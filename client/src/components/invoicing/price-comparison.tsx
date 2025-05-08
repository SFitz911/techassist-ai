import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronLeft, ShoppingCart, ExternalLink, Loader2, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StoreItem {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  image: string;
}

interface Store {
  id: number;
  name: string;
  distance: string;
  address: string;
  parts: StoreItem[];
}

interface PriceComparisonProps {
  stores: Store[];
  onBack: () => void;
  jobId: number;
}

export default function PriceComparison({ stores, onBack, jobId }: PriceComparisonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  
  // Filter only available parts
  const availableParts = stores
    .map(store => ({
      store,
      part: store.parts[0] // Just get the first part for each store
    }))
    .filter(({ part }) => part.inStock);
  
  // Sort by price
  const sortedParts = [...availableParts].sort((a, b) => a.part.price - b.part.price);
  
  // Check if there are any parts available
  if (sortedParts.length === 0) {
    return (
      <div className="mt-4">
        <Card>
          <CardContent className="pt-6 pb-4 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No Parts Available</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We couldn't find any parts in stock at local stores.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={onBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Analysis
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (data: { storeId: number }) => {
      const store = stores.find(s => s.id === data.storeId);
      if (!store) throw new Error("Store not found");
      
      const part = store.parts[0];
      
      const response = await apiRequest('POST', '/api/estimate-items', {
        jobId,
        type: "material",
        description: part.name,
        quantity: 1,
        unitPrice: part.price,
        storeSource: store.name
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}/estimate-items`] });
      toast({
        title: "Part added",
        description: "The part has been added to your estimate.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding part",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle add to estimate
  const handleAddToEstimate = (storeId: number) => {
    setSelectedStore(storeId);
    addItemMutation.mutate({ storeId });
  };
  
  // Format price from cents to dollars
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Price Comparison</h3>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      </div>
      
      <div className="space-y-3">
        {sortedParts.map(({ store, part }) => (
          <Card key={store.id} className={selectedStore === store.id ? "border-primary" : ""}>
            <CardHeader className="py-3">
              <div className="flex justify-between">
                <CardTitle className="text-base font-medium">{store.name}</CardTitle>
                <span className="text-xs text-muted-foreground">{store.distance}</span>
              </div>
            </CardHeader>
            <CardContent className="py-2">
              <div className="flex justify-between mb-1">
                <div>
                  <p className="font-medium">{part.name}</p>
                  <p className="text-xs text-muted-foreground">{store.address}</p>
                </div>
                <div className="font-bold">{formatPrice(part.price)}</div>
              </div>
              
              {sortedParts[0].part.price === part.price && (
                <div className="flex items-center mt-1">
                  <div className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Best Price
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="py-3">
              <div className="w-full flex justify-between gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => window.open(`https://maps.google.com/?q=${store.address}`, '_blank')}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Map
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleAddToEstimate(store.id)}
                  disabled={addItemMutation.isPending}
                >
                  {addItemMutation.isPending && selectedStore === store.id ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5 mr-1" />
                  )}
                  Add
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
