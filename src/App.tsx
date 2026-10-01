import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Coins,
  ShoppingBag,
  History,
  User,
  Menu,
  X,
} from 'lucide-react';
import {
  AppView,
  FoodCategory,
  KitchenItem,
  ShoppingListItem,
  ShoppingTripRecord,
  UserAccountData,
} from './types.ts';
import { api, getStoredToken } from './services/api.ts';
import { AuthView } from './components/AuthView.tsx';
import { KitchenSetupView } from './components/KitchenSetupView.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { KitchenInventoryView } from './components/KitchenInventoryView.tsx';
import { ShoppingListView } from './components/ShoppingListView.tsx';
import { KidsTokensView } from './components/KidsTokensView.tsx';
import { ShoppingModeView } from './components/ShoppingModeView.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { ProfileView } from './components/ProfileView.tsx';

export default function App() {
  const [account, setAccount] = useState<UserAccountData | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [forceSetupMode, setForceSetupMode] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setInitializing(false);
      return;
    }
    api
      .getMe()
      .then((data) => {
        setAccount(data);
      })
      .catch(() => {
        setAccount(null);
      })
      .finally(() => {
        setInitializing(false);
      });
  }, []);

  const handleSignUp = async (name: string, email: string, password: string) => {
    const data = await api.signUp(name, email, password);
    setAccount(data);
    setForceSetupMode(true);
  };

  const handleLogIn = async (email: string, password: string) => {
    const data = await api.logIn(email, password);
    setAccount(data);
    setForceSetupMode(!data.user.kitchenSetupCompleted);
    setActiveView('dashboard');
  };

  const handleLogOut = async () => {
    await api.logOut();
    setAccount(null);
    setForceSetupMode(false);
    setActiveView('dashboard');
  };

  const handleCompleteKitchenSetup = async () => {
    const data = await api.completeKitchenSetup();
    setAccount(data);
    setForceSetupMode(false);
    setActiveView('dashboard');
  };

  const handleNavigate = (view: AppView) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Kitchen Inventory Handlers
  const handleAddKitchenItem = async (payload: {
    name: string;
    category: FoodCategory;
    quantity: number;
    unit: string;
    notes?: string;
  }) => {
    const data = await api.addKitchenItem(payload);
    setAccount(data);
  };

  const handleAddStarterPreset = async () => {
    const data = await api.addStarterKitchenPreset();
    setAccount(data);
  };

  const handleUpdateKitchenItem = async (
    id: string,
    payload: Partial<Pick<KitchenItem, 'name' | 'category' | 'quantity' | 'unit' | 'notes'>>
  ) => {
    const data = await api.updateKitchenItem(id, payload);
    setAccount(data);
  };

  const handleDeleteKitchenItem = async (id: string) => {
    const data = await api.deleteKitchenItem(id);
    setAccount(data);
  };

  // Shopping List Handlers
  const handleAddShoppingItem = async (payload: {
    name: string;
    category: FoodCategory;
    quantity: number;
    unit: string;
    note?: string;
    addedAnyway?: boolean;
    fromKidsToken?: boolean;
    addedInStore?: boolean;
  }) => {
    const data = await api.addShoppingItem(payload);
    setAccount(data);
  };

  const handleRecordDuplicateAvoided = async (itemName: string) => {
    const data = await api.recordDuplicateAvoided(itemName);
    setAccount(data);
  };

  const handleUpdateShoppingItem = async (
    id: string,
    payload: Partial<Pick<ShoppingListItem, 'name' | 'category' | 'quantity' | 'unit' | 'note' | 'bought'>>
  ) => {
    const data = await api.updateShoppingItem(id, payload);
    setAccount(data);
  };

  const handleDeleteShoppingItem = async (id: string) => {
    const data = await api.deleteShoppingItem(id);
    setAccount(data);
  };

  // Kids' Tokens Handlers
  const handleUseToken = async (label: string) => {
    const data = await api.useOneToken(label);
    setAccount(data);
  };

  const handleUpdateTokenChoice = async (choiceId: string, label: string) => {
    const data = await api.updateTokenChoice(choiceId, label);
    setAccount(data);
  };

  const handleRemoveTokenChoice = async (choiceId: string) => {
    const data = await api.removeTokenChoice(choiceId);
    setAccount(data);
  };

  const handleStartNewTrip = async () => {
    const data = await api.startNewShoppingTrip(false);
    setAccount(data);
  };

  // Shopping Session & Completion Handlers
  const handleConfirmReusableBag = async (
    confirmed: boolean,
    response?: 'unanswered' | 'brought' | 'not_yet'
  ) => {
    const data = await api.setReusableBagConfirmed(confirmed, response);
    setAccount(data);
  };

  const handleCompleteShopping = async (): Promise<ShoppingTripRecord> => {
    const res = await api.completeShoppingTrip(false);
    setAccount(res.account);
    return res.trip;
  };

  const handleApplyKitchenUpdates = async (
    tripId: string,
    clearBought: boolean
  ): Promise<ShoppingTripRecord> => {
    const res = await api.applyTripKitchenUpdates(tripId, clearBought);
    setAccount(res.account);
    return res.trip;
  };

  const handleDeferKitchenUpdates = async (
    tripId: string
  ): Promise<ShoppingTripRecord> => {
    const res = await api.deferTripKitchenUpdates(tripId);
    setAccount(res.account);
    return res.trip;
  };

  const handleUpdateProfile = async (name: string) => {
    const data = await api.updateProfile(name);
    setAccount(data);
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <p className="text-xl font-bold text-[#1C2820] font-display">SmartShop Buddy</p>
          <p className="text-xs text-[#546358]">Loading your family kitchen &amp; shopping companion...</p>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated -> Show Welcome / Sign Up / Log In
  if (!account) {
    return <AuthView onSignUp={handleSignUp} onLogIn={handleLogIn} />;
  }

  // 2. First-Time Setup — My Kitchen (mandatory after creating a new account)
  if (!account.user.kitchenSetupCompleted || forceSetupMode) {
    return (
      <KitchenSetupView
        userName={account.user.name}
        kitchenItems={account.kitchenItems}
        onAddItem={handleAddKitchenItem}
        onAddStarterPreset={handleAddStarterPreset}
        onUpdateItem={handleUpdateKitchenItem}
        onDeleteItem={handleDeleteKitchenItem}
        onCompleteSetup={handleCompleteKitchenSetup}
      />
    );
  }

  const navItems: Array<{ id: AppView; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kitchen', label: 'My Kitchen', icon: Package },
    { id: 'shopping-list', label: 'Shopping List', icon: ShoppingCart },
    { id: 'kids-tokens', label: "Kids' Tokens", icon: Coins },
    { id: 'shopping-mode', label: 'Shopping Mode', icon: ShoppingBag },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C2820] flex flex-col">
      {/* Top Bar Contract: Zone 1 Wordmark | Zone 2 Clean Nav Links | Zone 3 Primary Action */}
      <header className="sticky top-0 z-30 bg-[#FBF9F5]/95 backdrop-blur-sm border-b border-[#E5E0D5]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single Text Element Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNavigate('dashboard')}
            className="text-xl font-bold tracking-tight text-[#1C2820] font-display cursor-pointer whitespace-nowrap shrink-0"
          >
            SmartShop Buddy
          </button>

          {/* Zone 2: Clean Typography Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#546358]">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`py-1 transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
                    isActive
                      ? 'text-[#1C2820] font-semibold border-[#2D5A3D]'
                      : 'border-transparent hover:text-[#1C2820] hover:border-[#D8D2C5]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleNavigate('shopping-mode')}
              className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold text-white bg-[#2D5A3D] hover:bg-[#234730] rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              Start Shopping ({account.shoppingList.filter((i) => !i.bought).length})
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl border border-[#D8D2C5] text-[#1C2820] hover:bg-[#F3EFE6] cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E5E0D5] bg-white px-6 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#E8EFEA] text-[#2D5A3D] font-semibold'
                      : 'text-[#546358] hover:bg-[#FBF9F5] hover:text-[#1C2820]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {activeView === 'dashboard' && (
          <DashboardView account={account} onNavigate={handleNavigate} />
        )}

        {activeView === 'kitchen' && (
          <KitchenInventoryView
            kitchenItems={account.kitchenItems}
            onAddItem={handleAddKitchenItem}
            onAddStarterPreset={handleAddStarterPreset}
            onUpdateItem={handleUpdateKitchenItem}
            onDeleteItem={handleDeleteKitchenItem}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'shopping-list' && (
          <ShoppingListView
            kitchenItems={account.kitchenItems}
            shoppingList={account.shoppingList}
            shoppingHistory={account.shoppingHistory}
            duplicatesAvoidedCount={account.shoppingSession.duplicatesAvoidedCount}
            onAddShoppingItem={handleAddShoppingItem}
            onRecordDuplicateAvoided={handleRecordDuplicateAvoided}
            onUpdateShoppingItem={handleUpdateShoppingItem}
            onDeleteShoppingItem={handleDeleteShoppingItem}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'kids-tokens' && (
          <KidsTokensView
            kidsTokens={account.kidsTokens}
            shoppingList={account.shoppingList}
            onUseToken={handleUseToken}
            onUpdateTokenChoice={handleUpdateTokenChoice}
            onRemoveTokenChoice={handleRemoveTokenChoice}
            onStartNewTrip={handleStartNewTrip}
            onAddChoiceToShoppingList={handleAddShoppingItem}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'shopping-mode' && (
          <ShoppingModeView
            kitchenItems={account.kitchenItems}
            shoppingList={account.shoppingList}
            kidsTokens={account.kidsTokens}
            shoppingSession={account.shoppingSession}
            onToggleBought={(itemId, bought) =>
              handleUpdateShoppingItem(itemId, { bought })
            }
            onAddShoppingItem={handleAddShoppingItem}
            onRecordDuplicateAvoided={handleRecordDuplicateAvoided}
            onUseToken={handleUseToken}
            onRemoveTokenChoice={handleRemoveTokenChoice}
            onStartNewTrip={handleStartNewTrip}
            onConfirmReusableBag={handleConfirmReusableBag}
            onCompleteShopping={handleCompleteShopping}
            onApplyKitchenUpdates={handleApplyKitchenUpdates}
            onDeferKitchenUpdates={handleDeferKitchenUpdates}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'history' && (
          <HistoryView
            history={account.shoppingHistory}
            onApplyKitchenUpdates={handleApplyKitchenUpdates}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'profile' && (
          <ProfileView
            account={account}
            onUpdateProfile={handleUpdateProfile}
            onLogOut={handleLogOut}
            onReopenKitchenSetup={() => setForceSetupMode(true)}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      <footer className="border-t border-[#E5E0D5] py-6 px-6 text-center text-xs text-[#546358]">
        SmartShop Buddy · My Kitchen → Shopping List → Kids&apos; Choice Tokens → Reusable Bag Reminder → Shopping Mode → Shopping Summary → Update My Kitchen → Shopping History
      </footer>
    </div>
  );
}
