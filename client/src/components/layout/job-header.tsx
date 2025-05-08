import { ChevronLeft, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

interface JobHeaderProps {
  job: {
    id?: number; // Add ID for status badge
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
          <ChevronLeft className="h-5 w-5 text-blue-500" />
        </Button>
        <div>
          <div className="flex items-center">
            <h1 className="text-lg font-semibold">{customer.name}</h1>
            <div className="ml-2">
              {job.id ? (
                <StatusBadge jobId={job.id} status={job.status} size="sm" />
              ) : (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border 
                  ${job.status === 'scheduled' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-500/50' : 
                  job.status === 'in_progress' ? 'bg-blue-900/30 text-blue-500 border-blue-500/50' : 
                  'bg-green-900/30 text-green-500 border-green-500/50'}`}>
                  {job.status.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span className="mr-2 font-medium text-yellow-500">WO# {job.workOrderNumber}</span>
            {customer.address && (
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1 text-red-500" />
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
