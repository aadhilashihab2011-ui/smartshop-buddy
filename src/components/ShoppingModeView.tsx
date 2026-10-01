import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  ShoppingBag,
  Coins,
  CheckCircle2,
  ArrowRight,
  Plus,
  PackageCheck,
  History,
  RotateCcw,
  Trash2,
  ShoppingCart,
  AlertTriangle,
  Undo2,
  X,
  Clock,
  Tag,
} from 'lucide-react';
import {
  AppView,
  FoodCategory,
  FOOD_CATEGORIES,
  CATEGORY_METADATA,
  KitchenItem,
  KidsTokenState,
  ShoppingListItem,
  ShoppingSessionState,
  ShoppingTripRecord,
  formatQuantity,
  parseQuantityString,
  getItemIcon,
  findMatchingKitchenItem,
  normalizeItemName,
} from '../types.ts';
import bagImg from '../assets/images/kit_reusable_bag_1790843558148.jpg';

interface ShoppingModeViewProps {
  kitchenItems: KitchenItem[];
  shoppingList: ShoppingListItem[];
  kidsTokens: KidsTokenState;
  shoppingSession: ShoppingSessionState;
  onToggleBought: (itemId: string, bought: boolean) => Promise<void>;
  onAddShoppingItem: (payload: {
    name: string;
    category: FoodCategory;
    quantity: number;
    unit: string;
    note?: string;
    addedAnyway?: boolean;
    fromKidsToken?: boolean;
    addedInStore?: boolean;
  }) => Promise<void>;
  onRecordDuplicateAvoided: (itemName: string) => Promise<void>;
  onUseToken: (label: string) => Promise<void>;
  onRemoveTokenChoice: (choiceId: string) => Promise<void>;
  onStartNewTrip: () => Promise<void>;
  onConfirmReusableBag: (
    confirmed: boolean,
    response?: 'unanswered' | 'brought' | 'not_yet'
  ) => Promise<void>;
  onCompleteShopping: () => Promise<ShoppingTripRecord>;
  onApplyKitchenUpdates: (tripId: string, clearBought: boolean) => Promise<ShoppingTripRecord>;
  onDeferKitchenUpdates: (tripId: string) => Promise<ShoppingTripRecord>;
  onNavigate: (view: AppView) => void;
}

export const ShoppingModeView: React.FC<ShoppingModeViewProps> = ({
  kitchenItems,
  shoppingList,
  kidsTokens,
  shoppingSession,
  onToggleBought,
  onAddShoppingItem,
  onRecordDuplicateAvoided,
  onUseToken,
  onRemoveTokenChoice,
  onStartNewTrip,
  onConfirmReusableBag,
  onCompleteShopping,
  onApplyKitchenUpdates,
  onDeferKitchenUpdates,
  onNavigate,
}) => {
  const [completedTrip, setCompletedTrip] = useState<ShoppingTripRecord | null>(null);
  const [completing, setCompleting] = useState(false);
  const [updatingKitchen, setUpdatingKitchen] = useState(false);
  const [deferringKitchen, setDeferringKitchen] = useState(false);
  const [bagImgFailed, setBagImgFailed] = useState(false);

  // Reusable Bag Pre-Shopping Prompt dismissal so "Not yet" never blocks the user from continuing
  const [bagGateDismissed, setBagGateDismissed] = useState(false);
  const [bagBusy, setBagBusy] = useState(false);

  // Kids' Choice Tokens in-store state
  const [tokenChoiceInput, setTokenChoiceInput] = useState('');
  const [tokenBusy, setTokenBusy] = useState(false);

  // "+ Add Item" (Forgotten Item in Shopping Mode) state
  const [showAddForgottenForm, setShowAddForgottenForm] = useState(false);
  const [forgottenName, setForgottenName] = useState('');
  const [forgottenQuantityInput, setForgottenQuantityInput] = useState('1');
  const [forgottenCategory, setForgottenCategory] = useState<FoodCategory>('Fruits & Vegetables');
  const [forgottenNote, setForgottenNote] = useState('');
  const [addingForgotten, setAddingForgotten] = useState(false);

  // Prevent Unnecessary Purchases Reminder state inside Shopping Mode
  const [inStoreKitchenReminder, setInStoreKitchenReminder] = useState<{
    candidate: {
      name: string;
      category: FoodCategory;
      quantity: number;
      unit: string;
      note?: string;
    };
    matchedKitchenItem: KitchenItem;
  } | null>(null);

  // Unchecked Items Confirmation before finishing shopping
  const [showUncheckedWarning, setShowUncheckedWarning] = useState(false);

  const totalItems = shoppingList.length;
  const completedItems = shoppingList.filter((i) => i.bought).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const remainingList = useMemo(() => shoppingList.filter((i) => !i.bought), [shoppingList]);
  const plannedRemainingList = useMemo(
    () => remainingList.filter((i) => !i.addedInStore),
    [remainingList]
  );
  const inStoreAddedRemainingList = useMemo(
    () => remainingList.filter((i) => i.addedInStore),
    [remainingList]
  );
  const boughtList = useMemo(() => shoppingList.filter((i) => i.bought), [shoppingList]);

  const usedHistory = kidsTokens.usedHistory || [];
  const remainingTokens = Math.max(0, 3 - usedHistory.length);

  const bagResponse =
    shoppingSession.reusableBagResponse ||
    (shoppingSession.reusableBagConfirmed ? 'brought' : 'unanswered');

  const handleSelectBagBrought = async () => {
    setBagBusy(true);
    try {
      await onConfirmReusableBag(true, 'brought');
      setBagGateDismissed(true);
    } finally {
      setBagBusy(false);
    }
  };

  const handleSelectBagNotYet = async () => {
    setBagBusy(true);
    try {
      await onConfirmReusableBag(false, 'not_yet');
      // Keep the friendly reminder visible, do not block continuing
    } finally {
      setBagBusy(false);
    }
  };

  const handleUseInStoreToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenChoiceInput.trim() || remainingTokens <= 0 || tokenBusy) return;
    setTokenBusy(true);
    try {
      await onUseToken(tokenChoiceInput.trim());
      setTokenChoiceInput('');
    } finally {
      setTokenBusy(false);
    }
  };

  const isChoiceOnShoppingList = (label: string) => {
    const norm = normalizeItemName(label);
    return shoppingList.some((i) => normalizeItemName(i.name) === norm);
  };

  // Handle adding a forgotten item while in Shopping Mode
  const handleForgottenItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgottenName.trim() || addingForgotten) return;

    const parsed = parseQuantityString(forgottenQuantityInput);
    const candidate = {
      name: forgottenName.trim(),
      category: forgottenCategory,
      quantity: parsed.quantity,
      unit: parsed.unit,
      note: forgottenNote.trim(),
    };

    const existingInKitchen = findMatchingKitchenItem(candidate.name, kitchenItems);
    if (existingInKitchen) {
      setInStoreKitchenReminder({
        candidate,
        matchedKitchenItem: existingInKitchen,
      });
      return;
    }

    setAddingForgotten(true);
    try {
      await onAddShoppingItem({
        ...candidate,
        addedInStore: true,
      });
      setForgottenName('');
      setForgottenQuantityInput('1');
      setForgottenNote('');
      setShowAddForgottenForm(false);
    } finally {
      setAddingForgotten(false);
    }
  };

  const handleKeepAnywayInStore = async () => {
    if (!inStoreKitchenReminder || addingForgotten) return;
    const { candidate } = inStoreKitchenReminder;
    setInStoreKitchenReminder(null);
    setAddingForgotten(true);
    try {
      await onAddShoppingItem({
        ...candidate,
        addedAnyway: true,
        addedInStore: true,
      });
      setForgottenName('');
      setForgottenQuantityInput('1');
      setForgottenNote('');
      setShowAddForgottenForm(false);
    } finally {
      setAddingForgotten(false);
    }
  };

  const handleRemoveInStoreDuplicate = async () => {
    if (!inStoreKitchenReminder) return;
    const itemName = inStoreKitchenReminder.matchedKitchenItem.name;
    setInStoreKitchenReminder(null);
    setForgottenName('');
    setForgottenQuantityInput('1');
    setForgottenNote('');
    await onRecordDuplicateAvoided(itemName);
  };

  // Finish Shopping Handler (Checks if any items are still unchecked)
  const handleFinishButtonClick = () => {
    if (remainingList.length > 0) {
      setShowUncheckedWarning(true);
      return;
    }
    executeFinishShopping();
  };

  const executeFinishShopping = async () => {
    setShowUncheckedWarning(false);
    setCompleting(true);
    try {
      const trip = await onCompleteShopping();
      setCompletedTrip(trip);
    } finally {
      setCompleting(false);
    }
  };

  const handleUpdateKitchenFromSummary = async () => {
    if (!completedTrip || updatingKitchen) return;
    setUpdatingKitchen(true);
    try {
      const updated = await onApplyKitchenUpdates(completedTrip.id, true);
      setCompletedTrip(updated);
    } finally {
      setUpdatingKitchen(false);
    }
  };

  const handleDoThisLaterFromSummary = async () => {
    if (!completedTrip || deferringKitchen) return;
    setDeferringKitchen(true);
    try {
      const updated = await onDeferKitchenUpdates(completedTrip.id);
      setCompletedTrip(updated);
    } finally {
      setDeferringKitchen(false);
    }
  };

  // ============================================================================
  // 2. SHOPPING TRIP COMPLETE! (SHOPPING SUMMARY & UPDATE MY KITCHEN)
  // ============================================================================
  if (completedTrip) {
    const unpurchasedItems = completedTrip.unpurchasedItems || [];
    const tokenChoices = completedTrip.tokenChoices || [];

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EFECE6] pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#E8EFEA] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-[#2D5A3D]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
                  Shopping Summary · Saved to Your Account
                </p>
                <h1 className="text-3xl font-bold text-[#1C2820] font-display">
                  Shopping Trip Complete!
                </h1>
              </div>
            </div>

            <span className="px-3.5 py-1.5 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5] text-xs font-semibold text-[#546358]">
              {new Date(completedTrip.completedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* 6 Required Summary Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5]">
              <p className="text-xs text-[#546358]">Planned items</p>
              <p className="text-2xl font-bold text-[#1C2820] font-mono tabular-nums mt-1">
                {completedTrip.itemsPlanned}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F1F6F2] border border-[#C5DBC9]">
              <p className="text-xs text-[#2D5A3D] font-medium">Purchased items</p>
              <p className="text-2xl font-bold text-[#2D5A3D] font-mono tabular-nums mt-1">
                {completedTrip.itemsBought}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5]">
              <p className="text-xs text-[#546358]">Items left</p>
              <p className="text-2xl font-bold text-[#1C2820] font-mono tabular-nums mt-1">
                {completedTrip.itemsRemaining}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5]">
              <p className="text-xs text-[#546358]">Kids&apos; Choice Tokens used</p>
              <p className="text-2xl font-bold text-[#1C2820] font-mono tabular-nums mt-1">
                {completedTrip.tokensUsed} / 3
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5]">
              <p className="text-xs text-[#546358]">Items selected using tokens</p>
              <p className="text-sm font-bold text-[#1C2820] mt-1.5">
                {tokenChoices.length > 0
                  ? tokenChoices.map((c, i) => `Token ${i + 1}: ${c}`).join(' · ')
                  : 'No tokens used this trip'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5]">
              <p className="text-xs text-[#546358]">Reusable bag status</p>
              <p className="text-sm font-bold text-[#2D5A3D] mt-1.5 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>
                  {completedTrip.reusableBagUsed
                    ? 'Yes, I brought it (Used)'
                    : 'Not brought this trip'}
                </span>
              </p>
            </div>
          </div>

          {/* Truthful Trip Reflection */}
          <div className="p-4 rounded-xl bg-[#F1F6F2] border border-[#C5DBC9] text-sm text-[#1E3F29] leading-relaxed">
            {completedTrip.summaryMessage}
          </div>

          {/* Purchased Items Breakdown */}
          <div className="space-y-3 pt-2 border-t border-[#EFECE6]">
            <h2 className="text-base font-bold text-[#1C2820] font-display">
              Purchased Items ({completedTrip.boughtItemsDetail.length})
            </h2>

            {completedTrip.boughtItemsDetail.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5] text-xs text-[#546358]">
                No items were marked as purchased during this trip.
              </div>
            ) : (
              <div className="space-y-2.5">
                {completedTrip.boughtItemsDetail.map((detail) => {
                  const catMeta = CATEGORY_METADATA[detail.category];
                  return (
                    <div
                      key={detail.shoppingItemId}
                      className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {getItemIcon(detail.name, detail.category)}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-[#1C2820]">
                            {detail.name}{' '}
                            <span className="text-[#2D5A3D] font-mono tabular-nums">
                              — {formatQuantity(detail.quantityBought, detail.unit)}
                            </span>
                          </p>
                          <p className="text-xs text-[#546358]">
                            {detail.category}
                            {catMeta ? ` · ${catMeta.physicalLabelCode}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
                        <div className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E0D5]">
                          <span className="text-[#546358] block text-[10px] font-sans">
                            At home before
                          </span>
                          <span className="font-semibold text-[#1C2820]">
                            {formatQuantity(detail.beforeQuantity, detail.unit)}
                          </span>
                        </div>

                        <div className="px-2.5 py-1.5 rounded-lg bg-[#E8EFEA] border border-[#C5DBC9] text-[#2D5A3D]">
                          <span className="block text-[10px] font-sans">Bought</span>
                          <span className="font-bold">
                            +{formatQuantity(detail.quantityBought, detail.unit)}
                          </span>
                        </div>

                        <div className="px-2.5 py-1.5 rounded-lg bg-[#2D5A3D] text-white">
                          <span className="block text-[10px] font-sans opacity-85">
                            After update
                          </span>
                          <span className="font-bold">
                            {formatQuantity(detail.afterQuantity, detail.unit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Unpurchased Items ("Items left") — Shown Calmly Without Error Tone */}
          {unpurchasedItems.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[#EFECE6]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#1C2820] font-display">
                    Items Left ({unpurchasedItems.length})
                  </h2>
                  <p className="text-xs text-[#546358]">
                    These items were not purchased today. We kept them on your Shopping List so they are ready whenever you need them.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {unpurchasedItems.map((uItem) => (
                  <div
                    key={uItem.id}
                    className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">
                        {getItemIcon(uItem.name, uItem.category)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#1C2820]">{uItem.name}</p>
                        <p className="text-xs text-[#546358]">{uItem.category}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono tabular-nums font-semibold text-[#546358]">
                      {formatQuantity(uItem.quantity, uItem.unit)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt: "Would you like to update My Kitchen with the items you bought?" */}
          {completedTrip.boughtItemsDetail.length > 0 && (
            <div className="pt-4 border-t border-[#EFECE6]">
              {!completedTrip.kitchenUpdated && !completedTrip.kitchenUpdateDeferred && (
                <div className="p-6 rounded-2xl bg-[#FBF9F5] border-2 border-[#2D5A3D] space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
                      Step 9 · Update Home Inventory
                    </p>
                    <h3 className="text-xl font-bold text-[#1C2820] font-display">
                      Would you like to update My Kitchen with the items you bought?
                    </h3>
                    <p className="text-xs sm:text-sm text-[#546358]">
                      Selecting <strong className="text-[#1C2820]">Update My Kitchen</strong> automatically adds your purchased quantities directly to your saved kitchen inventory.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleUpdateKitchenFromSummary}
                      disabled={updatingKitchen}
                      className="px-6 py-3 bg-[#2D5A3D] hover:bg-[#234730] text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>
                        {updatingKitchen ? 'Updating My Kitchen...' : 'Update My Kitchen'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDoThisLaterFromSummary}
                      disabled={deferringKitchen}
                      className="px-5 py-3 bg-white hover:bg-[#F3EFE6] text-[#1C2820] border border-[#D8D2C5] text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <Clock className="w-4 h-4 text-[#546358]" />
                      <span>{deferringKitchen ? 'Saving...' : 'Do This Later'}</span>
                    </button>
                  </div>
                </div>
              )}

              {completedTrip.kitchenUpdated && (
                <div className="p-5 rounded-2xl bg-[#F1F6F2] border border-[#C5DBC9] space-y-3">
                  <div className="flex items-center gap-2.5 text-[#2D5A3D]">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <h3 className="text-base font-bold">
                      My Kitchen has been updated with the items you bought!
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#3C5243] leading-relaxed">
                    All purchased quantities have been added to <strong>My Kitchen</strong>. Use your physical <strong>SmartShop Buddy Food Organizer Labels</strong> to place each item onto its matching shelf or jar.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => onNavigate('kitchen')}
                      className="px-4 py-2 bg-[#2D5A3D] hover:bg-[#234730] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>View Updated My Kitchen</span>
                    </button>
                  </div>
                </div>
              )}

              {!completedTrip.kitchenUpdated && completedTrip.kitchenUpdateDeferred && (
                <div className="p-5 rounded-2xl bg-[#FBF9F5] border border-[#D8D2C5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#1C2820]">
                      Saved for later in Shopping History
                    </p>
                    <p className="text-xs text-[#546358]">
                      You can update My Kitchen with these purchased items anytime from here or from Shopping History.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleUpdateKitchenFromSummary}
                    disabled={updatingKitchen}
                    className="px-4 py-2.5 bg-[#2D5A3D] hover:bg-[#234730] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-center cursor-pointer whitespace-nowrap"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>{updatingKitchen ? 'Updating...' : 'Update My Kitchen Now'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Footer Buttons */}
          <div className="pt-4 border-t border-[#EFECE6] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onNavigate('kitchen')}
              className="px-4 py-2.5 bg-[#FBF9F5] hover:bg-[#F3EFE6] text-[#1C2820] border border-[#D8D2C5] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Open My Kitchen
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  await onStartNewTrip();
                  setCompletedTrip(null);
                  setBagGateDismissed(false);
                }}
                className="px-4 py-2.5 bg-[#FBF9F5] hover:bg-[#F3EFE6] text-[#1C2820] border border-[#D8D2C5] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#2D5A3D]" />
                <span>Start Another Trip</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('history')}
                className="px-5 py-2.5 bg-[#2D5A3D] hover:bg-[#234730] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <History className="w-4 h-4" />
                <span>Go to Shopping History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 1. REUSABLE BAG REMINDER (Shown when starting Shopping Mode if unanswered)
  // ============================================================================
  if (!bagGateDismissed && bagResponse === 'unanswered') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border-2 border-[#2D5A3D] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#EFECE6] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#E8EFEA] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-[#2D5A3D]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
                  Before You Start Shopping · Physical Kit Check
                </p>
                <h1 className="text-2xl font-bold text-[#1C2820] font-display">
                  Reusable Bag Reminder
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setBagGateDismissed(true)}
              className="text-xs font-semibold text-[#546358] hover:text-[#1C2820] underline cursor-pointer"
            >
              Continue to Shop →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            <div className="sm:col-span-5">
              <div className="aspect-4/3 rounded-xl overflow-hidden bg-[#E8EFEA] border border-[#C5DBC9]">
                {!bagImgFailed ? (
                  <img
                    src={bagImg}
                    alt="SmartShop Buddy foldable reusable cloth shopping bag"
                    referrerPolicy="no-referrer"
                    onError={() => setBagImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-[#2D5A3D]" />
                  </div>
                )}
              </div>
            </div>

            <div className="sm:col-span-7 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1C2820] font-display">
                Did you bring your reusable shopping bag?
              </h2>
              <p className="text-sm text-[#546358] leading-relaxed">
                Your physical <strong>SmartShop Buddy Kit</strong> includes a foldable reusable cloth bag. Checking before you enter the store helps your family avoid single-use plastic bags.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#EFECE6]">
            <button
              type="button"
              onClick={handleSelectBagBrought}
              disabled={bagBusy}
              className="flex-1 min-w-[180px] py-3.5 px-5 bg-[#2D5A3D] hover:bg-[#234730] text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Yes, I brought it</span>
            </button>

            <button
              type="button"
              onClick={handleSelectBagNotYet}
              disabled={bagBusy}
              className="flex-1 min-w-[180px] py-3.5 px-5 bg-[#FBF9F5] hover:bg-[#F3EFE6] text-[#1C2820] border border-[#D8D2C5] text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Not yet</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ACTIVE IN-STORE SHOPPING MODE
  // ============================================================================
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Start Shopping Mode Header & Progress */}
      <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
              In-Store Shopping Companion
            </p>
            <h1 className="text-3xl font-bold text-[#1C2820] font-display">Shopping Mode</h1>
            <p className="text-sm sm:text-base text-[#546358]">
              Let’s get everything you planned for.
            </p>
          </div>

          {/* 8. Simple Shopping Progress Indicator */}
          <div className="text-left sm:text-right bg-[#FBF9F5] px-4 py-3 rounded-xl border border-[#E5E0D5]">
            <p className="text-lg sm:text-xl font-bold text-[#2D5A3D] font-mono tabular-nums">
              {completedItems} / {totalItems} items completed
            </p>
            <p className="text-xs font-medium text-[#546358] font-mono tabular-nums">
              {completedItems} of {totalItems} items bought
            </p>
          </div>
        </div>

        {/* Clean Progress Bar */}
        <div className="w-full h-3 bg-[#F3EFE6] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2D5A3D] transition-all duration-200 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 5. Kids' Choice Tokens + Reusable Bag Reminder */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Kids' Choice Tokens Visible Inside Shopping Mode */}
        <div className="md:col-span-6 bg-white rounded-2xl border border-[#E5E0D5] p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#2D5A3D]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
                  Kids&apos; Choice Tokens
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('kids-tokens')}
                className="text-xs font-semibold text-[#546358] hover:text-[#1C2820] underline cursor-pointer"
              >
                Manage Tokens
              </button>
            </div>

            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-bold text-[#1C2820] font-display">
                Choices remaining:{' '}
                <span className="text-[#2D5A3D] font-mono tabular-nums">
                  {remainingTokens}
                </span>
              </h2>
              <span className="text-xs text-[#546358] font-mono tabular-nums">
                {usedHistory.length} / 3 used
              </span>
            </div>

            {/* Child's Recorded Choices Clearly Shown */}
            {usedHistory.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#546358]">
                  Today&apos;s Choices:
                </p>
                {usedHistory.map((entry, idx) => {
                  const onList = isChoiceOnShoppingList(entry.label);
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between text-xs bg-[#FBF9F5] px-3 py-2 rounded-lg border border-[#E5E0D5]"
                    >
                      <span className="font-semibold text-[#1C2820]">
                        Token {idx + 1} → {entry.label}
                      </span>
                      <div className="flex items-center gap-2">
                        {!onList && (
                          <button
                            type="button"
                            onClick={() =>
                              onAddShoppingItem({
                                name: entry.label,
                                category: 'Snacks',
                                quantity: 1,
                                unit: '',
                                note: "Kids' Choice Token pick",
                                fromKidsToken: true,
                                addedInStore: true,
                              })
                            }
                            className="text-[11px] font-semibold text-[#2D5A3D] hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>+ Add to List</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onRemoveTokenChoice(entry.id)}
                          className="text-[#9B2C2C] hover:underline cursor-pointer"
                          title="Remove choice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#546358]">
                No tokens used yet. Enter your child&apos;s choice below to use a token without leaving Shopping Mode.
              </p>
            )}
          </div>

          {remainingTokens > 0 ? (
            <form
              onSubmit={handleUseInStoreToken}
              className="flex items-center gap-2 pt-2 border-t border-[#EFECE6]"
            >
              <input
                type="text"
                value={tokenChoiceInput}
                onChange={(e) => setTokenChoiceInput(e.target.value)}
                placeholder="Child's choice (e.g., Chocolate)"
                className="flex-1 px-3 py-2 text-xs bg-[#FBF9F5] border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
              />
              <button
                type="submit"
                disabled={tokenBusy || !tokenChoiceInput.trim()}
                className="py-2 px-3.5 bg-[#2D5A3D] hover:bg-[#234730] disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                Use a Token
              </button>
            </form>
          ) : (
            <p className="text-xs font-semibold text-[#2D5A3D] pt-2 border-t border-[#EFECE6]">
              You’ve used all 3 choices for this trip.
            </p>
          )}
        </div>

        {/* 1. Reusable Bag Reminder Card (Connected to Physical Foldable Cloth Bag) */}
        <div className="md:col-span-6 bg-white rounded-2xl border border-[#E5E0D5] p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#E8EFEA] overflow-hidden shrink-0 border border-[#C5DBC9]">
              {!bagImgFailed ? (
                <img
                  src={bagImg}
                  alt="Foldable reusable cloth shopping bag"
                  referrerPolicy="no-referrer"
                  onError={() => setBagImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-[#2D5A3D]" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#2D5A3D]">
                Physical SmartShop Buddy Kit
              </p>
              <h2 className="text-base font-bold text-[#1C2820]">
                Did you bring your reusable shopping bag?
              </h2>
              <p className="text-xs text-[#546358] leading-relaxed">
                Use your foldable SmartShop Buddy cloth bag to avoid single-use bags.
              </p>
            </div>
          </div>

          {/* If the user selected "Not yet", show: "Don’t forget your reusable bag before you leave!" */}
          {bagResponse === 'not_yet' && !shoppingSession.reusableBagConfirmed && (
            <div className="p-3 rounded-xl bg-[#FDF8ED] border border-[#E6D0A3] flex items-center gap-2.5 text-xs font-semibold text-[#8C5E14]">
              <AlertTriangle className="w-4 h-4 text-[#B4690E] shrink-0" />
              <span>Don’t forget your reusable bag before you leave!</span>
            </div>
          )}

          <div className="pt-2 border-t border-[#EFECE6]">
            {shoppingSession.reusableBagConfirmed ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-[#2D5A3D] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Yes, I brought it (Foldable cloth bag ready)</span>
                </span>
                <button
                  type="button"
                  onClick={handleSelectBagNotYet}
                  className="text-xs text-[#546358] hover:text-[#1C2820] underline cursor-pointer"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSelectBagBrought}
                  disabled={bagBusy}
                  className="flex-1 py-2 px-3 bg-[#2D5A3D] hover:bg-[#234730] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Yes, I brought it
                </button>
                <button
                  type="button"
                  onClick={handleSelectBagNotYet}
                  disabled={bagBusy}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                    bagResponse === 'not_yet'
                      ? 'bg-[#FDF8ED] border-[#D99B26] text-[#8C5E14]'
                      : 'bg-[#FBF9F5] hover:bg-[#F3EFE6] border-[#D8D2C5] text-[#1C2820]'
                  }`}
                >
                  Not yet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2, 3, 6, 7. Main In-Store Shopping List + Add Forgotten Item + Bought Section */}
      <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EFECE6] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1C2820] font-display">
              Items to Purchase ({remainingList.length} remaining)
            </h2>
            <p className="text-xs text-[#546358]">
              Check off items or tap &ldquo;Bought&rdquo; as you place them in your basket.
            </p>
          </div>

          {/* 6. "+ Add Item" Button for Forgotten Items */}
          <button
            type="button"
            onClick={() => {
              setShowAddForgottenForm((prev) => !prev);
              setInStoreKitchenReminder(null);
            }}
            className="px-4 py-2 bg-[#FBF9F5] hover:bg-[#F1F6F2] text-[#2D5A3D] border border-[#2D5A3D]/40 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {showAddForgottenForm ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Close Form</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Item</span>
              </>
            )}
          </button>
        </div>

        {/* 6 & 7. Inline Form to Add a Forgotten Item During Shopping Mode */}
        {showAddForgottenForm && (
          <div className="p-5 rounded-2xl bg-[#FBF9F5] border border-[#D8D2C5] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1C2820]">
                  Add a Forgotten Item in Store
                </h3>
                <p className="text-xs text-[#546358]">
                  Remembered something while at the shop? Add it here—we’ll still check if you already have it in My Kitchen.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleForgottenItemSubmit}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
            >
              <div className="sm:col-span-3 space-y-1">
                <label className="block text-xs font-semibold text-[#1C2820]">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={forgottenName}
                  onChange={(e) => {
                    setForgottenName(e.target.value);
                    if (inStoreKitchenReminder) setInStoreKitchenReminder(null);
                  }}
                  placeholder="e.g., Milk, Bread, Soap"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-[#1C2820]">
                  Quantity
                </label>
                <input
                  type="text"
                  required
                  value={forgottenQuantityInput}
                  onChange={(e) => setForgottenQuantityInput(e.target.value)}
                  placeholder="e.g., 1 packet"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="block text-xs font-semibold text-[#1C2820]">
                  Category
                </label>
                <select
                  value={forgottenCategory}
                  onChange={(e) => setForgottenCategory(e.target.value as FoodCategory)}
                  className="w-full px-2.5 py-2 text-xs bg-white border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
                >
                  {FOOD_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-[#1C2820]">
                  Optional Note
                </label>
                <input
                  type="text"
                  value={forgottenNote}
                  onChange={(e) => setForgottenNote(e.target.value)}
                  placeholder="Note"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={addingForgotten}
                  className="w-full py-2 px-3 bg-[#2D5A3D] hover:bg-[#234730] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                >
                  Add to Trip
                </button>
              </div>
            </form>

            {/* 7. Prevent Unnecessary Purchases Reminder ("Keep Anyway" or "Remove") */}
            {inStoreKitchenReminder && (
              <div
                role="alertdialog"
                className="p-4 rounded-xl bg-[#FDF8ED] border-2 border-[#D99B26] space-y-3"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#9C6512] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-[#1C2820]">
                      You already have this at home.
                    </p>
                    <p className="text-xs text-[#3D3526]">
                      Your kitchen currently has{' '}
                      <strong className="font-mono tabular-nums">
                        {formatQuantity(
                          inStoreKitchenReminder.matchedKitchenItem.quantity,
                          inStoreKitchenReminder.matchedKitchenItem.unit
                        )}
                      </strong>{' '}
                      of {inStoreKitchenReminder.matchedKitchenItem.name}. Would you like to keep it on your list anyway or remove it?
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pl-8">
                  <button
                    type="button"
                    onClick={handleRemoveInStoreDuplicate}
                    className="px-4 py-2 bg-[#2D5A3D] hover:bg-[#234730] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={handleKeepAnywayInStore}
                    className="px-4 py-2 bg-white hover:bg-[#F3EFE6] text-[#1C2820] border border-[#D8D2C5] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Keep Anyway
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Checklist Body */}
        {shoppingList.length === 0 ? (
          <div className="py-10 text-center space-y-3 bg-[#FBF9F5] rounded-xl border border-dashed border-[#D8D2C5] p-6">
            <p className="text-sm font-semibold text-[#1C2820]">
              Your shopping list is currently empty.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowAddForgottenForm(true)}
                className="px-4 py-2 bg-[#2D5A3D] text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                + Add Item Here
              </button>
              <button
                type="button"
                onClick={() => onNavigate('shopping-list')}
                className="px-4 py-2 bg-white border border-[#D8D2C5] text-[#1C2820] text-xs font-semibold rounded-xl cursor-pointer"
              >
                Go to Shopping List
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 2. Planned Items Still Needed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#546358]">
                  Planned Shopping List ({plannedRemainingList.length} left)
                </h3>
              </div>

              {plannedRemainingList.length === 0 && inStoreAddedRemainingList.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#F1F6F2] border border-[#C5DBC9] text-xs font-semibold text-[#2D5A3D] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All items on your shopping list have been marked as bought!</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {plannedRemainingList.map((item) => renderRemainingItemRow(item))}
                </div>
              )}
            </div>

            {/* 6. Newly Added In-Store (Forgotten Items) Clearly Separated */}
            {inStoreAddedRemainingList.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-[#EFECE6]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9C6512]">
                  Added During Shopping ({inStoreAddedRemainingList.length})
                </h3>
                <div className="space-y-2.5">
                  {inStoreAddedRemainingList.map((item) => renderRemainingItemRow(item))}
                </div>
              </div>
            )}

            {/* 3. Purchased Items ("Bought" Section with Undo) */}
            {boughtList.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-[#EFECE6]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#2D5A3D] font-display">
                    Bought ({boughtList.length} of {totalItems} items bought)
                  </h3>
                  <span className="text-xs text-[#546358]">
                    Kitchen quantities will update when you finish shopping
                  </span>
                </div>

                <div className="space-y-2">
                  {boughtList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border bg-[#F1F6F2] border-[#C5DBC9] text-[#546358] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div
                        onClick={() => onToggleBought(item.id, false)}
                        className="flex items-center gap-3.5 cursor-pointer"
                      >
                        <CheckSquare className="w-5 h-5 text-[#2D5A3D] shrink-0" />
                        <span className="text-lg opacity-80">
                          {getItemIcon(item.name, item.category)}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-semibold line-through text-[#546358]">
                              {item.name}
                            </span>
                            <span className="text-xs font-mono tabular-nums font-semibold text-[#2D5A3D]">
                              — {formatQuantity(item.quantity, item.unit)}
                            </span>
                          </div>
                          <p className="text-xs text-[#546358]">
                            {item.category}
                            {item.addedInStore ? ' · Added in store' : ''}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleBought(item.id, false)}
                        className="px-3 py-1.5 bg-white hover:bg-[#FBF9F5] text-[#1C2820] border border-[#C5DBC9] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 self-end sm:self-center cursor-pointer whitespace-nowrap"
                        title="Undo marking as bought"
                      >
                        <Undo2 className="w-3.5 h-3.5 text-[#2D5A3D]" />
                        <span>Undo</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 9. Unchecked Items Confirmation Prompt Before Finishing */}
        {showUncheckedWarning && remainingList.length > 0 && (
          <div
            role="alertdialog"
            aria-labelledby="unchecked-items-title"
            className="p-6 rounded-2xl bg-[#FDF8ED] border-2 border-[#D99B26] space-y-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F7E8C6] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#9C6512]" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#9C6512]">
                  Unchecked Items Reminder
                </p>
                <h3 id="unchecked-items-title" className="text-lg font-bold text-[#1C2820]">
                  You still have {remainingList.length}{' '}
                  {remainingList.length === 1 ? 'item' : 'items'} left on your list.
                </h3>
                <p className="text-sm text-[#3D3526]">
                  Remaining: {remainingList.map((i) => i.name).join(', ')}. Would you like to go back and keep shopping, or finish your trip anyway?
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowUncheckedWarning(false)}
                className="px-5 py-2.5 bg-[#2D5A3D] hover:bg-[#234730] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={executeFinishShopping}
                disabled={completing}
                className="px-5 py-2.5 bg-white hover:bg-[#F3EFE6] text-[#1C2820] border border-[#D8D2C5] text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                {completing ? 'Finishing...' : 'Finish Anyway'}
              </button>
            </div>
          </div>
        )}

        {/* 9. Finish Shopping Footer CTA */}
        <div className="pt-4 border-t border-[#EFECE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-[#546358]">
            Kitchen quantities are only updated after you confirm <strong className="text-[#1C2820]">Finish Shopping</strong>.
          </div>

          <button
            type="button"
            onClick={handleFinishButtonClick}
            disabled={completing || shoppingList.length === 0}
            className="px-6 py-3.5 bg-[#2D5A3D] hover:bg-[#234730] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <span>{completing ? 'Completing Trip...' : 'Finish Shopping'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  function renderRemainingItemRow(item: ShoppingListItem) {
    const kitchenMatch = findMatchingKitchenItem(item.name, kitchenItems);
    const hasPartialAtHome = Boolean(kitchenMatch && kitchenMatch.quantity > 0);

    return (
      <div
        key={item.id}
        className="p-4 rounded-xl border bg-[#FBF9F5] border-[#E5E0D5] hover:border-[#2D5A3D] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div
          onClick={() => onToggleBought(item.id, true)}
          className="flex items-start gap-3.5 cursor-pointer flex-1"
        >
          <Square className="w-5 h-5 text-[#546358] mt-0.5 shrink-0" />
          <span className="text-xl leading-none mt-0.5">
            {getItemIcon(item.name, item.category)}
          </span>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-[#1C2820]">{item.name}</span>
              <span className="text-sm font-mono tabular-nums font-bold text-[#2D5A3D]">
                — Need {formatQuantity(item.quantity, item.unit)}
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
                  <span className="text-[#2D5A3D] font-semibold">
                    Kids&apos; Choice Token Pick
                  </span>
                </>
              )}
              {item.addedInStore && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#9C6512] font-semibold">Added in store</span>
                </>
              )}
            </div>

            {/* Whether it is already partly available at home */}
            {hasPartialAtHome && kitchenMatch && (
              <p className="text-xs font-medium text-[#8C5E14] bg-[#FDF8ED] border border-[#E6D0A3] px-2.5 py-1 rounded-lg inline-block mt-1">
                Partly available at home: You currently have{' '}
                <strong className="font-mono tabular-nums">
                  {formatQuantity(kitchenMatch.quantity, kitchenMatch.unit)}
                </strong>{' '}
                in My Kitchen
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleBought(item.id, true)}
          className="px-4 py-2 bg-[#2D5A3D] hover:bg-[#234730] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 self-end sm:self-center cursor-pointer whitespace-nowrap"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Bought</span>
        </button>
      </div>
    );
  }
};
