import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPriceSchema, insertRestockSchema, insertSalesSchema, insertExpensesSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Price management routes
  app.get("/api/prices", async (req, res) => {
    try {
      const prices = await storage.getAllPrices();
      res.json(prices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch prices" });
    }
  });

  app.get("/api/prices/:itemName", async (req, res) => {
    try {
      const price = await storage.getPriceByItemName(req.params.itemName);
      if (!price) {
        return res.status(404).json({ message: "Price not found" });
      }
      res.json(price);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch price" });
    }
  });

  app.post("/api/prices", async (req, res) => {
    try {
      const validatedData = insertPriceSchema.parse(req.body);
      const price = await storage.createPrice(validatedData);
      res.status(201).json(price);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid price data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create price" });
    }
  });

  app.put("/api/prices/:itemName", async (req, res) => {
    try {
      const validatedData = insertPriceSchema.partial().parse(req.body);
      const price = await storage.updatePrice(req.params.itemName, validatedData);
      res.json(price);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid price data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update price" });
    }
  });

  app.delete("/api/prices/:itemName", async (req, res) => {
    try {
      await storage.deletePrice(req.params.itemName);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete price" });
    }
  });

  // Restock routes
  app.get("/api/restocks/:date", async (req, res) => {
    try {
      const restocks = await storage.getRestocksByDate(req.params.date);
      res.json(restocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restocks" });
    }
  });

  app.post("/api/restocks", async (req, res) => {
    try {
      const validatedData = insertRestockSchema.parse(req.body);
      const restock = await storage.createRestock(validatedData);
      res.status(201).json(restock);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid restock data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create restock" });
    }
  });

  app.post("/api/restocks/batch", async (req, res) => {
    try {
      const restocksArray = z.array(insertRestockSchema).parse(req.body);
      const restocks = await storage.createMultipleRestocks(restocksArray);
      res.status(201).json(restocks);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid restock data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create restocks" });
    }
  });

  // Sales routes
  app.get("/api/sales/:date", async (req, res) => {
    try {
      const sales = await storage.getSalesByDate(req.params.date);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const validatedData = insertSalesSchema.parse(req.body);
      const sales = await storage.createOrUpdateSales(validatedData);
      res.status(201).json(sales);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sales data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save sales" });
    }
  });

  // Expenses routes
  app.get("/api/expenses/:date", async (req, res) => {
    try {
      const expenses = await storage.getExpensesByDate(req.params.date);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const validatedData = insertExpensesSchema.parse(req.body);
      const expenses = await storage.createOrUpdateExpenses(validatedData);
      res.status(201).json(expenses);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid expenses data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save expenses" });
    }
  });

  // Reports routes
  app.get("/api/reports/sales", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const sales = await storage.getSalesInDateRange(startDate as string, endDate as string);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales report" });
    }
  });

  app.get("/api/reports/expenses", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const expenses = await storage.getExpensesInDateRange(startDate as string, endDate as string);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses report" });
    }
  });

  app.get("/api/reports/restocks", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const restocks = await storage.getRestocksInDateRange(startDate as string, endDate as string);
      res.json(restocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restocks report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
