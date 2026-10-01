import React, { useState } from 'react';
import {
  Coins,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ShoppingCart,
} from 'lucide-react';
import {
  AppView,
  FoodCategory,
  KidsTokenState,
  ShoppingListItem,
  normalizeItemName,
} from '../types.ts';
import tokensImg from '../assets/images/kit_choice_tokens_1790843570596.jpg';

interface KidsTokensViewProps {
  kidsTokens: KidsTokenState;
  shoppingList: ShoppingListItem[];
  onUseToken: (label: string) => Promise<void>;
  onUpdateTokenChoice: (choiceId: string, label: string) => Promise<void>;
  onRemoveTokenChoice: (choiceId: string) => Promise<void>;
  onStartNewTrip: () => Promise<void>;
  onAddChoiceToShoppingList: (payload: {
    name: string;
    category: FoodCategory;
    quantity: number;
    unit: string;
    note?: string;
    fromKidsToken?: boolean;
  }) => Promise<void>;
  onNavigate: (view: AppView) => void;
}

const TOKEN_COLORS = [
  {
    name: 'Sage Green Token',
    activeBg: 'bg-[#E8EFEA]',
    activeBorder: 'border-[#2D5A3D]',
    activeAccent: 'text-[#2D5A3D]',
    dotBg: 'bg-[#2D5A3D]',
  },
  {
    name: 'Warm Amber Token',
    activeBg: 'bg-[#FDF6E7]',
    activeBorder: 'border-[#B87D1E]',
    activeAccent: 'text-[#9C6512]',
    dotBg: 'bg-[#B87D1E]',
  },
  {
    name: 'Terracotta Token',
    activeBg: 'bg-[#FBF0EC]',
    activeBorder: 'border-[#B5543C]',
    activeAccent: 'text-[#9E442E]',
    dotBg: 'bg-[#B5543C]',
  },
];

export const KidsTokensView: React.FC<KidsTokensViewProps> = ({
  kidsTokens,
  shoppingList,
  onUseToken,
  onUpdateTokenChoice,
  onRemoveTokenChoice,
  onStartNewTrip,
  onAddChoiceToShoppingList,
  onNavigate,
}) => {
  const [itemInput, setItemInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  const [editingChoiceId, setEditingChoiceId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');

  // Ensure 3-token foundation while respecting any saved state
  const totalTokens = 3;
  const usedHistory = kidsTokens.usedHistory || [];
  const usedCount = usedHistory.length;
  const remainingTokens = Math.max(0, totalTokens - usedCount);

  const handleUseTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (remainingTokens <= 0) return;
    if (!itemInput.trim()) {
      setErrorMsg('Please enter the item your child chose (for example: Chocolate, Juice, or Toy).');
      return;
    }
    setBusy(true);
    try {
      await onUseToken(itemInput.trim());
      setItemInput('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not record token choice.');
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveChoice = async (choiceId: string) => {
    if (busy) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      await onRemoveTokenChoice(choiceId);
    } finally {
      setBusy(false);
    }
  };

  const handleSaveEdit = async (choiceId: string) => {
    if (!editingLabel.trim() || busy) return;
    setBusy(true);
    try {
      await onUpdateTokenChoice(choiceId, editingLabel.trim());
      setEditingChoiceId(null);
    } finally {
      setBusy(false);
    }
  };

  const handleStartNewShoppingTrip = async () => {
    if (busy) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      await onStartNewTrip();
      setItemInput('');
    } finally {
      setBusy(false);
    }
  };

  const isItemInShoppingList = (choiceLabel: string): boolean => {
    const norm = normalizeItemName(choiceLabel);
    if (!norm) return false;
    return shoppingList.some((item) => normalizeItemName(item.name) === norm);
  };

  const handleAddToShoppingList = async (choiceLabel: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const lower = choiceLabel.toLowerCase();
      let category: FoodCategory = 'Snacks';
      if (lower.includes('juice') || lower.includes('drink') || lower.includes('milk')) {
        category = 'Drinks';
      } else if (lower.includes('apple') || lower.includes('berry') || lower.includes('fruit')) {
        category = 'Fruits & Vegetables';
      } else if (lower.includes('toy') || lower.includes('book') || lower.includes('sticker')) {
        category = 'Other';
      }
      await onAddChoiceToShoppingList({
        name: choiceLabel.trim(),
        category,
        quantity: 1,
        unit: '',
        note: "Kids' Choice Token pick",
        fromKidsToken: true,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
            Step 3 · Mindful Family Choices (3 Physical + Digital Tokens)
          </p>
          <h1 className="text-3xl font-bold text-[#1C2820] font-display">
            Kids&apos; Choice Tokens
          </h1>
          <p className="text-sm text-[#546358] max-w-2xl">
            {remainingTokens === 3
              ? 'You have 3 choices for this shopping trip.'
              : remainingTokens === 0
              ? 'You’ve used all 3 choices for this trip.'
              : `${remainingTokens} ${remainingTokens === 1 ? 'choice' : 'choices'} remaining for this shopping trip.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleStartNewShoppingTrip}
            disabled={busy}
            className="px-4 py-2.5 bg-[#FBF9F5] hover:bg-[#F3EFE6] text-[#1C2820] border border-[#D8D2C5] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#2D5A3D]" />
            <span>Start New Shopping Trip</span>
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

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: 3 Visual Tokens + Use a Token + Today's Choices */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Visual 3-Token Display & Use a Token Form */}
          <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EFECE6] pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
                  3 Choices Per Trip
                </span>
                <h2 className="text-2xl font-bold text-[#1C2820] font-display mt-0.5">
                  {remainingTokens === 3
                    ? 'You have 3 choices for this shopping trip.'
                    : remainingTokens === 0
                    ? 'You’ve used all 3 choices for this trip.'
                    : `${remainingTokens} ${remainingTokens === 1 ? 'choice' : 'choices'} remaining`}
                </h2>
              </div>

              <span className="px-3 py-1.5 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5] text-xs font-mono tabular-nums font-semibold text-[#1C2820]">
                {remainingTokens} / 3 Available
              </span>
            </div>

            {/* 3 Colorful, Mature Family-Friendly Token Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map((idx) => {
                const chosenEntry = usedHistory[idx];
                const isUsed = Boolean(chosenEntry);
                const style = TOKEN_COLORS[idx];

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border-2 p-5 transition-all flex flex-col justify-between min-h-[132px] ${
                      !isUsed
                        ? `${style.activeBg} ${style.activeBorder}`
                        : 'bg-[#FBF9F5] border-dashed border-[#D8D2C5]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono tabular-nums text-[#1C2820]">
                        Token {idx + 1}
                      </span>
                      <span
                        className={`w-3.5 h-3.5 rounded-full ${
                          !isUsed ? style.dotBg : 'bg-[#D8D2C5]'
                        }`}
                      />
                    </div>

                    {isUsed ? (
                      <div className="space-y-1 pt-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#546358]">
                          Chosen Item
                        </p>
                        <p className="text-base font-bold text-[#1C2820] truncate">
                          {chosenEntry.label}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 pt-3">
                        <p className={`text-sm font-bold ${style.activeAccent}`}>
                          Available Choice
                        </p>
                        <p className="text-xs text-[#546358]">
                          Ready for child&apos;s selection
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Use a Token Input or All Used Message */}
            {remainingTokens === 0 ? (
              <div className="p-5 rounded-2xl bg-[#F1F6F2] border border-[#C5DBC9] space-y-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#2D5A3D] shrink-0" />
                  <h3 className="text-base font-bold text-[#1C2820]">
                    You’ve used all 3 choices for this trip.
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#3C5243] leading-relaxed">
                  All 3 tokens have been assigned to items in <strong>Today&apos;s Choices</strong> below. You can remove a choice below to free up a token, or click <strong>Start New Shopping Trip</strong> when beginning your next trip.
                </p>
                <button
                  type="button"
                  disabled
                  className="w-full py-3 px-5 bg-[#D8D2C5] text-[#546358] font-semibold rounded-xl text-sm cursor-not-allowed"
                >
                  Use a Token (0 Choices Remaining)
                </button>
              </div>
            ) : (
              <form onSubmit={handleUseTokenSubmit} className="space-y-4 pt-2 border-t border-[#EFECE6]">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label htmlFor="child-choice-input" className="block text-sm font-semibold text-[#1C2820]">
                      What item did your child choose?
                    </label>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[#546358]">Examples:</span>
                      {['Chocolate', 'Juice', 'Toy'].map((ex) => (
                        <button
                          key={ex}
                          type="button"
                          onClick={() => {
                            setItemInput(ex);
                            setErrorMsg(null);
                          }}
                          className="px-2 py-0.5 rounded-md bg-[#F3EFE6] hover:bg-[#E8EFEA] text-[#1C2820] font-medium cursor-pointer"
                        >
                          {ex}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      id="child-choice-input"
                      type="text"
                      value={itemInput}
                      onChange={(e) => {
                        setItemInput(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      placeholder="Enter chosen item (e.g., Chocolate, Juice, Toy)"
                      className="flex-1 px-4 py-3 text-sm bg-[#FBF9F5] border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
                    />
                    <button
                      type="submit"
                      disabled={busy || remainingTokens <= 0}
                      className="px-6 py-3 bg-[#2D5A3D] hover:bg-[#234730] disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <Coins className="w-4 h-4" />
                      <span>Use a Token</span>
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs font-medium text-[#9B2C2C]">{errorMsg}</p>
                )}
              </form>
            )}
          </div>

          {/* Card 2: Today's Choices List + Edit/Remove + Shopping List Connection */}
          <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[#EFECE6] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#1C2820] font-display">
                  Today&apos;s Choices
                </h2>
                <p className="text-xs text-[#546358]">
                  Remove a choice anytime before finishing the trip to return that token, or add chosen items to your Shopping List.
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums font-semibold text-[#2D5A3D]">
                {usedCount} of 3 used
              </span>
            </div>

            {usedHistory.length === 0 ? (
              <div className="py-8 text-center space-y-2 bg-[#FBF9F5] rounded-xl border border-dashed border-[#D8D2C5] p-6">
                <p className="text-sm font-semibold text-[#1C2820]">
                  No tokens used yet on this shopping trip
                </p>
                <p className="text-xs text-[#546358]">
                  When your child selects an item they genuinely want, enter it above and select &ldquo;Use a Token&rdquo;.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {usedHistory.map((entry, idx) => {
                  const isEditing = editingChoiceId === entry.id;
                  const alreadyOnList = isItemInShoppingList(entry.label);

                  return (
                    <div
                      key={entry.id}
                      className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs font-bold font-mono text-[#2D5A3D] shrink-0">
                            Token {idx + 1} →
                          </span>
                          <input
                            type="text"
                            value={editingLabel}
                            onChange={(e) => setEditingLabel(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-sm bg-white border border-[#D8D2C5] rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(entry.id)}
                            className="px-3 py-1.5 bg-[#2D5A3D] text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingChoiceId(null)}
                            className="p-1.5 text-[#546358] hover:bg-[#EFECE6] rounded-lg cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold font-mono uppercase text-[#2D5A3D]">
                                Token {idx + 1} →
                              </span>
                              <span className="text-base font-bold text-[#1C2820]">
                                {entry.label}
                              </span>
                            </div>

                            {/* Connection With Shopping List */}
                            <div>
                              {alreadyOnList ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2D5A3D]">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Already included on Shopping List</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAddToShoppingList(entry.label)}
                                  disabled={busy}
                                  className="mt-1 px-3 py-1.5 bg-[#E8EFEA] hover:bg-[#DAE6DD] text-[#2D5A3D] text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                  <span>Add {entry.label} to Shopping List</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingChoiceId(entry.id);
                                setEditingLabel(entry.label);
                              }}
                              className="px-2.5 py-1.5 text-xs font-medium text-[#546358] hover:text-[#1C2820] hover:bg-[#EFECE6] rounded-lg flex items-center gap-1 cursor-pointer"
                              title="Edit choice"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveChoice(entry.id)}
                              disabled={busy}
                              className="px-2.5 py-1.5 text-xs font-medium text-[#9B2C2C] hover:bg-[#FDF2F2] rounded-lg flex items-center gap-1 cursor-pointer"
                              title="Remove choice and return token"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove Choice</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Columns: Physical Token Connection & New Shopping Trip Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Physical Token Connection Card */}
          <div className="bg-[#F3EFE6] rounded-2xl border border-[#E5E0D5] p-6 space-y-5">
            <div className="aspect-4/3 rounded-xl overflow-hidden bg-white border border-[#E5E0D5]">
              {!imgFailed ? (
                <img
                  src={tokensImg}
                  alt="SmartShop Buddy 3 physical choice tokens"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Coins className="w-10 h-10 text-[#2D5A3D]" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
                Physical + Digital Kit Integration
              </p>
              <h3 className="text-lg font-bold text-[#1C2820] font-display">
                3 Physical Choice Tokens
              </h3>
              <p className="text-sm text-[#3C5243] leading-relaxed">
                SmartShop Buddy also includes 3 physical choice tokens. Use the physical tokens together with the app to keep track of your child’s choices while shopping.
              </p>
            </div>

            {/* 3 Simple Physical Token Indicators */}
            <div className="p-4 rounded-xl bg-white border border-[#E5E0D5] space-y-2.5">
              <p className="text-xs font-semibold text-[#1C2820]">
                Physical Kit Token Sync:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((idx) => {
                  const entry = usedHistory[idx];
                  const style = TOKEN_COLORS[idx];
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#FBF9F5] border border-[#E5E0D5] text-center space-y-1"
                    >
                      <div className={`w-3 h-3 rounded-full mx-auto ${style.dotBg}`} />
                      <p className="text-[11px] font-bold text-[#1C2820]">
                        Token {idx + 1}
                      </p>
                      <p className="text-[10px] text-[#546358] truncate">
                        {entry ? entry.label : 'In child’s hand'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Start New Shopping Trip Card */}
          <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1C2820]">
                Starting a New Shopping Trip?
              </h3>
              <p className="text-xs text-[#546358] leading-relaxed">
                Resetting for a new trip restores all <strong>3 Choices</strong> and clears today&apos;s active choices while keeping all your previous shopping trip records saved in History.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartNewShoppingTrip}
              disabled={busy}
              className="w-full py-3 px-4 bg-[#FBF9F5] hover:bg-[#F3EFE6] text-[#1C2820] border border-[#D8D2C5] text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#2D5A3D]" />
              <span>Start New Shopping Trip (Reset to 3 Choices)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
