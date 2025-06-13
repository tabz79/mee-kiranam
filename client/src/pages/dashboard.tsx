import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  ShoppingCart, 
  Receipt, 
  Wallet,
  ShoppingBag,
  CreditCard,
  FileText,
  BarChart3
} from "lucide-react";
import { QuickRestockOverlay } from "@/components/quick-restock-overlay";
import { formatCurrency, calculateDailyTotals, getTodayDate } from "@/lib/calculations";
import { Sales, Expenses, Restock } from "@shared/schema";

export default function Dashboard() {
  const [isQuickRestockOpen, setIsQuickRestockOpen] = useState(false);
  const today = getTodayDate();

  const { data: todaySales } = useQuery<Sales>({
    queryKey: ["/api/sales", today],
    queryFn: async () => {
      const response = await fetch(`/api/sales/${today}`);
      if (response.status === 404) return null;
      return response.json();
    },
  });

  const { data: todayExpenses } = useQuery<Expenses>({
    queryKey: ["/api/expenses", today],
    queryFn: async () => {
      const response = await fetch(`/api/expenses/${today}`);
      if (response.status === 404) return null;
      return response.json();
    },
  });

  const { data: todayRestocks = [] } = useQuery<Restock[]>({
    queryKey: ["/api/restocks", today],
    queryFn: () => fetch(`/api/restocks/${today}`).then(res => res.json()),
  });

  const dailyTotals = calculateDailyTotals(todaySales, todayExpenses, todayRestocks);

  const quickActions = [
    {
      title: "Quick Restock",
      icon: <ShoppingBag className="w-6 h-6" />,
      action: () => setIsQuickRestockOpen(true),
      bgColor: "bg-primary-container",
      textColor: "text-primary",
    },
    {
      title: "Record Sales",
      icon: <CreditCard className="w-6 h-6" />,
      action: () => window.location.href = "/sales",
      bgColor: "bg-secondary-container",
      textColor: "text-secondary",
    },
    {
      title: "Add Expenses",
      icon: <FileText className="w-6 h-6" />,
      action: () => window.location.href = "/expenses",
      bgColor: "bg-tertiary-container",
      textColor: "text-tertiary",
    },
    {
      title: "View Reports",
      icon: <BarChart3 className="w-6 h-6" />,
      action: () => window.location.href = "/reports",
      bgColor: "bg-surface-variant",
      textColor: "text-on-surface-variant",
    },
  ];

  const recentActivities = [
    ...(todaySales ? [{
      icon: <TrendingUp className="w-5 h-5 text-success" />,
      title: "Sales Entry",
      description: `Cash: ${formatCurrency(todaySales.cashSales)}, Online: ${formatCurrency(todaySales.onlineSales)}`,
      time: "Today",
      bgColor: "bg-success/10"
    }] : []),
    ...(todayRestocks.length > 0 ? [{
      icon: <ShoppingCart className="w-5 h-5 text-warning" />,
      title: "Restock Entry",
      description: `${todayRestocks.length} items added`,
      time: "Today",
      bgColor: "bg-warning/10"
    }] : [])
  ];

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Today's Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="elevation-1">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-muted-foreground">Today's Sales</span>
            </div>
            <p className="text-2xl font-bold text-success">{formatCurrency(dailyTotals.totalSales)}</p>
            <p className="text-xs text-muted-foreground mt-1">Cash + Online</p>
          </CardContent>
        </Card>

        <Card className="elevation-1">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ShoppingCart className="w-5 h-5 text-warning" />
              <span className="text-sm font-medium text-muted-foreground">Restock Cost</span>
            </div>
            <p className="text-2xl font-bold text-warning">{formatCurrency(dailyTotals.totalRestock)}</p>
            <p className="text-xs text-muted-foreground mt-1">Today's Purchase</p>
          </CardContent>
        </Card>

        <Card className="elevation-1">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Receipt className="w-5 h-5 text-error" />
              <span className="text-sm font-medium text-muted-foreground">Expenses</span>
            </div>
            <p className="text-2xl font-bold text-error">{formatCurrency(dailyTotals.totalExpenses)}</p>
            <p className="text-xs text-muted-foreground mt-1">Rent + Utilities</p>
          </CardContent>
        </Card>

        <Card className="elevation-1">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Wallet className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Net Profit</span>
            </div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(dailyTotals.netProfit)}</p>
            <p className="text-xs text-muted-foreground mt-1">After all costs</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`${action.bgColor} ${action.textColor} p-4 h-auto flex flex-col items-center space-y-2 hover:shadow-elevation-2 transition-shadow rounded-2xl`}
                onClick={action.action}
              >
                {action.icon}
                <span className="text-sm font-medium">{action.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentActivities.length > 0 && (
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className={`flex items-center justify-between p-3 ${activity.bgColor} rounded-xl`}>
                <div className="flex items-center space-x-3">
                  {activity.icon}
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <QuickRestockOverlay 
        isOpen={isQuickRestockOpen} 
        onClose={() => setIsQuickRestockOpen(false)} 
      />
    </div>
  );
}
