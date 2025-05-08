import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, ShoppingCart, Check } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PartSearchProps {
  initialQuery?: string;
  jobId: number;
  onPartSelect?: (part: any) => void;
}

export default function PartSearch({ initialQuery = '', jobId, onPartSelect }: PartSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedParts, setSelectedParts] = useState<Map<number, any>>(new Map());
  const { toast } = useToast();

  const {
    data: stores,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['/api/stores/search', searchQuery],
    queryFn: async () => {
      const response = await apiRequest(`/api/stores/search?query=${encodeURIComponent(searchQuery)}`);
      return response;
    },
    enabled: searchQuery.length > 2,
  });

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };
  
  // Add a part to the estimate
  const addPartToEstimate = async (part: any, store: any) => {
    try {
      // Create a new estimate item for this part
      const response = await apiRequest('/api/estimate-items', {
        method: 'POST',
        body: JSON.stringify({
          jobId,
          type: 'material',
          description: part.name,
          quantity: 1,
          unitPrice: part.price,
          storeSource: store.name
        })
      } as RequestInit);
      
      // Update UI to show item was added
      const partKey = part.id;
      setSelectedParts(new Map(selectedParts.set(partKey, {...part, added: true})));
      
      toast({
        title: 'Part added to estimate',
        description: `${part.name} has been added to the job estimate.`,
      });
      
      if (onPartSelect) {
        onPartSelect({...part, store: store.name});
      }
      
      return response;
    } catch (error) {
      toast({
        title: 'Error adding part',
        description: 'Failed to add part to the estimate. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  // Check if a part has been added to the estimate
  const isPartAdded = (partId: number) => {
    return selectedParts.has(partId) && selectedParts.get(partId).added;
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex space-x-2">
        <Input
          placeholder="Search for parts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={searchQuery.length < 3 || isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
          Search
        </Button>
      </form>

      {isError && (
        <div className="text-center p-4 border border-red-300 rounded-md bg-red-50 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          Error searching for parts. Please try again.
        </div>
      )}

      {isLoading && searchQuery.length > 2 && (
        <div className="text-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Searching hardware stores...</p>
        </div>
      )}

      {stores && stores.length === 0 && (
        <div className="text-center p-4 border rounded-md bg-muted/40">
          No parts found matching "{searchQuery}". Try a different search term.
        </div>
      )}

      <div className="space-y-6">
        {stores?.map((store: any) => (
          <Card key={store.id} className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex justify-between items-center">
                <span>{store.name}</span>
                <Badge variant="outline">{store.distance}</Badge>
              </CardTitle>
              <CardDescription>{store.address}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {store.parts?.map((part: any) => {
                  const isAdded = isPartAdded(part.id);
                  return (
                    <div
                      key={part.id}
                      className="p-4 flex justify-between items-center hover:bg-accent/20 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{part.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{part.description}</p>
                        <div className="mt-1 flex items-center">
                          <p className="font-bold text-primary">{formatPrice(part.price)}</p>
                          <Badge 
                            variant={part.inStock ? "default" : "outline"} 
                            className="ml-2"
                          >
                            {part.inStock ? 'In Stock' : 'Out of Stock'}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant={isAdded ? "secondary" : "default"}
                        onClick={() => addPartToEstimate(part, store)}
                        disabled={isAdded || !part.inStock}
                        className="ml-4"
                      >
                        {isAdded ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Added
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Estimate
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}