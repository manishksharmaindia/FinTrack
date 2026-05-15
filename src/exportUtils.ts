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

export async function importCSV(file: File, type: 'expense' | 'earning'): Promise<number> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          let count = 0;
          if (type === 'expense') {
            const cats = await db.expenseCategories.toArray();
            const catNameMap = Object.fromEntries(cats.map((c) => [c.name.toLowerCase(), c.id]));
            for (const row of results.data as any[]) {
              if (!row.Date || !row.Amount) continue;
              const categoryId = catNameMap[row.Category?.toLowerCase()] || cats[0]?.id;
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
            const cats = await db.earningCategories.toArray();
            const catNameMap = Object.fromEntries(cats.map((c) => [c.name.toLowerCase(), c.id]));
            for (const row of results.data as any[]) {
              if (!row.Date || !row.Amount) continue;
              const categoryId = catNameMap[row.Category?.toLowerCase()] || cats[0]?.id;
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
    await db.transaction('rw', [db.expenses, db.earnings, db.expenseCategories, db.earningCategories, db.budgets, db.userProfiles], async () => {
      await db.expenses.clear();
      await db.earnings.clear();
      await db.expenseCategories.clear();
      await db.earningCategories.clear();
      await db.budgets.clear();
      await db.userProfiles.clear();
    });
    window.location.reload();
  } catch (error) {
    console.error('Reset failed:', error);
    alert('Failed to reset data. Please close other app tabs and try again.');
  }
}
