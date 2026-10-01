import React, { useState } from 'react';
import {
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Coins,
  Tag,
  PackageCheck,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import bagImg from '../assets/images/kit_reusable_bag_1790843558148.jpg';
import tokensImg from '../assets/images/kit_choice_tokens_1790843570596.jpg';
import labelsImg from '../assets/images/kit_organizer_labels_1790843581474.jpg';

interface AuthViewProps {
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
  onLogIn: (email: string, password: string) => Promise<void>;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSignUp, onLogIn }) => {
  const [mode, setMode] = useState<'welcome' | 'signup' | 'login'>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        await onSignUp(name, email, password);
      } else if (mode === 'login') {
        await onLogIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await onLogIn('aadhila@smartshop.family', 'smartshop123');
    } catch (err: any) {
      setError(err.message || 'Could not load demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C2820] flex flex-col">
      {/* Top Bar Contract: Zone 1 Brand | Zone 2 Nav | Zone 3 Primary Actions */}
      <header className="w-full border-b border-[#E5E0D5] bg-[#FBF9F5]/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setMode('welcome');
              setError(null);
            }}
            className="text-xl font-bold tracking-tight text-[#1C2820] font-display cursor-pointer whitespace-nowrap"
          >
            SmartShop Buddy
          </button>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#546358]">
            <a href="#how-it-works" className="hover:text-[#1C2820] transition-colors whitespace-nowrap">
              How It Works
            </a>
            <a href="#physical-kit" className="hover:text-[#1C2820] transition-colors whitespace-nowrap">
              Physical + Digital Kit
            </a>
            <a href="#core-journey" className="hover:text-[#1C2820] transition-colors whitespace-nowrap">
              Family Workflow
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className="px-4 py-2 text-sm font-medium text-[#1C2820] hover:bg-[#EFECE6] rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#2D5A3D] hover:bg-[#234730] rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {mode === 'welcome' ? (
          <div>
            {/* Welcome Hero Section */}
            <section className="max-w-7xl mx-auto px-6 pt-12 pb-16 lg:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <p className="text-xs font-semibold tracking-wider text-[#2D5A3D] uppercase">
                    Smart Family Shopping Companion
                  </p>
                  <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#1C2820] leading-[1.1] tracking-tight font-display">
                    SmartShop Buddy
                  </h1>
                  <p className="text-2xl sm:text-3xl font-medium text-[#2D5A3D] font-display">
                    Plan smarter. Shop better. Waste less.
                  </p>
                  <p className="text-base sm:text-lg text-[#546358] max-w-2xl leading-relaxed">
                    Keep track of what your family already has in the kitchen, spot duplicate purchases before they reach your cart, guide children&apos;s store requests with tactile choice tokens, and build a lasting reusable bag habit.
                  </p>

                  {/* Primary Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setError(null);
                      }}
                      className="px-6 py-3.5 bg-[#2D5A3D] hover:bg-[#234730] text-white font-semibold rounded-xl transition-colors flex items-center gap-2.5 text-base cursor-pointer whitespace-nowrap"
                    >
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError(null);
                      }}
                      className="px-6 py-3.5 bg-white hover:bg-[#F3EFE6] text-[#1C2820] font-semibold rounded-xl border border-[#D8D2C5] transition-colors text-base cursor-pointer whitespace-nowrap"
                    >
                      Log In
                    </button>

                    <button
                      type="button"
                      onClick={handleQuickDemoLogin}
                      disabled={loading}
                      className="px-4 py-3.5 text-sm font-medium text-[#2D5A3D] hover:bg-[#E8EFEA] rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {loading ? 'Loading Demo...' : 'Try Demo Account (Aadhila) →'}
                    </button>
                  </div>

                  {/* Clean unboxed workflow metadata */}
                  <div className="pt-4 border-t border-[#E5E0D5] flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-[#546358]">
                    <span className="text-[#1C2820] font-semibold">Core System:</span>
                    <span>Plan</span>
                    <span aria-hidden="true">→</span>
                    <span>Choose</span>
                    <span aria-hidden="true">→</span>
                    <span>Shop</span>
                    <span aria-hidden="true">→</span>
                    <span>Organize</span>
                    <span aria-hidden="true">→</span>
                    <span className="text-[#2D5A3D] font-semibold">Waste Less</span>
                  </div>
                </div>

                {/* Right Anchor Card: Live Interactive Preview of Smart Kitchen Check */}
                <div className="lg:col-span-5">
                  <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-[#EFECE6] pb-4">
                      <div>
                        <p className="text-xs text-[#546358]">Smart Inventory Guard</p>
                        <h2 className="text-lg font-semibold text-[#1C2820]">
                          How SmartShop Buddy Prevents Waste
                        </h2>
                      </div>
                      <PackageCheck className="w-6 h-6 text-[#2D5A3D]" />
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5]">
                        <div className="flex items-center justify-between text-xs text-[#546358] mb-1">
                          <span>1. In Your Kitchen Inventory</span>
                          <span className="font-mono tabular-nums">Dairy · Shelf 2</span>
                        </div>
                        <p className="text-sm font-semibold text-[#1C2820]">
                          Milk — <span className="font-mono tabular-nums text-[#2D5A3D]">2 packets</span> at home
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FDF8ED] border border-[#E6D0A3]">
                        <p className="text-xs font-semibold text-[#8C5E14] mb-1">
                          2. Instant Duplicate Alert When Planning
                        </p>
                        <p className="text-sm font-semibold text-[#1C2820]">
                          You already have Milk at home.
                        </p>
                        <p className="text-xs text-[#546358] mt-0.5">
                          Your kitchen currently has 2 packets. Choose &ldquo;Don&apos;t Add&rdquo; or &ldquo;Add Anyway&rdquo;.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#F1F6F2] border border-[#C5DBC9]">
                        <div className="flex items-center justify-between text-xs text-[#2D5A3D] mb-1">
                          <span className="font-semibold">3. Mindful In-Store Trip</span>
                          <span className="font-mono tabular-nums">3 / 3 Tokens Ready</span>
                        </div>
                        <p className="text-xs text-[#3C5243]">
                          Check off needed items, confirm your foldable reusable cloth bag, and update kitchen quantities in one tap after shopping.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Physical + Digital SmartShop Buddy Kit */}
            <section id="physical-kit" className="bg-[#F3EFE6] border-y border-[#E5E0D5] py-16">
              <div className="max-w-7xl mx-auto px-6 space-y-10">
                <div className="max-w-2xl space-y-2">
                  <p className="text-xs font-semibold tracking-wider text-[#2D5A3D] uppercase">
                    Integrated Physical + Digital Kit
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#1C2820] font-display">
                    Three physical tools connected to one digital companion.
                  </h2>
                  <p className="text-sm sm:text-base text-[#546358]">
                    SmartShop Buddy bridges your home kitchen, your children&apos;s choices, and the grocery aisle so every tool supports the same goal: Plan → Choose → Shop → Organize → Waste Less.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Kit Item 1: Reusable Bag */}
                  <div className="bg-white rounded-2xl border border-[#E5E0D5] overflow-hidden flex flex-col">
                    <div className="aspect-4/3 bg-[#E8EFEA] relative overflow-hidden">
                      {!imgFailed.bag ? (
                        <img
                          src={bagImg}
                          alt="Foldable reusable cloth shopping bag"
                          referrerPolicy="no-referrer"
                          onError={() => setImgFailed((prev) => ({ ...prev, bag: true }))}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-12 h-12 text-[#2D5A3D]" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <p className="text-xs text-[#546358]">01 · Shop Sustainably</p>
                        <h3 className="text-lg font-semibold text-[#1C2820]">
                          Foldable Reusable Cloth Bag
                        </h3>
                        <p className="text-sm text-[#546358] leading-relaxed">
                          Tucks into a pocket or purse. Before you enter Shopping Mode, the app prompts you to confirm your cloth bag is ready so you don&apos;t rely on single-use plastic bags.
                        </p>
                      </div>
                      <p className="text-xs font-medium text-[#2D5A3D] pt-2 border-t border-[#EFECE6]">
                        Connected to: Shopping Mode Bag Check
                      </p>
                    </div>
                  </div>

                  {/* Kit Item 2: Kids' Choice Tokens */}
                  <div className="bg-white rounded-2xl border border-[#E5E0D5] overflow-hidden flex flex-col">
                    <div className="aspect-4/3 bg-[#F4EFE6] relative overflow-hidden">
                      {!imgFailed.tokens ? (
                        <img
                          src={tokensImg}
                          alt="Three colorful kids choice tokens"
                          referrerPolicy="no-referrer"
                          onError={() => setImgFailed((prev) => ({ ...prev, tokens: true }))}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Coins className="w-12 h-12 text-[#2D5A3D]" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <p className="text-xs text-[#546358]">02 · Mindful Family Choices</p>
                        <h3 className="text-lg font-semibold text-[#1C2820]">
                          3 Colorful Kids&apos; Choice Tokens
                        </h3>
                        <p className="text-sm text-[#546358] leading-relaxed">
                          Children hold physical tokens during the trip and trade one token for an item they genuinely want—synced live with the in-app token counter (3 → 2 → 1 → 0).
                        </p>
                      </div>
                      <p className="text-xs font-medium text-[#2D5A3D] pt-2 border-t border-[#EFECE6]">
                        Connected to: Kids&apos; Choice Token Tracker
                      </p>
                    </div>
                  </div>

                  {/* Kit Item 3: Food Organizer Labels */}
                  <div className="bg-white rounded-2xl border border-[#E5E0D5] overflow-hidden flex flex-col">
                    <div className="aspect-4/3 bg-[#EFECE6] relative overflow-hidden">
                      {!imgFailed.labels ? (
                        <img
                          src={labelsImg}
                          alt="Food organizer labels on kitchen jars"
                          referrerPolicy="no-referrer"
                          onError={() => setImgFailed((prev) => ({ ...prev, labels: true }))}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tag className="w-12 h-12 text-[#2D5A3D]" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <p className="text-xs text-[#546358]">03 · Organize at Home</p>
                        <h3 className="text-lg font-semibold text-[#1C2820]">
                          Food Organizer Labels
                        </h3>
                        <p className="text-sm text-[#546358] leading-relaxed">
                          Physical pantry and fridge labels match the exact 7 categories in My Kitchen so every item has a clear home and nothing gets buried or forgotten.
                        </p>
                      </div>
                      <p className="text-xs font-medium text-[#2D5A3D] pt-2 border-t border-[#EFECE6]">
                        Connected to: My Kitchen Category System
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section: 5-Stage Family Workflow */}
            <section id="core-journey" className="max-w-7xl mx-auto px-6 py-16 space-y-8">
              <div className="max-w-2xl space-y-2">
                <p className="text-xs font-semibold tracking-wider text-[#2D5A3D] uppercase">
                  How SmartShop Buddy Works
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1C2820] font-display">
                  Five simple steps for every family shopping trip.
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  {
                    step: '01. Before Shopping',
                    title: 'Check My Kitchen',
                    desc: 'Record what you already have at home by category and quantity.',
                  },
                  {
                    step: '02. Plan',
                    title: 'Create Shopping List',
                    desc: 'SmartShop Buddy checks your kitchen automatically to prevent duplicates.',
                  },
                  {
                    step: '03. Prepare',
                    title: 'Tokens & Cloth Bag',
                    desc: 'Set Kids’ Choice Tokens for the trip and pack your foldable reusable bag.',
                  },
                  {
                    step: '04. Shop',
                    title: 'In-Store Shopping Mode',
                    desc: 'Check off items as you shop and use tokens for thoughtful child picks.',
                  },
                  {
                    step: '05. After Shopping',
                    title: 'Update & Organize',
                    desc: 'Add bought quantities straight into My Kitchen and review your trip history.',
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="bg-white rounded-2xl border border-[#E5E0D5] p-5 space-y-2"
                  >
                    <p className="text-xs font-semibold text-[#2D5A3D]">{item.step}</p>
                    <h3 className="text-base font-semibold text-[#1C2820]">{item.title}</h3>
                    <p className="text-xs text-[#546358] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* Sign Up / Log In Form View */
          <div className="max-w-md mx-auto px-6 py-12 sm:py-16">
            <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 space-y-6">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
                  {mode === 'signup' ? 'New Family Account' : 'Welcome Back'}
                </p>
                <h1 className="text-2xl font-bold text-[#1C2820] font-display">
                  {mode === 'signup' ? 'Create your SmartShop Buddy account' : 'Log in to SmartShop Buddy'}
                </h1>
                <p className="text-sm text-[#546358]">
                  {mode === 'signup'
                    ? 'Start by creating your account. Next, we will set up your kitchen inventory.'
                    : 'Sign in to access your saved kitchen inventory, shopping list, and family tokens.'}
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-[#FDF2F2] border border-[#F5C6C6] text-xs font-medium text-[#9B2C2C]">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <label htmlFor="auth-name" className="block text-xs font-semibold text-[#1C2820]">
                      Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-[#546358] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="auth-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Aadhila"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="auth-email" className="block text-xs font-semibold text-[#1C2820]">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#546358] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="auth-password" className="block text-xs font-semibold text-[#1C2820]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#546358] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-password"
                      type="password"
                      required
                      minLength={4}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D2C5] rounded-xl focus:outline-none focus:border-[#2D5A3D]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#2D5A3D] hover:bg-[#234730] disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm cursor-pointer"
                >
                  {loading
                    ? 'Please wait...'
                    : mode === 'signup'
                    ? 'Create Account & Set Up Kitchen'
                    : 'Log In'}
                </button>
              </form>

              <div className="pt-4 border-t border-[#EFECE6] space-y-3 text-center">
                {mode === 'signup' ? (
                  <p className="text-xs text-[#546358]">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError(null);
                      }}
                      className="font-semibold text-[#2D5A3D] hover:underline cursor-pointer"
                    >
                      Log In
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-[#546358]">
                    New to SmartShop Buddy?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setError(null);
                      }}
                      className="font-semibold text-[#2D5A3D] hover:underline cursor-pointer"
                    >
                      Create Account
                    </button>
                  </p>
                )}

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleQuickDemoLogin}
                    disabled={loading}
                    className="text-xs font-medium text-[#546358] hover:text-[#1C2820] underline cursor-pointer"
                  >
                    Or sign in with pre-loaded demo account (Aadhila)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[#E5E0D5] py-6 px-6 text-center text-xs text-[#546358]">
        SmartShop Buddy · Plan smarter. Shop better. Waste less.
      </footer>
    </div>
  );
};
