import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Printer, 
  Mail, 
  Download, 
  FileText, 
  Check, 
  Clock, 
  DollarSign, 
  Loader2, 
  CreditCard,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  ShoppingCart
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableFooter, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface InvoiceTabProps {
  jobId: number;
}

export default function InvoiceTab({ jobId }: InvoiceTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [emailAddress, setEmailAddress] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [itemDescription, setItemDescription] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemUnitPrice, setItemUnitPrice] = useState(0);
  const [isNewItem, setIsNewItem] = useState(false);
  
  // Fetch job details
  const { data: job } = useQuery({
    queryKey: [`/api/jobs/${jobId}`],
    queryFn: async () => {
      return apiRequest(`/api/jobs/${jobId}`);
    },
  });
  
  // Fetch customer details
  const { data: customer } = useQuery({
    queryKey: [`/api/customers/${job?.customerId}`],
    queryFn: async () => {
      return apiRequest(`/api/customers/${job?.customerId}`);
    },
    enabled: !!job?.customerId,
  });
  
  // Fetch estimate items
  const { data: estimateItems, isLoading: itemsLoading } = useQuery({
    queryKey: [`/api/jobs/${jobId}/estimate-items`],
    queryFn: async () => {
      return apiRequest(`/api/jobs/${jobId}/estimate-items`);
    },
  });
  
  // Fetch estimate
  const { data: estimate } = useQuery({
    queryKey: [`/api/jobs/${jobId}/estimate`],
    queryFn: async () => {
      return apiRequest(`/api/jobs/${jobId}/estimate`);
    },
  });
  
  // Add new item mutation
  const addItemMutation = useMutation({
    mutationFn: async (newItem: any) => {
      return apiRequest('/api/estimate-items', {
        method: 'POST',
        body: JSON.stringify(newItem)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}/estimate-items`] });
      toast({
        title: 'Item Added',
        description: 'The item has been added to the invoice.',
      });
      setEditDialogOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add item. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, updateData }: { itemId: number, updateData: any }) => {
      return apiRequest(`/api/estimate-items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}/estimate-items`] });
      toast({
        title: 'Item Updated',
        description: 'The item has been updated.',
      });
      setEditDialogOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update item. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return apiRequest(`/api/estimate-items/${itemId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}/estimate-items`] });
      toast({
        title: 'Item Removed',
        description: 'The item has been removed from the invoice.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to remove item. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Calculate totals
  const subtotal = estimateItems?.reduce((acc: number, item: any) => {
    return acc + (item.quantity * item.unitPrice);
  }, 0) || 0;
  
  const taxRate = 0.0825; // 8.25% for Texas
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };
  
  // Handle email invoice
  const handleEmailInvoice = async () => {
    if (!emailAddress) return;
    
    try {
      // In a real app, this would call an API endpoint to send the email
      toast({
        title: "Invoice Sent",
        description: `Invoice has been emailed to ${emailAddress}`,
      });
      setEmailDialogOpen(false);
    } catch (error) {
      toast({
        title: "Failed to Send Email",
        description: "Please try again or use print option",
        variant: "destructive"
      });
    }
  };
  
  // Handle print invoice
  const handlePrintInvoice = () => {
    // In a real app, this would open a print dialog or send to a Wi-Fi printer
    // For this demo, we'll just use the browser print functionality
    window.print();
  };
  
  // Handle invoice download
  const handleDownloadInvoice = () => {
    // In a real app, this would generate a PDF and trigger download
    toast({
      title: "Invoice Downloaded",
      description: "Invoice has been saved as PDF",
    });
  };
  
  // Handle payment processing
  const handleProcessPayment = () => {
    setProcessingPayment(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessingPayment(false);
      setPaymentComplete(true);
      
      toast({
        title: "Payment Successful",
        description: `Payment of ${formatCurrency(total)} has been processed`,
      });
      
      // In a real app, update the invoice status in the backend
      setTimeout(() => {
        setPaymentDialogOpen(false);
        setPaymentComplete(false);
      }, 2000);
    }, 2500);
  };

  // Handle editing an item
  const handleEditItem = (item: any) => {
    setCurrentItem(item);
    setItemDescription(item.description);
    setItemQuantity(item.quantity);
    setItemUnitPrice(item.unitPrice);
    setIsNewItem(false);
    setEditDialogOpen(true);
  };
  
  // Handle adding a new item
  const handleAddItem = () => {
    setCurrentItem(null);
    setItemDescription('');
    setItemQuantity(1);
    setItemUnitPrice(0);
    setIsNewItem(true);
    setEditDialogOpen(true);
  };
  
  // Handle deleting an item
  const handleDeleteItem = (itemId: number) => {
    if (confirm('Are you sure you want to remove this item?')) {
      deleteItemMutation.mutate(itemId);
    }
  };
  
  // Handle saving item changes
  const handleSaveItem = () => {
    if (!itemDescription || itemQuantity <= 0 || itemUnitPrice <= 0) {
      toast({
        title: 'Invalid Item',
        description: 'Please provide a description, quantity, and price.',
        variant: 'destructive',
      });
      return;
    }
    
    if (isNewItem) {
      // Add new item
      addItemMutation.mutate({
        jobId,
        type: 'material',
        description: itemDescription,
        quantity: itemQuantity,
        unitPrice: itemUnitPrice,
      });
    } else if (currentItem) {
      // Update existing item
      updateItemMutation.mutate({
        itemId: currentItem.id,
        updateData: {
          description: itemDescription,
          quantity: itemQuantity,
          unitPrice: itemUnitPrice,
        }
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "sent":
        return <Badge variant="secondary">Sent</Badge>;
      case "paid":
        return <Badge variant="default">Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (itemsLoading) {
    return (
      <div className="p-4">
        <div className="h-6 w-24 bg-muted rounded animate-pulse mb-4" />
        <Card>
          <CardHeader>
            <div className="h-5 w-32 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-4 overflow-y-auto space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Invoice</h2>
        
        <div className="flex flex-wrap gap-2">
          <Link href="/parts-search">
            <Button variant="outline" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Find Parts
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleAddItem}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
          
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setEmailDialogOpen(true)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </DialogTrigger>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrintInvoice}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownloadInvoice}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          
          <DialogTrigger asChild>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setPaymentDialogOpen(true)}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
          </DialogTrigger>
        </div>
      </div>
      
      <div className="print-area">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">INVOICE</CardTitle>
                <CardDescription className="mt-1">
                  {estimate?.status && getStatusBadge(estimate.status)}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">Grande Technicians</p>
                <p className="text-sm text-muted-foreground">123 Service Road</p>
                <p className="text-sm text-muted-foreground">Houston, TX 77001</p>
                <p className="text-sm text-muted-foreground">(555) 123-4567</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium mb-1">Bill To:</h3>
                <p className="text-sm">{customer?.name}</p>
                <p className="text-sm">{customer?.address}</p>
                <p className="text-sm">{customer?.city}, {customer?.state} {customer?.zip}</p>
                <p className="text-sm">{customer?.phone}</p>
              </div>
              
              <div className="text-right">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium mr-4">Invoice #:</span>
                    <span className="text-sm">INV-{jobId}-{Math.floor(Math.random() * 10000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium mr-4">Date:</span>
                    <span className="text-sm">{format(new Date(), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium mr-4">Work Order #:</span>
                    <span className="text-sm">{job?.workOrderNumber}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[80px] print:hidden">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimateItems?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                      <div className="flex flex-col items-center">
                        <ShoppingCart className="h-8 w-8 mb-2" />
                        <p>No items have been added to this invoice</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={handleAddItem}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  estimateItems?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.description}
                        {item.storeSource && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Source: {item.storeSource}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                      <TableCell className="print:hidden">
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditItem(item)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteItem(item.id)}
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Subtotal</TableCell>
                  <TableCell className="text-right">{formatCurrency(subtotal)}</TableCell>
                  <TableCell className="print:hidden"></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3}>Tax (8.25%)</TableCell>
                  <TableCell className="text-right">{formatCurrency(taxAmount)}</TableCell>
                  <TableCell className="print:hidden"></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(total)}</TableCell>
                  <TableCell className="print:hidden"></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="font-medium">Notes:</h3>
              <p className="text-sm text-muted-foreground">
                Thank you for your business! Payment is due within 30 days.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Invoice</DialogTitle>
            <DialogDescription>
              Send this invoice to the customer via email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                placeholder="customer@example.com"
                className="col-span-3"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                defaultValue={customer?.email || ""}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEmailInvoice} disabled={!emailAddress}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Collect payment for invoice total of {formatCurrency(total)}
            </DialogDescription>
          </DialogHeader>
          
          {paymentComplete ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Payment Successful</h3>
              <p className="text-center text-muted-foreground">
                Payment of {formatCurrency(total)} has been processed successfully.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="paymentMethod" className="text-right">
                    Payment Method
                  </Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {paymentMethod === 'card' && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="cardNumber" className="text-right">
                        Card Number
                      </Label>
                      <Input
                        id="cardNumber"
                        placeholder="•••• •••• •••• ••••"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="cardName" className="text-right">
                        Name on Card
                      </Label>
                      <Input
                        id="cardName"
                        placeholder="John Smith"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div />
                      <div className="col-span-2 flex space-x-2">
                        <div className="flex-1">
                          <Label htmlFor="expiry">Expiry</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div className="w-20">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" placeholder="123" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {paymentMethod === 'check' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="checkNumber" className="text-right">
                      Check Number
                    </Label>
                    <Input
                      id="checkNumber"
                      placeholder="1234"
                      className="col-span-3"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleProcessPayment} disabled={processingPayment}>
                  {processingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Process {formatCurrency(total)}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Item Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNewItem ? 'Add Item' : 'Edit Item'}</DialogTitle>
            <DialogDescription>
              {isNewItem ? 'Add a new item to the invoice' : 'Make changes to the selected item'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="col-span-3"
                placeholder="Item description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Unit Price ($)
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={itemUnitPrice / 100}
                onChange={(e) => setItemUnitPrice(Math.round(parseFloat(e.target.value) * 100))}
                className="col-span-3"
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveItem} 
              disabled={!itemDescription || itemQuantity <= 0 || itemUnitPrice <= 0}
            >
              {isNewItem ? 'Add Item' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}