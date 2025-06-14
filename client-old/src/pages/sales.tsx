import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, getTodayDate } from "@/lib/calculations";
import { useToast } from "@/hooks/use-toast";
import { Sales } from "@shared/schema";

export default function SalesPage() {
  const [salesDate, setSalesDate] = useState(getTodayDate());
  const [cashSales, setCashSales] = useState("");
  const [onlineSales, setOnlineSales] = useState("");
  const { toast } = useToast();

import { getSales, addSale } from "../data/sales"; // ⬅️ Add this to the top if not already

const { data: existingSales } = useQuery<Sales | null>({
  queryKey: ["sales", salesDate],
  queryFn: async () => {
    const allSales = getSales();
    const match = allSales.find((sale) => sale.date === salesDate);
    return match || null;
  },
});

  const createSalesMutation = useMutation({
  mutationFn: (data: any) => {
    addSale(data);
    return Promise.resolve();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["sales"] });
    resetForm();
    toast({ title: "Success", description: "Sales entry saved successfully" });
  },
  onError: () => {
    toast({ 
      title: "Error", 
      description: "Failed to save sales entry", 
      variant: "destructive" 
    });
  }
});

  useEffect(() => {
    if (existingSales) {
      setCashSales(existingSales.cashSales.toString());
      setOnlineSales(existingSales.onlineSales.toString());
    } else {
      setCashSales("");
      setOnlineSales("");
    }
  }, [existingSales]);

  const resetForm = () => {
    setCashSales("");
    setOnlineSales("");
  };

  const totalSales = (parseFloat(cashSales) || 0) + (parseFloat(onlineSales) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      date: salesDate,
      cashSales: parseFloat(cashSales) || 0,
      onlineSales: parseFloat(onlineSales) || 0
    };

    createSalesMutation.mutate(data);
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <Card className="elevation-1">
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

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cash-sales">Cash Sales (₹)</Label>
                <Input
                  id="cash-sales"
                  type="number"
                  step="0.01"
                  value={cashSales}
                  onChange={(e) => setCashSales(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="online-sales">Online Sales (₹)</Label>
                <Input
                  id="online-sales"
                  type="number"
                  step="0.01"
                  value={onlineSales}
                  onChange={(e) => setOnlineSales(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="bg-success/10 p-4 rounded-2xl">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Sales:</span>
                <span className="text-2xl font-bold text-success">
                  {formatCurrency(totalSales)}
                </span>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-success hover:bg-success/90" 
              size="lg"
              disabled={createSalesMutation.isPending}
            >
              {createSalesMutation.isPending ? "Saving..." : "Save Sales Entry"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
