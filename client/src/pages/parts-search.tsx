import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Search, 
  ShoppingBag, 
  MapPin, 
  Store, 
  ShoppingCart, 
  Check, 
  DollarSign,
  Loader2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import TopNavigation from '@/components/layout/top-navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PartsSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [jobId, setJobId] = useState<string>('');
  const [selectedParts, setSelectedParts] = useState<Map<number, any>>(new Map());
  const { toast } = useToast();

  // Get available jobs for the dropdown
  const { data: jobs } = useQuery({
    queryKey: ['/api/technicians/1/jobs'],  // Hardcoded technician ID for now
    queryFn: async () => apiRequest('/api/technicians/1/jobs'),
  });

  // Search for parts
  const { 
    data: searchResults, 
    refetch, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['/api/stores/search', searchQuery],
    queryFn: async () => {
      return apiRequest(`/api/stores/search?query=${encodeURIComponent(searchQuery)}`);
    },
    enabled: false,
    retry: false
  });

  // Format price as currency
  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };
  
  // Add a part to the estimate
  const addPartToEstimate = async (part: any, store: any) => {
    if (!jobId) {
      toast({
        title: 'No job selected',
        description: 'Please select a job to add parts to.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Create a new estimate item for this part
      const response = await apiRequest('/api/estimate-items', {
        method: 'POST',
        body: JSON.stringify({
          jobId: parseInt(jobId),
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
    if (searchQuery.trim()) {
      refetch();
    }
  };

  // Check if a part has been added to the estimate
  const isPartAdded = (partId: number) => {
    return selectedParts.has(partId) && selectedParts.get(partId).added;
  };

  return (
    <div className="flex flex-col min-h-screen overflow-auto">
      <TopNavigation />
      
      <div className="container py-6 flex-1">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Hardware Store Parts Search</h1>
            <p className="text-muted-foreground">
              Search for parts across all local hardware stores
            </p>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Options</CardTitle>
            <CardDescription>
              Find parts at local hardware stores and add them to a job estimate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="job-select" className="text-sm font-medium">
                  Select Job
                </label>
                <Select value={jobId} onValueChange={setJobId}>
                  <SelectTrigger id="job-select">
                    <SelectValue placeholder="Select a job..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs?.map((job: any) => (
                      <SelectItem key={job.id} value={job.id.toString()}>
                        WO #{job.workOrderNumber} - {job.description.substring(0, 30)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Search for parts (e.g., copper pipe, sink faucet)..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={!searchQuery.trim() || isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  Search
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-muted-foreground">Searching local hardware stores...</p>
            </div>
          )}
          
          {isError && (
            <Card className="border-destructive">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <p className="font-medium text-destructive mb-2">Error searching for parts</p>
                  <p className="text-muted-foreground">
                    There was a problem connecting to local hardware stores. Please try again later.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {!isLoading && !isError && searchResults && (
            searchResults.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <ShoppingBag className="h-8 w-8 mb-4 text-muted-foreground" />
                    <p className="font-medium mb-2">No parts found</p>
                    <p className="text-muted-foreground">
                      We couldn't find any parts matching "{searchQuery}" in local stores.
                      Try different search terms or check back later.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              searchResults.map((store: any) => (
                <Card key={store.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Store className="h-5 w-5" />
                          {store.name}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {store.distance ? `${store.distance} away` : store.address}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="space-y-3">
                      {store.parts.map((part: any) => {
                        const isAdded = isPartAdded(part.id);
                        return (
                          <div key={part.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                            <div className="flex items-start gap-3">
                              <div className="h-12 w-12 rounded-md bg-background flex items-center justify-center shrink-0">
                                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{part.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm font-medium text-primary">
                                    {formatPrice(part.price)}
                                  </span>
                                  <Badge variant={part.inStock ? "outline" : "secondary"}>
                                    {part.inStock ? "In Stock" : "Out of Stock"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant={isAdded ? "secondary" : "default"}
                              onClick={() => addPartToEstimate(part, store)}
                              disabled={isAdded || !part.inStock || !jobId}
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
              ))
            )
          )}
          
          {!searchResults && !isLoading && (
            <Card>
              <CardContent className="p-10">
                <div className="flex flex-col items-center text-center">
                  <Search className="h-12 w-12 mb-4 text-muted-foreground" />
                  <p className="font-medium text-lg mb-2">Search for Hardware Store Parts</p>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Enter a search term above to find parts at local hardware stores. 
                    You can add parts directly to a job's estimate.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}