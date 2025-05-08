import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'wouter';
import { MapPin, Home, Calendar, Clock, ArrowRight, Phone, Navigation, Mail, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Customer, Job } from '@shared/schema';
import { useMapboxToken } from '@/hooks/use-mapbox-token';

// Import Mapbox CSS
import 'mapbox-gl/dist/mapbox-gl.css';

// Import from mapbox subpath for newer react-map-gl v8
import Map from 'react-map-gl/mapbox';
import { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';

// Define a type for combined job data
type JobWithCustomer = {
  job: Job;
  customer: Customer;
  coordinates: [number, number];
};

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
  const { token: mapboxToken, isLoading: isTokenLoading } = useMapboxToken();
  
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
      (acc: any, jobData) => {
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
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'Not scheduled';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get color for job status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase().replace('_', ' ')) {
      case 'scheduled':
        return 'bg-yellow-500 hover:bg-yellow-600 border-2 border-yellow-300';
      case 'in progress':
        return 'bg-blue-500 hover:bg-blue-600 border-2 border-blue-300';
      case 'completed':
        return 'bg-green-500 hover:bg-green-600 border-2 border-green-300';
      case 'canceled':
        return 'bg-red-500 hover:bg-red-600 border-2 border-red-300';
      default:
        return 'bg-slate-500 hover:bg-slate-600 border-2 border-slate-300';
    }
  };
  
  console.log("JobMap rendering with token:", { 
    hasToken: !!mapboxToken, 
    isTokenLoading, 
    jobsCount: jobsWithData.length 
  });
  
  return (
    <div className="h-full w-full flex flex-col">
      <div className="px-4 py-3 border-b bg-gradient-to-r from-slate-900 to-slate-800">
        <h1 className="text-xl font-bold flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-yellow-500" />
          Job Map
        </h1>
        <p className="text-sm text-amber-500 font-medium mt-1">
          {jobsWithData.length} job{jobsWithData.length !== 1 ? 's' : ''} on the map
        </p>
      </div>
      
      <div className="flex-1 relative">
        {isTokenLoading ? (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        ) : mapboxToken ? (
          <Map
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={mapboxToken}
            style={{ width: '100%', height: '100%' }}
            attributionControl={false}
          >
            <NavigationControl />
            <FullscreenControl />
            
            {jobsWithData.map((jobData) => (
              <Marker
                key={jobData.job.id}
                longitude={jobData.coordinates[0]}
                latitude={jobData.coordinates[1]}
                onClick={(e) => {
                  // Prevent click from propagating to the map
                  e.originalEvent.stopPropagation();
                  handleMarkerClick(jobData);
                }}
              >
                <div 
                  className={`${jobData.job.status.toLowerCase() === 'in progress' ? 'animate-pulse w-10 h-10' : 'w-8 h-8'} 
                              rounded-full flex items-center justify-center text-white 
                              ${getStatusColor(jobData.job.status)} 
                              transition-all duration-300 transform hover:scale-110 cursor-pointer`}
                >
                  <MapPin className={`${jobData.job.status.toLowerCase() === 'in progress' ? 'h-6 w-6' : 'h-5 w-5'}`} />
                </div>
              </Marker>
            ))}
            
            {selectedJob && (
              <Popup
                longitude={selectedJob.coordinates[0]}
                latitude={selectedJob.coordinates[1]}
                closeOnClick={false}
                onClose={() => setSelectedJob(null)}
                className="custom-popup-content w-64"
              >
                <Card className="w-full border-0 shadow-none">
                  <CardHeader className="p-3 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">
                          Work Order <span className="text-yellow-500 font-bold">#{selectedJob.job.workOrderNumber}</span>
                        </CardTitle>
                        <CardDescription>{selectedJob.customer.name}</CardDescription>
                      </div>
                      <Badge 
                        className={`
                          ${selectedJob.job.status.toLowerCase() === 'scheduled' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-500/50' : ''}
                          ${selectedJob.job.status.toLowerCase() === 'in progress' ? 'bg-blue-900/30 text-blue-500 border-blue-500/50' : ''}
                          ${selectedJob.job.status.toLowerCase() === 'completed' ? 'bg-green-900/30 text-green-500 border-green-500/50' : ''}
                          border px-3
                        `}
                      >
                        {selectedJob.job.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 pb-2 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-red-500" />
                      <span>
                        {selectedJob.customer.address}, {selectedJob.customer.city}, {selectedJob.customer.state} {selectedJob.customer.zip}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-500" />
                      <a 
                        href={`tel:${selectedJob.customer.phone || '5551234567'}`} 
                        className="hover:underline text-green-500"
                      >
                        {selectedJob.customer.phone || '(555) 123-4567'}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <a 
                        href={`mailto:${selectedJob.customer.email || 'contact@example.com'}`} 
                        className="hover:underline text-blue-500"
                      >
                        {selectedJob.customer.email || 'contact@example.com'}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span>{formatDate(selectedJob.job.scheduled)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>{selectedJob.job.timeZone || 'Default timezone'}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-3 pt-0 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2 w-full mb-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
                        onClick={() => {
                          if (selectedJob.customer.phone) {
                            window.open(`sms:${selectedJob.customer.phone.replace(/[^\d+]/g, '')}`, '_blank');
                          }
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Text
                      </Button>
                    
                      <Button 
                        size="sm"
                        variant="outline"
                        className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                        onClick={() => {
                          if (selectedJob.customer.phone) {
                            window.location.href = `tel:${selectedJob.customer.phone.replace(/[^\d+]/g, '')}`;
                          }
                        }}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </div>
                    
                    <Button 
                      asChild 
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0"
                      size="sm"
                    >
                      <Link href={`/jobs/${selectedJob.job.id}`}>
                        <span className="flex items-center justify-center gap-1">
                          View Details
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </Link>
                    </Button>
                    
                    <Button 
                      size="sm"
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-0"
                      onClick={() => {
                        const address = `${selectedJob.customer.address}, ${selectedJob.customer.city}, ${selectedJob.customer.state} ${selectedJob.customer.zip}`;
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
                        window.open(url, '_blank');
                      }}
                    >
                      <span className="flex items-center justify-center gap-1">
                        Get Directions
                        <Navigation className="h-4 w-4" />
                      </span>
                    </Button>
                  </CardFooter>
                </Card>
              </Popup>
            )}
          </Map>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-muted">
            <MapPin className="h-8 w-8 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Map not available - API token missing</p>
          </div>
        )}
      </div>
      
      {/* Add a legend for job status colors that's always vertical */}
      <div className="p-3 border-t bg-background">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-yellow-500 border border-yellow-300"></div>
            <span className="text-xs">Scheduled</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-blue-500 border border-blue-300"></div>
            <span className="text-xs">In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-green-500 border border-green-300"></div>
            <span className="text-xs">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}