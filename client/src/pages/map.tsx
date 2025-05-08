import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SimpleJobMap from '@/components/map/simple-job-map';
import TopNavigation from '@/components/layout/top-navigation';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, FilterX } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapPage() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

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
  
  // Apply filters to jobs
  const filteredJobs = jobs?.filter((job) => {
    // No filter applied
    if (!statusFilter) return true;
    // Apply status filter
    return job.status.toLowerCase() === statusFilter.toLowerCase();
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
  
  // Get count of each status type
  const statusCounts = jobs?.reduce((acc, job) => {
    const status = job.status.toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="flex flex-col min-h-screen overflow-auto map-container">
      <TopNavigation />
      
      {/* Filter controls */}
      <div className="border-b bg-slate-900 p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-slate-200">Filter Jobs by Status:</h2>
          {statusFilter && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setStatusFilter(null)}
              className="h-8 px-2 text-yellow-500 hover:text-yellow-400"
            >
              <FilterX className="h-4 w-4 mr-1" />
              Clear Filter
            </Button>
          )}
        </div>
        
        <div className="flex flex-col gap-2 pb-1">
          <Button
            variant={statusFilter === 'scheduled' ? 'default' : 'outline'}
            size="sm"
            className={`h-8 w-full ${statusFilter === 'scheduled' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'border-yellow-500/50 text-yellow-500 hover:text-yellow-400'}`}
            onClick={() => setStatusFilter(statusFilter === 'scheduled' ? null : 'scheduled')}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Scheduled ({statusCounts['scheduled'] || 0})
          </Button>
          
          <Button
            variant={statusFilter === 'in progress' ? 'default' : 'outline'}
            size="sm"
            className={`h-8 w-full ${statusFilter === 'in progress' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'border-blue-500/50 text-blue-500 hover:text-blue-400'}`}
            onClick={() => setStatusFilter(statusFilter === 'in progress' ? null : 'in progress')}
          >
            <MapPin className="h-4 w-4 mr-1" />
            In Progress ({statusCounts['in progress'] || 0})
          </Button>
          
          <Button
            variant={statusFilter === 'completed' ? 'default' : 'outline'}
            size="sm"
            className={`h-8 w-full ${statusFilter === 'completed' ? 'bg-green-500 hover:bg-green-600 text-white' : 'border-green-500/50 text-green-500 hover:text-green-400'}`}
            onClick={() => setStatusFilter(statusFilter === 'completed' ? null : 'completed')}
          >
            <MapPin className="h-4 w-4 mr-1" />
            Completed ({statusCounts['completed'] || 0})
          </Button>
        </div>
      </div>
      
      <div className="flex-1 min-h-[70vh]">
        <SimpleJobMap jobs={filteredJobs || []} customers={customers} />
      </div>
    </div>
  );
}