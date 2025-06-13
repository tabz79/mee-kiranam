import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Calendar, Package } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, getTodayDate } from "@/lib/calculations";
import { useToast } from "@/hooks/use-toast";
import { Price, type Restock as RestockEntry } from "@shared/schema";

interface RestockItem {
  itemName: string;
  quantity: number;
  price: number;
  total: number;
}

export default function Restock() {
  const [restockDate, setRestockDate] = useState(getTodayDate());
  const [restockItems, setRestockItems] = useState<RestockItem[]>([
    { itemName: "", quantity: 0, price: 0, total: 0 }
  ]);
  const { toast } = useToast();

  const { data: prices = [] } = useQuery<Price[]>({
    queryKey: ["/api/prices"],
  });

  const { data: todayRestocks = [] } = useQuery<RestockEntry[]>({
    queryKey: ["/api/restocks", restockDate],
    queryFn: () => fetch(`/api/restocks/${restockDate}`).then(res => res.json()),
  });

  const createRestockMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/restocks/batch", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restocks"] });
      resetForm();
      toast({ title: "Success", description: "Restock entry saved successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to save restock entry", 
        variant: "destructive" 
      });
    }
  });

  const resetForm = () => {
    setRestockDate(getTodayDate());
    setRestockItems([{ itemName: "", quantity: 0, price: 0, total: 0 }]);
  };

  const updateItemPrice = (index: number, itemName: string) => {
    const priceInfo = prices.find(p => p.itemName === itemName);
    if (priceInfo) {
      const newItems = [...restockItems];
      newItems[index] = {
        ...newItems[index],
        itemName,
        price: priceInfo.wholesalePrice,
        total: priceInfo.wholesalePrice * newItems[index].quantity
      };
      setRestockItems(newItems);
    }
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...restockItems];
    newItems[index] = {
      ...newItems[index],
      quantity,
      total: newItems[index].price * quantity
    };
    setRestockItems(newItems);
  };

  const addRestockItem = () => {
    setRestockItems([...restockItems, { itemName: "", quantity: 0, price: 0, total: 0 }]);
  };

  const removeRestockItem = (index: number) => {
    if (restockItems.length > 1) {
      setRestockItems(restockItems.filter((_, i) => i !== index));
    }
  };

  const totalRestockCost = restockItems.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = restockItems.filter(item => 
      item.itemName && item.quantity > 0 && item.price > 0
    );

    if (validItems.length === 0) {
      toast({ 
        title: "Invalid input", 
        description: "Please add at least one valid item",
        variant: "destructive" 
      });
      return;
    }

    const restockData = validItems.map(item => ({
      date: restockDate,
      itemName: item.itemName,
      quantity: item.quantity,
      price: item.price,
      total: item.total
    }));

    createRestockMutation.mutate(restockData);
  };

  const totalTodayRestock = todayRestocks.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="p-4 space-y-6 pb-20">
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-xl">Restock Management</CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">Add New</TabsTrigger>
              <TabsTrigger value="view">View Entries</TabsTrigger>
            </TabsList>
            
            <TabsContent value="add" className="space-y-4 mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restock-date">Restock Date</Label>
              <Input
                id="restock-date"
                type="date"
                value={restockDate}
                onChange={(e) => setRestockDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              {restockItems.map((item, index) => (
                <div key={index} className="restock-item bg-surface-variant p-4 rounded-2xl">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Item Name</Label>
                      <select
                        value={item.itemName}
                        onChange={(e) => updateItemPrice(index, e.target.value)}
                        className="w-full p-3 border border-input rounded-2xl focus:border-primary focus:outline-none bg-background"
                        required
                      >
                        <option value="">Select item</option>
                        {prices.map((price) => (
                          <option key={price.itemName} value={price.itemName}>
                            {price.itemName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity || ""}
                        onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      <span>Wholesale: {formatCurrency(item.price)}</span>
                      <span className="ml-4">Total: {formatCurrency(item.total)}</span>
                    </div>
                    {restockItems.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeRestockItem(index)}
                        className="text-destructive"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              onClick={addRestockItem}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Item
            </Button>

            <div className="bg-success/10 p-4 rounded-2xl">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Restock Cost:</span>
                <span className="text-2xl font-bold text-success">
                  {formatCurrency(totalRestockCost)}
                </span>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={createRestockMutation.isPending}
            >
              {createRestockMutation.isPending ? "Saving..." : "Save Restock Entry"}
            </Button>
          </form>
            </TabsContent>

            <TabsContent value="view" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="view-date">Select Date</Label>
                <Input
                  id="view-date"
                  type="date"
                  value={restockDate}
                  onChange={(e) => setRestockDate(e.target.value)}
                />
              </div>

              {todayRestocks.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-primary-container p-4 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium">
                          {new Date(restockDate).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Cost</p>
                        <p className="text-xl font-bold text-primary">{formatCurrency(totalTodayRestock)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {todayRestocks.map((restock) => (
                      <div key={restock.id} className="bg-surface-variant p-4 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Package className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium">{restock.itemName}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {restock.quantity} × {formatCurrency(restock.price)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-warning">{formatCurrency(restock.total)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No restock entries for {new Date(restockDate).toLocaleDateString('en-IN')}</p>
                  <p className="text-sm">Switch to "Add New" tab to create entries</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
