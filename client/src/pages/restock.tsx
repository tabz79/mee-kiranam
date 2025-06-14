import { useState } from "react";
import { getPriceList, getPriceByName } from "@/data/pricelist";
import { addRestock } from "@/data/restock";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTodayDate } from "@/lib/calculations";

type Row = {
  item: string;
  numCases: number;
  numUnits: number;
};

export default function RestockPage() {
  const [date, setDate] = useState(getTodayDate());
  const [rows, setRows] = useState<Row[]>([{ item: "", numCases: 0, numUnits: 0 }]);
  const priceList = getPriceList();

  const handleRowChange = (index: number, field: keyof Row, value: string) => {
    const updated = [...rows];
    if (field === "item") {
      updated[index].item = value;
    } else {
      updated[index][field] = parseInt(value) || 0;
    }
    setRows(updated);
  };

  const addRow = () => {
    setRows((prev) => [...prev, { item: "", numCases: 0, numUnits: 0 }]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = { date, items: rows };
    addRestock(entry);
    alert("✅ restock entry saved");
    setRows([{ item: "", numCases: 0, numUnits: 0 }]);
  };

  let totalWholesale = 0;
  let totalRetail = 0;

  return (
    <div className="p-4 space-y-6 pb-20">
      <Card>
        <CardHeader>
          <CardTitle>Restock Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            {/* HEADER ROW */}
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground border-b pb-1">
              <div className="col-span-2">Item</div>
              <div>Cases</div>
              <div>Units</div>
              <div>Case W</div>
              <div>Case R</div>
              <div>Unit W</div>
              <div>Unit R</div>
              <div>Unit Profit</div>
              <div>Total W</div>
              <div>Row Profit</div>
              <div>Action</div>
            </div>

            {rows.map((row, index) => {
              const price = getPriceByName(row.item);
              const caseWholesale = price?.caseWholesale || 0;
              const caseRetail = price?.caseRetail || 0;
              const caseSize = price?.caseSize || 1;
              const unitWholesale = price?.unitWholesale || 0;
              const unitRetail = price?.unitRetail || 0;
              const unitProfit = unitRetail - unitWholesale;

              const totalRowWholesale =
                row.numCases * caseWholesale + row.numUnits * unitWholesale;
              const totalRowRetail =
                row.numCases * caseRetail + row.numUnits * unitRetail;
              const rowProfit = totalRowRetail - totalRowWholesale;

              totalWholesale += totalRowWholesale;
              totalRetail += totalRowRetail;

              return (
                <div key={index} className="grid grid-cols-12 gap-2 items-center text-xs">
                  <select
                    className="border p-1 rounded col-span-2"
                    value={row.item}
                    onChange={(e) =>
                      handleRowChange(index, "item", e.target.value)
                    }
                  >
                    <option value="">Select item</option>
                    {priceList.map((p, i) => (
                      <option key={i} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <Input
                    type="number"
                    value={row.numCases}
                    onChange={(e) =>
                      handleRowChange(index, "numCases", e.target.value)
                    }
                    placeholder="Cases"
                  />
                  <Input
                    type="number"
                    value={row.numUnits}
                    onChange={(e) =>
                      handleRowChange(index, "numUnits", e.target.value)
                    }
                    placeholder="Units"
                  />

                  <div>₹{caseWholesale}</div>
                  <div>₹{caseRetail}</div>
                  <div>₹{unitWholesale.toFixed(2)}</div>
                  <div>₹{unitRetail.toFixed(2)}</div>
                  <div className="text-green-700">₹{unitProfit.toFixed(2)}</div>
                  <div>₹{totalRowWholesale.toFixed(2)}</div>
                  <div className="font-bold text-green-600">₹{rowProfit.toFixed(2)}</div>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeRow(index)}
                  >
                    Delete
                  </Button>
                </div>
              );
            })}

            <Button type="button" onClick={addRow}>
              + Add Item
            </Button>

            <div className="pt-4 border-t space-y-1 text-sm">
              <div>Total Wholesale: ₹{totalWholesale.toFixed(2)}</div>
              <div>Total Retail: ₹{totalRetail.toFixed(2)}</div>
              <div className="font-bold text-green-700">
                Net Profit: ₹{(totalRetail - totalWholesale).toFixed(2)}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Save Restock Entry
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
