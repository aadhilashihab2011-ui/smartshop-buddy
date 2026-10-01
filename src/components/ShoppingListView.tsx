import React, { useState, useMemo } from 'react';
import {
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit3,
  Check,
  X,
  ArrowRight,
  ShoppingCart,
  Search,
  Square,
  CheckSquare,
  Info,
  History,
  Coins,
} from 'lucide-react';
import {
  AppView,
  FoodCategory,
  FOOD_CATEGORIES,
  CATEGORY_METADATA,
  KitchenItem,
  ShoppingListItem,
  ShoppingTripRecord,
  compareWithKitchenInventory,
  KitchenInventoryComparison,
  formatQuantity,
  parseQuantityString,
  normalizeItemName,
  getItemIcon,
} from '../types.ts';

interface ShoppingListViewProps {
  kitchenItems: KitchenItem[];
  shoppingList: ShoppingListItem[];
  shoppingHistory: ShoppingTripRecord[];
  duplicatesAvoidedCount: number;
  onAddShoppingItem: (payload: {
    name: string;
    category: FoodCategory;
    quantity: number;
    unit: string;
    note?: string;
    addedAnyway?: boolean;
  }) => Promise<void>;
  onRecordDuplicateAvoided: (itemName: string) => Promise<void>;
  onUpdateShoppingItem: (
    id: string,
    payload: Partial<Pick<ShoppingListItem, 'name' | 'category' | 'quantity' | 'unit' | 'note' | 'bought'>>
  ) => Promise<void>;
  onDeleteShoppingItem: (id: string) => Promise<void>;
  onNavigate: (view: AppView) => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  kitchenItems,
  shoppingList,
  shoppingHistory,
  duplicatesAvoidedCount,
  onAddShoppingItem,
  onRecordDuplicateAvoided,
  onUpdateShoppingItem,
  onDeleteShoppingItem,
  onNavigate,
}) => {
  const [name, setName] = useState('');
  const [quantityInput, setQuantityInput] = useState('1 packet');
  const [category, setCategory] = useState<FoodCategory>('Dairy');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // State for the Smart Inventory Check Prompt (Already Available or Need More)
  const [pendingCheck, setPendingCheck] = useState<{
    candidate: {
      name: string;
      category: FoodCategory;
      quantity: number;
      unit: string;
      note?: string;
    };
    comparison: KitchenInventoryComparison;
  } | null>(null);

  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'avoided' | 'added' | 'adjusted';
    message: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [groupMode, setGroupMode] = useState<'category' | 'food-household'>('category');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<FoodCategory>('Other');
  const [editQuantityStr, setEditQuantityStr] = useState('');
  const [editNote, setEditNote] = useState('');

  // Live quantity-aware kitchen comparison as user types item name & quantity
  const liveComparison = useMemo(() => {
    if (!name.trim()) return null;
    const parsed = parseQuantityString(quantityInput);
    return compareWithKitchenInventory(name.trim(), parsed.quantity, parsed.unit, kitchenItems);
  }, [name, quantityInput, kitchenItems]);

  // Real purchase history check: did the user buy this item on their last shopping trip?
  const lastTripBoughtMatch = useMemo(() => {
    if (!name.trim() || shoppingHistory.length === 0) return null;
    const norm = normalizeItemName(name);
    if (!norm) return null;
    const lastTrip = shoppingHistory[0];
    const matchInLast = lastTrip.boughtItemsDetail.find(
      (b) => normalizeItemName(b.name) === norm
    );
    return matchInLast ? { item: matchInLast, tripDate: lastTrip.completedAt } : null;
  }, [name, shoppingHistory]);

  // Items bought on the most recent saved shopping trip (for smart history reminder strip)
  const recentHistoryItems = useMemo(() => {
    if (shoppingHistory.length === 0) return [];
    return shoppingHistory[0].boughtItemsDetail;
  }, [shoppingHistory]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setFeedbackBanner(null);

    const parsed = parseQuantityString(quantityInput);
    const candidate = {
      name: name.trim(),
      category,
      quantity: parsed.quantity,
      unit: parsed.unit,
      note: note.trim(),
    };

    const comparison = compareWithKitchenInventory(
      candidate.name,
      candidate.quantity,
      candidate.unit,
      kitchenItems
    );

    if (comparison.status === 'already_have_enough' || comparison.status === 'need_more') {
      // Show interactive confirmation prompt so the user decides!
      setPendingCheck({
        candidate,
        comparison,
      });
      return;
    }

    // Status is 'not_in_kitchen' -> add directly
    setSubmitting(true);
    try {
      await onAddShoppingItem({ ...candidate, addedAnyway: false });
      setFeedbackBanner({
        type: 'added',
        message: `Added "${candidate.name} — ${formatQuantity(candidate.quantity, candidate.unit)}" to your shopping list (not currently in your kitchen).`,
      });
      setName('');
      setQuantityInput('1');
      setNote('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeepOffList = async () => {
    if (!pendingCheck) return;
    const itemName = pendingCheck.comparison.matchedKitchenItem?.name || pendingCheck.candidate.name;
    const kitchenStock = formatQuantity(
      pendingCheck.comparison.kitchenQuantity,
      pendingCheck.comparison.effectiveUnit
    );
    setPendingCheck(null);
    setName('');
    setQuantityInput('1');
    setNote('');
    await onRecordDuplicateAvoided(itemName);
    setFeedbackBanner({
      type: 'avoided',
      message: `Kept "${itemName}" off your shopping list since you already have ${kitchenStock} in My Kitchen.`,
    });
  };

  const handleAddNeededDifference = async () => {
    if (!pendingCheck) return;
    const { candidate, comparison } = pendingCheck;
    const diffQty = comparison.neededDifference;
    const unitToUse = comparison.effectiveUnit || candidate.unit;
    setPendingCheck(null);
    setSubmitting(true);
    try {
      await onAddShoppingItem({
        ...candidate,
        quantity: diffQty,
        unit: unitToUse,
        addedAnyway: false,
      });
      setFeedbackBanner({
        type: 'adjusted',
        message: `Smart adjustment: Added "${candidate.name} — ${formatQuantity(
          diffQty,
          unitToUse
        )}" to your list (accounting for the ${formatQuantity(
          comparison.kitchenQuantity,
          unitToUse
        )} already in your kitchen).`,
      });
      setName('');
      setQuantityInput('1');
      setNote('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFullAmountAnyway = async () => {
    if (!pendingCheck) return;
    const { candidate } = pendingCheck;
    setPendingCheck(null);
    setSubmitting(true);
    try {
      await onAddShoppingItem({
        ...candidate,
        addedAnyway: true,
      });
      setFeedbackBanner({
        type: 'added',
        message: `Added "${candidate.name} — ${formatQuantity(
          candidate.quantity,
          candidate.unit
        )}" to your shopping list.`,
      });
      setName('');
      setQuantityInput('1');
      setNote('');
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (item: ShoppingListItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditQuantityStr(formatQuantity(item.quantity, item.unit));
    setEditNote(item.note || '');
  };

  const saveEdit = async (itemId: string) => {
    if (!editName.trim()) return;
    const parsed = parseQuantityString(editQuantityStr);
    await onUpdateShoppingItem(itemId, {
      name: editName.trim(),
      category: editCategory,
      quantity: parsed.quantity,
      unit: parsed.unit,
      note: editNote.trim(),
    });
    setEditingId(null);
  };

  // Filter shopping list by search & category
  const filteredList = useMemo(() => {
    return shoppingList.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.note && item.note.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [shoppingList, searchQuery, selectedCategory]);

  // Separate Remaining vs Bought items
  const remainingItems = useMemo(() => filteredList.filter((i) => !i.bought), [filteredList]);
  const boughtItems = useMemo(() => filteredList.filter((i) => i.bought), [filteredList]);

  const totalCount = shoppingList.length;
  const completedCount = shoppingList.filter((i) => i.bought).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const sampleKitchenMilk = kitchenItems.find(
    (i) => i.quantity > 0 && normalizeItemName(i.name) === 'milk'
  ) || kitchenItems.find((i) => i.quantity > 0);

  return (
    <div className="space-y-8">
      {/* Header Banner + Shopping Progress */}
      <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
              Step 2 · Connected With My Kitchen Inventory
            </p>
            <h1 className="text-3xl font-bold text-[#1C2820] font-display">
              Smart Shopping List
            </h1>
            <p className="text-sm text-[#546358] max-w-2xl">
              Every item and quantity you add is compared directly with your saved <strong className="text-[#1C2820]">My Kitchen</strong> inventory so you only buy what your family genuinely needs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('kids-tokens')}
              className="px-4 py-2.5 bg-[#FBF9F5] hover:bg-[#F3EFE6] text-[#1C2820] border border-[#D8D2C5] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Coins className="w-4 h-4 text-[#2D5A3D]" />
              <span>Next: Kids&apos; Choice Tokens</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('shopping-mode')}
              className="px-5 py-2.5 bg-[#2D5A3D] hover:bg-[#234730] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Shopping Progress Bar: "3 of 7 items completed" */}
        <div className="pt-4 border-t border-[#EFECE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#2D5A3D] font-mono tabular-nums">
              {completedCount} of {totalCount} items completed
            </span>
            <span className="text-xs text-[#546358]">
              · {duplicatesAvoidedCount} unnecessary purchase{duplicatesAvoidedCount === 1 ? '' : 's'} avoided
            </span>
          </div>
          <div className="w-full sm:w-64 h-2.5 bg-[#F3EFE6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2D5A3D] transition-all duration-200 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Item Form + Smart Inventory & Quantity Check */}
      <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFECE6] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1C2820] font-display">
              Add Item to Shopping List
            </h2>
            <p className="text-xs text-[#546358]">
              SmartShop Buddy compares both item name and quantity against your {kitchenItems.filter((i) => i.quantity > 0).length} kitchen items.
            </p>
          </div>

          {/* Interactive Scenario Test Buttons for Demo */}
          {sampleKitchenMilk && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#546358]">Try comparing:</span>
              <button
                type="button"
                onClick={() => {
                  setName(sampleKitchenMilk.name);
                  setCategory(sampleKitchenMilk.category);
                  setQuantityInput(formatQuantity(1, sampleKitchenMilk.unit));
                  setPendingCheck(null);
                  setFeedbackBanner(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#FDF8ED] border border-[#E6D0A3] text-[#8C5E14] font-medium hover:bg-[#F9EFD8] cursor-pointer whitespace-nowrap"
              >
                {sampleKitchenMilk.name} — {formatQuantity(1, sampleKitchenMilk.unit)} (Already Available)
              </button>

              <button
                type="button"
                onClick={() => {
                  setName(sampleKitchenMilk.name);
                  setCategory(sampleKitchenMilk.category);
                  setQuantityInput(
                    formatQuantity(sampleKitchenMilk.quantity + 2, sampleKitchenMilk.unit)
                  );
                  setPendingCheck(null);
                  setFeedbackBanner(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#FDF8ED] border border-[#E6D0A3] text-[#8C5E14] font-medium hover:bg-[#F9EFD8] cursor-pointer whitespace-nowrap"
              >
                {sampleKitchenMilk.name} — {formatQuantity(sampleKitchenMilk.quantity + 2, sampleKitchenMilk.unit)} (Need More)
              </button>

              <button
                type="button"
                onClick={() => {
                  setName('Bananas');
                  setCategory('Fruits & Vegetables');
                  setQuantityInput('1 bunch');
                  setPendingCheck(null);
                  setFeedbackBanner(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#F1F6F2] border border-[#C5DBC9] text-[#2D5A3D] font-medium hover:bg-[#E3EFE6] cursor-pointer whitespace-nowrap"
              >
                Bananas — 1 bunch (Not in Kitchen)
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-3 space-y-1.5">
            <label className="block text-xs font-semibold text-[#1C2820]">Item Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (pendingCheck) setPendingCheck(null);
              }}
              placeholder="e.g., Milk, Eggs, Rice"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-[#1C2820]">Quantity *</label>
            <input
              type="text"
              required
              value={quantityInput}
              onChange={(e) => {
                setQuantityInput(e.target.value);
                if (pendingCheck) setPendingCheck(null);
              }}
              placeholder="e.g., 2 packets"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
            />
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label className="block text-xs font-semibold text-[#1C2820]">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FoodCategory)}
              className="w-full px-3 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
            >
              {FOOD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-[#1C2820]">Optional Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Low fat"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-[#2D5A3D] hover:bg-[#234730] text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add to List</span>
            </button>
          </div>
        </form>

        {/* Smart Suggestion from Actual Saved Shopping History */}
        {lastTripBoughtMatch && (
          <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#D8D2C5] flex items-center gap-2.5 text-xs text-[#1C2820]">
            <History className="w-4 h-4 text-[#2D5A3D] shrink-0" />
            <span>
              <strong>Smart Reminder:</strong> You bought{' '}
              <strong>{lastTripBoughtMatch.item.name}</strong> (
              {formatQuantity(
                lastTripBoughtMatch.item.quantityBought,
                lastTripBoughtMatch.item.unit
              )}
              ) on your last shopping trip.
            </span>
          </div>
        )}

        {/* Live Kitchen Inventory Preview Banner while typing */}
        {liveComparison && !pendingCheck && (
          <div>
            {liveComparison.status === 'not_in_kitchen' && (
              <div className="p-4 rounded-xl bg-[#F1F6F2] border border-[#C5DBC9] flex items-center gap-3">
                <Info className="w-5 h-5 text-[#2D5A3D] shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[#1C2820]">
                    You don&apos;t currently have this in your kitchen.
                  </p>
                  <p className="text-xs text-[#3C5243]">
                    Click &ldquo;Add to List&rdquo; to include{' '}
                    <strong>
                      {name.trim()} — {formatQuantity(liveComparison.requestedQuantity, liveComparison.effectiveUnit)}
                    </strong>{' '}
                    on your shopping list.
                  </p>
                </div>
              </div>
            )}

            {liveComparison.status === 'already_have_enough' && liveComparison.matchedKitchenItem && (
              <div className="p-4 rounded-xl bg-[#FDF8ED] border border-[#E6D0A3] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#B4690E] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#1C2820]">
                    You already have {liveComparison.matchedKitchenItem.name} at home.
                  </p>
                  <p className="text-xs text-[#546358]">
                    You currently have{' '}
                    <strong className="text-[#1C2820] font-mono tabular-nums">
                      {formatQuantity(liveComparison.kitchenQuantity, liveComparison.effectiveUnit)}
                    </strong>{' '}
                    of {liveComparison.matchedKitchenItem.name} in your kitchen. Click &ldquo;Add to List&rdquo; to choose whether to Keep Off List or Add Anyway.
                  </p>
                </div>
              </div>
            )}

            {liveComparison.status === 'need_more' && liveComparison.matchedKitchenItem && (
              <div className="p-4 rounded-xl bg-[#FDF8ED] border border-[#E6D0A3] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#B4690E] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#1C2820]">
                    You already have{' '}
                    {formatQuantity(liveComparison.kitchenQuantity, liveComparison.effectiveUnit)}{' '}
                    {liveComparison.effectiveUnit ? `of ${liveComparison.matchedKitchenItem.name}` : liveComparison.matchedKitchenItem.name}{' '}
                    at home.
                  </p>
                  <p className="text-xs text-[#546358]">
                    Your shopping list asks for{' '}
                    <strong className="font-mono tabular-nums">
                      {formatQuantity(liveComparison.requestedQuantity, liveComparison.effectiveUnit)}
                    </strong>
                    . You may still need to buy{' '}
                    <strong className="text-[#2D5A3D] font-mono tabular-nums">
                      {formatQuantity(liveComparison.neededDifference, liveComparison.effectiveUnit)}
                    </strong>{' '}
                    more.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INTERACTIVE DECISION DIALOG WHEN SUBMITTING AN ITEM THAT EXISTS IN MY KITCHEN */}
        {pendingCheck && pendingCheck.comparison.matchedKitchenItem && (
          <div
            role="alertdialog"
            aria-labelledby="inventory-check-title"
            className="p-6 rounded-2xl bg-[#FDF8ED] border-2 border-[#D99B26] space-y-4 shadow-xs"
          >
            {pendingCheck.comparison.status === 'already_have_enough' ? (
              /* Example 1: Item Already Available in sufficient quantity */
              <>
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F7E8C6] flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-[#9C6512]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#9C6512]">
                      You already have this at home
                    </p>
                    <h3 id="inventory-check-title" className="text-lg font-bold text-[#1C2820]">
                      You already have {pendingCheck.comparison.matchedKitchenItem.name} at home.
                    </h3>
                    <p className="text-sm text-[#3D3526]">
                      You currently have{' '}
                      <strong className="font-mono tabular-nums">
                        {formatQuantity(
                          pendingCheck.comparison.kitchenQuantity,
                          pendingCheck.comparison.effectiveUnit
                        )}
                      </strong>{' '}
                      of {pendingCheck.comparison.matchedKitchenItem.name} in your kitchen. Do you still want to add it to your shopping list?
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleKeepOffList}
                    className="px-5 py-2.5 bg-[#2D5A3D] hover:bg-[#234730] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Keep Off List
                  </button>

                  <button
                    type="button"
                    onClick={handleAddFullAmountAnyway}
                    className="px-5 py-2.5 bg-white hover:bg-[#F3EFE6] text-[#1C2820] border border-[#D8D2C5] text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Add Anyway
                  </button>
                </div>
              </>
            ) : (
              /* Example 2: User Needs More (Kitchen has some, but less than requested) */
              <>
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F7E8C6] flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-[#9C6512]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#9C6512]">
                      Quantity-Aware Kitchen Check
                    </p>
                    <h3 id="inventory-check-title" className="text-lg font-bold text-[#1C2820]">
                      You already have{' '}
                      {formatQuantity(
                        pendingCheck.comparison.kitchenQuantity,
                        pendingCheck.comparison.effectiveUnit
                      )}{' '}
                      {pendingCheck.comparison.effectiveUnit
                        ? 'at home.'
                        : `${pendingCheck.comparison.matchedKitchenItem.name.toLowerCase()} at home.`}
                    </h3>
                    <p className="text-sm text-[#3D3526]">
                      Your shopping list asks for{' '}
                      <strong className="font-mono tabular-nums">
                        {formatQuantity(
                          pendingCheck.comparison.requestedQuantity,
                          pendingCheck.comparison.effectiveUnit
                        )}
                      </strong>
                      . You may still need to buy{' '}
                      <strong className="text-[#2D5A3D] font-mono tabular-nums">
                        {formatQuantity(
                          pendingCheck.comparison.neededDifference,
                          pendingCheck.comparison.effectiveUnit
                        )}
                      </strong>{' '}
                      more.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleAddNeededDifference}
                    className="px-5 py-2.5 bg-[#2D5A3D] hover:bg-[#234730] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Buy {formatQuantity(pendingCheck.comparison.neededDifference, pendingCheck.comparison.effectiveUnit)} More (Recommended)
                  </button>

                  <button
                    type="button"
                    onClick={handleAddFullAmountAnyway}
                    className="px-4 py-2.5 bg-white hover:bg-[#F3EFE6] text-[#1C2820] border border-[#D8D2C5] text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Add All {formatQuantity(pendingCheck.comparison.requestedQuantity, pendingCheck.comparison.effectiveUnit)} Anyway
                  </button>

                  <button
                    type="button"
                    onClick={handleKeepOffList}
                    className="px-4 py-2.5 text-xs font-medium text-[#546358] hover:text-[#1C2820] hover:bg-[#F3EFE6] rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Keep Off List
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Action Feedback Banner */}
        {feedbackBanner && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
              feedbackBanner.type === 'avoided' || feedbackBanner.type === 'adjusted'
                ? 'bg-[#F1F6F2] border-[#C5DBC9] text-[#1E3F29]'
                : 'bg-[#FBF9F5] border-[#D8D2C5] text-[#1C2820]'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#2D5A3D] shrink-0" />
              <span>{feedbackBanner.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackBanner(null)}
              className="text-xs text-[#546358] hover:text-[#1C2820] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Real Purchase History Smart Suggestion Strip (Only shown if user has actual saved history) */}
        {recentHistoryItems.length > 0 && (
          <div className="pt-3 border-t border-[#EFECE6] flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#546358] flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-[#2D5A3D]" />
              <span>Bought on your last trip:</span>
            </span>
            {recentHistoryItems.map((histItem) => (
              <button
                key={histItem.shoppingItemId}
                type="button"
                onClick={() => {
                  setName(histItem.name);
                  setCategory(histItem.category);
                  setQuantityInput(formatQuantity(histItem.quantityBought, histItem.unit));
                  setPendingCheck(null);
                }}
                className="px-2.5 py-1 text-xs bg-[#FBF9F5] hover:bg-[#F1F6F2] text-[#1C2820] border border-[#D8D2C5] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                You bought <strong>{histItem.name}</strong> on your last trip
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Shopping List Display: Separated into Remaining and Bought */}
      <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EFECE6] pb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#546358] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or filter your shopping list..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#FBF9F5] border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#546358]">Organize by:</span>
            <div className="flex items-center gap-1 p-1 bg-[#F3EFE6] rounded-xl">
              <button
                type="button"
                onClick={() => setGroupMode('food-household')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  groupMode === 'food-household'
                    ? 'bg-white text-[#1C2820] shadow-xs'
                    : 'text-[#546358] hover:text-[#1C2820]'
                }`}
              >
                Food &amp; Household
              </button>
              <button
                type="button"
                onClick={() => setGroupMode('category')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  groupMode === 'category'
                    ? 'bg-white text-[#1C2820] shadow-xs'
                    : 'text-[#546358] hover:text-[#1C2820]'
                }`}
              >
                All 7 Categories
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['All', ...FOOD_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#2D5A3D] text-white'
                  : 'bg-[#F3EFE6] text-[#546358] hover:text-[#1C2820]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredList.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-[#FBF9F5] rounded-xl border border-dashed border-[#D8D2C5] p-6">
            <ShoppingCart className="w-8 h-8 text-[#546358] mx-auto" />
            <p className="text-sm font-semibold text-[#1C2820]">
              {shoppingList.length === 0
                ? 'Your shopping list is empty.'
                : 'No shopping items match your current filter.'}
            </p>
            <p className="text-xs text-[#546358] max-w-md mx-auto">
              Add items above. SmartShop Buddy compares every item and quantity against your saved kitchen inventory.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* REMAINING ITEMS SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-2">
                <h2 className="text-lg font-bold text-[#1C2820] font-display">
                  Remaining ({remainingItems.length})
                </h2>
                <span className="text-xs text-[#546358]">
                  Tap checkbox when bought
                </span>
              </div>

              {remainingItems.length === 0 ? (
                <p className="text-xs text-[#2D5A3D] font-medium py-3">
                  All planned items have been marked as bought!
                </p>
              ) : groupMode === 'food-household' ? (
                <div className="space-y-6">
                  {(['Food', 'Household'] as const).map((grp) => {
                    const grpItems = remainingItems.filter(
                      (i) => CATEGORY_METADATA[i.category]?.group === grp
                    );
                    if (grpItems.length === 0) return null;
                    return (
                      <div key={grp} className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
                          {grp} ({grpItems.length})
                        </h3>
                        <div className="divide-y divide-[#EFECE6] border border-[#E5E0D5] rounded-xl bg-[#FBF9F5] px-4">
                          {grpItems.map((item) => renderShoppingRow(item))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-6">
                  {FOOD_CATEGORIES.map((cat) => {
                    const catItems = remainingItems.filter((i) => i.category === cat);
                    if (catItems.length === 0) return null;
                    return (
                      <div key={cat} className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
                          {cat} ({catItems.length})
                        </h3>
                        <div className="divide-y divide-[#EFECE6] border border-[#E5E0D5] rounded-xl bg-[#FBF9F5] px-4">
                          {catItems.map((item) => renderShoppingRow(item))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* BOUGHT ITEMS SECTION (Visually Separated) */}
            {boughtItems.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-[#C5DBC9] pb-2">
                  <h2 className="text-lg font-bold text-[#2D5A3D] font-display">
                    Bought ({boughtItems.length})
                  </h2>
                  <span className="text-xs text-[#546358]">
                    Ready to update My Kitchen when you finish shopping
                  </span>
                </div>
                <div className="divide-y divide-[#D8E6DC] border border-[#C5DBC9] rounded-xl bg-[#F1F6F2] px-4">
                  {boughtItems.map((item) => renderShoppingRow(item))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  function renderShoppingRow(item: ShoppingListItem) {
    const isEditing = editingId === item.id;
    if (isEditing) {
      return (
        <div
          key={item.id}
          className="py-3 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
        >
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="sm:col-span-3 px-3 py-1.5 text-xs bg-white border border-[#D8D2C5] rounded-lg"
          />
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value as FoodCategory)}
            className="sm:col-span-3 px-2.5 py-1.5 text-xs bg-white border border-[#D8D2C5] rounded-lg"
          >
            {FOOD_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={editQuantityStr}
            onChange={(e) => setEditQuantityStr(e.target.value)}
            className="sm:col-span-2 px-3 py-1.5 text-xs bg-white border border-[#D8D2C5] rounded-lg"
          />
          <input
            type="text"
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            placeholder="Note"
            className="sm:col-span-2 px-3 py-1.5 text-xs bg-white border border-[#D8D2C5] rounded-lg"
          />
          <div className="sm:col-span-2 flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => saveEdit(item.id)}
              className="px-2.5 py-1.5 bg-[#2D5A3D] text-white text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="p-1.5 text-[#546358] hover:bg-[#F3EFE6] rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={item.id}
        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onUpdateShoppingItem(item.id, { bought: !item.bought })}
            className="mt-0.5 text-[#2D5A3D] hover:opacity-80 cursor-pointer shrink-0"
            title={item.bought ? 'Mark as remaining' : 'Mark as bought'}
          >
            {item.bought ? (
              <CheckSquare className="w-5 h-5 text-[#2D5A3D]" />
            ) : (
              <Square className="w-5 h-5 text-[#546358]" />
            )}
          </button>

          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#1C2820]">
              <span>{getItemIcon(item.name, item.category)}</span>
              <span className={item.bought ? 'line-through text-[#546358]' : ''}>
                {item.name}
              </span>
              <span className="text-[#546358] font-normal">—</span>
              <span className="text-[#2D5A3D] font-mono tabular-nums">
                {formatQuantity(item.quantity, item.unit)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#546358]">
              <span>{item.category}</span>
              {item.note && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{item.note}</span>
                </>
              )}
              {item.fromKidsToken && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#2D5A3D] font-medium">Kids&apos; Choice Token Pick</span>
                </>
              )}
              {item.addedAnyway && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#9C6512]">Added extra stock</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <button
            type="button"
            onClick={() =>
              onUpdateShoppingItem(item.id, {
                quantity: Math.max(1, item.quantity - 1),
              })
            }
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-[#D8D2C5] text-[#1C2820] hover:bg-[#F3EFE6] cursor-pointer"
            title="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              onUpdateShoppingItem(item.id, { quantity: item.quantity + 1 })
            }
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-[#D8D2C5] text-[#1C2820] hover:bg-[#F3EFE6] cursor-pointer"
            title="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => startEditing(item)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#546358] hover:text-[#1C2820] hover:bg-[#EFECE6] cursor-pointer"
            title="Edit item"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteShoppingItem(item.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9B2C2C] hover:bg-[#FDF2F2] cursor-pointer"
            title="Delete item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }
};
