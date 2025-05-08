import { MockStore } from '@/lib/mock-stores';
import { ExternalLink, MapPin, Phone, Navigation, Clock, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FallbackStoreMapProps {
  stores: MockStore[];
  selectedPartName?: string;
  height?: string;
}

export default function FallbackStoreMap({ 
  stores, 
  selectedPartName,
  height = '300px' 
}: FallbackStoreMapProps) {
  // Determine available features in stores
  const hasPhoneNumbers = stores.some(store => store.phone);
  const hasHours = stores.some(store => store.hours);
  
  return (
    <div className="w-full rounded-md overflow-hidden bg-background" style={{ height: 'auto', minHeight: height, maxHeight: '80vh' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 border-b bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-white flex items-center">
            <Store className="h-4 w-4 mr-2" />
            <span className="text-amber-400 font-bold">{stores.length}</span> 
            <span className="ml-1">Store{stores.length !== 1 ? 's' : ''} Found</span>
          </h3>
          {selectedPartName && (
            <Badge variant="outline" className="mt-1 bg-amber-500/10 text-amber-400 border-amber-500/30">
              Searching for: {selectedPartName}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Store list with enhanced styling */}
      <div className="p-3 overflow-auto" style={{ maxHeight: `calc(${height} - 60px)` }}>
        <div className="grid grid-cols-1 gap-3">
          {stores.map(store => (
            <Card 
              key={store.id}
              className="overflow-hidden border-slate-700/50 bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                    {store.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-lg">{store.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {store.distance || '2.3 miles away'}
                      </Badge>
                      {(store as any).parts && (store as any).parts.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                          {(store as any).parts.length} items in stock
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm text-slate-300">
                    <MapPin className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <span>{store.address}, {store.city}, {store.state} {store.zipCode}</span>
                  </div>
                  
                  {hasPhoneNumbers && store.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Phone className="h-4 w-4 text-green-500 shrink-0" />
                      <span>{store.phone}</span>
                    </div>
                  )}
                  
                  {hasHours && store.hours && (
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                      <span>{store.hours}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {store.phone && (
                    <Button 
                      size="sm"
                      variant="outline"
                      className="bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20 hover:text-green-300"
                      asChild
                    >
                      <a href={`tel:${store.phone}`}>
                        <Phone className="h-3.5 w-3.5 mr-1.5" />
                        Call Store
                      </a>
                    </Button>
                  )}
                  
                  <Button 
                    size="sm"
                    variant="outline"
                    className="bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20 hover:text-blue-300"
                    asChild
                  >
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${store.name} ${store.address}, ${store.city}, ${store.state} ${store.zipCode}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation className="h-3.5 w-3.5 mr-1.5" />
                      Get Directions
                    </a>
                  </Button>
                  
                  {store.latitude && store.longitude && (
                    <Button 
                      size="sm"
                      variant="outline"
                      className="bg-slate-500/10 text-slate-400 border-slate-500/30 hover:bg-slate-500/20 hover:text-slate-300"
                      asChild
                    >
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        View on Google Maps
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}