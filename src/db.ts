import { doc, getDoc, setDoc, collection, getDocs, getDocFromCache, getDocsFromCache } from 'firebase/firestore';
import { firestoreDB, auth } from './firebase';
import { encryptData, decryptData } from './crypto';

async function safeGetDoc(docRef: any) {
  try {
    return await getDoc(docRef);
  } catch (err: any) {
    console.warn("safeGetDoc: failed to fetch from server, trying cache...", err);
    try {
      return await getDocFromCache(docRef);
    } catch (cacheErr) {
      console.error("safeGetDoc: failed to fetch from cache", cacheErr);
      return {
        exists: () => false,
        data: () => ({})
      } as any;
    }
  }
}

async function safeGetDocs(colRef: any) {
  try {
    return await getDocs(colRef);
  } catch (err: any) {
    console.warn("safeGetDocs: failed to fetch from server, trying cache...", err);
    try {
      return await getDocsFromCache(colRef);
    } catch (cacheErr) {
      console.error("safeGetDocs: failed to fetch from cache", cacheErr);
      return {
        docs: [],
        empty: true,
        size: 0
      } as any;
    }
  }
}

// Export interfaces with string IDs
export interface ExpenseCategory { id?: string; name: string; icon: string; color: string; monthlyBudget: number; isDefault: boolean; createdAt: string; }
export interface EarningCategory { id?: string; name: string; icon: string; color: string; isRecurring: boolean; recurringAmount: number; recurringFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none'; isDefault: boolean; createdAt: string; }
export interface Expense { id?: string; date: string; categoryId: string; amount: number; paymentMethod: string; notes: string; tags: string[]; isRecurring: boolean; createdAt: string; }
export interface Earning { id?: string; date: string; categoryId: string; amount: number; source: string; notes: string; isRecurring: boolean; createdAt: string; }
export interface EmiEntry { id?: string; name: string; lender: string; totalAmount: number; emiAmount: number; interestRate: number; totalEmis: number; emisPaid: number; startDate: string; notes: string; createdAt: string; }
export interface Budget { id?: string; year: number; month: number; totalBudget: number; savingsGoal: number; }
export interface UserProfile { id?: string; name: string; currency: string; theme: 'light' | 'dark' | 'system'; createdAt: string; }

/**
 * Returns a reference to the single user document at `users/{uid}`.
 * All data for the user is stored as encrypted fields within this document.
 */
function getUserDocRef() {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be logged in to access data");
  return doc(firestoreDB, 'users', user.uid);
}

function generateId(): string {
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  // Fallback UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * A collection-like abstraction that stores items as an encrypted array
 * within a single Firestore document field.
 *
 * Document structure: users/{uid} = {
 *   expenses: "encrypted_array_string",
 *   earnings: "encrypted_array_string",
 *   expenseCategories: "encrypted_array_string",
 *   ...
 *   dataVersion: 2,
 *   lastUpdated: "ISO timestamp"
 * }
 */
class SingleDocCollection<T extends { id?: string }> {
  fieldName: string;

  constructor(fieldName: string) {
    this.fieldName = fieldName;
  }

  /**
   * Read and decrypt the array stored in this section of the user document.
   * Uses cache-first for display/read-only operations.
   */
  private async readSection(): Promise<T[]> {
    const docRef = getUserDocRef();
    let docSnap;
    try {
      docSnap = await getDocFromCache(docRef);
    } catch (err) {
      docSnap = await safeGetDoc(docRef);
    }
    if (!docSnap.exists()) return [];
    const encrypted = docSnap.data()[this.fieldName];
    if (!encrypted) return [];
    try {
      return await decryptData(encrypted);
    } catch (err) {
      console.error(`Error decrypting ${this.fieldName}:`, err);
      return [];
    }
  }

  /**
   * Read from the SERVER (not cache) to get the latest data.
   * Must be used before any write operation to prevent stale cache
   * from overwriting server data on a new device.
   */
  private async readSectionFromServer(): Promise<T[]> {
    const docRef = getUserDocRef();
    const docSnap = await safeGetDoc(docRef);
    if (!docSnap.exists()) return [];
    const encrypted = docSnap.data()[this.fieldName];
    if (!encrypted) return [];
    try {
      return await decryptData(encrypted);
    } catch (err) {
      console.error(`Error decrypting ${this.fieldName} from server:`, err);
      return [];
    }
  }

  /**
   * Encrypt and write the array back to this section of the user document.
   * Uses merge:true so other sections are not overwritten.
   */
  private async writeSection(items: T[]): Promise<void> {
    const docRef = getUserDocRef();
    const encrypted = await encryptData(items);
    await setDoc(docRef, {
      [this.fieldName]: encrypted,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  }

  async toArray(fromServer = false): Promise<T[]> {
    return fromServer ? this.readSectionFromServer() : this.readSection();
  }

  async add(item: T): Promise<string> {
    const id = generateId();
    const { id: _removedId, ...dataToSave } = item as any;
    // Use server read before write to prevent stale cache overwrites
    const items = await this.readSectionFromServer();
    items.push({ id, ...dataToSave } as T);
    await this.writeSection(items);
    return id;
  }

  async get(id: string): Promise<T | undefined> {
    const items = await this.readSection();
    return items.find(item => (item as any).id === id);
  }

  async update(id: string, updates: Partial<T>): Promise<void> {
    // Use server read before write to prevent stale cache overwrites
    const items = await this.readSectionFromServer();
    const index = items.findIndex(item => (item as any).id === id);
    if (index === -1) throw new Error("Item not found");
    const { id: _removedId, ...updateData } = updates as any;
    items[index] = { ...items[index], ...updateData };
    await this.writeSection(items);
  }

  async delete(id: string): Promise<void> {
    // Use server read before write to prevent stale cache overwrites
    const items = await this.readSectionFromServer();
    const filtered = items.filter(item => (item as any).id !== id);
    await this.writeSection(filtered);
  }

  async clear(): Promise<void> {
    await this.writeSection([]);
  }

  /**
   * Count items. When forWrite=true, reads from server to get accurate count
   * (used by seedDefaults to avoid re-seeding on new devices).
   */
  async count(forWrite = false): Promise<number> {
    const items = forWrite
      ? await this.readSectionFromServer()
      : await this.readSection();
    return items.length;
  }

  async bulkAdd(newItems: T[]): Promise<void> {
    // Use server read before write to prevent stale cache overwrites
    const items = await this.readSectionFromServer();
    for (const item of newItems) {
      const { id: _removedId, ...dataToSave } = item as any;
      items.push({ id: generateId(), ...dataToSave } as T);
    }
    await this.writeSection(items);
  }
}

export const db = {
  expenseCategories: new SingleDocCollection<ExpenseCategory>('expenseCategories'),
  earningCategories: new SingleDocCollection<EarningCategory>('earningCategories'),
  expenses: new SingleDocCollection<Expense>('expenses'),
  earnings: new SingleDocCollection<Earning>('earnings'),
  budgets: new SingleDocCollection<Budget>('budgets'),
  userProfiles: new SingleDocCollection<UserProfile>('userProfiles'),
  emiEntries: new SingleDocCollection<EmiEntry>('emiEntries'),
  transaction: async (_mode: string, _stores: any[], callback: () => Promise<void>) => {
    await callback();
  }
};

/**
 * Migrates data from the old subcollection-per-type structure
 * to the new single-document structure.
 *
 * Old: users/{uid}/expenses/{docId} (each item is a separate encrypted doc)
 * New: users/{uid} = { expenses: "encrypted_array", ... }
 *
 * Preserves original Firestore document IDs so category references remain valid.
 * Only runs once — sets dataVersion=2 after migration.
 */
export async function migrateFromSubcollections(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  const userDocRef = doc(firestoreDB, 'users', user.uid);

  // Try cache first for instant load if already migrated
  try {
    const cachedSnap = await getDocFromCache(userDocRef);
    if (cachedSnap.exists() && cachedSnap.data().dataVersion === 2) {
      return false;
    }
  } catch (err) {
    // Cache miss or not ready, proceed to check server
  }

  const userDocSnap = await safeGetDoc(userDocRef);

  // Already migrated — skip
  if (userDocSnap.exists() && userDocSnap.data().dataVersion === 2) {
    return false;
  }

  const collectionNames = [
    'expenseCategories', 'earningCategories', 'expenses',
    'earnings', 'budgets', 'userProfiles', 'emiEntries'
  ];

  const consolidatedData: Record<string, string> = {};
  let hasOldData = false;

  for (const colName of collectionNames) {
    const colRef = collection(firestoreDB, `users/${user.uid}/${colName}`);
    const snapshot = await safeGetDocs(colRef);
    const items: any[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data().data;
      if (data) {
        try {
          const decrypted = await decryptData(data);
          // Preserve the original Firestore doc ID so categoryId references stay valid
          items.push({ id: docSnap.id, ...decrypted });
          hasOldData = true;
        } catch (err) {
          console.error(`Migration: error decrypting ${colName}/${docSnap.id}:`, err);
        }
      }
    }

    if (items.length > 0) {
      consolidatedData[colName] = await encryptData(items);
    }
  }

  // Write the consolidated single document
  await setDoc(userDocRef, {
    ...consolidatedData,
    dataVersion: 2,
    migratedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  }, { merge: true });

  return hasOldData;
}

export async function seedDefaults() {
  if (!auth.currentUser) return;

  // Use forWrite=true to read from SERVER, not cache.
  // This prevents re-seeding on a new device where the cache is empty
  // but the server already has the user's data.
  const expCount = await db.expenseCategories.count(true);
  if (expCount === 0) {
    await db.expenseCategories.bulkAdd([
      { name: 'Food', icon: 'UtensilsCrossed', color: '#f59e0b', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Rent', icon: 'Home', color: '#3b82f6', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Electricity', icon: 'Zap', color: '#eab308', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Water Bill', icon: 'Droplets', color: '#06b6d4', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Internet', icon: 'Wifi', color: '#8b5cf6', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Fuel', icon: 'Fuel', color: '#ef4444', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Groceries', icon: 'ShoppingCart', color: '#10b981', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Entertainment', icon: 'Film', color: '#a855f7', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Travel', icon: 'Plane', color: '#0ea5e9', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Medical', icon: 'Heart', color: '#f43f5e', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Education', icon: 'GraduationCap', color: '#6366f1', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'EMI', icon: 'CreditCard', color: '#f97316', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Insurance', icon: 'Shield', color: '#14b8a6', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Investment', icon: 'TrendingUp', color: '#22c55e', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Miscellaneous', icon: 'MoreHorizontal', color: '#64748b', monthlyBudget: 0, isDefault: true, createdAt: new Date().toISOString() },
    ]);
  }

  // Use forWrite=true to read from SERVER, not cache.
  const earnCount = await db.earningCategories.count(true);
  if (earnCount === 0) {
    await db.earningCategories.bulkAdd([
      { name: 'Salary', icon: 'Banknote', color: '#10b981', isRecurring: true, recurringAmount: 0, recurringFrequency: 'monthly', isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Freelancing', icon: 'Laptop', color: '#3b82f6', isRecurring: false, recurringAmount: 0, recurringFrequency: 'none', isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Business', icon: 'Briefcase', color: '#8b5cf6', isRecurring: false, recurringAmount: 0, recurringFrequency: 'none', isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Rental Income', icon: 'Building', color: '#f59e0b', isRecurring: true, recurringAmount: 0, recurringFrequency: 'monthly', isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Interest', icon: 'Percent', color: '#06b6d4', isRecurring: false, recurringAmount: 0, recurringFrequency: 'none', isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Dividend', icon: 'PieChart', color: '#22c55e', isRecurring: false, recurringAmount: 0, recurringFrequency: 'none', isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Side Income', icon: 'Sparkles', color: '#ec4899', isRecurring: false, recurringAmount: 0, recurringFrequency: 'none', isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Bonus', icon: 'Gift', color: '#f97316', isRecurring: false, recurringAmount: 0, recurringFrequency: 'none', isDefault: true, createdAt: new Date().toISOString() },
      { name: 'Other Income', icon: 'CircleDollarSign', color: '#64748b', isRecurring: false, recurringAmount: 0, recurringFrequency: 'none', isDefault: true, createdAt: new Date().toISOString() },
    ]);
  }
}

export async function clearAllData(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be logged in to clear data");

  const docRef = doc(firestoreDB, 'users', user.uid);
  const encryptedEmptyArray = await encryptData([]);

  await setDoc(docRef, {
    expenseCategories: encryptedEmptyArray,
    earningCategories: encryptedEmptyArray,
    expenses: encryptedEmptyArray,
    earnings: encryptedEmptyArray,
    budgets: encryptedEmptyArray,
    userProfiles: encryptedEmptyArray,
    emiEntries: encryptedEmptyArray,
    dataVersion: 2,
    lastUpdated: new Date().toISOString()
  });
}

