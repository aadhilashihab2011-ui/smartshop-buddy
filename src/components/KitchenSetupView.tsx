import React, { useState, useMemo, useRef } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Check,
  X,
  Minus,
  ArrowRight,
  Sparkles,
  Package,
} from 'lucide-react';
import {
  FoodCategory,
  FOOD_CATEGORIES,
  KitchenItem,
  formatQuantity,
  parseQuantityString,
  getItemIcon,
} from '../types.ts';

interface KitchenSetupViewProps {
  userName: string;
  kitchenItems: KitchenItem[];
  onAddItem: (payload: {
    name: string;
    category: FoodCategory;
    quantity: number;
    unit: string;
    notes?: string;
  }) => Promise<void>;
  onAddStarterPreset: () => Promise<void>;
  onUpdateItem: (
    id: string,
    payload: Partial<Pick<KitchenItem, 'name' | 'category' | 'quantity' | 'unit' | 'notes'>>
  ) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onCompleteSetup: () => Promise<void>;
}

const QUICK_ADD_SUGGESTIONS: Array<{
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
}> = [
  { name: 'Milk', category: 'Dairy', quantity: 2, unit: 'packet' },
  { name: 'Bread', category: 'Grains & Staples', quantity: 1, unit: 'packet' },
  { name: 'Eggs', category: 'Dairy', quantity: 10, unit: '' },
  { name: 'Apples', category: 'Fruits & Vegetables', quantity: 6, unit: '' },
  { name: 'Rice', category: 'Grains & Staples', quantity: 5, unit: 'kg' },
  { name: 'Cereal', category: 'Snacks', quantity: 1, unit: 'box' },
];

export const KitchenSetupView: React.FC<KitchenSetupViewProps> = ({
  userName,
  kitchenItems,
  onAddItem,
  onAddStarterPreset,
  onUpdateItem,
  onDeleteItem,
  onCompleteSetup,
}) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [quantityInput, setQuantityInput] = useState('1 packet');
  const [category, setCategory] = useState<FoodCategory>('Dairy');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<FoodCategory>('Other');
  const [editQuantityStr, setEditQuantityStr] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const parsed = parseQuantityString(quantityInput);
      await onAddItem({
        name: name.trim(),
        category,
        quantity: parsed.quantity,
        unit: parsed.unit,
        notes: notes.trim(),
      });
      setName('');
      setQuantityInput('1');
      setNotes('');
      nameInputRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickChipAdd = async (chip: {
    name: string;
    category: FoodCategory;
    quantity: number;
    unit: string;
  }) => {
    setSubmitting(true);
    try {
      await onAddItem(chip);
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (item: KitchenItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditQuantityStr(formatQuantity(item.quantity, item.unit));
    setEditNotes(item.notes || '');
  };

  const saveEdit = async (itemId: string) => {
    if (!editName.trim()) return;
    const parsed = parseQuantityString(editQuantityStr);
    await onUpdateItem(itemId, {
      name: editName.trim(),
      category: editCategory,
      quantity: parsed.quantity,
      unit: parsed.unit,
      notes: editNotes.trim(),
    });
    setEditingId(null);
  };

  const filteredItems = useMemo(() => {
    return kitchenItems.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [kitchenItems, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C2820] py-10 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
              First-Time Kitchen Setup · Welcome, {userName}
            </p>
            <span className="text-xs text-[#546358] font-mono tabular-nums">
              {kitchenItems.length} item{kitchenItems.length === 1 ? '' : 's'} in My Kitchen
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#1C2820] font-display">
            Let&apos;s set up your kitchen
          </h1>

          <p className="text-base text-[#546358] leading-relaxed max-w-2xl">
            Add the items you already have at home. SmartShop Buddy will use this information to help you avoid unnecessary purchases.
          </p>
        </div>

        {/* Simple, Fast + Add Item Card */}
        <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFECE6] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1C2820] font-display">
                Quick Add to My Kitchen
              </h2>
              <p className="text-xs text-[#546358]">
                Enter an item below or tap any common staple to add it immediately.
              </p>
            </div>

            <button
              type="button"
              onClick={onAddStarterPreset}
              disabled={submitting}
              className="px-3.5 py-2 text-xs font-semibold text-[#2D5A3D] bg-[#E8EFEA] hover:bg-[#DAE6DD] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Add All 6 Sample Staples</span>
            </button>
          </div>

          {/* One-Tap Quick Staple Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#546358]">One-tap add:</span>
            {QUICK_ADD_SUGGESTIONS.map((chip) => (
              <button
                key={chip.name}
                type="button"
                onClick={() => handleQuickChipAdd(chip)}
                disabled={submitting}
                className="px-3 py-1.5 text-xs font-medium bg-[#FBF9F5] hover:bg-[#F1F6F2] text-[#1C2820] border border-[#D8D2C5] hover:border-[#2D5A3D] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>{getItemIcon(chip.name, chip.category)}</span>
                <span className="font-semibold">{chip.name}</span>
                <span className="text-[#546358] font-mono tabular-nums">
                  ({formatQuantity(chip.quantity, chip.unit)})
                </span>
                <Plus className="w-3 h-3 text-[#2D5A3D]" />
              </button>
            ))}
          </div>

          {/* Streamlined Add Form */}
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
            <div className="sm:col-span-4 space-y-1">
              <label className="block text-xs font-semibold text-[#1C2820]">Item Name</label>
              <input
                ref={nameInputRef}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Milk, Bread, Eggs"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-[#1C2820]">Quantity</label>
              <input
                type="text"
                required
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                placeholder="e.g., 2 packets"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
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

            <div className="sm:col-span-3 space-y-1">
              <label className="block text-xs font-semibold text-[#1C2820]">Optional Note</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Note (optional)"
                  className="w-full px-3 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2.5 bg-[#2D5A3D] hover:bg-[#234730] text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Item</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* My Kitchen Inventory Display */}
        <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFECE6] pb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1C2820] font-display">My Kitchen</h2>
              <p className="text-xs text-[#546358]">
                Items currently saved in your home inventory.
              </p>
            </div>

            {kitchenItems.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#546358] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search My Kitchen..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FBF9F5] border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
                />
              </div>
            )}
          </div>

          {kitchenItems.length > 0 && (
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
          )}

          {/* Empty Kitchen State vs Populated Kitchen Cards */}
          {kitchenItems.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-4 bg-[#FBF9F5] rounded-2xl border border-dashed border-[#D8D2C5]">
              <div className="w-12 h-12 rounded-2xl bg-[#E8EFEA] text-[#2D5A3D] flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-[#1C2820] font-display">
                  Your kitchen is empty
                </h3>
                <p className="text-sm text-[#546358] leading-relaxed">
                  Add the items you currently have so SmartShop Buddy can help you make smarter shopping decisions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => nameInputRef.current?.focus()}
                className="px-5 py-2.5 bg-[#2D5A3D] hover:bg-[#234730] text-white text-sm font-semibold rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Your First Item</span>
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#546358]">
              No kitchen items match your current search or category filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const isEditing = editingId === item.id;
                if (isEditing) {
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#FBF9F5] border-2 border-[#2D5A3D] space-y-3"
                    >
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-[#D8D2C5] rounded-lg"
                        placeholder="Item name"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editQuantityStr}
                          onChange={(e) => setEditQuantityStr(e.target.value)}
                          className="px-3 py-1.5 text-xs bg-white border border-[#D8D2C5] rounded-lg"
                          placeholder="Quantity"
                        />
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as FoodCategory)}
                          className="px-2 py-1.5 text-xs bg-white border border-[#D8D2C5] rounded-lg"
                        >
                          {FOOD_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#D8D2C5] rounded-lg"
                        placeholder="Optional note"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => saveEdit(item.id)}
                          className="px-3 py-1.5 bg-[#2D5A3D] text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1.5 text-xs text-[#546358] hover:bg-[#EFECE6] rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E5E0D5] hover:border-[#2D5A3D]/50 transition-colors flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl leading-none select-none mt-0.5" aria-hidden="true">
                          {getItemIcon(item.name, item.category)}
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-[#1C2820]">{item.name}</h3>
                          <p className="text-sm font-semibold text-[#2D5A3D] font-mono tabular-nums">
                            {formatQuantity(item.quantity, item.unit)}
                          </p>
                          <p className="text-xs text-[#546358] mt-0.5">
                            {item.category}
                            {item.notes ? ` · ${item.notes}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#EFECE6]">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateItem(item.id, { quantity: Math.max(0, item.quantity - 1) })
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-[#D8D2C5] text-[#1C2820] hover:bg-[#F3EFE6] cursor-pointer"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateItem(item.id, { quantity: item.quantity + 1 })}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-[#D8D2C5] text-[#1C2820] hover:bg-[#F3EFE6] cursor-pointer"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEditing(item)}
                          className="p-1.5 text-[#546358] hover:text-[#1C2820] hover:bg-[#EFECE6] rounded-lg cursor-pointer"
                          title="Edit item"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 text-[#9B2C2C] hover:bg-[#FDF2F2] rounded-lg cursor-pointer"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Setup Complete Footer */}
        <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#546358]">
            Your kitchen inventory is saved to your account and can be updated anytime.
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onCompleteSetup}
              className="px-4 py-2.5 text-xs font-medium text-[#546358] hover:text-[#1C2820] hover:bg-[#F3EFE6] rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Skip for Now
            </button>

            <button
              type="button"
              onClick={onCompleteSetup}
              className="px-6 py-3 bg-[#2D5A3D] hover:bg-[#234730] text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span>Kitchen Setup Complete</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
