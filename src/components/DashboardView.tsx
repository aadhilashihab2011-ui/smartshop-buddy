import React, { useState } from 'react';
import {
  Package,
  ShoppingCart,
  Coins,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Tag,
  Clock,
} from 'lucide-react';
import {
  AppView,
  UserAccountData,
  formatQuantity,
} from '../types.ts';
import bagImg from '../assets/images/kit_reusable_bag_1790843558148.jpg';
import tokensImg from '../assets/images/kit_choice_tokens_1790843570596.jpg';
import labelsImg from '../assets/images/kit_organizer_labels_1790843581474.jpg';

interface DashboardViewProps {
  account: UserAccountData;
  onNavigate: (view: AppView) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ account, onNavigate }) => {
  const { user, kitchenItems, shoppingList, kidsTokens, shoppingSession, shoppingHistory } = account;
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});

  const activeKitchenItems = kitchenItems.filter((i) => i.quantity > 0);
  const totalKitchenUnits = activeKitchenItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const plannedCount = shoppingList.length;
  const boughtCount = shoppingList.filter((i) => i.bought).length;

  return (
    <div className="space-y-8">
      {/* Greeting & Primary Action Buttons */}
      <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
            Family Shopping Companion
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1C2820] font-display">
            Hi, {user.name}!
          </h1>
          <p className="text-lg text-[#546358]">Ready to shop smarter?</p>
        </div>

        {/* 4 Required Clear Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('kitchen')}
            className="px-4 py-2.5 bg-[#FBF9F5] hover:bg-[#F3EFE6] text-[#1C2820] border border-[#D8D2C5] text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            Check My Kitchen
          </button>

          <button
            type="button"
            onClick={() => onNavigate('shopping-list')}
            className="px-4 py-2.5 bg-[#FBF9F5] hover:bg-[#F3EFE6] text-[#1C2820] border border-[#D8D2C5] text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            Create Shopping List
          </button>

          <button
            type="button"
            onClick={() => onNavigate('kids-tokens')}
            className="px-4 py-2.5 bg-[#FBF9F5] hover:bg-[#F3EFE6] text-[#1C2820] border border-[#D8D2C5] text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            Kids&apos; Tokens
          </button>

          <button
            type="button"
            onClick={() => onNavigate('shopping-mode')}
            className="px-5 py-2.5 bg-[#2D5A3D] hover:bg-[#234730] text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: My Kitchen */}
        <div
          onClick={() => onNavigate('kitchen')}
          className="bg-white rounded-2xl border border-[#E5E0D5] p-6 hover:border-[#2D5A3D] transition-colors cursor-pointer flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#546358]">My Kitchen</span>
            <Package className="w-5 h-5 text-[#2D5A3D]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1C2820] font-mono tabular-nums">
              {activeKitchenItems.length} items at home
            </p>
            <p className="text-xs text-[#546358] mt-1 font-mono tabular-nums">
              {totalKitchenUnits} total units tracked across categories
            </p>
          </div>
          <div className="text-xs font-semibold text-[#2D5A3D] flex items-center gap-1">
            <span>Check My Kitchen</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Shopping List */}
        <div
          onClick={() => onNavigate('shopping-list')}
          className="bg-white rounded-2xl border border-[#E5E0D5] p-6 hover:border-[#2D5A3D] transition-colors cursor-pointer flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#546358]">Shopping List</span>
            <ShoppingCart className="w-5 h-5 text-[#2D5A3D]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1C2820] font-mono tabular-nums">
              {plannedCount} items planned
            </p>
            <p className="text-xs text-[#546358] mt-1 font-mono tabular-nums">
              {boughtCount} marked bought · {shoppingSession.duplicatesAvoidedCount} duplicates avoided
            </p>
          </div>
          <div className="text-xs font-semibold text-[#2D5A3D] flex items-center gap-1">
            <span>Create Shopping List</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Kids' Tokens */}
        <div
          onClick={() => onNavigate('kids-tokens')}
          className="bg-white rounded-2xl border border-[#E5E0D5] p-6 hover:border-[#2D5A3D] transition-colors cursor-pointer flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#546358]">Kids&apos; Tokens</span>
            <Coins className="w-5 h-5 text-[#2D5A3D]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1C2820] font-mono tabular-nums">
              {kidsTokens.remainingTokens} choices remaining
            </p>
            <p className="text-xs text-[#546358] mt-1 font-mono tabular-nums">
              Out of {kidsTokens.totalTokens} tokens set for today&apos;s trip
            </p>
          </div>
          <div className="text-xs font-semibold text-[#2D5A3D] flex items-center gap-1">
            <span>Manage Kids&apos; Tokens</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Sustainability */}
        <div
          onClick={() => onNavigate('shopping-mode')}
          className="bg-white rounded-2xl border border-[#E5E0D5] p-6 hover:border-[#2D5A3D] transition-colors cursor-pointer flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#546358]">Sustainability</span>
            <ShoppingBag className="w-5 h-5 text-[#2D5A3D]" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#2D5A3D]">
              {shoppingSession.reusableBagConfirmed
                ? 'Reusable bag packed'
                : 'Reusable bag reminder ready'}
            </p>
            <p className="text-xs text-[#546358] mt-1">
              {shoppingSession.reusableBagConfirmed
                ? 'Confirmed for your current trip'
                : 'Foldable cloth bag check before shopping'}
            </p>
          </div>
          <div className="text-xs font-semibold text-[#2D5A3D] flex items-center gap-1">
            <span>Open Shopping Mode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Two-Column Split: Kitchen & Shopping List Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Kitchen Inventory Snapshot */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5E0D5] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3">
            <div>
              <h2 className="text-lg font-bold text-[#1C2820] font-display">
                At Home in My Kitchen
              </h2>
              <p className="text-xs text-[#546358]">
                SmartShop Buddy checks this list before you add new shopping items.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('kitchen')}
              className="text-xs font-semibold text-[#2D5A3D] hover:underline cursor-pointer whitespace-nowrap"
            >
              View All ({activeKitchenItems.length}) →
            </button>
          </div>

          {activeKitchenItems.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <p className="text-sm text-[#546358]">No items in your kitchen inventory yet.</p>
              <button
                type="button"
                onClick={() => onNavigate('kitchen')}
                className="px-4 py-2 bg-[#2D5A3D] text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Add Kitchen Items
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#EFECE6]">
              {activeKitchenItems.slice(0, 6).map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1C2820]">{item.name}</span>
                    <span className="text-xs text-[#546358]">· {item.category}</span>
                  </div>
                  <span className="font-mono tabular-nums text-xs font-semibold text-[#2D5A3D]">
                    {formatQuantity(item.quantity, item.unit)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Current Shopping List Snapshot */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5E0D5] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3">
            <div>
              <h2 className="text-lg font-bold text-[#1C2820] font-display">
                Planned Shopping List
              </h2>
              <p className="text-xs text-[#546358]">
                Items verified against your home inventory for the next trip.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('shopping-list')}
              className="text-xs font-semibold text-[#2D5A3D] hover:underline cursor-pointer whitespace-nowrap"
            >
              Manage List ({shoppingList.length}) →
            </button>
          </div>

          {shoppingList.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <p className="text-sm text-[#546358]">Your shopping list is currently empty.</p>
              <button
                type="button"
                onClick={() => onNavigate('shopping-list')}
                className="px-4 py-2 bg-[#2D5A3D] text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Create Shopping List
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#EFECE6]">
              {shoppingList.slice(0, 6).map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${item.bought ? 'line-through text-[#546358]' : 'text-[#1C2820]'}`}>
                      {item.name}
                    </span>
                    <span className="text-xs text-[#546358]">· {item.category}</span>
                  </div>
                  <span className="font-mono tabular-nums text-xs font-semibold text-[#1C2820]">
                    {formatQuantity(item.quantity, item.unit)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SmartShop Buddy's Core Idea & Workflow */}
      <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFECE6] pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
              SmartShop Buddy Core Workflow
            </p>
            <h2 className="text-xl font-bold text-[#1C2820] font-display">
              Plan → Choose → Shop → Organize → Waste Less
            </h2>
          </div>
          {shoppingHistory.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-[#2D5A3D] hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{shoppingHistory.length} completed trip{shoppingHistory.length === 1 ? '' : 's'} in History</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div
            onClick={() => onNavigate('kitchen')}
            className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5] hover:border-[#2D5A3D] transition-colors cursor-pointer space-y-1.5"
          >
            <p className="text-xs font-semibold text-[#2D5A3D]">01. Before Shopping</p>
            <p className="text-sm font-semibold text-[#1C2820]">Check what you have</p>
            <p className="text-xs text-[#546358]">
              Review your {activeKitchenItems.length} kitchen items organized by shelf label.
            </p>
          </div>

          <div
            onClick={() => onNavigate('shopping-list')}
            className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5] hover:border-[#2D5A3D] transition-colors cursor-pointer space-y-1.5"
          >
            <p className="text-xs font-semibold text-[#2D5A3D]">02. Plan</p>
            <p className="text-sm font-semibold text-[#1C2820]">Create your shopping list</p>
            <p className="text-xs text-[#546358]">
              Automatic alerts warn you if an item is already in My Kitchen.
            </p>
          </div>

          <div
            onClick={() => onNavigate('kids-tokens')}
            className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5] hover:border-[#2D5A3D] transition-colors cursor-pointer space-y-1.5"
          >
            <p className="text-xs font-semibold text-[#2D5A3D]">03. Prepare</p>
            <p className="text-sm font-semibold text-[#1C2820]">Tokens &amp; Reusable Bag</p>
            <p className="text-xs text-[#546358]">
              Set children&apos;s choice tokens ({kidsTokens.totalTokens}) and pack your foldable cloth bag.
            </p>
          </div>

          <div
            onClick={() => onNavigate('shopping-mode')}
            className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5] hover:border-[#2D5A3D] transition-colors cursor-pointer space-y-1.5"
          >
            <p className="text-xs font-semibold text-[#2D5A3D]">04. Shop</p>
            <p className="text-sm font-semibold text-[#1C2820]">Follow the list in-store</p>
            <p className="text-xs text-[#546358]">
              Check off items, confirm your reusable bag, and spend choice tokens mindfully.
            </p>
          </div>

          <div
            onClick={() => onNavigate('history')}
            className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5] hover:border-[#2D5A3D] transition-colors cursor-pointer space-y-1.5"
          >
            <p className="text-xs font-semibold text-[#2D5A3D]">05. After Shopping</p>
            <p className="text-sm font-semibold text-[#1C2820]">Update &amp; Keep History</p>
            <p className="text-xs text-[#546358]">
              Add bought quantities directly to My Kitchen and track every trip.
            </p>
          </div>
        </div>
      </div>

      {/* Physical SmartShop Buddy Kit Strip */}
      <div className="bg-[#F3EFE6] rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
            Physical SmartShop Buddy Kit + Digital App
          </p>
          <h2 className="text-xl font-bold text-[#1C2820] font-display">
            How your physical kit works with this dashboard
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl border border-[#E5E0D5] p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-[#E8EFEA] overflow-hidden shrink-0">
              {!imgFailed.bag ? (
                <img
                  src={bagImg}
                  alt="Foldable reusable cloth bag"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed((p) => ({ ...p, bag: true }))}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-[#2D5A3D]" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#1C2820]">Foldable Reusable Cloth Bag</h3>
              <p className="text-xs text-[#546358]">
                Paired with the Shopping Mode reminder to replace single-use plastic bags.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E0D5] p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-[#F4EFE6] overflow-hidden shrink-0">
              {!imgFailed.tokens ? (
                <img
                  src={tokensImg}
                  alt="3 colorful kids choice tokens"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed((p) => ({ ...p, tokens: true }))}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-[#2D5A3D]" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#1C2820]">3 Colorful Kids&apos; Choice Tokens</h3>
              <p className="text-xs text-[#546358]">
                Kids hand over a physical token in-store while you tap &ldquo;Use 1 Token&rdquo; in the app.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E0D5] p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-[#EFECE6] overflow-hidden shrink-0">
              {!imgFailed.labels ? (
                <img
                  src={labelsImg}
                  alt="Food organizer labels"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed((p) => ({ ...p, labels: true }))}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Tag className="w-6 h-6 text-[#2D5A3D]" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#1C2820]">Food Organizer Labels</h3>
              <p className="text-xs text-[#546358]">
                Match the 7 categories in My Kitchen so shelves and pantry jars stay organized.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
