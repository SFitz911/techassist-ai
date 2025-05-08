import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Navigation } from 'lucide-react';
import { Customer, Job } from '@shared/schema';

// Mapbox token using the project's access token
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2ZpdHo5MTEiLCJhIjoiY21hZjJocGcyMDEzbDJrbzdxMzZleTM2eSJ9.pwYUN6WMF5T0yC54B1qsUw';

// Configure mapbox
mapboxgl.accessToken = MAPBOX_TOKEN;

// Define types
type JobWithLocation = {
  id: number;
  workOrderNumber: string;
  customerId: number;
  status: string;
  coordinates: [number, number];
  customer: Customer;
};

interface JobMapProps {
  jobs: Job[];
  customers: Customer[];
}

export default function SimpleJobMap({ jobs, customers }: JobMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [jobsWithLocations, setJobsWithLocations] = useState<JobWithLocation[]>([]);
  
  // Process jobs data
  useEffect(() => {
    if (!jobs || !customers) return;
    
    const processedJobs = jobs.map(job => {
      const customer = customers.find(c => c.id === job.customerId);
      if (!customer) return null;
      
      // In a real app, you would get coordinates from a geocoding service
      // For this demo, we'll use random coordinates around Houston
      const baseLatitude = 29.7604;
      const baseLongitude = -95.3698;
      
      // Add small random offset to create different points
      const randomLat = baseLatitude + (Math.random() * 0.1 - 0.05);
      const randomLng = baseLongitude + (Math.random() * 0.1 - 0.05);
      
      return {
        id: job.id,
        workOrderNumber: job.workOrderNumber,
        customerId: job.customerId,
        status: job.status,
        coordinates: [randomLng, randomLat] as [number, number],
        customer
      };
    }).filter(Boolean) as JobWithLocation[];
    
    setJobsWithLocations(processedJobs);
  }, [jobs, customers]);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-95.3698, 29.7604], // Houston, TX
      zoom: 10
    });
    
    // Add controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  // Add markers for jobs
  useEffect(() => {
    if (!map.current || !jobsWithLocations.length) return;
    
    // Remove existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());
    
    // Fit map to bounds of all markers
    const bounds = new mapboxgl.LngLatBounds();
    
    // Add markers for each job
    jobsWithLocations.forEach(job => {
      // Create a marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      
      // Add appropriate styling based on status
      const baseClasses = 'rounded-full flex items-center justify-center text-white border-2';
      let statusClasses = '';
      
      switch(job.status.toLowerCase().replace('_', ' ')) {
        case 'scheduled':
          statusClasses = 'bg-yellow-500 border-yellow-300';
          break;
        case 'in progress':
          statusClasses = 'bg-blue-500 border-blue-300';
          markerEl.classList.add('animate-pulse');
          break;
        case 'completed':
          statusClasses = 'bg-green-500 border-green-300';
          break;
        default:
          statusClasses = 'bg-slate-500 border-slate-300';
      }
      
      // Style the marker
      markerEl.className = `custom-marker ${baseClasses} ${statusClasses}`;
      
      // Add a pin icon
      const icon = document.createElement('span');
      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
      markerEl.appendChild(icon);
      
      // Create the popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'custom-popup-content';
      
      // Add job info to popup
      popupContent.innerHTML = `
        <div class="popup-header">
          <h3>Work Order #<span class="text-yellow-500 font-bold">${job.workOrderNumber}</span></h3>
          <p>${job.customer.name}</p>
        </div>
        <div class="popup-content">
          <div class="popup-address">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <p>${job.customer.address}, ${job.customer.city}, ${job.customer.state}</p>
          </div>
          <div class="popup-phone">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <p>${job.customer.phone || '(555) 123-4567'}</p>
          </div>
        </div>
        <div class="popup-footer">
          <a href="/jobs/${job.id}" class="view-details-btn">
            View Details
          </a>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${job.customer.address}, ${job.customer.city}, ${job.customer.state}`)}" class="get-directions-btn" target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
            Get Directions
          </a>
        </div>
      `;
      
      // Create a popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        className: 'custom-popup'
      }).setDOMContent(popupContent);
      
      // Create a marker
      new mapboxgl.Marker(markerEl)
        .setLngLat(job.coordinates)
        .setPopup(popup)
        .addTo(map.current!);
      
      // Extend bounds to include this marker
      bounds.extend(job.coordinates);
    });
    
    // Fit the map to show all markers
    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 13
      });
    }
  }, [jobsWithLocations, map.current]);
  
  return (
    <div className="h-full w-full flex flex-col">
      <div className="px-4 py-3 border-b bg-gradient-to-r from-slate-900 to-slate-800">
        <h1 className="text-xl font-bold flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-yellow-500" />
          Job Map
        </h1>
        <p className="text-sm text-amber-500 font-medium mt-1">
          {jobsWithLocations.length} job{jobsWithLocations.length !== 1 ? 's' : ''} on the map
        </p>
      </div>
      
      <div ref={mapContainer} className="flex-1" />
      
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
      
      <style>{`
        .custom-marker {
          width: 32px;
          height: 32px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .custom-marker:hover {
          transform: scale(1.1);
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .custom-popup .mapboxgl-popup-content {
          background: #0f172a;
          color: white;
          border-radius: 8px;
          border: 1px solid #334155;
          padding: 0;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        .custom-popup .mapboxgl-popup-close-button {
          color: #94a3b8;
          font-size: 16px;
          padding: 4px;
        }
        
        .custom-popup .mapboxgl-popup-close-button:hover {
          color: white;
          background: none;
        }
        
        .popup-header {
          padding: 12px 16px 8px;
          border-bottom: 1px solid #1e293b;
        }
        
        .popup-header h3 {
          font-size: 14px;
          font-weight: 500;
          margin: 0 0 4px;
        }
        
        .popup-header p {
          font-size: 12px;
          color: #94a3b8;
          margin: 0;
        }
        
        .popup-content {
          padding: 8px 16px;
        }
        
        .popup-content p {
          font-size: 12px;
          margin: 6px 0;
        }
        
        .popup-address, .popup-phone {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }
        
        .icon {
          flex-shrink: 0;
        }
        
        .popup-footer {
          padding: 8px 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .view-details-btn, .get-directions-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-align: center;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 4px;
          text-decoration: none;
        }
        
        .view-details-btn {
          background: linear-gradient(to right, #2563eb, #1d4ed8);
          color: white;
        }
        
        .view-details-btn:hover {
          background: linear-gradient(to right, #1d4ed8, #1e40af);
        }
        
        .get-directions-btn {
          background: linear-gradient(to right, #22c55e, #16a34a);
          color: white;
        }
        
        .get-directions-btn:hover {
          background: linear-gradient(to right, #16a34a, #15803d);
        }
      `}</style>
    </div>
  );
}