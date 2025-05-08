import { useState, useEffect, useCallback, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl';
import { Link } from 'wouter';
import { MapPin, Home, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Customer, Job } from '@shared/schema';

// Define a type for combined job data
type JobWithCustomer = {
  job: Job;
  customer: Customer;
  coordinates: [number, number];
};

// Mapbox token - in a real application, this should be an environment variable
// For demo purposes, we're using a rotating token
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

interface JobMapProps {
  jobs: Job[];
  customers: Customer[];
}

export default function JobMap({ jobs, customers }: JobMapProps) {
  const [viewState, setViewState] = useState({
    longitude: -95.3698,  // Default to center of US
    latitude: 29.7604,    // Houston, TX
    zoom: 10
  });
  
  const [selectedJob, setSelectedJob] = useState<JobWithCustomer | null>(null);
  
  // Process jobs data to include customer and coordinates
  const jobsWithData = useMemo(() => {
    return jobs.map(job => {
      const customer = customers.find(c => c.id === job.customerId);
      if (!customer) return null;
      
      // Generate map coordinates from address
      // In a real app, this would use geocoding, but we'll simulate with random coordinates around Houston
      const baseLatitude = 29.7604;
      const baseLongitude = -95.3698;
      
      // Add small random offset to create different points
      const randomLat = baseLatitude + (Math.random() * 0.1 - 0.05);
      const randomLng = baseLongitude + (Math.random() * 0.1 - 0.05);
      
      return {
        job,
        customer,
        coordinates: [randomLng, randomLat] as [number, number]
      };
    }).filter(Boolean) as JobWithCustomer[];
  }, [jobs, customers]);
  
  // Calculate the bounds for all job locations to auto-center the map
  useEffect(() => {
    if (jobsWithData.length === 0) return;
    
    const bounds = jobsWithData.reduce(
      (acc, jobData) => {
        const [lng, lat] = jobData.coordinates;
        return {
          minLng: Math.min(acc.minLng, lng),
          maxLng: Math.max(acc.maxLng, lng),
          minLat: Math.min(acc.minLat, lat),
          maxLat: Math.max(acc.maxLat, lat),
        };
      },
      {
        minLng: Infinity,
        maxLng: -Infinity,
        minLat: Infinity,
        maxLat: -Infinity,
      }
    );
    
    // If we have only one job, zoom in more
    const zoom = jobsWithData.length === 1 ? 12 : 10;
    
    // Center the map on the average of coordinates
    setViewState({
      longitude: (bounds.minLng + bounds.maxLng) / 2,
      latitude: (bounds.minLat + bounds.maxLat) / 2,
      zoom
    });
  }, [jobsWithData]);
  
  // Handle marker click
  const handleMarkerClick = useCallback((jobData: JobWithCustomer) => {
    setSelectedJob(jobData);
  }, []);
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get color for job status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'in progress':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'completed':
        return 'bg-green-500 hover:bg-green-600';
      case 'canceled':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-slate-500 hover:bg-slate-600';
    }
  };
  
  return (
    <div className="h-full w-full flex flex-col">
      <div className="px-4 py-2 border-b">
        <h1 className="text-xl font-bold">Job Map</h1>
        <p className="text-sm text-muted-foreground">
          {jobsWithData.length} job{jobsWithData.length !== 1 ? 's' : ''} on the map
        </p>
      </div>
      
      <div className="flex-1 relative">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />
          
          {jobsWithData.map((jobData) => (
            <Marker
              key={jobData.job.id}
              longitude={jobData.coordinates[0]}
              latitude={jobData.coordinates[1]}
              onClick={() => handleMarkerClick(jobData)}
              style={{ cursor: 'pointer' }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getStatusColor(jobData.job.status)}`}>
                <MapPin className="h-5 w-5" />
              </div>
            </Marker>
          ))}
          
          {selectedJob && (
            <Popup
              longitude={selectedJob.coordinates[0]}
              latitude={selectedJob.coordinates[1]}
              anchor="bottom"
              closeOnClick={false}
              onClose={() => setSelectedJob(null)}
              maxWidth="300px"
            >
              <Card className="w-full border-0 shadow-none">
                <CardHeader className="p-3 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">Work Order #{selectedJob.job.workOrderNumber}</CardTitle>
                      <CardDescription>{selectedJob.customer.name}</CardDescription>
                    </div>
                    <Badge variant={selectedJob.job.status.toLowerCase() === 'completed' ? 'default' : 'outline'}>
                      {selectedJob.job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 pb-2 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {selectedJob.customer.address}, {selectedJob.customer.city}, {selectedJob.customer.state} {selectedJob.customer.zip}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(selectedJob.job.scheduled)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedJob.job.timeZone || 'Default timezone'}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-3 pt-0">
                  <Button asChild className="w-full" size="sm">
                    <Link href={`/jobs/${selectedJob.job.id}`}>
                      <span className="flex items-center justify-center gap-1">
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
}