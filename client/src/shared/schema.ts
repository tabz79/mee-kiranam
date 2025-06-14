import { pgTable, text, serial, integer, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const prices = pgTable("prices", {
  id: serial("id").primaryKey(),
  itemName: text("item_name").notNull().unique(),
  wholesalePrice: real("wholesale_price").notNull(),
  retailPrice: real("retail_price").notNull(),
});

export const restocks = pgTable("restocks", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  itemName: text("item_name").notNull(),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
  total: real("total").notNull(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  cashSales: real("cash_sales").notNull().default(0),
  onlineSales: real("online_sales").notNull().default(0),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  rent: real("rent").notNull().default(0),
  electricity: real("electricity").notNull().default(0),
  miscellaneous: real("miscellaneous").notNull().default(0),
});

export const insertPriceSchema = createInsertSchema(prices).omit({
  id: true,
});

export const insertRestockSchema = createInsertSchema(restocks).omit({
  id: true,
});

export const insertSalesSchema = createInsertSchema(sales).omit({
  id: true,
});

export const insertExpensesSchema = createInsertSchema(expenses).omit({
  id: true,
});

export type Price = typeof prices.$inferSelect;
export type InsertPrice = z.infer<typeof insertPriceSchema>;

export type Restock = typeof restocks.$inferSelect;
export type InsertRestock = z.infer<typeof insertRestockSchema>;

export type Sales = typeof sales.$inferSelect;
export type InsertSales = z.infer<typeof insertSalesSchema>;

export type Expenses = typeof expenses.$inferSelect;
export type InsertExpenses = z.infer<typeof insertExpensesSchema>;
