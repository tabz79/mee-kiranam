const RESTOCKS_KEY = "mee_kiranam_restocks";

export function getRestocks() {
  const data = localStorage.getItem(RESTOCKS_KEY);
  return data ? JSON.parse(data) : [];
}

export function addRestockBatch(entries: any[]) {
  const current = getRestocks();
  const filtered = current.filter((r: any) => r.date !== entries[0].date);
  const newData = [...filtered, ...entries];
  localStorage.setItem(RESTOCKS_KEY, JSON.stringify(newData));
}
