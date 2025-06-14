const SALES_KEY = 'mee_kiranam_sales';

export function getSales() {
  const data = localStorage.getItem(SALES_KEY);
  return data ? JSON.parse(data) : [];
}

export function addSale(sale: any) {
  const current = getSales();
  const index = current.findIndex((s: any) => s.date === sale.date);

  if (index !== -1) {
    current[index] = sale; // update existing
  } else {
    current.push(sale); // add new
  }

  localStorage.setItem(SALES_KEY, JSON.stringify(current));
}
