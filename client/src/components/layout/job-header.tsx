import { ChevronLeft, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface JobHeaderProps {
  job: {
    workOrderNumber: string;
    status: string;
    description: string;
  };
  customer: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
  };
}

export default function JobHeader({ job, customer }: JobHeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="job-header">
      <div className="flex items-center mb-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mr-1 -ml-2"
          onClick={() => setLocation("/")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center">
            <h1 className="text-lg font-semibold">{customer.name}</h1>
            <span className={`status-badge ml-2 
              ${job.status === 'scheduled' ? 'status-scheduled' : 
              job.status === 'in_progress' ? 'status-in-progress' : 
              'status-completed'}`}>
              {job.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span className="mr-2">WO# {job.workOrderNumber}</span>
            {customer.address && (
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                <span>
                  {customer.city}, {customer.state}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-sm truncate">{job.description}</p>
    </div>
  );
}
