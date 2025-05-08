import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import JobMap from '@/components/map/job-map';
import TopNavigation from '@/components/layout/top-navigation';
import { apiRequest } from '@/lib/queryClient';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapPage() {
  const [, setLocation] = useLocation();

  // Fetch jobs
  const { data: jobs, isLoading: loadingJobs, error: jobsError } = useQuery({
    queryKey: ['/api/technicians/1/jobs'],  // Hardcoded technician ID for now
    queryFn: async () => apiRequest('/api/technicians/1/jobs'),
  });
  
  // Fetch customers
  const { data: customers, isLoading: loadingCustomers, error: customersError } = useQuery({
    queryKey: ['/api/customers'],
    queryFn: async () => apiRequest('/api/customers'),
  });
  
  // Redirect if there's an error
  useEffect(() => {
    if (jobsError || customersError) {
      setLocation('/');
    }
  }, [jobsError, customersError, setLocation]);
  
  const isLoading = loadingJobs || loadingCustomers;
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <TopNavigation />
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }
  
  // If no jobs or customers
  if (!jobs?.length || !customers?.length) {
    return (
      <div className="flex flex-col h-screen">
        <TopNavigation />
        <div className="flex-1 p-4 flex items-center justify-center">
          <Card className="p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">No Jobs Available</h2>
            <p className="text-muted-foreground">
              There are no jobs assigned to this technician or the data could not be loaded.
            </p>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
      <TopNavigation />
      <div className="flex-1">
        <JobMap jobs={jobs} customers={customers} />
      </div>
    </div>
  );
}