import { Price, Sales, Expenses, Restock } from "@shared/schema";

interface LocalStorageData {
  prices: Record<string, Price>;
  sales: Record<string, Sales>;
  expenses: Record<string, Expenses>;
  restocks: Record<string, Restock[]>;
  quickRestockSession: {
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    total: number;
  };
}

const STORAGE_KEY = 'meeKiranamData';

export class LocalStorageManager {
  private data: LocalStorageData;

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): LocalStorageData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }

    return {
      prices: {},
      sales: {},
      expenses: {},
      restocks: {},
      quickRestockSession: {
        items: [],
        total: 0
      }
    };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }

  // Price management
  getAllPrices(): Price[] {
    return Object.values(this.data.prices);
  }

  getPriceByItemName(itemName: string): Price | undefined {
    return this.data.prices[itemName];
  }

  savePrice(price: Price): void {
    this.data.prices[price.itemName] = price;
    this.saveToStorage();
  }

  deletePrice(itemName: string): void {
    delete this.data.prices[itemName];
    this.saveToStorage();
  }

  // Sales management
  getSalesByDate(date: string): Sales | undefined {
    return this.data.sales[date];
  }

  saveSales(sales: Sales): void {
    this.data.sales[sales.date] = sales;
    this.saveToStorage();
  }

  // Expenses management
  getExpensesByDate(date: string): Expenses | undefined {
    return this.data.expenses[date];
  }

  saveExpenses(expenses: Expenses): void {
    this.data.expenses[expenses.date] = expenses;
    this.saveToStorage();
  }

  // Restock management
  getRestocksByDate(date: string): Restock[] {
    return this.data.restocks[date] || [];
  }

  saveRestocks(date: string, restocks: Restock[]): void {
    this.data.restocks[date] = restocks;
    this.saveToStorage();
  }

  addRestock(restock: Restock): void {
    if (!this.data.restocks[restock.date]) {
      this.data.restocks[restock.date] = [];
    }
    this.data.restocks[restock.date].push(restock);
    this.saveToStorage();
  }

  // Quick restock session
  getQuickRestockSession() {
    return { ...this.data.quickRestockSession };
  }

  addQuickRestockItem(item: { name: string; quantity: number; price: number; total: number }): void {
    this.data.quickRestockSession.items.push(item);
    this.data.quickRestockSession.total += item.total;
    this.saveToStorage();
  }

  clearQuickRestockSession(): void {
    this.data.quickRestockSession = { items: [], total: 0 };
    this.saveToStorage();
  }

  // Reports
  getSalesInDateRange(startDate: string, endDate: string): Sales[] {
    return Object.entries(this.data.sales)
      .filter(([date]) => date >= startDate && date <= endDate)
      .map(([, sales]) => sales)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  getExpensesInDateRange(startDate: string, endDate: string): Expenses[] {
    return Object.entries(this.data.expenses)
      .filter(([date]) => date >= startDate && date <= endDate)
      .map(([, expenses]) => expenses)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  getRestocksInDateRange(startDate: string, endDate: string): Restock[] {
    const results: Restock[] = [];
    
    Object.entries(this.data.restocks)
      .filter(([date]) => date >= startDate && date <= endDate)
      .forEach(([, restocks]) => results.push(...restocks));
    
    return results.sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const localStorageManager = new LocalStorageManager();
