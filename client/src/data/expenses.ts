const EXPENSES_KEY = 'mee_kiranam_expenses';

export function getExpenses() {
  const data = localStorage.getItem(EXPENSES_KEY);
  return data ? JSON.parse(data) : [];
}

export function addExpense(expense: any) {
  const current = getExpenses();
  const index = current.findIndex((e: any) => e.date === expense.date);

  if (index !== -1) {
    current[index] = expense; // update
  } else {
    current.push(expense); // add new
  }

  localStorage.setItem(EXPENSES_KEY, JSON.stringify(current));
}