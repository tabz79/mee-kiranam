import { useEffect, useState } from "react";
import { getPriceList, setPriceList } from "@/data/pricelist";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Item = {
  name: string;
  caseWholesale: number;
  caseRetail: number;
  caseSize: number;
  unitWholesale: number; // auto-calculated
  unitRetail: number;
};

export default function PriceListPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState({
    name: "",
    caseWholesale: "",
    caseRetail: "",
    caseSize: "",
    unitRetail: "",
  });

  useEffect(() => {
    const stored = getPriceList();
    setItems(stored || []);
  }, []);

  const handleChange = (index: number, field: keyof Item, value: string) => {
    const updated = [...items];
    if (["caseWholesale", "caseRetail", "caseSize", "unitRetail"].includes(field)) {
      updated[index][field] = parseFloat(value) || 0;
    } else {
      updated[index][field] = value;
    }

    // auto-calculate unitWholesale
    if (field === "caseWholesale" || field === "caseSize") {
      const { caseWholesale, caseSize } = updated[index];
      updated[index].unitWholesale =
        caseWholesale && caseSize ? parseFloat((caseWholesale / caseSize).toFixed(2)) : 0;
    }

    setItems(updated);
  };

  const handleAdd = () => {
    const { name, caseWholesale, caseRetail, caseSize, unitRetail } = newItem;
    if (!name.trim() || !caseSize) return;

    const entry: Item = {
      name: name.trim(),
      caseWholesale: parseFloat(caseWholesale) || 0,
      caseRetail: parseFloat(caseRetail) || 0,
      caseSize: parseInt(caseSize) || 1,
      unitWholesale:
        parseFloat(caseWholesale) && parseInt(caseSize)
          ? parseFloat((parseFloat(caseWholesale) / parseInt(caseSize)).toFixed(2))
          : 0,
      unitRetail: parseFloat(unitRetail) || 0,
    };

    setItems([...items, entry]);
    setNewItem({
      name: "",
      caseWholesale: "",
      caseRetail: "",
      caseSize: "",
      unitRetail: "",
    });
  };

  const handleDelete = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleSave = () => {
    setPriceList(items);
    alert("✅ price list saved");
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <Card>
        <CardHeader>
          <CardTitle>price list</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          {/* existing items */}
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-6 gap-2 items-center">
              <Input
                value={item.name}
                onChange={(e) => handleChange(index, "name", e.target.value)}
                placeholder="item"
              />
              <Input
                type="number"
                value={item.caseWholesale}
                onChange={(e) =>
                  handleChange(index, "caseWholesale", e.target.value)
                }
                placeholder="case wholesale"
              />
              <Input
                type="number"
                value={item.caseRetail}
                onChange={(e) =>
                  handleChange(index, "caseRetail", e.target.value)
                }
                placeholder="case retail"
              />
              <Input
                type="number"
                value={item.caseSize}
                onChange={(e) => handleChange(index, "caseSize", e.target.value)}
                placeholder="case size"
              />
              <Input
                type="number"
                value={item.unitRetail}
                onChange={(e) =>
                  handleChange(index, "unitRetail", e.target.value)
                }
                placeholder="unit retail"
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleDelete(index)}
              >
                delete
              </Button>
            </div>
          ))}

          {/* new item entry */}
          <div className="grid grid-cols-6 gap-2 items-center border-t pt-2">
            <Input
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="new item"
            />
            <Input
              type="number"
              value={newItem.caseWholesale}
              onChange={(e) =>
                setNewItem({ ...newItem, caseWholesale: e.target.value })
              }
              placeholder="case wholesale"
            />
            <Input
              type="number"
              value={newItem.caseRetail}
              onChange={(e) =>
                setNewItem({ ...newItem, caseRetail: e.target.value })
              }
              placeholder="case retail"
            />
            <Input
              type="number"
              value={newItem.caseSize}
              onChange={(e) =>
                setNewItem({ ...newItem, caseSize: e.target.value })
              }
              placeholder="case size"
            />
            <Input
              type="number"
              value={newItem.unitRetail}
              onChange={(e) =>
                setNewItem({ ...newItem, unitRetail: e.target.value })
              }
              placeholder="unit retail"
            />
            <Button onClick={handleAdd}>add</Button>
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            save price list
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
