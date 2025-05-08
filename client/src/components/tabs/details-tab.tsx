import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Info, 
  Calendar, 
  Edit2, 
  Save, 
  Lightbulb, 
  Search,
  Wrench,
  Wand2,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface DetailsTabProps {
  job: {
    id: number;
    workOrderNumber: string;
    status: string;
    description: string;
    created: string;
    scheduled: string | null;
    timeZone: string;
  };
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

export default function DetailsTab({ job, customer }: DetailsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingWoNumber, setEditingWoNumber] = useState(false);
  const [workOrderNumber, setWorkOrderNumber] = useState(job.workOrderNumber);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestedParts, setSuggestedParts] = useState<string[]>([]);
  const [additionalParts, setAdditionalParts] = useState<string[]>([]);
  
  // Update work order number mutation
  const updateWoMutation = useMutation({
    mutationFn: async (newWorkOrderNumber: string) => {
      return apiRequest(`/api/jobs/${job.id}/update-wo`, {
        method: 'PATCH',
        body: JSON.stringify({ workOrderNumber: newWorkOrderNumber }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${job.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/technicians/1/jobs'] });
      
      toast({
        title: "Work Order Updated",
        description: "The work order number has been successfully updated.",
      });
      
      setEditingWoNumber(false);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update work order number. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Analyze job description for part suggestions
  const analyzeJobDescription = async () => {
    setIsAnalyzing(true);
    
    try {
      // In a real application, this would call the OpenAI API
      // For now, we'll simulate a response to show the functionality
      
      // Parts that might be needed for the job description
      setTimeout(() => {
        if (job.description.toLowerCase().includes("light") || 
            job.description.toLowerCase().includes("switch") || 
            job.description.toLowerCase().includes("dimmer") || 
            job.description.toLowerCase().includes("wiring")) {
          
          setSuggestedParts([
            "14/2 Romex Wire",
            "Wire Nuts",
            "Electrical Tape",
            "Dimmer Switch"
          ]);
          
          setAdditionalParts([
            "Wire Stripper",
            "Voltage Tester",
            "Electrical Box",
            "Wall Plate"
          ]);
        } else {
          setSuggestedParts([]);
          setAdditionalParts([]);
          
          toast({
            title: "Analysis Complete",
            description: "No specific parts could be identified from the job description.",
          });
        }
        
        setIsAnalyzing(false);
      }, 2000);
      
    } catch (error) {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze job description. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Save the updated work order number
  const handleSaveWorkOrderNumber = () => {
    if (!workOrderNumber.trim()) {
      toast({
        title: "Invalid Input",
        description: "Work order number cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    updateWoMutation.mutate(workOrderNumber);
  };
  
  return (
    <div className="p-4 overflow-y-auto">
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mt-0.5 mr-2 text-amber-500" />
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {customer.address}
                  <br />
                  {customer.city}, {customer.state} {customer.zip}
                </p>
              </div>
            </div>
            
            {customer.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-green-500" />
                <p>{customer.phone}</p>
              </div>
            )}
            
            {customer.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-blue-500" />
                <p>{customer.email}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Job Details</CardTitle>
          <CardDescription className="flex items-center">
            {editingWoNumber ? (
              <div className="flex items-center gap-2">
                <span>Work Order #</span>
                <Input
                  value={workOrderNumber}
                  onChange={(e) => setWorkOrderNumber(e.target.value)}
                  className="w-40 h-7 py-1"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={handleSaveWorkOrderNumber}
                  disabled={updateWoMutation.isPending}
                >
                  {updateWoMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Work Order #{job.workOrderNumber}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => setEditingWoNumber(true)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start">
              <Info className="h-4 w-4 mt-0.5 mr-2 text-emerald-500" />
              <div>
                <p className="font-medium">Description</p>
                <p className="text-sm text-muted-foreground">{job.description}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-4 w-4 mt-0.5 mr-2 text-orange-500" />
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm text-muted-foreground capitalize">{job.status.replace('_', ' ')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="h-4 w-4 mt-0.5 mr-2 text-purple-500" />
              <div>
                <p className="font-medium">Scheduled</p>
                <p className="text-sm text-muted-foreground">
                  {job.scheduled ? format(new Date(job.scheduled), 'MMM d, yyyy h:mm a') : 'Not scheduled'}
                  {job.timeZone && ` (${job.timeZone})`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Job Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Tech was onsite to change light switches to dimmer switches and found bad wiring in wall. 
            This proposal is to replace wiring in wall.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeJobDescription}
            disabled={isAnalyzing}
            className="border-amber-200 hover:bg-amber-100 hover:text-amber-900"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin text-amber-500" />
                Analyzing...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2 text-amber-500" />
                Suggest Parts
              </>
            )}
          </Button>
          
          <Link href="/parts-search">
            <Button 
              variant="outline" 
              size="sm"
              className="border-blue-200 hover:bg-blue-100 hover:text-blue-900"
            >
              <Search className="h-4 w-4 mr-2 text-blue-500" />
              Search Parts
            </Button>
          </Link>
        </CardFooter>
      </Card>
      
      {(suggestedParts.length > 0 || additionalParts.length > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">AI-Suggested Materials</CardTitle>
            <CardDescription>
              Based on the job description, these parts may be needed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestedParts.length > 0 && (
              <div>
                <Label className="text-sm font-medium flex items-center mb-2">
                  <Lightbulb className="h-4 w-4 mr-1.5 text-amber-500" />
                  Primary Materials Needed
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestedParts.map((part, idx) => (
                    <div key={idx} className="flex items-center">
                      <Badge variant="outline" className="mr-2 bg-muted/50">Required</Badge>
                      <Link href={`/parts-search?query=${encodeURIComponent(part)}`}>
                        <Button variant="link" className="h-auto p-0 text-left justify-start">
                          {part}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {additionalParts.length > 0 && (
              <>
                <Separator />
                <div>
                  <Label className="text-sm font-medium flex items-center mb-2">
                    <Wrench className="h-4 w-4 mr-1.5 text-blue-500" />
                    Additional Recommended Items
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {additionalParts.map((part, idx) => (
                      <div key={idx} className="flex items-center">
                        <Badge variant="outline" className="mr-2">Optional</Badge>
                        <Link href={`/parts-search?query=${encodeURIComponent(part)}`}>
                          <Button variant="link" className="h-auto p-0 text-left justify-start">
                            {part}
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
