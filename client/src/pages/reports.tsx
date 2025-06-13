import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3 } from "lucide-react";
import { formatCurrency, getDateRange, calculateMonthlyReport, getTopPerformingItems } from "@/lib/calculations";
import { Sales, Expenses, Restock, Price } from "@shared/schema";

type ReportPeriod = "30days" | "thisMonth" | "lastMonth";

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("30days");

  const getDateRangeForPeriod = (period: ReportPeriod) => {
    const now = new Date();
    let startDate: string;
    let endDate: string;

    switch (period) {
      case "30days":
        return getDateRange(30);
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        return { startDate, endDate };
      case "lastMonth":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        startDate = lastMonth.toISOString().split('T')[0];
        endDate = lastMonthEnd.toISOString().split('T')[0];
        return { startDate, endDate };
      default:
        return getDateRange(30);
    }
  };

  const { startDate, endDate } = getDateRangeForPeriod(selectedPeriod);

  const { data: sales = [] } = useQuery<Sales[]>({
    queryKey: ["/api/reports/sales", { startDate, endDate }],
    queryFn: () => fetch(`/api/reports/sales?startDate=${startDate}&endDate=${endDate}`).then(res => res.json()),
  });

  const { data: expenses = [] } = useQuery<Expenses[]>({
    queryKey: ["/api/reports/expenses", { startDate, endDate }],
    queryFn: () => fetch(`/api/reports/expenses?startDate=${startDate}&endDate=${endDate}`).then(res => res.json()),
  });

  const { data: restocks = [] } = useQuery<Restock[]>({
    queryKey: ["/api/reports/restocks", { startDate, endDate }],
    queryFn: () => fetch(`/api/reports/restocks?startDate=${startDate}&endDate=${endDate}`).then(res => res.json()),
  });

  const { data: prices = [] } = useQuery<Price[]>({
    queryKey: ["/api/prices"],
  });

  const monthlyReport = calculateMonthlyReport(sales, expenses, restocks);
  const topItems = getTopPerformingItems(restocks, prices);

  const periodLabels = {
    "30days": "Last 30 Days",
    "thisMonth": "This Month",
    "lastMonth": "Last Month"
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-xl">Monthly Reports & Analytics</CardTitle>
        </CardHeader>

        <CardContent>
          {/* Time Period Selector */}
          <div className="flex space-x-2 mb-6">
            {(Object.keys(periodLabels) as ReportPeriod[]).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                className="flex-1 rounded-full"
                onClick={() => setSelectedPeriod(period)}
              >
                {periodLabels[period]}
              </Button>
            ))}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-success/10 p-4 rounded-2xl">
              <p className="text-sm text-success font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(monthlyReport.totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">
                Margin: {monthlyReport.profitMargin.toFixed(1)}%
              </p>
            </div>

            <div className="bg-primary/10 p-4 rounded-2xl">
              <p className="text-sm text-primary font-medium">Net Profit</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(monthlyReport.netProfit)}</p>
              <p className="text-xs text-muted-foreground">After all costs</p>
            </div>

            <div className="bg-warning/10 p-4 rounded-2xl">
              <p className="text-sm text-warning font-medium">Total Costs</p>
              <p className="text-2xl font-bold text-warning">{formatCurrency(monthlyReport.totalCosts)}</p>
              <p className="text-xs text-muted-foreground">Inventory costs</p>
            </div>

            <div className="bg-error/10 p-4 rounded-2xl">
              <p className="text-sm text-error font-medium">Expenses</p>
              <p className="text-2xl font-bold text-error">{formatCurrency(monthlyReport.totalExpenses)}</p>
              <p className="text-xs text-muted-foreground">Operating costs</p>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-surface-variant p-6 rounded-2xl mb-6">
            <h3 className="font-semibold mb-4">Profit Trend ({periodLabels[selectedPeriod]})</h3>
            <div className="h-48 bg-card rounded-xl flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                <p>Chart visualization</p>
                <p className="text-sm">Shows daily profit trends</p>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-surface-variant p-6 rounded-2xl mb-6">
            <h3 className="font-semibold mb-4">Period Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Sales Days</p>
                <p className="font-medium">{sales.length} days</p>
              </div>
              <div>
                <p className="text-muted-foreground">Restock Days</p>
                <p className="font-medium">{new Set(restocks.map(r => r.date)).size} days</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Daily Revenue</p>
                <p className="font-medium">
                  {sales.length > 0 ? formatCurrency(monthlyReport.totalRevenue / sales.length) : formatCurrency(0)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Daily Profit</p>
                <p className="font-medium">
                  {sales.length > 0 ? formatCurrency(monthlyReport.netProfit / Math.max(sales.length, 1)) : formatCurrency(0)}
                </p>
              </div>
            </div>
          </div>

          {/* Top Performing Items */}
          {topItems.length > 0 && (
            <div className="bg-surface-variant p-6 rounded-2xl">
              <h3 className="font-semibold mb-4">Top Performing Items</h3>
              <div className="space-y-3">
                {topItems.slice(0, 5).map((item, index) => (
                  <div key={item.itemName} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-medium">{item.itemName}</span>
                    </div>
                    <span className="font-semibold text-success">{formatCurrency(item.profit)} profit</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
