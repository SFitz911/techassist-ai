import { useEffect, useRef } from 'react';
import { Link } from 'wouter';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapboxToken } from '@/hooks/use-mapbox-token';
import { Customer, Job } from '@shared/schema';

interface SimpleJobMapProps {
  jobs: Job[];
  customers: Customer[];
  height?: string;
}

export default function SimpleJobMap({ 
  jobs, 
  customers,
  height = '500px' 
}: SimpleJobMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { token: mapboxToken, isLoading: isTokenLoading } = useMapboxToken();
  
  useEffect(() => {
    if (isTokenLoading || !mapboxToken || !mapContainer.current || map.current) return;
    
    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-95.3698, 29.7604], // Default center (Houston)
      zoom: 10
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(new mapboxgl.FullscreenControl());
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, isTokenLoading]);
  
  // Add markers when jobs, customers or map changes
  useEffect(() => {
    if (!map.current || !jobs.length || !customers.length) return;
    
    // Clear existing markers (the DOM elements persist otherwise)
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());
    
    // Calculate bounds for jobs
    const bounds = new mapboxgl.LngLatBounds();
    
    // Process jobs with customer data
    const jobsWithData = jobs.map(job => {
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
    }).filter(Boolean);
    
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
    
    // Get color based on job status
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase().replace('_', ' ')) {
        case 'scheduled':
          return '#eab308'; // yellow-500
        case 'in progress':
          return '#3b82f6'; // blue-500
        case 'completed':
          return '#22c55e'; // green-500
        case 'canceled':
          return '#ef4444'; // red-500
        default:
          return '#64748b'; // slate-500
      }
    };
    
    // Add markers for each job
    jobsWithData.forEach(jobData => {
      const { job, customer, coordinates } = jobData;
      
      // Add job to bounds
      bounds.extend(coordinates);
      
      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'job-marker';
      markerEl.style.width = job.status.toLowerCase() === 'in progress' ? '40px' : '32px';
      markerEl.style.height = job.status.toLowerCase() === 'in progress' ? '40px' : '32px';
      markerEl.style.borderRadius = '50%';
      markerEl.style.background = getStatusColor(job.status);
      markerEl.style.border = '2px solid ' + getStatusColor(job.status).replace(')', ', 0.5)').replace('rgb', 'rgba');
      markerEl.style.display = 'flex';
      markerEl.style.justifyContent = 'center';
      markerEl.style.alignItems = 'center';
      markerEl.style.color = 'white';
      markerEl.style.cursor = 'pointer';
      markerEl.style.zIndex = '10';
      
      // Add pulsing animation for in-progress jobs
      if (job.status.toLowerCase() === 'in progress') {
        markerEl.style.animation = 'pulse 2s infinite';
        const styleSheet = document.createElement('style');
        styleSheet.innerText = `
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `;
        document.head.appendChild(styleSheet);
      }
      
      markerEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${job.status.toLowerCase() === 'in progress' ? '24' : '20'}" height="${job.status.toLowerCase() === 'in progress' ? '24' : '20'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
      
      // Create popup with job info
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family: system-ui, sans-serif; min-width: 240px; max-width: 300px;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <div>
              <div style="font-weight: 500; margin-bottom: 4px; font-size: 16px;">
                Work Order <span style="color: #eab308; font-weight: 700;">#${job.workOrderNumber}</span>
              </div>
              <div style="color: #888; margin-bottom: 4px; font-size: 14px;">${customer.name}</div>
            </div>
            <div style="
              background: ${job.status.toLowerCase() === 'scheduled' ? 'rgba(234, 179, 8, 0.2)' : 
                          job.status.toLowerCase() === 'in progress' ? 'rgba(59, 130, 246, 0.2)' : 
                          job.status.toLowerCase() === 'completed' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.2)'};
              color: ${getStatusColor(job.status)};
              border: 1px solid ${getStatusColor(job.status).replace(')', ', 0.5)').replace('rgb', 'rgba')};
              border-radius: 4px;
              padding: 2px 8px;
              font-size: 12px;
              white-space: nowrap;
            ">
              ${job.status}
            </div>
          </div>
          
          <div style="margin-bottom: 6px; font-size: 14px; display: flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            ${customer.address}, ${customer.city}, ${customer.state} ${customer.zip || ''}
          </div>
          
          <div style="margin-bottom: 6px; font-size: 14px; display: flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <a href="tel:${customer.phone || ''}" style="color: #22c55e; text-decoration: none;">
              ${customer.phone || 'No phone'}
            </a>
          </div>
          
          <div style="margin-bottom: 6px; font-size: 14px; display: flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            <a href="mailto:${customer.email || ''}" style="color: #3b82f6; text-decoration: none;">
              ${customer.email || 'No email'}
            </a>
          </div>
          
          <div style="margin-bottom: 6px; font-size: 14px; display: flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
            ${formatDate(job.scheduled)}
          </div>
          
          <div style="margin-top: 12px; display: flex; gap: 8px;">
            <a 
              href="/jobs/${job.id}" 
              style="background: linear-gradient(to right, #2563eb, #1d4ed8); flex: 1; color: white; border: none; border-radius: 4px; padding: 6px 0; font-size: 14px; text-decoration: none; display: inline-block; text-align: center;"
            >
              View Details
            </a>
            
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${customer.address}, ${customer.city}, ${customer.state} ${customer.zip || ''}`)}" 
              target="_blank" 
              style="background: linear-gradient(to right, #16a34a, #15803d); flex: 1; color: white; border: none; border-radius: 4px; padding: 6px 0; font-size: 14px; text-decoration: none; display: inline-block; text-align: center;"
            >
              Get Directions
            </a>
          </div>
        </div>
      `);
      
      // Add marker with popup
      new mapboxgl.Marker(markerEl)
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map.current!);
    });
    
    // Fit bounds if we have jobs
    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12
      });
    }
  }, [jobs, customers, map.current]);
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-4 py-3 border-b bg-gradient-to-r from-slate-900 to-slate-800">
        <h1 className="text-xl font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-yellow-500"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          Job Map
        </h1>
        <p className="text-sm text-amber-500 font-medium mt-1">
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} on the map
        </p>
      </div>
      
      <div className="flex-1 relative">
        {isTokenLoading ? (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        ) : mapboxToken ? (
          <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-muted-foreground"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <p className="text-sm text-muted-foreground">Map not available - API token missing</p>
          </div>
        )}
      </div>
      
      {/* Add a legend for job status colors */}
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