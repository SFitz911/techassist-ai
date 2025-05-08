import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Info, Calendar } from "lucide-react";
import { format } from "date-fns";

interface DetailsTabProps {
  job: {
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
  return (
    <div className="p-4 overflow-y-auto">
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
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
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <p>{customer.phone}</p>
              </div>
            )}
            
            {customer.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <p>{customer.email}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Job Details</CardTitle>
          <CardDescription>Work Order #{job.workOrderNumber}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start">
              <Info className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
              <div>
                <p className="font-medium">Description</p>
                <p className="text-sm text-muted-foreground">{job.description}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm text-muted-foreground capitalize">{job.status.replace('_', ' ')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
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
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Job Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Tech was onsite to change light switches to dimmer switches and found bad wiring in wall. 
            This proposal is to replace wiring in wall.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
