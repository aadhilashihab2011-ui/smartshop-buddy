import React, { useState, useMemo, useRef } from 'react';
import {
  Plus,
  Minus,
  Search,
  Edit3,
  Trash2,
  Check,
  X,
  Tag,
  Sparkles,
  FolderKanban,
  LayoutGrid,
  Package,
  ArrowRight,
} from 'lucide-react';
import {
  AppView,
  FoodCategory,
  FOOD_CATEGORIES,
  CATEGORY_METADATA,
  KitchenItem,
  formatQuantity,
  parseQuantityString,
  getItemIcon,
} from '../types.ts';
import labelsImg from '../assets/images/kit_organizer_labels_1790843581474.jpg';

interface KitchenInventoryViewProps {
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
  onNavigate?: (view: AppView) => void;
}

const QUICK_STAPLES: Array<{
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

export const KitchenInventoryView: React.FC<KitchenInventoryViewProps> = ({
  kitchenItems,
  onAddItem,
  onAddStarterPreset,
  onUpdateItem,
  onDeleteItem,
  onNavigate,
}) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Dairy');
  const [quantityInput, setQuantityInput] = useState('1 packet');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'category' | 'organization'>('cards');
  const [labelImgFailed, setLabelImgFailed] = useState(false);

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

  const handleQuickAdd = async (item: {
    name: string;
    category: FoodCategory;
    quantity: number;
    unit: string;
  }) => {
    setSubmitting(true);
    try {
      await onAddItem(item);
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
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [kitchenItems, searchQuery, selectedCategory]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<FoodCategory, KitchenItem[]> = {
      'Fruits & Vegetables': [],
      'Grains & Staples': [],
      'Dairy': [],
      'Snacks': [],
      'Drinks': [],
      'Canned / Packaged Food': [],
      'Other': [],
    };
    for (const item of filteredItems) {
      groups[item.category].push(item);
    }
    return groups;
  }, [filteredItems]);

  return (
    <div className="space-y-8">
      {/* Page Header & Flow Link to Shopping List */}
      <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
            Step 1 · Home Inventory &amp; Shelf Organization
          </p>
          <h1 className="text-3xl font-bold text-[#1C2820] font-display">My Kitchen</h1>
          <p className="text-sm text-[#546358] max-w-2xl">
            Add the items you already have at home. SmartShop Buddy compares your Shopping List directly against this inventory to help you avoid unnecessary purchases.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#F3EFE6] rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewMode === 'cards'
                  ? 'bg-white text-[#1C2820] shadow-xs'
                  : 'text-[#546358] hover:text-[#1C2820]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kitchen Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('category')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewMode === 'category'
                  ? 'bg-white text-[#1C2820] shadow-xs'
                  : 'text-[#546358] hover:text-[#1C2820]'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>By Category</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('organization')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewMode === 'organization'
                  ? 'bg-white text-[#1C2820] shadow-xs'
                  : 'text-[#546358] hover:text-[#1C2820]'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Organizer Labels</span>
            </button>
          </div>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('shopping-list')}
              className="px-4 py-2.5 bg-[#2D5A3D] hover:bg-[#234730] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Next: Shopping List</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick + Add Item Form */}
      <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFECE6] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1C2820] font-display">
              + Add Item to My Kitchen
            </h2>
            <p className="text-xs text-[#546358]">
              Keep your kitchen inventory up to date. Adding an existing item increases its quantity automatically.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddStarterPreset}
            disabled={submitting}
            className="px-3.5 py-2 text-xs font-semibold text-[#2D5A3D] bg-[#E8EFEA] hover:bg-[#DAE6DD] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample Staples</span>
          </button>
        </div>

        {/* One-Tap Staple Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#546358]">Quick add:</span>
          {QUICK_STAPLES.map((staple) => (
            <button
              key={staple.name}
              type="button"
              onClick={() => handleQuickAdd(staple)}
              disabled={submitting}
              className="px-3 py-1.5 text-xs font-medium bg-[#FBF9F5] hover:bg-[#F1F6F2] text-[#1C2820] border border-[#D8D2C5] hover:border-[#2D5A3D] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>{getItemIcon(staple.name, staple.category)}</span>
              <span className="font-semibold">{staple.name}</span>
              <span className="text-[#546358] font-mono tabular-nums">
                +{formatQuantity(staple.quantity, staple.unit)}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-3 space-y-1">
            <label className="block text-xs font-semibold text-[#1C2820]">Item Name *</label>
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

          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-semibold text-[#1C2820]">Optional Note</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Fridge shelf"
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
              <span>+ Add Item</span>
            </button>
          </div>
        </form>
      </div>

      {/* Home Organization Section (Connected to Physical Food Organizer Labels) */}
      {viewMode === 'organization' && (
        <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center border-b border-[#EFECE6] pb-6">
            <div className="lg:col-span-8 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
                Physical + Digital Home Organization
              </p>
              <h2 className="text-2xl font-bold text-[#1C2820] font-display">
                Using SmartShop Buddy Food Organizer Labels
              </h2>
              <p className="text-sm text-[#546358] leading-relaxed">
                The physical SmartShop Buddy kit includes durable, waterproof <strong>Food Organizer Labels</strong> for your pantry jars, fridge bins, and shelves. Each physical label matches one of the 7 categories in the app so your family can see what you have at a glance and return groceries to the right spot after every shopping trip.
              </p>
            </div>
            <div className="lg:col-span-4">
              <div className="aspect-4/3 rounded-xl overflow-hidden bg-[#EFECE6] border border-[#E5E0D5]">
                {!labelImgFailed ? (
                  <img
                    src={labelsImg}
                    alt="SmartShop Buddy food organizer labels on glass jars"
                    referrerPolicy="no-referrer"
                    onError={() => setLabelImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tag className="w-10 h-10 text-[#2D5A3D]" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FOOD_CATEGORIES.map((cat) => {
              const meta = CATEGORY_METADATA[cat];
              const count = kitchenItems.filter((i) => i.category === cat && i.quantity > 0).length;
              return (
                <div
                  key={cat}
                  className="p-5 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5] space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[#2D5A3D] font-mono tabular-nums">
                      <span>{meta.physicalLabelCode}</span>
                      <span>{count} item{count === 1 ? '' : 's'} at home</span>
                    </div>
                    <h3 className="text-base font-bold text-[#1C2820]">{cat}</h3>
                    <p className="text-xs text-[#546358] leading-relaxed">{meta.storageTip}</p>
                  </div>
                  <div className="pt-2 border-t border-[#EFECE6] flex items-center justify-between text-xs text-[#546358]">
                    <span>Recommended Zone: {meta.shelfLocation}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setViewMode('cards');
                      }}
                      className="font-semibold text-[#2D5A3D] hover:underline cursor-pointer"
                    >
                      View items →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Kitchen Inventory Container */}
      <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFECE6] pb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#546358] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items in My Kitchen..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#FBF9F5] border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
            />
          </div>

          <div className="text-xs text-[#546358] font-mono tabular-nums">
            Showing {filteredItems.length} of {kitchenItems.length} items in My Kitchen
          </div>
        </div>

        {/* Category Filter Tabs */}
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

        {/* Empty Kitchen State */}
        {kitchenItems.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-4 bg-[#FBF9F5] rounded-2xl border border-dashed border-[#D8D2C5]">
            <div className="w-12 h-12 rounded-2xl bg-[#E8EFEA] text-[#2D5A3D] flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-[#1C2820] font-display">
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
          <div className="py-10 text-center space-y-2 bg-[#FBF9F5] rounded-xl border border-dashed border-[#D8D2C5] p-6">
            <p className="text-sm font-semibold text-[#1C2820]">No matching kitchen items</p>
            <p className="text-xs text-[#546358]">
              Try clearing your search or selecting &ldquo;All&rdquo; categories.
            </p>
          </div>
        ) : viewMode === 'category' ? (
          <div className="space-y-8">
            {FOOD_CATEGORIES.map((cat) => {
              const items = groupedByCategory[cat];
              if (!items || items.length === 0) return null;
              const meta = CATEGORY_METADATA[cat];
              return (
                <div key={cat} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E0D5] pb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#1C2820]">{cat}</h3>
                      <span className="text-xs text-[#546358]">· {meta.physicalLabelCode}</span>
                    </div>
                    <span className="text-xs font-mono tabular-nums text-[#2D5A3D] font-semibold">
                      {items.length} item{items.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => renderKitchenCard(item))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => renderKitchenCard(item))}
          </div>
        )}
      </div>
    </div>
  );

  function renderKitchenCard(item: KitchenItem) {
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
            placeholder="Optional note"
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#D8D2C5] rounded-lg"
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => saveEdit(item.id)}
              className="px-3 py-1.5 bg-[#2D5A3D] text-white text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="p-1.5 text-[#546358] hover:bg-[#EFECE6] rounded-lg cursor-pointer"
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
        className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E5E0D5] hover:border-[#2D5A3D]/50 transition-colors flex flex-col justify-between gap-3"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none select-none mt-0.5" aria-hidden="true">
            {getItemIcon(item.name, item.category)}
          </span>
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-[#1C2820]">{item.name}</h3>
            <p
              className={`text-sm font-bold font-mono tabular-nums ${
                item.quantity === 0 ? 'text-[#9B2C2C]' : 'text-[#2D5A3D]'
              }`}
            >
              {formatQuantity(item.quantity, item.unit)}
            </p>
            <p className="text-xs text-[#546358]">
              {item.category}
              {item.notes ? ` · ${item.notes}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#EFECE6]">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                onUpdateItem(item.id, { quantity: Math.max(0, item.quantity - 1) })
              }
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-[#D8D2C5] text-[#1C2820] hover:bg-[#F3EFE6] cursor-pointer"
              title="Decrease quantity by 1"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="px-1.5 text-xs font-mono tabular-nums font-semibold text-[#1C2820]">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() => onUpdateItem(item.id, { quantity: item.quantity + 1 })}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-[#D8D2C5] text-[#1C2820] hover:bg-[#F3EFE6] cursor-pointer"
              title="Increase quantity by 1"
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
  }
};
