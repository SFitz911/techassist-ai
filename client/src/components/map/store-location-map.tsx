import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { MapPin, Home, ArrowRight, Phone, Navigation, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMapboxToken } from '@/hooks/use-mapbox-token';
import { MockStore } from '@/lib/mock-stores';

// Import Mapbox CSS
import 'mapbox-gl/dist/mapbox-gl.css';

// Import from mapbox subpath for newer react-map-gl v8
import Map from 'react-map-gl/mapbox';
import { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';

interface StoreLocationMapProps {
  stores: MockStore[];
  selectedPartName?: string;
}

export default function StoreLocationMap({ stores, selectedPartName }: StoreLocationMapProps) {
  const [viewState, setViewState] = useState({
    longitude: -95.3698,  // Default to center of US
    latitude: 29.7604,    // Houston, TX
    zoom: 10
  });
  
  const [selectedStore, setSelectedStore] = useState<MockStore | null>(null);
  const { token: mapboxToken, isLoading: isTokenLoading } = useMapboxToken();
  
  // Calculate the bounds for all store locations to auto-center the map
  useEffect(() => {
    if (stores.length === 0) return;
    
    // Find bounds
    const bounds = stores.reduce(
      (acc: any, store) => {
        const { longitude, latitude } = store;
        return {
          minLng: Math.min(acc.minLng, longitude),
          maxLng: Math.max(acc.maxLng, longitude),
          minLat: Math.min(acc.minLat, latitude),
          maxLat: Math.max(acc.maxLat, latitude),
        };
      },
      {
        minLng: Infinity,
        maxLng: -Infinity,
        minLat: Infinity,
        maxLat: -Infinity,
      }
    );
    
    // If we have only one store, zoom in more
    const zoom = stores.length === 1 ? 14 : 12;
    
    // Center the map on the average of coordinates
    setViewState({
      longitude: (bounds.minLng + bounds.maxLng) / 2,
      latitude: (bounds.minLat + bounds.maxLat) / 2,
      zoom
    });
  }, [stores]);
  
  // Handle marker click
  const handleMarkerClick = (store: MockStore) => {
    setSelectedStore(store);
  };
  
  console.log("StoreLocationMap rendering with token:", { 
    hasToken: !!mapboxToken, 
    isTokenLoading, 
    storeCount: stores.length 
  });
  
  return (
    <div className="h-full w-full flex flex-col bg-background rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-3 border-b bg-gradient-to-r from-slate-900 to-slate-800">
        <h2 className="text-xl font-bold flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-yellow-500" />
          Store Locations
        </h2>
        <p className="text-sm text-amber-500 font-medium mt-1">
          {stores.length} store{stores.length !== 1 ? 's' : ''} near you
          {selectedPartName && <span> with <span className="font-bold">{selectedPartName}</span></span>}
        </p>
      </div>
      
      <div className="flex-1 relative min-h-[300px]">
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
            
            {stores.map((store) => (
              <Marker
                key={store.id}
                longitude={store.longitude}
                latitude={store.latitude}
                onClick={(e: any) => {
                  // Prevent click from propagating to the map
                  e.originalEvent.stopPropagation();
                  handleMarkerClick(store);
                }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white 
                            bg-orange-500 hover:bg-orange-600 border-2 border-orange-300
                            transition-all duration-300 transform hover:scale-110 cursor-pointer z-20"
                >
                  <Home className="h-5 w-5" />
                </div>
              </Marker>
            ))}
            
            {selectedStore && (
              <Popup
                longitude={selectedStore.longitude}
                latitude={selectedStore.latitude}
                closeOnClick={false}
                onClose={() => setSelectedStore(null)}
                className="custom-popup-content w-64"
              >
                <Card className="w-full border-0 shadow-none">
                  <CardHeader className="p-3 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base flex items-center">
                          <img 
                            src={selectedStore.logo} 
                            alt={selectedStore.name}
                            className="h-5 w-5 mr-2"
                          />
                          {selectedStore.name}
                        </CardTitle>
                        <CardDescription>{selectedStore.distance || '2.3 miles away'}</CardDescription>
                      </div>
                      <Badge 
                        className="bg-green-900/30 text-green-500 border-green-500/50 border px-3"
                      >
                        Open
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 pb-2 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-red-500" />
                      <span>
                        {selectedStore.address}, {selectedStore.city}, {selectedStore.state} {selectedStore.zipCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-500" />
                      <a 
                        href={`tel:${selectedStore.phone}`} 
                        className="hover:underline text-green-500"
                      >
                        {selectedStore.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-blue-500 text-blue-500">Hours: {selectedStore.hours}</Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="p-3 pt-0 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2 w-full mb-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
                        onClick={() => {
                          window.open(`https://www.${selectedStore.name.toLowerCase().replace(' ', '')}.com`, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Website
                      </Button>
                    
                      <Button 
                        size="sm"
                        variant="outline"
                        className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                        onClick={() => {
                          window.location.href = `tel:${selectedStore.phone}`;
                        }}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </div>
                    
                    <Button 
                      size="sm"
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-0"
                      onClick={() => {
                        const address = `${selectedStore.address}, ${selectedStore.city}, ${selectedStore.state} ${selectedStore.zipCode}`;
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
    </div>
  );
}