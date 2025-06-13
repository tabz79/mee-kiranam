import { 
  prices, 
  restocks, 
  sales, 
  expenses,
  type Price, 
  type InsertPrice,
  type Restock,
  type InsertRestock,
  type Sales,
  type InsertSales,
  type Expenses,
  type InsertExpenses
} from "@shared/schema";

export interface IStorage {
  // Price management
  getAllPrices(): Promise<Price[]>;
  getPriceByItemName(itemName: string): Promise<Price | undefined>;
  createPrice(price: InsertPrice): Promise<Price>;
  updatePrice(itemName: string, price: Partial<InsertPrice>): Promise<Price>;
  deletePrice(itemName: string): Promise<void>;

  // Restock management
  getRestocksByDate(date: string): Promise<Restock[]>;
  createRestock(restock: InsertRestock): Promise<Restock>;
  createMultipleRestocks(restocks: InsertRestock[]): Promise<Restock[]>;

  // Sales management
  getSalesByDate(date: string): Promise<Sales | undefined>;
  createOrUpdateSales(sales: InsertSales): Promise<Sales>;

  // Expenses management
  getExpensesByDate(date: string): Promise<Expenses | undefined>;
  createOrUpdateExpenses(expenses: InsertExpenses): Promise<Expenses>;

  // Reports
  getSalesInDateRange(startDate: string, endDate: string): Promise<Sales[]>;
  getExpensesInDateRange(startDate: string, endDate: string): Promise<Expenses[]>;
  getRestocksInDateRange(startDate: string, endDate: string): Promise<Restock[]>;
}

export class MemStorage implements IStorage {
  private prices: Map<string, Price>;
  private restocks: Map<string, Restock[]>;
  private sales: Map<string, Sales>;
  private expenses: Map<string, Expenses>;
  private currentPriceId: number;
  private currentRestockId: number;
  private currentSalesId: number;
  private currentExpensesId: number;

  constructor() {
    this.prices = new Map();
    this.restocks = new Map();
    this.sales = new Map();
    this.expenses = new Map();
    this.currentPriceId = 1;
    this.currentRestockId = 1;
    this.currentSalesId = 1;
    this.currentExpensesId = 1;

    // Initialize with some default prices
    this.initializeDefaultPrices();
  }

  private initializeDefaultPrices() {
    const defaultPrices = [
      { itemName: 'Rice (1kg)', wholesalePrice: 45, retailPrice: 60 },
      { itemName: 'Eggs (Tray)', wholesalePrice: 180, retailPrice: 240 },
      { itemName: 'Milk (1L)', wholesalePrice: 55, retailPrice: 65 },
      { itemName: 'Sugar (1kg)', wholesalePrice: 40, retailPrice: 50 },
      { itemName: 'Tea (250g)', wholesalePrice: 120, retailPrice: 150 },
    ];

    defaultPrices.forEach(price => {
      const priceWithId: Price = { ...price, id: this.currentPriceId++ };
      this.prices.set(price.itemName, priceWithId);
    });
  }

  // Price management
  async getAllPrices(): Promise<Price[]> {
    return Array.from(this.prices.values());
  }

  async getPriceByItemName(itemName: string): Promise<Price | undefined> {
    return this.prices.get(itemName);
  }

  async createPrice(insertPrice: InsertPrice): Promise<Price> {
    const price: Price = { ...insertPrice, id: this.currentPriceId++ };
    this.prices.set(insertPrice.itemName, price);
    return price;
  }

  async updatePrice(itemName: string, updateData: Partial<InsertPrice>): Promise<Price> {
    const existingPrice = this.prices.get(itemName);
    if (!existingPrice) {
      throw new Error(`Price for item ${itemName} not found`);
    }
    
    const updatedPrice: Price = { ...existingPrice, ...updateData };
    this.prices.set(itemName, updatedPrice);
    return updatedPrice;
  }

  async deletePrice(itemName: string): Promise<void> {
    this.prices.delete(itemName);
  }

  // Restock management
  async getRestocksByDate(date: string): Promise<Restock[]> {
    return this.restocks.get(date) || [];
  }

  async createRestock(insertRestock: InsertRestock): Promise<Restock> {
    const restock: Restock = { ...insertRestock, id: this.currentRestockId++ };
    
    if (!this.restocks.has(insertRestock.date)) {
      this.restocks.set(insertRestock.date, []);
    }
    
    this.restocks.get(insertRestock.date)!.push(restock);
    return restock;
  }

  async createMultipleRestocks(insertRestocks: InsertRestock[]): Promise<Restock[]> {
    const results: Restock[] = [];
    
    for (const insertRestock of insertRestocks) {
      const restock = await this.createRestock(insertRestock);
      results.push(restock);
    }
    
    return results;
  }

  // Sales management
  async getSalesByDate(date: string): Promise<Sales | undefined> {
    return this.sales.get(date);
  }

  async createOrUpdateSales(insertSales: InsertSales): Promise<Sales> {
    const existingSales = this.sales.get(insertSales.date);
    
    if (existingSales) {
      const updatedSales: Sales = { ...existingSales, ...insertSales };
      this.sales.set(insertSales.date, updatedSales);
      return updatedSales;
    } else {
      const sales: Sales = { ...insertSales, id: this.currentSalesId++ };
      this.sales.set(insertSales.date, sales);
      return sales;
    }
  }

  // Expenses management
  async getExpensesByDate(date: string): Promise<Expenses | undefined> {
    return this.expenses.get(date);
  }

  async createOrUpdateExpenses(insertExpenses: InsertExpenses): Promise<Expenses> {
    const existingExpenses = this.expenses.get(insertExpenses.date);
    
    if (existingExpenses) {
      const updatedExpenses: Expenses = { ...existingExpenses, ...insertExpenses };
      this.expenses.set(insertExpenses.date, updatedExpenses);
      return updatedExpenses;
    } else {
      const expenses: Expenses = { ...insertExpenses, id: this.currentExpensesId++ };
      this.expenses.set(insertExpenses.date, expenses);
      return expenses;
    }
  }

  // Reports
  async getSalesInDateRange(startDate: string, endDate: string): Promise<Sales[]> {
    const result: Sales[] = [];
    
    for (const [date, sales] of this.sales.entries()) {
      if (date >= startDate && date <= endDate) {
        result.push(sales);
      }
    }
    
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  async getExpensesInDateRange(startDate: string, endDate: string): Promise<Expenses[]> {
    const result: Expenses[] = [];
    
    for (const [date, expenses] of this.expenses.entries()) {
      if (date >= startDate && date <= endDate) {
        result.push(expenses);
      }
    }
    
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  async getRestocksInDateRange(startDate: string, endDate: string): Promise<Restock[]> {
    const result: Restock[] = [];
    
    for (const [date, restocks] of this.restocks.entries()) {
      if (date >= startDate && date <= endDate) {
        result.push(...restocks);
      }
    }
    
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const storage = new MemStorage();
