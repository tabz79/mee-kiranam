const RESTOCK_KEY = "mee_kiranam_restocks";

export function getRestocks() {
  const data = localStorage.getItem(RESTOCK_KEY);
  return data ? JSON.parse(data) : [];
}

export function addRestock(entry: any) {
  const current = getRestocks();
  current.push(entry);
  localStorage.setItem(RESTOCK_KEY, JSON.stringify(current));
}