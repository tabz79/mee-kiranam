import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, getTodayDate } from "@/lib/calculations";
import { useToast } from "@/hooks/use-toast";
import { Expenses } from "@shared/schema";

export default function ExpensesPage() {
  const [expensesDate, setExpensesDate] = useState(getTodayDate());
  const [rent, setRent] = useState("");
  const [electricity, setElectricity] = useState("");
  const [miscellaneous, setMiscellaneous] = useState("");
  const { toast } = useToast();

  const { data: existingExpenses } = useQuery<Expenses>({
    queryKey: ["/api/expenses", expensesDate],
    queryFn: async () => {
      const response = await fetch(`/api/expenses/${expensesDate}`);
      if (response.status === 404) return null;
      return response.json();
    },
  });

  const createExpensesMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      resetForm();
      toast({ title: "Success", description: "Expenses entry saved successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to save expenses entry", 
        variant: "destructive" 
      });
    }
  });

  useEffect(() => {
    if (existingExpenses) {
      setRent(existingExpenses.rent.toString());
      setElectricity(existingExpenses.electricity.toString());
      setMiscellaneous(existingExpenses.miscellaneous.toString());
    } else {
      setRent("");
      setElectricity("");
      setMiscellaneous("");
    }
  }, [existingExpenses]);

  const resetForm = () => {
    setRent("");
    setElectricity("");
    setMiscellaneous("");
  };

  const totalExpenses = (parseFloat(rent) || 0) + (parseFloat(electricity) || 0) + (parseFloat(miscellaneous) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      date: expensesDate,
      rent: parseFloat(rent) || 0,
      electricity: parseFloat(electricity) || 0,
      miscellaneous: parseFloat(miscellaneous) || 0
    };

    createExpensesMutation.mutate(data);
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <Card className="elevation-1">
        <CardHeader>
          <CardTitle className="text-xl">Daily Expenses Entry</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expenses-date">Expense Date</Label>
              <Input
                id="expenses-date"
                type="date"
                value={expensesDate}
                onChange={(e) => setExpensesDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rent-expense">Rent (₹)</Label>
                <Input
                  id="rent-expense"
                  type="number"
                  step="0.01"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="electricity-expense">Electricity (₹)</Label>
                <Input
                  id="electricity-expense"
                  type="number"
                  step="0.01"
                  value={electricity}
                  onChange={(e) => setElectricity(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="misc-expense">Miscellaneous (₹)</Label>
                <Input
                  id="misc-expense"
                  type="number"
                  step="0.01"
                  value={miscellaneous}
                  onChange={(e) => setMiscellaneous(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="bg-error/10 p-4 rounded-2xl">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Expenses:</span>
                <span className="text-2xl font-bold text-error">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-error hover:bg-error/90" 
              size="lg"
              disabled={createExpensesMutation.isPending}
            >
              {createExpensesMutation.isPending ? "Saving..." : "Save Expenses Entry"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
