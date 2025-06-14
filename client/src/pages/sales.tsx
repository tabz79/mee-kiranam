import { useState, useEffect } from "react";
import { getSales, addSale } from "../data/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Sales() {
  const [salesDate, setSalesDate] = useState("2025-06-14");
  const [cashSales, setCashSales] = useState("");
  const [onlineSales, setOnlineSales] = useState("");
useEffect(() => {
  const allSales = getSales();
  const match = allSales.find((sale: any) => sale.date === salesDate);

  if (match) {
    setCashSales(match.cashSales.toString());
    setOnlineSales(match.onlineSales.toString());
  } else {
    setCashSales("");
    setOnlineSales("");
  }
}, [salesDate]);

  const totalSales = (parseFloat(cashSales) || 0) + (parseFloat(onlineSales) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSale({
  date: salesDate,
  cashSales: parseFloat(cashSales) || 0,
  onlineSales: parseFloat(onlineSales) || 0,
});
alert("✅ Sales saved locally");
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Daily Sales Entry</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sales-date">Sales Date</Label>
              <Input
                id="sales-date"
                type="date"
                value={salesDate}
                onChange={(e) => setSalesDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cash-sales">Cash Sales (₹)</Label>
              <Input
                id="cash-sales"
                type="number"
                value={cashSales}
                onChange={(e) => setCashSales(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="online-sales">Online Sales (₹)</Label>
              <Input
                id="online-sales"
                type="number"
                value={onlineSales}
                onChange={(e) => setOnlineSales(e.target.value)}
              />
            </div>

            <div className="text-right font-bold">
              Total: ₹{totalSales.toFixed(2)}
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
              Save Sales Entry
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
