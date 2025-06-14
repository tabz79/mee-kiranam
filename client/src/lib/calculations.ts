import { Sales, Expenses, Restock, Price } from "@/shared/schema";

export interface DailyTotals {
  totalSales: number;
  totalExpenses: number;
  totalRestock: number;
  netProfit: number;
}

export function calculateDailyTotals(
  sales: Sales | undefined,
  expenses: Expenses | undefined,
  restocks: Restock[]
): DailyTotals {
  const totalSales = sales ? sales.cashSales + sales.onlineSales : 0;
  const totalExpenses = expenses ? expenses.rent + expenses.electricity + expenses.miscellaneous : 0;
  const totalRestock = restocks.reduce((sum, restock) => sum + restock.total, 0);
  const netProfit = totalSales - totalRestock - totalExpenses;

  return {
    totalSales,
    totalExpenses,
    totalRestock,
    netProfit
  };
}

export function calculateProfitMargin(wholesalePrice: number, retailPrice: number): number {
  return retailPrice - wholesalePrice;
}

export function calculateItemProfit(
  wholesalePrice: number,
  retailPrice: number,
  quantity: number
): number {
  return (retailPrice - wholesalePrice) * quantity;
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDateRange(days: number): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

export interface MonthlyReport {
  totalRevenue: number;
  totalCosts: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

export function calculateMonthlyReport(
  sales: Sales[],
  expenses: Expenses[],
  restocks: Restock[]
): MonthlyReport {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.cashSales + sale.onlineSales, 0);
  const totalCosts = restocks.reduce((sum, restock) => sum + restock.total, 0);
  const totalExpenses = expenses.reduce((sum, expense) => 
    sum + expense.rent + expense.electricity + expense.miscellaneous, 0);
  
  const netProfit = totalRevenue - totalCosts - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalCosts,
    totalExpenses,
    netProfit,
    profitMargin
  };
}

export function getTopPerformingItems(
  restocks: Restock[],
  prices: Price[]
): Array<{ itemName: string; profit: number }> {
  const priceMap = new Map(prices.map(price => [price.itemName, price]));
  const itemProfits = new Map<string, number>();

  restocks.forEach(restock => {
    const priceInfo = priceMap.get(restock.itemName);
    if (priceInfo) {
      const profit = calculateItemProfit(priceInfo.wholesalePrice, priceInfo.retailPrice, restock.quantity);
      itemProfits.set(restock.itemName, (itemProfits.get(restock.itemName) || 0) + profit);
    }
  });

  return Array.from(itemProfits.entries())
    .map(([itemName, profit]) => ({ itemName, profit }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 10);
}
