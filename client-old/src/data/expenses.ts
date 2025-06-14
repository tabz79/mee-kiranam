const EXPENSES_KEY = "mee_kiranam_expenses";

export function getExpenses() {
  const data = localStorage.getItem(EXPENSES_KEY);
  return data ? JSON.parse(data) : [];
}

export function addExpense(entry: any) {
  const current = getExpenses();
  const index = current.findIndex((e: any) => e.date === entry.date);

  if (index !== -1) {
    current[index] = entry; // update existing
  } else {
    current.push(entry); // add new
  }

  localStorage.setItem(EXPENSES_KEY, JSON.stringify(current));
}