import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  type FoodCategory,
  type KitchenItem,
  type ShoppingListItem,
  type KidsTokenState,
  type ShoppingSessionState,
  type ShoppingTripRecord,
  type UserProfile,
  type UserAccountData,
  type BoughtItemUpdatePreview,
  type UnpurchasedItemRecord,
  normalizeItemName,
} from '../src/types.ts';

interface StoredUser extends UserProfile {
  passwordHash: string;
  salt: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  sessions: Record<string, string>; // token -> userId
  kitchenItems: Record<string, KitchenItem[]>; // userId -> items
  shoppingLists: Record<string, ShoppingListItem[]>; // userId -> items
  kidsTokens: Record<string, KidsTokenState>; // userId -> token state
  shoppingSessions: Record<string, ShoppingSessionState>; // userId -> session state
  shoppingHistory: Record<string, ShoppingTripRecord[]>; // userId -> history
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'smartshop_db.json');

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function createInitialDb(): DatabaseSchema {
  const demoUserId = 'user_demo_aadhila';
  const salt = 'demo_salt_smartshop_2026';
  const passwordHash = hashPassword('smartshop123', salt);
  const now = new Date().toISOString();
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const demoKitchen: KitchenItem[] = [
    {
      id: 'k_milk',
      userId: demoUserId,
      name: 'Milk',
      category: 'Dairy',
      quantity: 2,
      unit: 'packet',
      notes: 'Full cream milk in center fridge shelf',
      updatedAt: now,
    },
    {
      id: 'k_bread',
      userId: demoUserId,
      name: 'Bread',
      category: 'Grains & Staples',
      quantity: 1,
      unit: 'packet',
      notes: 'Whole wheat loaf',
      updatedAt: now,
    },
    {
      id: 'k_eggs',
      userId: demoUserId,
      name: 'Eggs',
      category: 'Dairy',
      quantity: 10,
      unit: '',
      notes: 'Free-range carton',
      updatedAt: now,
    },
    {
      id: 'k_apples',
      userId: demoUserId,
      name: 'Apples',
      category: 'Fruits & Vegetables',
      quantity: 6,
      unit: '',
      notes: 'Crisper drawer',
      updatedAt: now,
    },
    {
      id: 'k_rice',
      userId: demoUserId,
      name: 'Rice',
      category: 'Grains & Staples',
      quantity: 5,
      unit: 'kg',
      notes: 'Basmati rice in labeled glass jar',
      updatedAt: now,
    },
    {
      id: 'k_cereal',
      userId: demoUserId,
      name: 'Cereal',
      category: 'Snacks',
      quantity: 1,
      unit: 'box',
      notes: 'Oat clusters in lower pantry bin',
      updatedAt: now,
    },
  ];

  const demoShoppingList: ShoppingListItem[] = [
    {
      id: 's_carrots',
      userId: demoUserId,
      name: 'Fresh Carrots',
      category: 'Fruits & Vegetables',
      quantity: 1,
      unit: 'kg',
      note: 'For weeknight soup & lunchboxes',
      bought: false,
      createdAt: now,
    },
    {
      id: 's_yogurt',
      userId: demoUserId,
      name: 'Greek Yogurt',
      category: 'Dairy',
      quantity: 2,
      unit: 'tub',
      note: 'Plain unsweetened',
      bought: false,
      createdAt: now,
    },
    {
      id: 's_lentils',
      userId: demoUserId,
      name: 'Red Lentils',
      category: 'Grains & Staples',
      quantity: 1,
      unit: 'kg',
      note: 'Refill LABEL-02 pantry jar',
      bought: false,
      createdAt: now,
    },
    {
      id: 's_chickpeas',
      userId: demoUserId,
      name: 'Chickpeas',
      category: 'Canned / Packaged Food',
      quantity: 3,
      unit: 'can',
      note: 'Low sodium',
      bought: false,
      createdAt: now,
    },
    {
      id: 's_soap',
      userId: demoUserId,
      name: 'Hand Soap',
      category: 'Other',
      quantity: 2,
      unit: 'bottle',
      note: 'Household refill',
      bought: false,
      createdAt: now,
    },
  ];

  const demoHistory: ShoppingTripRecord[] = [
    {
      id: 'trip_demo_1',
      userId: demoUserId,
      completedAt: threeDaysAgo,
      itemsPlanned: 6,
      itemsBought: 6,
      itemsRemaining: 0,
      tokensTotal: 3,
      tokensUsed: 2,
      tokenChoices: ['Chocolate', 'Juice'],
      reusableBagUsed: true,
      duplicatesAvoided: 1,
      summaryMessage:
        'You planned your shopping, checked what you already had before buying, and brought your reusable cloth bag.',
      kitchenUpdated: true,
      boughtItemsDetail: [
        {
          shoppingItemId: 'old_1',
          name: 'Milk',
          category: 'Dairy',
          quantityBought: 1,
          unit: 'packet',
          beforeQuantity: 1,
          afterQuantity: 2,
        },
        {
          shoppingItemId: 'old_2',
          name: 'Apples',
          category: 'Fruits & Vegetables',
          quantityBought: 6,
          unit: '',
          beforeQuantity: 0,
          afterQuantity: 6,
        },
        {
          shoppingItemId: 'old_3',
          name: 'Bread',
          category: 'Grains & Staples',
          quantityBought: 1,
          unit: 'packet',
          beforeQuantity: 0,
          afterQuantity: 1,
        },
      ],
    },
  ];

  return {
    users: [
      {
        id: demoUserId,
        name: 'Aadhila',
        email: 'aadhila@smartshop.family',
        passwordHash,
        salt,
        kitchenSetupCompleted: true,
        createdAt: threeDaysAgo,
      },
    ],
    sessions: {},
    kitchenItems: {
      [demoUserId]: demoKitchen,
    },
    shoppingLists: {
      [demoUserId]: demoShoppingList,
    },
    kidsTokens: {
      [demoUserId]: {
        totalTokens: 3,
        remainingTokens: 3,
        usedHistory: [],
      },
    },
    shoppingSessions: {
      [demoUserId]: {
        reusableBagConfirmed: false,
        duplicatesAvoidedCount: 0,
        duplicatesAvoidedItems: [],
      },
    },
    shoppingHistory: {
      [demoUserId]: demoHistory,
    },
  };
}

class SmartShopDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        if (parsed && Array.isArray(parsed.users)) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading DB, initializing fresh schema:', err);
    }
    const initial = createInitialDb();
    this.save(initial);
    return initial;
  }

  private save(schema: DatabaseSchema = this.data): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(schema, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  private ensureUserCollections(userId: string): void {
    if (!this.data.kitchenItems[userId]) {
      this.data.kitchenItems[userId] = [];
    }
    if (!this.data.shoppingLists[userId]) {
      this.data.shoppingLists[userId] = [];
    }
    if (!this.data.kidsTokens[userId]) {
      this.data.kidsTokens[userId] = {
        totalTokens: 3,
        remainingTokens: 3,
        usedHistory: [],
      };
    }
    if (!this.data.shoppingSessions[userId]) {
      this.data.shoppingSessions[userId] = {
        reusableBagConfirmed: false,
        duplicatesAvoidedCount: 0,
        duplicatesAvoidedItems: [],
      };
    }
    if (!this.data.shoppingHistory[userId]) {
      this.data.shoppingHistory[userId] = [];
    }
  }

  public toPublicUser(user: StoredUser): UserProfile {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      kitchenSetupCompleted: user.kitchenSetupCompleted,
      createdAt: user.createdAt,
    };
  }

  public getUserAccountData(userId: string): UserAccountData | null {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;
    this.ensureUserCollections(userId);
    return {
      user: this.toPublicUser(user),
      kitchenItems: this.data.kitchenItems[userId],
      shoppingList: this.data.shoppingLists[userId],
      kidsTokens: this.data.kidsTokens[userId],
      shoppingSession: this.data.shoppingSessions[userId],
      shoppingHistory: this.data.shoppingHistory[userId],
    };
  }

  public signUp(name: string, email: string, password: string): { token: string; account: UserAccountData } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    if (!cleanName || !cleanEmail || !password) {
      throw new Error('Name, email, and password are required.');
    }
    const existing = this.data.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists. Please log in instead.');
    }

    const userId = `user_${crypto.randomBytes(8).toString('hex')}`;
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const newUser: StoredUser = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      salt,
      kitchenSetupCompleted: false, // Guides new user through "Let's set up your kitchen"
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.ensureUserCollections(userId);

    const token = crypto.randomBytes(24).toString('hex');
    this.data.sessions[token] = userId;
    this.save();

    return {
      token,
      account: this.getUserAccountData(userId)!,
    };
  }

  public logIn(email: string, password: string): { token: string; account: UserAccountData } {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.data.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('No account found with that email address.');
    }
    const attemptHash = hashPassword(password, user.salt);
    if (attemptHash !== user.passwordHash) {
      throw new Error('Incorrect password. Please try again.');
    }

    this.ensureUserCollections(user.id);
    const token = crypto.randomBytes(24).toString('hex');
    this.data.sessions[token] = user.id;
    this.save();

    return {
      token,
      account: this.getUserAccountData(user.id)!,
    };
  }

  public logOut(token: string): void {
    if (this.data.sessions[token]) {
      delete this.data.sessions[token];
      this.save();
    }
  }

  public getUserByToken(token: string): UserProfile | null {
    const userId = this.data.sessions[token];
    if (!userId) return null;
    const user = this.data.users.find((u) => u.id === userId);
    return user ? this.toPublicUser(user) : null;
  }

  public completeKitchenSetup(userId: string): UserAccountData {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    user.kitchenSetupCompleted = true;
    this.save();
    return this.getUserAccountData(userId)!;
  }

  public updateProfile(userId: string, name: string): UserAccountData {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    if (name.trim()) {
      user.name = name.trim();
    }
    this.save();
    return this.getUserAccountData(userId)!;
  }

  // Kitchen Inventory Operations
  public addKitchenItem(
    userId: string,
    payload: { name: string; category: FoodCategory; quantity: number; unit: string; notes?: string }
  ): UserAccountData {
    this.ensureUserCollections(userId);
    const list = this.data.kitchenItems[userId];
    const norm = normalizeItemName(payload.name);
    const existing = list.find((item) => normalizeItemName(item.name) === norm);

    if (existing) {
      existing.quantity = Math.max(0, Number(existing.quantity) + Number(payload.quantity));
      if (payload.unit && !existing.unit) existing.unit = payload.unit;
      if (payload.notes) existing.notes = payload.notes;
      existing.category = payload.category || existing.category;
      existing.updatedAt = new Date().toISOString();
    } else {
      const newItem: KitchenItem = {
        id: `k_${crypto.randomBytes(6).toString('hex')}`,
        userId,
        name: payload.name.trim(),
        category: payload.category,
        quantity: Math.max(0, Number(payload.quantity) || 1),
        unit: (payload.unit || '').trim(),
        notes: payload.notes?.trim() || '',
        updatedAt: new Date().toISOString(),
      };
      list.unshift(newItem);
    }
    this.save();
    return this.getUserAccountData(userId)!;
  }

  public addStarterKitchenPreset(userId: string): UserAccountData {
    this.ensureUserCollections(userId);
    const starterItems: Array<{ name: string; category: FoodCategory; quantity: number; unit: string; notes: string }> = [
      { name: 'Milk', category: 'Dairy', quantity: 2, unit: 'packet', notes: 'Center fridge shelf' },
      { name: 'Bread', category: 'Grains & Staples', quantity: 1, unit: 'packet', notes: 'Whole grain loaf' },
      { name: 'Eggs', category: 'Dairy', quantity: 10, unit: '', notes: 'Chilled carton' },
      { name: 'Apples', category: 'Fruits & Vegetables', quantity: 6, unit: '', notes: 'Crisper drawer' },
      { name: 'Rice', category: 'Grains & Staples', quantity: 5, unit: 'kg', notes: 'Labeled pantry jar' },
      { name: 'Cereal', category: 'Snacks', quantity: 1, unit: 'box', notes: 'Family breakfast bin' },
    ];
    for (const s of starterItems) {
      const exists = this.data.kitchenItems[userId].some(
        (i) => normalizeItemName(i.name) === normalizeItemName(s.name)
      );
      if (!exists) {
        this.data.kitchenItems[userId].push({
          id: `k_${crypto.randomBytes(6).toString('hex')}`,
          userId,
          name: s.name,
          category: s.category,
          quantity: s.quantity,
          unit: s.unit,
          notes: s.notes,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    this.save();
    return this.getUserAccountData(userId)!;
  }

  public updateKitchenItem(
    userId: string,
    itemId: string,
    payload: Partial<Pick<KitchenItem, 'name' | 'category' | 'quantity' | 'unit' | 'notes'>>
  ): UserAccountData {
    this.ensureUserCollections(userId);
    const item = this.data.kitchenItems[userId].find((i) => i.id === itemId);
    if (!item) throw new Error('Kitchen item not found');
    if (payload.name !== undefined) item.name = payload.name.trim();
    if (payload.category !== undefined) item.category = payload.category;
    if (payload.quantity !== undefined) item.quantity = Math.max(0, Number(payload.quantity));
    if (payload.unit !== undefined) item.unit = payload.unit.trim();
    if (payload.notes !== undefined) item.notes = payload.notes.trim();
    item.updatedAt = new Date().toISOString();
    this.save();
    return this.getUserAccountData(userId)!;
  }

  public deleteKitchenItem(userId: string, itemId: string): UserAccountData {
    this.ensureUserCollections(userId);
    this.data.kitchenItems[userId] = this.data.kitchenItems[userId].filter((i) => i.id !== itemId);
    this.save();
    return this.getUserAccountData(userId)!;
  }

  // Shopping List Operations
  public addShoppingItem(
    userId: string,
    payload: {
      name: string;
      category: FoodCategory;
      quantity: number;
      unit: string;
      note?: string;
      addedAnyway?: boolean;
      fromKidsToken?: boolean;
      addedInStore?: boolean;
    }
  ): UserAccountData {
    this.ensureUserCollections(userId);
    const list = this.data.shoppingLists[userId];
    const norm = normalizeItemName(payload.name);
    const existingUnbought = list.find((i) => !i.bought && normalizeItemName(i.name) === norm);

    if (existingUnbought) {
      existingUnbought.quantity = Math.max(
        1,
        Number(existingUnbought.quantity) + (Number(payload.quantity) || 1)
      );
      if (payload.unit && !existingUnbought.unit) existingUnbought.unit = payload.unit.trim();
      if (payload.note) existingUnbought.note = payload.note.trim();
      if (payload.addedAnyway) existingUnbought.addedAnyway = true;
      if (payload.fromKidsToken) existingUnbought.fromKidsToken = true;
      if (payload.addedInStore) existingUnbought.addedInStore = true;
    } else {
      const newItem: ShoppingListItem = {
        id: `s_${crypto.randomBytes(6).toString('hex')}`,
        userId,
        name: payload.name.trim(),
        category: payload.category || 'Snacks',
        quantity: Math.max(1, Number(payload.quantity) || 1),
        unit: (payload.unit || '').trim(),
        note: payload.note?.trim() || '',
        bought: false,
        addedAnyway: Boolean(payload.addedAnyway),
        fromKidsToken: Boolean(payload.fromKidsToken),
        addedInStore: Boolean(payload.addedInStore),
        createdAt: new Date().toISOString(),
      };
      list.push(newItem);
    }

    this.save();
    return this.getUserAccountData(userId)!;
  }

  public recordDuplicateAvoided(userId: string, itemName: string): UserAccountData {
    this.ensureUserCollections(userId);
    const session = this.data.shoppingSessions[userId];
    session.duplicatesAvoidedCount += 1;
    if (itemName && !session.duplicatesAvoidedItems.includes(itemName.trim())) {
      session.duplicatesAvoidedItems.push(itemName.trim());
    }
    this.save();
    return this.getUserAccountData(userId)!;
  }

  public updateShoppingItem(
    userId: string,
    itemId: string,
    payload: Partial<Pick<ShoppingListItem, 'name' | 'category' | 'quantity' | 'unit' | 'note' | 'bought'>>
  ): UserAccountData {
    this.ensureUserCollections(userId);
    const item = this.data.shoppingLists[userId].find((i) => i.id === itemId);
    if (!item) throw new Error('Shopping item not found');
    if (payload.name !== undefined) item.name = payload.name.trim();
    if (payload.category !== undefined) item.category = payload.category;
    if (payload.quantity !== undefined) item.quantity = Math.max(1, Number(payload.quantity));
    if (payload.unit !== undefined) item.unit = payload.unit.trim();
    if (payload.note !== undefined) item.note = payload.note.trim();
    if (payload.bought !== undefined) item.bought = Boolean(payload.bought);
    this.save();
    return this.getUserAccountData(userId)!;
  }

  public deleteShoppingItem(userId: string, itemId: string): UserAccountData {
    this.ensureUserCollections(userId);
    this.data.shoppingLists[userId] = this.data.shoppingLists[userId].filter((i) => i.id !== itemId);
    this.save();
    return this.getUserAccountData(userId)!;
  }

  // Kids' Choice Tokens Operations (Designed around the 3 physical tokens)
  public setTokenAllowance(userId: string, totalTokens: number): UserAccountData {
    this.ensureUserCollections(userId);
    const safeTotal = Math.max(1, Math.min(12, Math.round(Number(totalTokens) || 3)));
    const state = this.data.kidsTokens[userId];
    const usedCount = state.usedHistory.length;
    state.totalTokens = safeTotal;
    state.remainingTokens = Math.max(0, safeTotal - usedCount);
    this.save();
    return this.getUserAccountData(userId)!;
  }

  public useOneToken(userId: string, label?: string): UserAccountData {
    this.ensureUserCollections(userId);
    const state = this.data.kidsTokens[userId];
    if (state.remainingTokens <= 0) {
      throw new Error("You've used all 3 choices for this trip.");
    }
    const cleanLabel = (label || '').trim();
    if (!cleanLabel) {
      throw new Error("Please enter the item your child chose.");
    }
    state.usedHistory.push({
      id: `tok_${crypto.randomBytes(4).toString('hex')}`,
      label: cleanLabel,
      usedAt: new Date().toISOString(),
    });
    state.remainingTokens = Math.max(0, state.totalTokens - state.usedHistory.length);
    this.save();
    return this.getUserAccountData(userId)!;
  }

  public updateTokenChoice(userId: string, choiceId: string, label: string): UserAccountData {
    this.ensureUserCollections(userId);
    const state = this.data.kidsTokens[userId];
    const entry = state.usedHistory.find((e) => e.id === choiceId);
    if (!entry) throw new Error('Token choice not found');
    if (label.trim()) {
      entry.label = label.trim();
    }
    this.save();
    return this.getUserAccountData(userId)!;
  }

  public removeTokenChoice(userId: string, choiceId: string): UserAccountData {
    this.ensureUserCollections(userId);
    const state = this.data.kidsTokens[userId];
    const beforeLen = state.usedHistory.length;
    state.usedHistory = state.usedHistory.filter((e) => e.id !== choiceId);
    if (state.usedHistory.length < beforeLen) {
      state.remainingTokens = Math.min(
        state.totalTokens,
        Math.max(0, state.totalTokens - state.usedHistory.length)
      );
    }
    this.save();
    return this.getUserAccountData(userId)!;
  }

  public resetTokens(userId: string, newTotal?: number): UserAccountData {
    this.ensureUserCollections(userId);
    const total = newTotal !== undefined ? Math.max(1, Math.min(12, Math.round(Number(newTotal)))) : 3;
    this.data.kidsTokens[userId] = {
      totalTokens: total,
      remainingTokens: total,
      usedHistory: [],
    };
    this.save();
    return this.getUserAccountData(userId)!;
  }

  // Reusable Bag Reminder
  public setReusableBagConfirmed(
    userId: string,
    confirmed: boolean,
    response?: 'unanswered' | 'brought' | 'not_yet'
  ): UserAccountData {
    this.ensureUserCollections(userId);
    this.data.shoppingSessions[userId].reusableBagConfirmed = Boolean(confirmed);
    this.data.shoppingSessions[userId].reusableBagResponse =
      response || (confirmed ? 'brought' : 'not_yet');
    this.save();
    return this.getUserAccountData(userId)!;
  }

  // Start a New Shopping Trip (Resets active trip tokens to 3 & session flags, preserves all history)
  public startNewShoppingTrip(userId: string, clearBoughtItems: boolean = true): UserAccountData {
    this.ensureUserCollections(userId);
    this.data.kidsTokens[userId] = {
      totalTokens: 3,
      remainingTokens: 3,
      usedHistory: [],
    };
    this.data.shoppingSessions[userId] = {
      reusableBagConfirmed: false,
      reusableBagResponse: 'unanswered',
      duplicatesAvoidedCount: 0,
      duplicatesAvoidedItems: [],
    };
    if (clearBoughtItems) {
      this.data.shoppingLists[userId] = this.data.shoppingLists[userId].filter((i) => !i.bought);
    }
    this.save();
    return this.getUserAccountData(userId)!;
  }

  // Complete Shopping Trip & Build Summary
  public completeShoppingTrip(
    userId: string,
    autoUpdateKitchen: boolean = false
  ): { trip: ShoppingTripRecord; account: UserAccountData } {
    this.ensureUserCollections(userId);
    const shoppingList = this.data.shoppingLists[userId];
    const kitchenList = this.data.kitchenItems[userId];
    const tokens = this.data.kidsTokens[userId];
    const session = this.data.shoppingSessions[userId];

    const itemsPlanned = shoppingList.length;
    const boughtItems = shoppingList.filter((i) => i.bought);
    const unpurchasedList = shoppingList.filter((i) => !i.bought);
    const itemsBought = boughtItems.length;
    const itemsRemaining = Math.max(0, itemsPlanned - itemsBought);
    const tokensUsed = tokens.usedHistory.length;
    const tokenChoices = tokens.usedHistory.map((u) => u.label);
    const reusableBagUsed = session.reusableBagConfirmed;
    const duplicatesAvoided = session.duplicatesAvoidedCount;

    const boughtItemsDetail: BoughtItemUpdatePreview[] = boughtItems.map((bItem) => {
      const norm = normalizeItemName(bItem.name);
      const existingKitchen = kitchenList.find((k) => normalizeItemName(k.name) === norm);
      const beforeQuantity = existingKitchen ? existingKitchen.quantity : 0;
      const afterQuantity = beforeQuantity + bItem.quantity;
      return {
        shoppingItemId: bItem.id,
        kitchenItemId: existingKitchen?.id,
        name: bItem.name,
        category: bItem.category,
        quantityBought: bItem.quantity,
        unit: existingKitchen?.unit || bItem.unit,
        note: bItem.note,
        beforeQuantity,
        afterQuantity,
      };
    });

    const unpurchasedItems: UnpurchasedItemRecord[] = unpurchasedList.map((uItem) => ({
      id: uItem.id,
      name: uItem.name,
      category: uItem.category,
      quantity: uItem.quantity,
      unit: uItem.unit,
      note: uItem.note,
    }));

    // Build honest, factual summary message based on what actually happened
    const messageParts: string[] = [
      'You planned your shopping and checked what you already had before buying.',
    ];
    if (duplicatesAvoided > 0) {
      messageParts.push(
        `You skipped ${duplicatesAvoided} duplicate item${duplicatesAvoided > 1 ? 's' : ''} already in your kitchen.`
      );
    }
    if (reusableBagUsed) {
      messageParts.push('You brought your foldable reusable cloth bag instead of relying on single-use bags.');
    } else {
      messageParts.push('Remember to pack your foldable reusable cloth bag on your next trip.');
    }
    if (tokensUsed > 0) {
      messageParts.push(
        `Your family used ${tokensUsed} of ${tokens.totalTokens} Kids' Choice Tokens (${tokenChoices.join(', ')}).`
      );
    }

    const trip: ShoppingTripRecord = {
      id: `trip_${crypto.randomBytes(6).toString('hex')}`,
      userId,
      completedAt: new Date().toISOString(),
      itemsPlanned,
      itemsBought,
      itemsRemaining,
      tokensTotal: tokens.totalTokens,
      tokensUsed,
      tokenChoices,
      reusableBagUsed,
      duplicatesAvoided,
      summaryMessage: messageParts.join(' '),
      kitchenUpdated: false,
      kitchenUpdateDeferred: false,
      boughtItemsDetail,
      unpurchasedItems,
    };

    this.data.shoppingHistory[userId].unshift(trip);

    // Keep unpurchased items on the shopping list for next time, remove bought items, and reset trip tokens/bag session
    this.data.shoppingLists[userId] = this.data.shoppingLists[userId].filter((i) => !i.bought);
    this.data.shoppingSessions[userId] = {
      reusableBagConfirmed: false,
      reusableBagResponse: 'unanswered',
      duplicatesAvoidedCount: 0,
      duplicatesAvoidedItems: [],
    };
    this.data.kidsTokens[userId] = {
      totalTokens: 3,
      remainingTokens: 3,
      usedHistory: [],
    };

    if (autoUpdateKitchen && boughtItemsDetail.length > 0) {
      this.applyTripKitchenUpdates(userId, trip.id, false);
    }

    this.save();
    return {
      trip,
      account: this.getUserAccountData(userId)!,
    };
  }

  public deferTripKitchenUpdates(
    userId: string,
    tripId: string
  ): { trip: ShoppingTripRecord; account: UserAccountData } {
    this.ensureUserCollections(userId);
    const trip = this.data.shoppingHistory[userId].find((t) => t.id === tripId);
    if (!trip) throw new Error('Shopping trip record not found');
    if (!trip.kitchenUpdated) {
      trip.kitchenUpdateDeferred = true;
    }
    this.save();
    return {
      trip,
      account: this.getUserAccountData(userId)!,
    };
  }

  public applyTripKitchenUpdates(
    userId: string,
    tripId: string,
    clearBoughtFromList: boolean = true
  ): { trip: ShoppingTripRecord; account: UserAccountData } {
    this.ensureUserCollections(userId);
    const trip = this.data.shoppingHistory[userId].find((t) => t.id === tripId);
    if (!trip) throw new Error('Shopping trip record not found');

    if (!trip.kitchenUpdated) {
      const kitchenList = this.data.kitchenItems[userId];
      for (const detail of trip.boughtItemsDetail) {
        const norm = normalizeItemName(detail.name);
        const existing = kitchenList.find((k) => normalizeItemName(k.name) === norm);
        if (existing) {
          const beforeQty = existing.quantity;
          const nextQty = Math.max(
            0,
            Math.round((Number(existing.quantity) + Number(detail.quantityBought)) * 100) / 100
          );
          existing.quantity = nextQty;
          detail.beforeQuantity = beforeQty;
          detail.afterQuantity = nextQty;
          if (!existing.unit && detail.unit) {
            existing.unit = detail.unit;
          }
          existing.updatedAt = new Date().toISOString();
        } else {
          detail.beforeQuantity = 0;
          detail.afterQuantity = detail.quantityBought;
          kitchenList.unshift({
            id: `k_${crypto.randomBytes(6).toString('hex')}`,
            userId,
            name: detail.name,
            category: detail.category,
            quantity: detail.quantityBought,
            unit: detail.unit,
            notes: detail.note || 'Added from completed shopping trip',
            updatedAt: new Date().toISOString(),
          });
        }
      }
      trip.kitchenUpdated = true;
      trip.kitchenUpdateDeferred = false;
    }

    if (clearBoughtFromList) {
      this.data.shoppingLists[userId] = this.data.shoppingLists[userId].filter((i) => !i.bought);
    }

    this.save();
    return {
      trip,
      account: this.getUserAccountData(userId)!,
    };
  }
}

export const db = new SmartShopDatabase();
