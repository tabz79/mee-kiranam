import { useState, useEffect } from "react";
import { X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { localStorageManager } from "@/lib/storage";
import { formatCurrency, calculateItemProfit, getTodayDate } from "@/lib/calculations";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface QuickRestockOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

type RestockStep = "item" | "quantity" | "confirm";

export function QuickRestockOverlay({ isOpen, onClose }: QuickRestockOverlayProps) {
  const [step, setStep] = useState<RestockStep>("item");
  const [currentStep, setCurrentStep] = useState(1);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [session, setSession] = useState({ items: [], total: 0 });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      resetToFirstStep();
      setSession(localStorageManager.getQuickRestockSession());
    }
  }, [isOpen]);

  const resetToFirstStep = () => {
    setStep("item");
    setCurrentStep(localStorageManager.getQuickRestockSession().items.length + 1);
    setItemName("");
    setQuantity("");
  };

  const handleNext = async () => {
    if (step === "item") {
      if (!itemName.trim()) return;
      setStep("quantity");
    } else if (step === "quantity") {
      const qty = parseInt(quantity);
      if (!qty || qty <= 0) return;
      setStep("confirm");
    } else if (step === "confirm") {
      await addItemToSession();
    }
  };

  const addItemToSession = async () => {
    const priceInfo = localStorageManager.getPriceByItemName(itemName);
    if (!priceInfo) {
      toast({
        title: "Price not found",
        description: `No price information found for ${itemName}. Please add it to the price list first.`,
        variant: "destructive",
      });
      return;
    }

    const qty = parseInt(quantity);
    const total = priceInfo.wholesalePrice * qty;

    localStorageManager.addQuickRestockItem({
      name: itemName,
      quantity: qty,
      price: priceInfo.wholesalePrice,
      total
    });

    setSession(localStorageManager.getQuickRestockSession());
    resetToFirstStep();
    
    toast({
      title: "Item added",
      description: `${qty} ${itemName} added to restock session`,
    });
  };

  const handleSaveSession = async () => {
    const sessionData = localStorageManager.getQuickRestockSession();
    if (sessionData.items.length === 0) {
      toast({
        title: "No items to save",
        description: "Add items to the session before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      const today = getTodayDate();
      const restocks = sessionData.items.map(item => ({
        date: today,
        itemName: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      }));

      await apiRequest("POST", "/api/restocks/batch", restocks);
      await queryClient.invalidateQueries({ queryKey: ["/api/restocks"] });

      localStorageManager.clearQuickRestockSession();
      setSession({ items: [], total: 0 });
      onClose();

      toast({
        title: "Restock saved",
        description: `${restocks.length} items saved successfully`,
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save restock session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    if (session.items.length > 0) {
      if (confirm("Save this restock session before closing?")) {
        handleSaveSession();
      } else {
        localStorageManager.clearQuickRestockSession();
        onClose();
      }
    } else {
      onClose();
    }
  };

  const getPriceDisplay = () => {
    const priceInfo = localStorageManager.getPriceByItemName(itemName);
    if (!priceInfo || !quantity) return null;

    const qty = parseInt(quantity);
    const profit = calculateItemProfit(priceInfo.wholesalePrice, priceInfo.retailPrice, qty);

    return (
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-muted-foreground">Wholesale</p>
          <p className="text-xl font-bold text-warning">{formatCurrency(priceInfo.wholesalePrice)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Retail</p>
          <p className="text-xl font-bold text-success">{formatCurrency(priceInfo.retailPrice)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Profit</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(profit)}</p>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="quick-restock-overlay active">
      <div className="p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Quick Restock</h2>
            <p className="text-sm text-muted-foreground">Sequential entry mode</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Current Entry */}
        <div className="flex-1 flex flex-col justify-center">
          <Card className="mx-4 elevation-2">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <span className="text-6xl font-bold text-primary">{currentStep}</span>
                <p className="text-lg text-muted-foreground mt-2">
                  {step === "item" && "Enter item name"}
                  {step === "quantity" && `Enter quantity for ${itemName}`}
                  {step === "confirm" && "Confirm details"}
                </p>
              </div>

              <div className="space-y-6">
                {step === "item" && (
                  <div className="space-y-2">
                    <Label htmlFor="item-name">Item Name</Label>
                    <Input
                      id="item-name"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="Enter item name"
                      className="text-xl p-6 rounded-3xl"
                      onKeyPress={(e) => e.key === "Enter" && handleNext()}
                      autoFocus
                    />
                  </div>
                )}

                {step === "quantity" && (
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Enter quantity"
                      className="text-xl p-6 rounded-3xl"
                      onKeyPress={(e) => e.key === "Enter" && handleNext()}
                      autoFocus
                    />
                  </div>
                )}

                {step === "confirm" && (
                  <div className="bg-primary-container p-6 rounded-3xl">
                    {getPriceDisplay()}
                  </div>
                )}
              </div>

              <Button 
                onClick={handleNext} 
                className="w-full py-4 rounded-3xl font-semibold text-lg mt-8"
                size="lg"
              >
                {step === "confirm" ? "Add & Continue" : "Next"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Session Summary */}
        <div className="mt-6 px-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Session Total</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(session.total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">{session.items.length} items added</div>
                {session.items.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSaveSession}
                    className="ml-2"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Save Session
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
