import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Globe, MapPin, LocateFixed, Briefcase, 
  ChevronRight, Clock, FileText
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/layout/bottom-navigation";
import TopNavigation from "@/components/layout/top-navigation";
import { StatusBadge } from "@/components/ui/status-badge";

type Job = {
  id: number;
  workOrderNumber: string;
  customerId: number;
  technicianId: number;
  status: string;
  description: string;
  created: string;
  scheduled: string;
  timeZone: string;
};

type Customer = {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
};

function JobCard({ job, customer }: { job: Job, customer: Customer }) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="mb-3 cursor-pointer hover:bg-secondary/40 transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">
                Work Order: {job.workOrderNumber}
              </p>
              <h3 className="text-lg font-medium mt-1">{customer.name}</h3>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                <span>
                  {customer.address}, {customer.city}, {customer.state} {customer.zip}
                </span>
              </div>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Clock className="w-3.5 h-3.5 mr-1" />
                <span>
                  {job.scheduled ? 
                    formatDistanceToNow(new Date(job.scheduled), { addSuffix: true }) : 
                    "No schedule set"}
                </span>
              </div>
              <div className="mt-2">
                <StatusBadge jobId={job.id} status={job.status} size="sm" />
              </div>
            </div>
            <ChevronRight className="text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Dashboard() {
  const { toast } = useToast();
  const [location, setLocation] = useState({ lat: 0, lng: 0, available: false });
  
  // Set up mock current location
  const fetchLocation = () => {
    setLocation({ lat: 40.7128, lng: -74.006, available: true });
    toast({ 
      title: "Location updated", 
      description: "Your current location has been updated.",
      duration: 2000 
    });
  };
  
  // Get jobs for the technician (using fixed ID 1 for development)
  const { data: jobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['/api/technicians/1/jobs'],
    retry: false
  });
  
  // Get all customers (in a real app, this would be filtered or paginated)
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['/api/customers'],
    retry: false
  });
  
  // Handle loading state
  if (isLoadingJobs || isLoadingCustomers) {
    return (
      <div className="page-container pb-20 dashboard-container">
        <TopNavigation />
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">My Jobs</h1>
            <button className="p-2 bg-accent rounded-full">
              <FileText className="w-5 h-5" />
            </button>
          </div>
          
          <div className="bg-secondary rounded-lg p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <LocateFixed className="text-primary mr-2" />
              <div>
                <p className="text-sm text-muted-foreground">Current Location</p>
                <p>Locating...</p>
              </div>
            </div>
            <button 
              className="bg-primary rounded-full p-1.5" 
              onClick={fetchLocation}
            >
              <Globe className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
          
          <h2 className="text-lg font-medium mb-3">Today's Jobs</h2>
          {[1, 2, 3].map((_, i) => (
            <Card key={i} className="mb-3">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-5 w-44 mb-2" />
                    <Skeleton className="h-4 w-64 mb-2" />
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-6 w-24 rounded-full mt-1" />
                  </div>
                  <ChevronRight className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="page-container pb-20 dashboard-container">
      <TopNavigation />
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">My Jobs</h1>
          <button className="p-2 bg-accent rounded-full">
            <FileText className="w-5 h-5" />
          </button>
        </div>
        
        <div className="bg-secondary rounded-lg p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <LocateFixed className="text-primary mr-2" />
            <div>
              <p className="text-sm text-muted-foreground">Current Location</p>
              <p>{location.available ? 'Location available' : 'Not available'}</p>
            </div>
          </div>
          <button 
            className="bg-primary rounded-full p-1.5" 
            onClick={fetchLocation}
          >
            <Globe className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
        
        <h2 className="text-lg font-medium mb-3">Today's Jobs</h2>
        {jobs && customers && jobs.length > 0 ? (
          jobs.map((job: Job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              customer={customers.find((c: Customer) => c.id === job.customerId)} 
            />
          ))
        ) : (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No jobs scheduled</h3>
            <p className="text-muted-foreground mt-1">
              There are no jobs scheduled for today
            </p>
          </div>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
