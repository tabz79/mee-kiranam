import { 
  BarChart3, 
  ShoppingCart, 
  Receipt, 
  CreditCard, 
  Tag, 
  LayoutDashboard 
} from "lucide-react";
import { useLocation } from "wouter";

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  { path: "/", icon: <LayoutDashboard className="w-6 h-6" />, label: "Dashboard" },
  { path: "/prices", icon: <Tag className="w-6 h-6" />, label: "Prices" },
  { path: "/restock", icon: <ShoppingCart className="w-6 h-6" />, label: "Restock" },
  { path: "/sales", icon: <CreditCard className="w-6 h-6" />, label: "Sales" },
  { path: "/expenses", icon: <Receipt className="w-6 h-6" />, label: "Expenses" },
  { path: "/reports", icon: <BarChart3 className="w-6 h-6" />, label: "Reports" },
];

export function BottomNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => setLocation(item.path)}
            className={`flex-1 p-4 text-center flex flex-col items-center space-y-1 transition-colors ${
              location === item.path 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
