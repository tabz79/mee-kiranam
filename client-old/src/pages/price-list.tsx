import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Price } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, calculateProfitMargin } from "@/lib/calculations";
import { useToast } from "@/hooks/use-toast";

export default function PriceList() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Price | null>(null);
  const [formData, setFormData] = useState({
    itemName: "",
    wholesalePrice: "",
    retailPrice: ""
  });
  const { toast } = useToast();

  const { data: prices = [], isLoading } = useQuery<Price[]>({
    queryKey: ["/api/prices"],
  });

  const createPriceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/prices", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prices"] });
      resetForm();
      toast({ title: "Success", description: "Price added successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to add price", 
        variant: "destructive" 
      });
    }
  });

  const updatePriceMutation = useMutation({
    mutationFn: ({ itemName, data }: { itemName: string; data: any }) => 
      apiRequest("PUT", `/api/prices/${encodeURIComponent(itemName)}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prices"] });
      resetForm();
      toast({ title: "Success", description: "Price updated successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update price", 
        variant: "destructive" 
      });
    }
  });

  const deletePriceMutation = useMutation({
    mutationFn: (itemName: string) => 
      apiRequest("DELETE", `/api/prices/${encodeURIComponent(itemName)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prices"] });
      toast({ title: "Success", description: "Price deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to delete price", 
        variant: "destructive" 
      });
    }
  });

  const resetForm = () => {
    setFormData({ itemName: "", wholesalePrice: "", retailPrice: "" });
    setShowAddForm(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      itemName: formData.itemName.trim(),
      wholesalePrice: parseFloat(formData.wholesalePrice),
      retailPrice: parseFloat(formData.retailPrice)
    };

    if (!data.itemName || !data.wholesalePrice || !data.retailPrice) {
      toast({ 
        title: "Invalid input", 
        description: "Please fill all fields with valid values",
        variant: "destructive" 
      });
      return;
    }

    if (editingItem) {
      updatePriceMutation.mutate({ itemName: editingItem.itemName, data });
    } else {
      createPriceMutation.mutate(data);
    }
  };

  const handleEdit = (price: Price) => {
    setFormData({
      itemName: price.itemName,
      wholesalePrice: price.wholesalePrice.toString(),
      retailPrice: price.retailPrice.toString()
    });
    setEditingItem(price);
    setShowAddForm(true);
  };

  const handleDelete = (itemName: string) => {
    if (confirm(`Are you sure you want to delete ${itemName}?`)) {
      deletePriceMutation.mutate(itemName);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 pb-20">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      <Card className="elevation-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Price List Manager</CardTitle>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Add/Edit Price Form */}
          {showAddForm && (
            <div className="bg-primary-container p-4 rounded-2xl mb-6">
              <h3 className="font-semibold mb-4">
                {editingItem ? "Edit Item" : "Add New Item"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input
                    id="item-name"
                    value={formData.itemName}
                    onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                    placeholder="Enter item name"
                    disabled={!!editingItem}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wholesale-price">Wholesale Price (₹)</Label>
                    <Input
                      id="wholesale-price"
                      type="number"
                      step="0.01"
                      value={formData.wholesalePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, wholesalePrice: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="retail-price">Retail Price (₹)</Label>
                    <Input
                      id="retail-price"
                      type="number"
                      step="0.01"
                      value={formData.retailPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, retailPrice: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createPriceMutation.isPending || updatePriceMutation.isPending}
                  >
                    {editingItem ? "Update Item" : "Save Item"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Price List */}
          <div className="space-y-3">
            {prices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No items in price list</p>
                <p className="text-sm">Add your first item to get started</p>
              </div>
            ) : (
              prices.map((price) => {
                const profit = calculateProfitMargin(price.wholesalePrice, price.retailPrice);
                return (
                  <div key={price.itemName} className="flex items-center justify-between p-4 bg-surface-variant rounded-2xl">
                    <div>
                      <p className="font-medium">{price.itemName}</p>
                      <p className="text-sm text-muted-foreground">
                        Wholesale: {formatCurrency(price.wholesalePrice)} | Retail: {formatCurrency(price.retailPrice)}
                      </p>
                      <p className="text-xs text-success">
                        Profit: {formatCurrency(profit)} per unit
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleEdit(price)}
                        className="text-primary"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleDelete(price.itemName)}
                        className="text-destructive"
                        disabled={deletePriceMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
