import { db } from './db';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

export async function exportExpensesCSV(year?: number) {
  const expenses = await db.expenses.toArray();
  const categories = await db.expenseCategories.toArray();
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  let data = expenses.map((e) => ({
    Date: e.date,
    Category: catMap[e.categoryId] || 'Unknown',
    Amount: e.amount,
    'Payment Method': e.paymentMethod,
    Notes: e.notes,
    Tags: e.tags.join(', '),
  }));

  if (year) data = data.filter((d) => d.Date.startsWith(String(year)));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `expenses_${year || 'all'}.csv`);
}

export async function exportEarningsCSV(year?: number) {
  const earnings = await db.earnings.toArray();
  const categories = await db.earningCategories.toArray();
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  let data = earnings.map((e) => ({
    Date: e.date,
    Category: catMap[e.categoryId] || 'Unknown',
    Amount: e.amount,
    Source: e.source,
    Notes: e.notes,
  }));

  if (year) data = data.filter((d) => d.Date.startsWith(String(year)));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `earnings_${year || 'all'}.csv`);
}

export async function generateExpensesBlob(year?: number): Promise<{ blob: Blob; filename: string; count: number }> {
  const expenses = await db.expenses.toArray();
  const categories = await db.expenseCategories.toArray();
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  let data = expenses.map((e) => ({
    Date: e.date,
    Category: catMap[e.categoryId] || 'Unknown',
    Amount: e.amount,
    'Payment Method': e.paymentMethod,
    Notes: e.notes,
    Tags: e.tags.join(', '),
  }));

  if (year) data = data.filter((d) => d.Date.startsWith(String(year)));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const today = new Date().toISOString().split('T')[0];
  return { blob, filename: `FinTrack_Expenses_Backup_${today}.csv`, count: data.length };
}

export async function generateEarningsBlob(year?: number): Promise<{ blob: Blob; filename: string; count: number }> {
  const earnings = await db.earnings.toArray();
  const categories = await db.earningCategories.toArray();
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  let data = earnings.map((e) => ({
    Date: e.date,
    Category: catMap[e.categoryId] || 'Unknown',
    Amount: e.amount,
    Source: e.source,
    Notes: e.notes,
  }));

  if (year) data = data.filter((d) => d.Date.startsWith(String(year)));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const today = new Date().toISOString().split('T')[0];
  return { blob, filename: `FinTrack_Earnings_Backup_${today}.csv`, count: data.length };
}

export async function generateExpensesCSVString(year?: number): Promise<{ csv: string; count: number }> {
  const expenses = await db.expenses.toArray();
  const categories = await db.expenseCategories.toArray();
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  let data = expenses.map((e) => ({
    Date: e.date,
    Category: catMap[e.categoryId] || 'Unknown',
    Amount: e.amount,
    'Payment Method': e.paymentMethod,
    Notes: e.notes,
    Tags: e.tags.join(', '),
  }));

  if (year) data = data.filter((d) => d.Date.startsWith(String(year)));

  const csv = Papa.unparse(data);
  return { csv, count: data.length };
}

export async function generateEarningsCSVString(year?: number): Promise<{ csv: string; count: number }> {
  const earnings = await db.earnings.toArray();
  const categories = await db.earningCategories.toArray();
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  let data = earnings.map((e) => ({
    Date: e.date,
    Category: catMap[e.categoryId] || 'Unknown',
    Amount: e.amount,
    Source: e.source,
    Notes: e.notes,
  }));

  if (year) data = data.filter((d) => d.Date.startsWith(String(year)));

  const csv = Papa.unparse(data);
  return { csv, count: data.length };
}

// Default colors to assign to newly-created categories during import
const IMPORT_CATEGORY_COLORS = [
  '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#22c55e', '#6366f1',
  '#14b8a6', '#a855f7', '#0ea5e9', '#f43f5e', '#64748b',
];

export async function importCSV(file: File, type: 'expense' | 'earning'): Promise<number> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          let count = 0;

          if (type === 'expense') {
            // --- Step 1: Collect all unique category names from the CSV ---
            const csvCategoryNames = new Set<string>();
            for (const row of results.data as any[]) {
              if (row.Category && row.Category.trim()) {
                csvCategoryNames.add(row.Category.trim());
              }
            }

            // --- Step 2: Create any missing categories ---
            const existingCats = await db.expenseCategories.toArray();
            const catNameMap: Record<string, number> = {};
            for (const c of existingCats) {
              catNameMap[c.name.toLowerCase()] = c.id!;
            }

            let colorIndex = existingCats.length;
            for (const catName of csvCategoryNames) {
              if (!catNameMap[catName.toLowerCase()]) {
                const newId = await db.expenseCategories.add({
                  name: catName,
                  icon: 'Tag',
                  color: IMPORT_CATEGORY_COLORS[colorIndex % IMPORT_CATEGORY_COLORS.length],
                  monthlyBudget: 0,
                  isDefault: false,
                  createdAt: new Date().toISOString(),
                });
                catNameMap[catName.toLowerCase()] = newId as number;
                colorIndex++;
              }
            }

            // --- Step 3: Import transactions with correct category IDs ---
            for (const row of results.data as any[]) {
              if (!row.Date || !row.Amount) continue;
              const categoryId = catNameMap[row.Category?.trim().toLowerCase()];
              if (!categoryId) continue;
              await db.expenses.add({
                date: row.Date,
                categoryId,
                amount: Number(row.Amount),
                paymentMethod: row['Payment Method'] || 'Cash',
                notes: row.Notes || '',
                tags: row.Tags ? row.Tags.split(',').map((t: string) => t.trim()) : [],
                isRecurring: false,
                createdAt: new Date().toISOString(),
              });
              count++;
            }
          } else {
            // --- Step 1: Collect all unique category names from the CSV ---
            const csvCategoryNames = new Set<string>();
            for (const row of results.data as any[]) {
              if (row.Category && row.Category.trim()) {
                csvCategoryNames.add(row.Category.trim());
              }
            }

            // --- Step 2: Create any missing categories ---
            const existingCats = await db.earningCategories.toArray();
            const catNameMap: Record<string, number> = {};
            for (const c of existingCats) {
              catNameMap[c.name.toLowerCase()] = c.id!;
            }

            let colorIndex = existingCats.length;
            for (const catName of csvCategoryNames) {
              if (!catNameMap[catName.toLowerCase()]) {
                const newId = await db.earningCategories.add({
                  name: catName,
                  icon: 'Tag',
                  color: IMPORT_CATEGORY_COLORS[colorIndex % IMPORT_CATEGORY_COLORS.length],
                  isRecurring: false,
                  recurringAmount: 0,
                  recurringFrequency: 'none',
                  isDefault: false,
                  createdAt: new Date().toISOString(),
                });
                catNameMap[catName.toLowerCase()] = newId as number;
                colorIndex++;
              }
            }

            // --- Step 3: Import transactions with correct category IDs ---
            for (const row of results.data as any[]) {
              if (!row.Date || !row.Amount) continue;
              const categoryId = catNameMap[row.Category?.trim().toLowerCase()];
              if (!categoryId) continue;
              await db.earnings.add({
                date: row.Date,
                categoryId,
                amount: Number(row.Amount),
                source: row.Source || '',
                notes: row.Notes || '',
                isRecurring: false,
                createdAt: new Date().toISOString(),
              });
              count++;
            }
          }
          resolve(count);
        } catch (err) {
          reject(err);
        }
      },
      error: reject,
    });
  });
}

export async function resetDatabase() {
  try {
    await db.transaction('rw', [db.expenses, db.earnings, db.expenseCategories, db.earningCategories, db.budgets, db.userProfiles, db.emiEntries], async () => {
      await db.expenses.clear();
      await db.earnings.clear();
      await db.expenseCategories.clear();
      await db.earningCategories.clear();
      await db.budgets.clear();
      await db.userProfiles.clear();
      await db.emiEntries.clear();
    });
    window.location.reload();
  } catch (error) {
    console.error('Reset failed:', error);
    alert('Failed to reset data. Please close other app tabs and try again.');
  }
}
