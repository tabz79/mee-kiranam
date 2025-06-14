import { Switch, Route } from "wouter";
import Sales from "@/pages/sales";
import RestockPage from "@/pages/restock"; // ✅ rename this line
import PriceListPage from "@/pages/price-list";

function DummyPage({ label }: { label: string }) {
  return (
    <div className="p-6 text-blue-700 text-xl">
      {label} Page Loaded ✅
    </div>
  );
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={() => <DummyPage label="Dashboard" />} />
      <Route path="/sales" component={Sales} />
      <Route path="/restock" component={RestockPage} /> {/* ✅ updated to RestockPage */}
      <Route path="/price-list" component={PriceListPage} />
      <Route component={() => <DummyPage label="404 Not Found" />} />
    </Switch>
  );
}
