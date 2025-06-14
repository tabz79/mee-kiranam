const PRICE_LIST_KEY = "mee_kiranam_price_list";

export type PriceEntry = {
  name: string;
  caseWholesale: number;
  caseRetail: number;
  caseSize: number;
  unitWholesale: number;
  unitRetail: number;
};

export function getPriceList(): PriceEntry[] {
  const data = localStorage.getItem(PRICE_LIST_KEY);
  return data ? JSON.parse(data) : [];
}

export function setPriceList(data: PriceEntry[]) {
  localStorage.setItem(PRICE_LIST_KEY, JSON.stringify(data));
}

export function getPriceByName(name: string): PriceEntry | null {
  const list = getPriceList();
  return list.find((item) => item.name.toLowerCase() === name.toLowerCase()) || null;
}