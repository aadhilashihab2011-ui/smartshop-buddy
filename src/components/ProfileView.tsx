import React, { useState } from 'react';
import {
  User,
  LogOut,
  CheckCircle2,
  ShoppingBag,
  Coins,
  Tag,
  Terminal,
  PlayCircle,
  ArrowRight,
} from 'lucide-react';
import { AppView, UserAccountData } from '../types.ts';
import bagImg from '../assets/images/kit_reusable_bag_1790843558148.jpg';
import tokensImg from '../assets/images/kit_choice_tokens_1790843570596.jpg';
import labelsImg from '../assets/images/kit_organizer_labels_1790843581474.jpg';

interface ProfileViewProps {
  account: UserAccountData;
  onUpdateProfile: (name: string) => Promise<void>;
  onLogOut: () => Promise<void>;
  onReopenKitchenSetup: () => void;
  onNavigate: (view: AppView) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  account,
  onUpdateProfile,
  onLogOut,
  onReopenKitchenSetup,
  onNavigate,
}) => {
  const { user, kitchenItems, shoppingList, shoppingHistory } = account;
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setSavedMessage(false);
    try {
      await onUpdateProfile(name.trim());
      setSavedMessage(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
            Account &amp; System Companion
          </p>
          <h1 className="text-3xl font-bold text-[#1C2820] font-display">
            Profile &amp; Settings
          </h1>
          <p className="text-sm text-[#546358]">
            Manage your personal SmartShop Buddy account, view the Physical Kit guide, or review the Hackathon Demo &amp; Deployment documentation.
          </p>
        </div>

        <button
          type="button"
          onClick={onLogOut}
          className="px-5 py-2.5 bg-[#FDF2F2] hover:bg-[#F9E2E2] text-[#9B2C2C] border border-[#F5C6C6] text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Account Settings + Account Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-[#EFECE6] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E8EFEA] flex items-center justify-center">
              <User className="w-5 h-5 text-[#2D5A3D]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1C2820]">Account Details</h2>
              <p className="text-xs text-[#546358]">
                Your data is private and isolated to your account ({user.email}).
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1C2820]">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1C2820]">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F3EFE6] text-[#546358] border border-[#E5E0D5] rounded-xl cursor-not-allowed"
              />
            </div>

            {savedMessage && (
              <div className="p-3 rounded-xl bg-[#F1F6F2] border border-[#C5DBC9] text-xs font-semibold text-[#2D5A3D] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile updated!</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-[#2D5A3D] hover:bg-[#234730] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                type="button"
                onClick={onReopenKitchenSetup}
                className="px-4 py-2.5 bg-[#FBF9F5] hover:bg-[#F3EFE6] text-[#1C2820] border border-[#D8D2C5] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Open Initial Kitchen Setup Wizard
              </button>
            </div>
          </form>
        </div>

        {/* Account Isolation & Summary */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-[#EFECE6] pb-4">
              <h2 className="text-lg font-bold text-[#1C2820]">Your Saved Account Data</h2>
              <p className="text-xs text-[#546358]">
                Stored persistently in your personal SmartShop Buddy account profile.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5]">
                <p className="text-xs text-[#546358]">Kitchen Items</p>
                <p className="text-2xl font-bold text-[#1C2820] font-mono tabular-nums mt-1">
                  {kitchenItems.length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5]">
                <p className="text-xs text-[#546358]">Planned List</p>
                <p className="text-2xl font-bold text-[#1C2820] font-mono tabular-nums mt-1">
                  {shoppingList.length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5]">
                <p className="text-xs text-[#546358]">Past Trips</p>
                <p className="text-2xl font-bold text-[#2D5A3D] font-mono tabular-nums mt-1">
                  {shoppingHistory.length}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F1F6F2] border border-[#C5DBC9] space-y-1">
            <p className="text-xs font-semibold text-[#2D5A3D]">
              Plan → Choose → Shop → Organize → Waste Less
            </p>
            <p className="text-xs text-[#3C5243]">
              Every kitchen item, shopping list check, choice token, and trip summary is linked strictly to your logged-in user ID.
            </p>
          </div>
        </div>
      </div>

      {/* Physical SmartShop Buddy Kit Guide */}
      <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#EFECE6] pb-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
            Physical + Digital Companion System
          </p>
          <h2 className="text-2xl font-bold text-[#1C2820] font-display">
            The Physical SmartShop Buddy Kit
          </h2>
          <p className="text-sm text-[#546358]">
            How the three physical components work together with this web application to support one unified family habit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-[#E5E0D5] overflow-hidden bg-[#FBF9F5] flex flex-col">
            <div className="aspect-4/3 bg-[#E8EFEA]">
              {!imgFailed.bag ? (
                <img
                  src={bagImg}
                  alt="Foldable reusable cloth shopping bag"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed((p) => ({ ...p, bag: true }))}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-[#2D5A3D]" />
                </div>
              )}
            </div>
            <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#1C2820]">
                  1. Foldable Reusable Cloth Bag
                </h3>
                <p className="text-xs text-[#546358] leading-relaxed">
                  Carried in a pocket or purse. Before starting in-store shopping, the app prompts you to confirm you brought your cloth bag so your family avoids single-use plastic bags.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('shopping-mode')}
                className="text-xs font-semibold text-[#2D5A3D] hover:underline flex items-center gap-1 pt-2 cursor-pointer"
              >
                <span>See in Shopping Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E0D5] overflow-hidden bg-[#FBF9F5] flex flex-col">
            <div className="aspect-4/3 bg-[#F4EFE6]">
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
                  <Coins className="w-8 h-8 text-[#2D5A3D]" />
                </div>
              )}
            </div>
            <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#1C2820]">
                  2. Three Colorful Kids&apos; Choice Tokens
                </h3>
                <p className="text-xs text-[#546358] leading-relaxed">
                  Kids hold physical tokens in the store and exchange 1 token for a treat they genuinely want, synced with the digital counter (3 → 2 → 1 → 0).
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('kids-tokens')}
                className="text-xs font-semibold text-[#2D5A3D] hover:underline flex items-center gap-1 pt-2 cursor-pointer"
              >
                <span>Open Kids&apos; Tokens</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E0D5] overflow-hidden bg-[#FBF9F5] flex flex-col">
            <div className="aspect-4/3 bg-[#EFECE6]">
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
                  <Tag className="w-8 h-8 text-[#2D5A3D]" />
                </div>
              )}
            </div>
            <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#1C2820]">
                  3. Food Organizer Labels
                </h3>
                <p className="text-xs text-[#546358] leading-relaxed">
                  Placed on kitchen jars and fridge bins to match the 7 categories in My Kitchen so every item is easy to find before and after shopping.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('kitchen')}
                className="text-xs font-semibold text-[#2D5A3D] hover:underline flex items-center gap-1 pt-2 cursor-pointer"
              >
                <span>View Kitchen Categories</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hackathon Demo Flow & Installation/Deployment Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 14-Step Hackathon Demo Guide */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#EFECE6] pb-3">
            <PlayCircle className="w-5 h-5 text-[#2D5A3D]" />
            <h2 className="text-lg font-bold text-[#1C2820] font-display">
              3–5 Minute Hackathon Demo Checklist
            </h2>
          </div>
          <ol className="space-y-2 text-xs text-[#546358] list-decimal list-inside leading-relaxed">
            <li>Create a new account or log in to a saved SmartShop Buddy account.</li>
            <li>Set up the kitchen by adding existing home items (e.g., Milk — 2 packets, Rice — 5 kg).</li>
            <li>Navigate to the <strong className="text-[#1C2820]">Shopping List</strong> tab.</li>
            <li>Enter <strong className="text-[#1C2820]">Milk</strong> to trigger the automatic kitchen duplicate warning (&ldquo;You already have Milk at home&rdquo;) and choose &ldquo;Don&apos;t Add&rdquo; or &ldquo;Add Anyway&rdquo;.</li>
            <li>Add a genuinely needed item (e.g., <strong className="text-[#1C2820]">Vegetables</strong>).</li>
            <li>Open <strong className="text-[#1C2820]">Kids&apos; Tokens</strong> and set today&apos;s choice token allowance (e.g., 3 tokens).</li>
            <li>Enter <strong className="text-[#1C2820]">Shopping Mode</strong>.</li>
            <li>Mark items on the checklist as bought (<span className="font-mono">3 / 7 items completed</span>).</li>
            <li>Tap <strong className="text-[#1C2820]">Use 1 Token</strong> when a child chooses an item.</li>
            <li>Confirm the <strong className="text-[#1C2820]">♻️ Reusable Bag</strong> reminder (&ldquo;Yes, I&apos;m ready&rdquo;).</li>
            <li>Tap <strong className="text-[#1C2820]">Finish Shopping</strong>.</li>
            <li>Review the <strong className="text-[#1C2820]">Shopping Complete!</strong> summary.</li>
            <li>Click <strong className="text-[#1C2820]">Update Kitchen Inventory</strong> to add bought quantities directly to My Kitchen.</li>
            <li>Open <strong className="text-[#1C2820]">History</strong> to view the saved trip record.</li>
          </ol>
        </div>

        {/* Installation & Deployment Documentation */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#EFECE6] pb-3">
            <Terminal className="w-5 h-5 text-[#2D5A3D]" />
            <h2 className="text-lg font-bold text-[#1C2820] font-display">
              Installation &amp; Deployment Guide
            </h2>
          </div>

          <div className="space-y-3 text-xs text-[#546358]">
            <div>
              <p className="font-semibold text-[#1C2820] mb-1">1. Local Installation &amp; Development</p>
              <pre className="p-3 rounded-xl bg-[#1C2820] text-[#FBF9F5] font-mono text-[11px] overflow-x-auto">
{`npm install
npm run dev
# Starts Full-Stack Express + Vite Server on http://localhost:3000`}
              </pre>
            </div>

            <div>
              <p className="font-semibold text-[#1C2820] mb-1">2. Production Build &amp; Start</p>
              <pre className="p-3 rounded-xl bg-[#1C2820] text-[#FBF9F5] font-mono text-[11px] overflow-x-auto">
{`npm run build
NODE_ENV=production npm start`}
              </pre>
            </div>

            <div>
              <p className="font-semibold text-[#1C2820] mb-1">3. Architecture &amp; Persistence</p>
              <p className="leading-relaxed">
                Frontend React 19 + Tailwind CSS SPA (<code className="font-mono">src/</code>) communicates via REST API (<code className="font-mono">/api/*</code>) with the Express backend (<code className="font-mono">server.ts</code>) and persistent file database (<code className="font-mono">data/smartshop_db.json</code>). Every record is scoped strictly to the authenticated user&apos;s <code className="font-mono">userId</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
