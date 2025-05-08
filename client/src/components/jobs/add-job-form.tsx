import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, PasteClipboard, Wand } from 'lucide-react';
import { InsertJob, Customer } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';

interface AddJobFormProps {
  customers: Customer[];
  technicianId: number;
}

export default function AddJobForm({ customers, technicianId }: AddJobFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [workOrderNumber, setWorkOrderNumber] = useState('');
  const [description, setDescription] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  // Mutation for adding a new job
  const addJobMutation = useMutation({
    mutationFn: async (newJob: InsertJob) => {
      return apiRequest('/api/jobs', {
        method: 'POST',
        body: JSON.stringify(newJob),
      });
    },
    onSuccess: () => {
      // Invalidate queries to refetch job list
      queryClient.invalidateQueries({ queryKey: [`/api/technicians/${technicianId}/jobs`] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      
      // Reset form and close dialog
      resetForm();
      setOpen(false);
      
      // Show success toast
      toast({
        title: 'Job Added',
        description: 'The new job has been successfully added.',
      });
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: 'Error Adding Job',
        description: 'There was a problem adding the job. Please try again.',
        variant: 'destructive',
      });
      console.error('Error adding job:', error);
    },
  });

  // Reset form fields
  const resetForm = () => {
    setCustomerId('');
    setWorkOrderNumber('');
    setDescription('');
    setPastedText('');
    setIsParsing(false);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId || !workOrderNumber || !description) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    const newJob: InsertJob = {
      customerId: Number(customerId),
      technicianId,
      workOrderNumber,
      description,
      status: 'scheduled',
      scheduled: null,
      timeZone: 'America/Chicago', // Default timezone
    };
    
    addJobMutation.mutate(newJob);
  };

  // AI parsing of pasted text - simulated for demo purposes
  const parseText = () => {
    if (!pastedText) return;
    
    setIsParsing(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      // Extract info from text
      // This is a simplified example - in a real app, you would use AI to extract this info
      let extractedWorkOrder = '';
      let extractedDescription = '';
      let extractedCustomerId = '';
      
      // Simple pattern matching for demo purposes
      const workOrderMatch = pastedText.match(/work order[:\s]+(\w+)/i) || 
                             pastedText.match(/wo[:\s]+(\w+)/i) ||
                             pastedText.match(/order[:\s]+#?(\w+)/i);
      
      if (workOrderMatch) {
        extractedWorkOrder = workOrderMatch[1];
      }
      
      // Extract customer by looking for their name in the text
      customers.forEach(customer => {
        if (pastedText.toLowerCase().includes(customer.name.toLowerCase())) {
          extractedCustomerId = String(customer.id);
        }
      });
      
      // Extract description - just use the first sentence if multiple lines
      const sentences = pastedText.split(/\.\s|\n/);
      if (sentences.length > 0) {
        extractedDescription = sentences[0].trim();
        
        // If it's too short, use more content
        if (extractedDescription.length < 20 && sentences.length > 1) {
          extractedDescription = sentences.slice(0, 2).join('. ').trim();
        }
      }
      
      // Update form with extracted info
      if (extractedWorkOrder) setWorkOrderNumber(extractedWorkOrder);
      if (extractedCustomerId) setCustomerId(Number(extractedCustomerId));
      if (extractedDescription) setDescription(extractedDescription);
      
      setIsParsing(false);
      
      toast({
        title: 'Text Parsed',
        description: 'Information has been extracted from the pasted text.',
      });
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add New Job
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Job</DialogTitle>
          <DialogDescription>
            Create a new job by filling out the details below or paste text from a message.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pasted-text">Paste Text Message</Label>
            <div className="flex items-center gap-2">
              <Textarea
                id="pasted-text"
                placeholder="Paste text message containing job details here..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="flex-1"
                rows={3}
              />
            </div>
            <Button 
              variant="secondary" 
              onClick={parseText} 
              disabled={!pastedText || isParsing}
              className="w-full"
            >
              {isParsing ? (
                <>
                  <Wand className="h-4 w-4 mr-2 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <PasteClipboard className="h-4 w-4 mr-2" />
                  Extract Job Information
                </>
              )}
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select value={customerId.toString()} onValueChange={(value) => setCustomerId(Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workOrderNumber">Work Order Number</Label>
                <Input
                  id="workOrderNumber"
                  value={workOrderNumber}
                  onChange={(e) => setWorkOrderNumber(e.target.value)}
                  placeholder="e.g., WO12345"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the job..."
                  rows={3}
                />
              </div>
            </form>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit}
            disabled={!customerId || !workOrderNumber || !description || addJobMutation.isPending}
          >
            {addJobMutation.isPending ? 'Adding...' : 'Add Job'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}