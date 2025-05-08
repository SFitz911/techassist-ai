import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PlusCircle, Plus, X, Send, Loader2, ShoppingCart, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ItemSelection from "@/components/invoicing/item-selection";

interface EstimateItem {
  id: number;
  jobId: number;
  type: string;
  description: string;
  quantity: number;
  unitPrice: number;
  storeSource?: string;
  materialId?: number;
}

interface Estimate {
  id: number;
  jobId: number;
  status: string;
  totalAmount: number;
  created: string;
  notes?: string;
}

export default function EstimatesTab({ jobId }: { jobId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  
  // Fetch estimate items for this job
  const { data: items, isLoading: isLoadingItems } = useQuery({
    queryKey: [`/api/jobs/${jobId}/estimate-items`],
    retry: false,
  });
  
  // Fetch existing estimate for this job
  const { data: estimate, isLoading: isLoadingEstimate } = useQuery({
    queryKey: [`/api/jobs/${jobId}/estimate`],
    retry: false,
    refetchOnWindowFocus: false,
  });
  
  // Create or update an estimate
  const submitEstimateMutation = useMutation({
    mutationFn: async (data: { totalAmount: number, status: string }) => {
      if (estimate) {
        // Update existing estimate status
        const response = await apiRequest('PATCH', `/api/estimates/${estimate.id}/status`, {
          status: data.status
        });
        return response.json();
      } else {
        // Create new estimate
        const response = await apiRequest('POST', '/api/estimates', {
          jobId,
          totalAmount: data.totalAmount,
          status: data.status
        });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}/estimate`] });
      setSubmitDialogOpen(false);
      toast({
        title: "Estimate submitted",
        description: "The estimate has been submitted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error submitting estimate",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Calculate total
  const calculateTotal = () => {
    if (!items || items.length === 0) return 0;
    
    return items.reduce((total: number, item: EstimateItem) => {
      return total + (item.unitPrice * item.quantity);
    }, 0);
  };
  
  // Format price from cents to dollars
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };
  
  // Handle submit estimate
  const handleSubmitEstimate = () => {
    const totalAmount = calculateTotal();
    submitEstimateMutation.mutate({ totalAmount, status: "submitted" });
  };
  
  const isLoading = isLoadingItems || isLoadingEstimate;
  const total = calculateTotal();
  
  if (isLoading) {
    return (
      <div className="p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Estimate</h2>
        
        <Card className="mb-4">
          <CardHeader>
            <div className="h-6 bg-muted animate-pulse rounded mb-2 w-1/3" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between py-2">
                  <div className="space-y-1">
                    <div className="h-4 bg-muted animate-pulse rounded w-32" />
                    <div className="h-3 bg-muted animate-pulse rounded w-24" />
                  </div>
                  <div className="h-4 bg-muted animate-pulse rounded w-16" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex justify-between w-full">
              <div className="font-semibold">Total</div>
              <div className="h-5 bg-muted animate-pulse rounded w-20" />
            </div>
          </CardFooter>
        </Card>
        
        <div className="h-9 bg-muted animate-pulse rounded w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Estimate</h2>
        <div className={`status-badge 
          ${!estimate ? 'status-scheduled' :
          estimate.status === 'draft' ? 'status-scheduled' :
          estimate.status === 'submitted' ? 'status-in-progress' :
          'status-completed'}`}>
          {estimate ? estimate.status : 'No Estimate'}
        </div>
      </div>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Grande Deluxe</CardTitle>
          <CardDescription>
            {items && items.length > 0 ? `${items.length} item(s)` : 'No items added'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items && items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item: EstimateItem) => (
                <div key={item.id} className="flex justify-between items-start py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium">{item.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.quantity} x {formatPrice(item.unitPrice)} each
                      {item.storeSource && <span className="ml-1">from {item.storeSource}</span>}
                    </div>
                  </div>
                  <div className="font-semibold">
                    {formatPrice(item.quantity * item.unitPrice)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="mb-1">No items in this estimate</p>
              <p className="text-sm text-muted-foreground">
                Add labor or materials to create an estimate
              </p>
            </div>
          )}
        </CardContent>
        {items && items.length > 0 && (
          <CardFooter>
            <div className="flex justify-between w-full text-lg">
              <div className="font-semibold">Total</div>
              <div className="font-bold">{formatPrice(total)}</div>
            </div>
          </CardFooter>
        )}
      </Card>
      
      <div className="flex flex-col gap-2">
        <Button onClick={() => setAddItemDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Item
        </Button>
        
        {items && items.length > 0 && (
          <Button 
            variant="outline"
            onClick={() => setSubmitDialogOpen(true)}
            disabled={
              estimate && 
              (estimate.status === 'submitted' || estimate.status === 'approved')
            }
          >
            <Send className="mr-2 h-4 w-4" />
            {estimate ? 'Update Estimate' : 'Submit Estimate'}
          </Button>
        )}
      </div>
      
      {/* Add Item Dialog */}
      <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Item to Estimate</DialogTitle>
          </DialogHeader>
          
          <ItemSelection 
            jobId={jobId} 
            onClose={() => setAddItemDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Submit Estimate Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit Estimate</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Subtotal</div>
                  <div>{formatPrice(total)}</div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-muted-foreground">Tax</div>
                  <div>{formatPrice(0)}</div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-2 border-t text-lg">
                  <div className="font-semibold">Total</div>
                  <div className="font-bold">{formatPrice(total)}</div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-4">
              <RadioGroup defaultValue="email">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email">Send via Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="text" />
                  <Label htmlFor="text">Send via Text</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSubmitDialogOpen(false)}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitEstimate}
              disabled={submitEstimateMutation.isPending}
            >
              {submitEstimateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Submit Estimate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
