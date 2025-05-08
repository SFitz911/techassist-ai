import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Plus, CheckCircle, Drill, DollarSign, Box, Search, ListFilter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { searchParts } from "@/lib/openai";

interface ItemSelectionProps {
  jobId: number;
  onClose: () => void;
}

interface Material {
  id: number;
  name: string;
  description: string;
  category: string;
  defaultPrice: number;
  unit: string;
}

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

export default function ItemSelection({ jobId, onClose }: ItemSelectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("labor");
  const [laborHours, setLaborHours] = useState(1);
  const [laborRate, setLaborRate] = useState(17000); // $170.00
  const [materialSearch, setMaterialSearch] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedStoreItem, setSelectedStoreItem] = useState<{ item: StoreItem, store: Store } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Store[] | null>(null);
  
  // Get materials
  const { data: materials, isLoading: isLoadingMaterials } = useQuery({
    queryKey: ['/api/materials'],
    retry: false,
  });
  
  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (data: {
      type: string;
      description: string;
      quantity: number;
      unitPrice: number;
      storeSource?: string;
      materialId?: number;
    }) => {
      const response = await apiRequest('POST', '/api/estimate-items', {
        jobId,
        ...data
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}/estimate-items`] });
      toast({
        title: "Item added",
        description: "The item has been added to the estimate."
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error adding item",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Format price from cents to dollars
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };
  
  // Handle labor add
  const handleAddLabor = () => {
    const laborTotal = laborHours * laborRate;
    
    addItemMutation.mutate({
      type: "labor",
      description: `Labor (${laborHours} ${laborHours === 1 ? 'hour' : 'hours'} x ${formatPrice(laborRate)}/hr)`,
      quantity: 1,
      unitPrice: laborTotal
    });
  };
  
  // Handle material add
  const handleAddMaterial = () => {
    if (selectedMaterial) {
      addItemMutation.mutate({
        type: "material",
        description: selectedMaterial.name,
        quantity: 1,
        unitPrice: selectedMaterial.defaultPrice,
        materialId: selectedMaterial.id
      });
    }
  };
  
  // Handle store item add
  const handleAddStoreItem = () => {
    if (selectedStoreItem) {
      addItemMutation.mutate({
        type: "material",
        description: selectedStoreItem.item.name,
        quantity: 1,
        unitPrice: selectedStoreItem.item.price,
        storeSource: selectedStoreItem.store.name
      });
    }
  };
  
  // Handle search
  const handleSearch = async () => {
    if (!materialSearch.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchParts(materialSearch);
      setSearchResults(results);
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to search for parts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <div>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="labor" className="flex gap-1 items-center">
            <Drill className="h-4 w-4" />
            <span>Labor</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex gap-1 items-center">
            <Box className="h-4 w-4" />
            <span>Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="store" className="flex gap-1 items-center">
            <DollarSign className="h-4 w-4" />
            <span>Store</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Labor Tab */}
        <TabsContent value="labor" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="laborHours">Hours</Label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setLaborHours(Math.max(0.5, laborHours - 0.5))}
              >
                -
              </Button>
              <Input
                id="laborHours"
                type="number"
                value={laborHours}
                onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
                min={0.5}
                step={0.5}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setLaborHours(laborHours + 0.5)}
              >
                +
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="laborRate">Hourly Rate</Label>
            <Input
              id="laborRate"
              type="text"
              value={formatPrice(laborRate)}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setLaborRate(parseInt(value) || 0);
              }}
            />
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between text-sm mb-2">
              <span>Total:</span>
              <span className="font-bold">{formatPrice(laborHours * laborRate)}</span>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleAddLabor}
              disabled={addItemMutation.isPending || laborHours <= 0 || laborRate <= 0}
            >
              {addItemMutation.isPending && selectedTab === "labor" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Labor
            </Button>
          </div>
        </TabsContent>
        
        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          {isLoadingMaterials ? (
            <div className="py-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
              <p>Loading materials...</p>
            </div>
          ) : materials && materials.length > 0 ? (
            <>
              <div className="space-y-1 mb-2">
                <Label>Select Material</Label>
                <RadioGroup value={selectedMaterial?.id?.toString() || ""} onValueChange={(value) => {
                  const material = materials.find((m: Material) => m.id === parseInt(value));
                  setSelectedMaterial(material || null);
                }}>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {materials.map((material: Material) => (
                      <div
                        key={material.id}
                        className={`flex items-center justify-between p-3 rounded-md border ${
                          selectedMaterial?.id === material.id ? 'border-primary bg-primary/10' : 'border-border'
                        } cursor-pointer`}
                        onClick={() => setSelectedMaterial(material)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={material.id.toString()} id={`material-${material.id}`} />
                          <div>
                            <Label htmlFor={`material-${material.id}`} className="cursor-pointer">
                              {material.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">{material.description}</p>
                          </div>
                        </div>
                        <span>{formatPrice(material.defaultPrice)}</span>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleAddMaterial}
                disabled={addItemMutation.isPending || !selectedMaterial}
              >
                {addItemMutation.isPending && selectedTab === "inventory" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Add Material
              </Button>
            </>
          ) : (
            <div className="py-8 text-center">
              <Box className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p>No materials found in inventory</p>
            </div>
          )}
        </TabsContent>
        
        {/* Store Tab */}
        <TabsContent value="store" className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search for parts..."
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleSearch}
              disabled={isSearching || !materialSearch.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {isSearching ? (
            <div className="py-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
              <p>Searching stores...</p>
            </div>
          ) : searchResults ? (
            <>
              <div className="space-y-1 mb-2">
                <div className="flex justify-between">
                  <Label>Results</Label>
                  <Button variant="ghost" size="sm" className="gap-1 h-6" onClick={() => setSearchResults(null)}>
                    <ListFilter className="h-3 w-3" />
                    <span className="text-xs">Clear</span>
                  </Button>
                </div>
                
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1 pt-1">
                  {searchResults.map((store) => (
                    <div key={store.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm">{store.name}</h4>
                        <span className="text-xs text-muted-foreground">{store.distance}</span>
                      </div>
                      
                      {store.parts.map((part) => (
                        <div
                          key={part.id}
                          className={`flex items-center justify-between p-3 rounded-md border ${
                            selectedStoreItem?.item.id === part.id && selectedStoreItem?.store.id === store.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border'
                          } cursor-pointer`}
                          onClick={() => setSelectedStoreItem({ item: part, store })}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value={`${store.id}-${part.id}`} 
                              id={`part-${store.id}-${part.id}`}
                              checked={
                                selectedStoreItem?.item.id === part.id && 
                                selectedStoreItem?.store.id === store.id
                              }
                            />
                            <div>
                              <Label htmlFor={`part-${store.id}-${part.id}`} className="cursor-pointer">
                                {part.name}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {part.inStock ? 'In Stock' : 'Out of Stock'}
                              </p>
                            </div>
                          </div>
                          <span>{formatPrice(part.price)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleAddStoreItem}
                disabled={
                  addItemMutation.isPending || 
                  !selectedStoreItem || 
                  !selectedStoreItem.item.inStock
                }
              >
                {addItemMutation.isPending && selectedTab === "store" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Add to Estimate
              </Button>
            </>
          ) : (
            <div className="py-8 text-center">
              <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p>Search for parts at local stores</p>
              <p className="text-sm text-muted-foreground mt-1">
                Enter a part name or description above
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
