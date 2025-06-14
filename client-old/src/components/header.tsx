import { Store } from "lucide-react";

export function Header() {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="bg-primary text-primary-foreground p-4 elevation-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-foreground rounded-full flex items-center justify-center">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Mee Kiranam</h1>
            <p className="text-sm opacity-90">Grocery Store Manager</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-90">{currentDate}</p>
          <p className="text-xs opacity-75">Offline Ready</p>
        </div>
      </div>
    </header>
  );
}
