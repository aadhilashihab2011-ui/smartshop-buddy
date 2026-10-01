import {
  FoodCategory,
  KitchenItem,
  ShoppingListItem,
  ShoppingTripRecord,
  UserAccountData,
} from '../types.ts';

const TOKEN_STORAGE_KEY = 'smartshop_buddy_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data as T;
}

export const api = {
  async signUp(name: string, email: string, password: string): Promise<UserAccountData> {
    const res = await request<{ token: string; account: UserAccountData }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setStoredToken(res.token);
    return res.account;
  },

  async logIn(email: string, password: string): Promise<UserAccountData> {
    const res = await request<{ token: string; account: UserAccountData }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    return res.account;
  },

  async logOut(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore logout network errors
    } finally {
      setStoredToken(null);
    }
  },

  async getMe(): Promise<UserAccountData> {
    const res = await request<{ account: UserAccountData }>('/api/auth/me');
    return res.account;
  },

  async updateProfile(name: string): Promise<UserAccountData> {
    const res = await request<{ account: UserAccountData }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
    return res.account;
  },

  async completeKitchenSetup(): Promise<UserAccountData> {
    const res = await request<{ account: UserAccountData }>('/api/auth/complete-setup', {
      method: 'POST',
    });
    return res.account;
  },

  // Kitchen Inventory
  async addKitchenItem(payload: {
    name: string;
    category: FoodCategory;
    quantity: number;
    unit: string;
    notes?: string;
  }): Promise<UserAccountData> {
    const res = await request<{ account: UserAccountData }>('/api/kitchen', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.account;
  },

  async addStarterKitchenPreset(): Promise<UserAccountData> {
    const res = await request<{ account: UserAccountData }>('/api/kitchen/starter-preset', {
      method: 'POST',
    });
    return res.account;
  },

  async updateKitchenItem(
    itemId: string,
    payload: Partial<Pick<KitchenItem, 'name' | 'category' | 'quantity' | 'unit' | 'notes'>>
  ): Promise<UserAccountData> {
    const res = await request<{ account: UserAccountData }>(`/api/kitchen/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.account;
  },

  async deleteKitchenItem(itemId: string): Promise<UserAccountData> {
    const res = await request<{ account: UserAccountData }>(`/api/kitchen/${itemId}`, {
      method: 'DELETE',
    });
    return res.account;
  },

  // Shopping List
  async addShoppingItem(payload: {
    name: string;
    category: FoodCategory;
    quantity: number;
    unit: string;
    note?: string;
    addedAnyway?: boolean;
    fromKidsToken?: boolean;
    addedInStore?: boolean;
  }): Promise<UserAccountData> {
    const res = await request<{ account: UserAccountData }>('/api/shopping-list', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.account;
  },

  async recordDuplicateAvoided(itemName: string): Promise<UserAccountData> {
    const res = await request<{ account: UserAccountData }>('/api/shopping-list/avoided', {
      method: 'POST',
      body: JSON.stringify({ itemName }),
    });
    return res.account;
  },

  async updateShoppingItem(
    itemId: string,
    payload: Partial<Pick<ShoppingListItem, 'name' | 'category' | 'quantity' | 'unit' | 'note' | 'bought'>>
  ): Promise<UserAccountData> {
    const res = await request<{ account: UserAccountData }>(`/api/shopping-list/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.account;
  },

  async deleteShoppingItem(itemId: string): Promise<UserAccountData> {
    const res = await request<{ account: UserAccountData }>(`/api/shopping-list/${itemId}`, {
      method: 'DELETE',
    });
    return res.account;
  },

  // Kids' Choice Tokens
  async setTokenAllowance(totalTokens: number): Promise<UserAccountData> {
    const res = await request<{ account: UserAccountData }>('/api/tokens/allowance', {
      method: 'PUT',
      body: JSON.stringify({ totalTokens }),
    });
    return res.account;
  },

  async useOneToken(label: string): Promise<UserAccountData> {
    const res = await request<{ account: UserAccountData }>('/api/tokens/use', {
      method: 'POST',
      body: JSON.stringify({ label }),
    });
    return res.account;
  },

  async updateTokenChoice(choiceId: string, label: string): Promise<UserAccountData> {
    const res = await request<{ account: UserAccountData }>(`/api/tokens/choices/${choiceId}`, {
      method: 'PUT',
      body: JSON.stringify({ label }),
    });
    return res.account;
  },

  async removeTokenChoice(choiceId: string): Promise<UserAccountData> {
    const res = await request<{ account: UserAccountData }>(`/api/tokens/choices/${choiceId}`, {
      method: 'DELETE',
    });
    return res.account;
  },

  async resetTokens(totalTokens: number = 3): Promise<UserAccountData> {
    const res = await request<{ account: UserAccountData }>('/api/tokens/reset', {
      method: 'POST',
      body: JSON.stringify({ totalTokens }),
    });
    return res.account;
  },

  async startNewShoppingTrip(clearBoughtItems: boolean = false): Promise<UserAccountData> {
    const res = await request<{ account: UserAccountData }>('/api/shopping-trips/start-new', {
      method: 'POST',
      body: JSON.stringify({ clearBoughtItems }),
    });
    return res.account;
  },

  // Reusable Bag & Shopping Completion
  async setReusableBagConfirmed(
    confirmed: boolean,
    response?: 'unanswered' | 'brought' | 'not_yet'
  ): Promise<UserAccountData> {
    const res = await request<{ account: UserAccountData }>('/api/shopping-session/bag', {
      method: 'PUT',
      body: JSON.stringify({ confirmed, response }),
    });
    return res.account;
  },

  async completeShoppingTrip(
    autoUpdateKitchen: boolean = false
  ): Promise<{ trip: ShoppingTripRecord; account: UserAccountData }> {
    return request<{ trip: ShoppingTripRecord; account: UserAccountData }>(
      '/api/shopping-trips/complete',
      {
        method: 'POST',
        body: JSON.stringify({ autoUpdateKitchen }),
      }
    );
  },

  async applyTripKitchenUpdates(
    tripId: string,
    clearBoughtFromList: boolean = true
  ): Promise<{ trip: ShoppingTripRecord; account: UserAccountData }> {
    return request<{ trip: ShoppingTripRecord; account: UserAccountData }>(
      `/api/shopping-trips/${tripId}/update-kitchen`,
      {
        method: 'POST',
        body: JSON.stringify({ clearBoughtFromList }),
      }
    );
  },

  async deferTripKitchenUpdates(
    tripId: string
  ): Promise<{ trip: ShoppingTripRecord; account: UserAccountData }> {
    return request<{ trip: ShoppingTripRecord; account: UserAccountData }>(
      `/api/shopping-trips/${tripId}/defer-kitchen`,
      {
        method: 'POST',
      }
    );
  },
};
