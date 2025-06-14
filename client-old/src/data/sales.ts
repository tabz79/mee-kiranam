// sales.ts — stores and retrieves sales using localStorage

const SALES_KEY = 'mee_kiranam_sales';

export function getSales() {
  const data = localStorage.getItem(SALES_KEY);
  return data ? JSON.parse(data) : [];
}

export function addSale(sale: any) {
  const current = getSales();
  current.push(sale);
  localStorage.setItem(SALES_KEY, JSON.stringify(current));
}
