import { db, clearAllData } from './db';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { auth } from './firebase';

export async function exportExpensesCSV(year?: number) {
  const expenses = await db.expenses.toArray();
  const categories = await db.expenseCategories.toArray();
  const catMap = Object.fromEntries(categories.map((c) => [c.id, { name: c.name, icon: c.icon }]));

  let data = expenses.map((e) => ({
    Date: e.date,
    Category: catMap[e.categoryId]?.name || 'Unknown',
    Icon: catMap[e.categoryId]?.icon || 'Tag',
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
  const catMap = Object.fromEntries(categories.map((c) => [c.id, { name: c.name, icon: c.icon }]));

  let data = earnings.map((e) => ({
    Date: e.date,
    Category: catMap[e.categoryId]?.name || 'Unknown',
    Icon: catMap[e.categoryId]?.icon || 'Tag',
    Amount: e.amount,
    Source: e.source,
    Notes: e.notes,
  }));

  if (year) data = data.filter((d) => d.Date.startsWith(String(year)));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `earnings_${year || 'all'}.csv`);
}

export async function exportEmisCSV() {
  const emis = await db.emiEntries.toArray();
  const data = emis.map((e) => ({
    Name: e.name,
    Lender: e.lender,
    'Total Amount': e.totalAmount,
    'EMI Amount': e.emiAmount,
    'Interest Rate': e.interestRate,
    'Total EMIs': e.totalEmis,
    'EMIs Paid': e.emisPaid,
    'Start Date': e.startDate,
    Notes: e.notes,
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const today = new Date().toISOString().split('T')[0];
  saveAs(blob, `EMI_Backup_${today}.csv`);
}

export async function generateExpensesBlob(year?: number): Promise<{ blob: Blob; filename: string; count: number }> {
  const expenses = await db.expenses.toArray();
  const categories = await db.expenseCategories.toArray();
  const catMap = Object.fromEntries(categories.map((c) => [c.id, { name: c.name, icon: c.icon }]));

  let data = expenses.map((e) => ({
    Date: e.date,
    Category: catMap[e.categoryId]?.name || 'Unknown',
    Icon: catMap[e.categoryId]?.icon || 'Tag',
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
  const catMap = Object.fromEntries(categories.map((c) => [c.id, { name: c.name, icon: c.icon }]));

  let data = earnings.map((e) => ({
    Date: e.date,
    Category: catMap[e.categoryId]?.name || 'Unknown',
    Icon: catMap[e.categoryId]?.icon || 'Tag',
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

export async function generateEmisBlob(): Promise<{ blob: Blob; filename: string; count: number }> {
  const emis = await db.emiEntries.toArray();
  const data = emis.map((e) => ({
    Name: e.name,
    Lender: e.lender,
    'Total Amount': e.totalAmount,
    'EMI Amount': e.emiAmount,
    'Interest Rate': e.interestRate,
    'Total EMIs': e.totalEmis,
    'EMIs Paid': e.emisPaid,
    'Start Date': e.startDate,
    Notes: e.notes,
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const today = new Date().toISOString().split('T')[0];
  return { blob, filename: `FinTrack_EMI_Backup_${today}.csv`, count: data.length };
}

export async function generateExpensesCSVString(year?: number): Promise<{ csv: string; count: number }> {
  const expenses = await db.expenses.toArray();
  const categories = await db.expenseCategories.toArray();
  const catMap = Object.fromEntries(categories.map((c) => [c.id, { name: c.name, icon: c.icon }]));

  let data = expenses.map((e) => ({
    Date: e.date,
    Category: catMap[e.categoryId]?.name || 'Unknown',
    Icon: catMap[e.categoryId]?.icon || 'Tag',
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
  const catMap = Object.fromEntries(categories.map((c) => [c.id, { name: c.name, icon: c.icon }]));

  let data = earnings.map((e) => ({
    Date: e.date,
    Category: catMap[e.categoryId]?.name || 'Unknown',
    Icon: catMap[e.categoryId]?.icon || 'Tag',
    Amount: e.amount,
    Source: e.source,
    Notes: e.notes,
  }));

  if (year) data = data.filter((d) => d.Date.startsWith(String(year)));

  const csv = Papa.unparse(data);
  return { csv, count: data.length };
}

export async function generateEmisCSVString(): Promise<{ csv: string; count: number }> {
  const emis = await db.emiEntries.toArray();
  const data = emis.map((e) => ({
    Name: e.name,
    Lender: e.lender,
    'Total Amount': e.totalAmount,
    'EMI Amount': e.emiAmount,
    'Interest Rate': e.interestRate,
    'Total EMIs': e.totalEmis,
    'EMIs Paid': e.emisPaid,
    'Start Date': e.startDate,
    Notes: e.notes,
  }));

  const csv = Papa.unparse(data);
  return { csv, count: data.length };
}

// Default colors to assign to newly-created categories during import
const IMPORT_CATEGORY_COLORS = [
  '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#22c55e', '#6366f1',
  '#14b8a6', '#a855f7', '#0ea5e9', '#f43f5e', '#64748b',
];

export async function importCSV(file: File, type: 'expense' | 'earning' | 'emi'): Promise<number> {
  // Parse CSV synchronously first. PapaParse does NOT await async callbacks,
  // so we MUST separate parsing from async DB work to avoid swallowed errors.
  const parseResult = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: resolve,
      error: reject,
    });
  });

  if (parseResult.errors && parseResult.errors.length > 0) {
    const firstError = parseResult.errors[0];
    throw new Error(`CSV parse error: ${firstError.message} (row ${firstError.row})`);
  }

  const rows = parseResult.data as any[];
  if (rows.length === 0) throw new Error('CSV file is empty or has no valid rows.');

  let count = 0;

  if (type === 'expense') {
    const csvCategoryInfo = new Map<string, string>();
    for (const row of rows) {
      const cat = row.Category?.trim();
      if (cat) {
        const key = cat.toLowerCase();
        if (!csvCategoryInfo.has(key)) csvCategoryInfo.set(key, row.Icon?.trim() || 'Tag');
      }
    }

    const existingCats = await db.expenseCategories.toArray();
    const catNameMap: Record<string, string> = {};
    for (const c of existingCats) catNameMap[c.name.toLowerCase()] = c.id!;

    let colorIndex = existingCats.length;
    for (const [key, icon] of csvCategoryInfo) {
      if (!catNameMap[key]) {
        const originalName = rows.find((r) => r.Category?.trim().toLowerCase() === key)?.Category?.trim() || key;
        const newId = await db.expenseCategories.add({
          name: originalName,
          icon,
          color: IMPORT_CATEGORY_COLORS[colorIndex % IMPORT_CATEGORY_COLORS.length],
          monthlyBudget: 0,
          isDefault: false,
          createdAt: new Date().toISOString(),
        });
        catNameMap[key] = newId as string;
        colorIndex++;
      }
    }

    const expenseRows: any[] = [];
    for (const row of rows) {
      if (!row.Date?.trim() || !row.Amount) continue;
      const categoryId = catNameMap[row.Category?.trim().toLowerCase()];
      if (!categoryId) continue;
      expenseRows.push({
        date: row.Date.trim(),
        categoryId,
        amount: Number(row.Amount),
        paymentMethod: row['Payment Method']?.trim() || 'Cash',
        notes: row.Notes?.trim() || '',
        tags: row.Tags ? row.Tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        isRecurring: false,
        createdAt: new Date().toISOString(),
      });
    }
    if (expenseRows.length > 0) await db.expenses.bulkAdd(expenseRows);
    count = expenseRows.length;

  } else if (type === 'earning') {
    const csvCategoryInfo = new Map<string, string>();
    for (const row of rows) {
      const cat = row.Category?.trim();
      if (cat) {
        const key = cat.toLowerCase();
        if (!csvCategoryInfo.has(key)) csvCategoryInfo.set(key, row.Icon?.trim() || 'Tag');
      }
    }

    const existingCats = await db.earningCategories.toArray();
    const catNameMap: Record<string, string> = {};
    for (const c of existingCats) catNameMap[c.name.toLowerCase()] = c.id!;

    let colorIndex = existingCats.length;
    for (const [key, icon] of csvCategoryInfo) {
      if (!catNameMap[key]) {
        const originalName = rows.find((r) => r.Category?.trim().toLowerCase() === key)?.Category?.trim() || key;
        const newId = await db.earningCategories.add({
          name: originalName,
          icon,
          color: IMPORT_CATEGORY_COLORS[colorIndex % IMPORT_CATEGORY_COLORS.length],
          isRecurring: false,
          recurringAmount: 0,
          recurringFrequency: 'none',
          isDefault: false,
          createdAt: new Date().toISOString(),
        });
        catNameMap[key] = newId as string;
        colorIndex++;
      }
    }

    const earningRows: any[] = [];
    for (const row of rows) {
      if (!row.Date?.trim() || !row.Amount) continue;
      const categoryId = catNameMap[row.Category?.trim().toLowerCase()];
      if (!categoryId) continue;
      earningRows.push({
        date: row.Date.trim(),
        categoryId,
        amount: Number(row.Amount),
        source: row.Source?.trim() || '',
        notes: row.Notes?.trim() || '',
        isRecurring: false,
        createdAt: new Date().toISOString(),
      });
    }
    if (earningRows.length > 0) await db.earnings.bulkAdd(earningRows);
    count = earningRows.length;

  } else if (type === 'emi') {
    const emiRows: any[] = [];
    for (const row of rows) {
      if (!row.Name?.trim() || !row['EMI Amount']) continue;
      emiRows.push({
        name: row.Name.trim(),
        lender: row.Lender?.trim() || '',
        totalAmount: Number(row['Total Amount']) || 0,
        emiAmount: Number(row['EMI Amount']) || 0,
        interestRate: Number(row['Interest Rate']) || 0,
        totalEmis: Number(row['Total EMIs']) || 0,
        emisPaid: Number(row['EMIs Paid']) || 0,
        startDate: row['Start Date']?.trim() || '',
        notes: row.Notes?.trim() || '',
        createdAt: new Date().toISOString(),
      });
    }
    if (emiRows.length > 0) await db.emiEntries.bulkAdd(emiRows);
    count = emiRows.length;
  }

  return count;
}

export async function resetDatabase() {
  const user = auth.currentUser;
  if (user) {
    localStorage.removeItem(`fintrack_init_${user.uid}`);
  }
  // Fire the Firestore clear — don't await it before reloading.
  // clearAllData can hang on slow networks; we reload regardless after 800ms.
  clearAllData().catch((err) => console.error('clearAllData error:', err));
  setTimeout(() => window.location.reload(), 800);
}
