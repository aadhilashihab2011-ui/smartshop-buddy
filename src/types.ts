export type FoodCategory =
  | 'Fruits & Vegetables'
  | 'Grains & Staples'
  | 'Dairy'
  | 'Snacks'
  | 'Drinks'
  | 'Canned / Packaged Food'
  | 'Other';

export const FOOD_CATEGORIES: FoodCategory[] = [
  'Fruits & Vegetables',
  'Grains & Staples',
  'Dairy',
  'Snacks',
  'Drinks',
  'Canned / Packaged Food',
  'Other',
];

export interface CategoryMeta {
  name: FoodCategory;
  shortLabel: string;
  group: 'Food' | 'Household';
  storageTip: string;
  physicalLabelCode: string;
  shelfLocation: string;
}

export const CATEGORY_METADATA: Record<FoodCategory, CategoryMeta> = {
  'Fruits & Vegetables': {
    name: 'Fruits & Vegetables',
    shortLabel: 'Produce',
    group: 'Food',
    storageTip: 'Crisper drawer or breathable countertop basket. Keep ethylene-producing fruits separate from leafy greens.',
    physicalLabelCode: 'LABEL-01 · FRESH PRODUCE',
    shelfLocation: 'Crisper Zone & Counter Basket',
  },
  'Grains & Staples': {
    name: 'Grains & Staples',
    shortLabel: 'Grains & Staples',
    group: 'Food',
    storageTip: 'Airtight glass jars or dry pantry bins. Place SmartShop Buddy organizer labels on the front at eye level.',
    physicalLabelCode: 'LABEL-02 · GRAINS & STAPLES',
    shelfLocation: 'Middle Pantry Shelf',
  },
  'Dairy': {
    name: 'Dairy',
    shortLabel: 'Dairy & Eggs',
    group: 'Food',
    storageTip: 'Middle refrigerator shelf where temperature stays most consistent (avoid storing milk in the warm fridge door).',
    physicalLabelCode: 'LABEL-03 · DAIRY & CHILLED',
    shelfLocation: 'Center Refrigerator Shelf',
  },
  'Snacks': {
    name: 'Snacks',
    shortLabel: 'Snacks & Cereal',
    group: 'Food',
    storageTip: 'Dedicated family snack bin labeled clearly so kids know what is available at home.',
    physicalLabelCode: 'LABEL-04 · FAMILY SNACKS',
    shelfLocation: 'Accessible Lower Pantry Bin',
  },
  'Drinks': {
    name: 'Drinks',
    shortLabel: 'Beverages',
    group: 'Food',
    storageTip: 'Lower fridge rack or cool dark pantry shelf grouped by daily vs. guest beverages.',
    physicalLabelCode: 'LABEL-05 · BEVERAGES',
    shelfLocation: 'Beverage Rack & Lower Shelf',
  },
  'Canned / Packaged Food': {
    name: 'Canned / Packaged Food',
    shortLabel: 'Canned & Packaged',
    group: 'Food',
    storageTip: 'Arrange oldest cans in front (First-In, First-Out) inside your labeled Canned Goods organizer tray.',
    physicalLabelCode: 'LABEL-06 · CANNED & PANTRY',
    shelfLocation: 'Deep Pantry Organizer Tier',
  },
  'Other': {
    name: 'Other',
    shortLabel: 'Household & Other',
    group: 'Household',
    storageTip: 'Group household supplies, soap, detergent, and utility refills in a labeled shelf bin.',
    physicalLabelCode: 'LABEL-07 · HOUSEHOLD & OTHER',
    shelfLocation: 'Upper Utility Shelf',
  },
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  kitchenSetupCompleted: boolean;
  createdAt: string;
}

export interface KitchenItem {
  id: string;
  userId: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  notes?: string;
  updatedAt: string;
}

export interface ShoppingListItem {
  id: string;
  userId: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  note?: string;
  bought: boolean;
  addedAnyway?: boolean;
  fromKidsToken?: boolean;
  addedInStore?: boolean;
  createdAt: string;
}

export interface TokenUsageEntry {
  id: string;
  label: string;
  usedAt: string;
}

export interface KidsTokenState {
  totalTokens: number;
  remainingTokens: number;
  usedHistory: TokenUsageEntry[];
}

export interface ShoppingSessionState {
  reusableBagConfirmed: boolean;
  reusableBagResponse?: 'unanswered' | 'brought' | 'not_yet';
  duplicatesAvoidedCount: number;
  duplicatesAvoidedItems: string[];
}

export interface BoughtItemUpdatePreview {
  shoppingItemId: string;
  kitchenItemId?: string;
  name: string;
  category: FoodCategory;
  quantityBought: number;
  unit: string;
  note?: string;
  beforeQuantity: number;
  afterQuantity: number;
}

export interface UnpurchasedItemRecord {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  note?: string;
}

export interface ShoppingTripRecord {
  id: string;
  userId: string;
  completedAt: string;
  itemsPlanned: number;
  itemsBought: number;
  itemsRemaining: number;
  tokensTotal: number;
  tokensUsed: number;
  tokenChoices?: string[];
  reusableBagUsed: boolean;
  duplicatesAvoided: number;
  summaryMessage: string;
  kitchenUpdated: boolean;
  kitchenUpdateDeferred?: boolean;
  boughtItemsDetail: BoughtItemUpdatePreview[];
  unpurchasedItems?: UnpurchasedItemRecord[];
}

export interface UserAccountData {
  user: UserProfile;
  kitchenItems: KitchenItem[];
  shoppingList: ShoppingListItem[];
  kidsTokens: KidsTokenState;
  shoppingSession: ShoppingSessionState;
  shoppingHistory: ShoppingTripRecord[];
}

export type AppView =
  | 'dashboard'
  | 'kitchen'
  | 'shopping-list'
  | 'kids-tokens'
  | 'shopping-mode'
  | 'history'
  | 'profile';

/**
 * Returns a contextual food/household icon for an item
 */
export function getItemIcon(name: string, category: FoodCategory): string {
  const lower = name.trim().toLowerCase();
  if (lower.includes('milk')) return '🥛';
  if (lower.includes('bread') || lower.includes('loaf') || lower.includes('Toast')) return '🍞';
  if (lower.includes('egg')) return '🥚';
  if (lower.includes('apple')) return '🍎';
  if (lower.includes('banana')) return '🍌';
  if (lower.includes('carrot')) return '🥕';
  if (lower.includes('tomato')) return '🍅';
  if (lower.includes('potato')) return '🥔';
  if (lower.includes('onion') || lower.includes('garlic')) return '🧅';
  if (lower.includes('veg') || lower.includes('salad') || lower.includes('spinach') || lower.includes('greens')) return '🥬';
  if (lower.includes('rice') || lower.includes('grain') || lower.includes('wheat') || lower.includes('lentil') || lower.includes('oat')) return '🌾';
  if (lower.includes('cereal') || lower.includes('granola')) return '🥣';
  if (lower.includes('cheese') || lower.includes('butter')) return '🧀';
  if (lower.includes('yogurt') || lower.includes('curd')) return '🍨';
  if (lower.includes('chocolate') || lower.includes('candy') || lower.includes('cookie') || lower.includes('biscuit')) return '🍫';
  if (lower.includes('juice') || lower.includes('drink') || lower.includes('water') || lower.includes('soda')) return '🧃';
  if (lower.includes('coffee') || lower.includes('tea')) return '☕';
  if (lower.includes('can') || lower.includes('chickpea') || lower.includes('beans') || lower.includes('soup')) return '🥫';
  if (lower.includes('soap') || lower.includes('detergent') || lower.includes('clean') || lower.includes('wash')) return '🧼';
  if (lower.includes('toy') || lower.includes('game') || lower.includes('book') || lower.includes('sticker')) return '🧸';

  switch (category) {
    case 'Fruits & Vegetables':
      return '🍎';
    case 'Grains & Staples':
      return '🌾';
    case 'Dairy':
      return '🥛';
    case 'Snacks':
      return '🍪';
    case 'Drinks':
      return '🧃';
    case 'Canned / Packaged Food':
      return '🥫';
    case 'Other':
    default:
      return '🧺';
  }
}

/**
 * Formats a numeric quantity and unit into human-friendly text
 * e.g. (2, "packet") -> "2 packets", (1, "packets") -> "1 packet", (10, "") -> "10", (5, "kg") -> "5 kg"
 */
export function formatQuantity(quantity: number, unit?: string): string {
  const cleanQty = Number.isFinite(quantity) ? Math.round(quantity * 100) / 100 : 0;
  const cleanUnit = (unit || '').trim();
  if (!cleanUnit) {
    return `${cleanQty}`;
  }
  const lower = cleanUnit.toLowerCase();
  const invariantUnits = ['kg', 'g', 'ml', 'l', 'oz', 'lb', 'lbs', 'pcs'];
  if (invariantUnits.includes(lower)) {
    return `${cleanQty} ${cleanUnit}`;
  }
  if (cleanQty === 1) {
    if (lower === 'boxes') return `${cleanQty} box`;
    if (lower === 'loaves') return `${cleanQty} loaf`;
    if (lower.endsWith('s') && !lower.endsWith('ss')) {
      return `${cleanQty} ${cleanUnit.slice(0, -1)}`;
    }
    return `${cleanQty} ${cleanUnit}`;
  } else {
    if (lower === 'box') return `${cleanQty} boxes`;
    if (lower === 'loaf') return `${cleanQty} loaves`;
    if (!lower.endsWith('s')) {
      return `${cleanQty} ${cleanUnit}s`;
    }
    return `${cleanQty} ${cleanUnit}`;
  }
}

/**
 * Parses an input string like "2 packets", "5 kg", "10", "1 box" into { quantity, unit }
 */
export function parseQuantityString(input: string, fallbackUnit = ''): { quantity: number; unit: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { quantity: 1, unit: fallbackUnit };
  }
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (match) {
    const qty = parseFloat(match[1]);
    const extractedUnit = match[2].trim() || fallbackUnit;
    return {
      quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
      unit: extractedUnit,
    };
  }
  return { quantity: 1, unit: fallbackUnit || trimmed };
}

/**
 * Normalizes an item name for smart kitchen duplicate matching
 * e.g. "Apples" -> "apple", "Fresh Milk" -> "milk", "Eggs" -> "egg"
 */
export function normalizeItemName(name: string): string {
  let clean = name.trim().toLowerCase().replace(/\s+/g, ' ');
  if (clean.endsWith('ies') && clean.length > 4) {
    clean = clean.slice(0, -3) + 'y';
  } else if (clean.endsWith('oes') && clean.length > 4) {
    clean = clean.slice(0, -2);
  } else if (clean.endsWith('es') && (clean.endsWith('boxes') || clean.endsWith('ches') || clean.endsWith('shes') || clean.endsWith('potatoes') || clean.endsWith('tomatoes'))) {
    clean = clean.slice(0, -2);
  } else if (clean.endsWith('s') && !clean.endsWith('ss') && clean.length > 3) {
    clean = clean.slice(0, -1);
  }
  return clean;
}

/**
 * Checks if a candidate shopping item matches an existing kitchen item
 */
export function findMatchingKitchenItem(
  candidateName: string,
  kitchenItems: KitchenItem[]
): KitchenItem | undefined {
  const normCandidate = normalizeItemName(candidateName);
  if (!normCandidate) return undefined;

  // First check exact normalized match with quantity > 0
  const exactMatch = kitchenItems.find(
    (item) => item.quantity > 0 && normalizeItemName(item.name) === normCandidate
  );
  if (exactMatch) return exactMatch;

  // Next check if one contains the other as a distinct word (e.g., "Milk" vs "Full Cream Milk")
  return kitchenItems.find((item) => {
    if (item.quantity <= 0) return false;
    const normExisting = normalizeItemName(item.name);
    const existingWords = normExisting.split(' ');
    const candidateWords = normCandidate.split(' ');
    return (
      existingWords.includes(normCandidate) ||
      candidateWords.includes(normExisting)
    );
  });
}

export interface KitchenInventoryComparison {
  status: 'not_in_kitchen' | 'already_have_enough' | 'need_more';
  matchedKitchenItem?: KitchenItem;
  kitchenQuantity: number;
  requestedQuantity: number;
  neededDifference: number;
  effectiveUnit: string;
}

/**
 * Quantity-aware comparison between a requested shopping list item and My Kitchen
 */
export function compareWithKitchenInventory(
  candidateName: string,
  requestedQuantity: number,
  requestedUnit: string,
  kitchenItems: KitchenItem[]
): KitchenInventoryComparison {
  const matched = findMatchingKitchenItem(candidateName, kitchenItems);
  const safeReqQty = Math.max(1, Number(requestedQuantity) || 1);

  if (!matched || matched.quantity <= 0) {
    return {
      status: 'not_in_kitchen',
      kitchenQuantity: 0,
      requestedQuantity: safeReqQty,
      neededDifference: safeReqQty,
      effectiveUnit: requestedUnit,
    };
  }

  const kitchenQty = Number(matched.quantity) || 0;
  const effectiveUnit = matched.unit || requestedUnit;

  if (kitchenQty >= safeReqQty) {
    return {
      status: 'already_have_enough',
      matchedKitchenItem: matched,
      kitchenQuantity: kitchenQty,
      requestedQuantity: safeReqQty,
      neededDifference: 0,
      effectiveUnit,
    };
  }

  // User has some in kitchen (e.g. 1 packet or 2 eggs), but requested more (e.g. 3 packets or 12 eggs)
  const diff = Math.max(1, Math.round((safeReqQty - kitchenQty) * 100) / 100);
  return {
    status: 'need_more',
    matchedKitchenItem: matched,
    kitchenQuantity: kitchenQty,
    requestedQuantity: safeReqQty,
    neededDifference: diff,
    effectiveUnit,
  };
}
