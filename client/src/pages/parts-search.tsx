import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Search, 
  ShoppingBag, 
  MapPin, 
  Store, 
  ShoppingCart, 
  Check, 
  DollarSign,
  Loader2,
  Camera,
  Upload,
  FileImage,
  Sparkles,
  Map as MapIcon
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { identifyPartsFromJobImages, searchPartsByImage } from '@/lib/openai';
import { useToast } from '@/hooks/use-toast';
import { useMapboxToken } from '@/hooks/use-mapbox-token';
import IframeStoreMap from '@/components/map/iframe-store-map';
import TopNavigation from '@/components/layout/top-navigation';
import BottomNavigation from '@/components/layout/bottom-navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PartsSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [jobId, setJobId] = useState<string>('');
  const [selectedParts, setSelectedParts] = useState<Record<number, { added: boolean }>>({});
  const [searchType, setSearchType] = useState<'text' | 'image'>('text');
  const [imageData, setImageData] = useState<string | null>(null);
  const [aiGeneratedQuery, setAiGeneratedQuery] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Get available jobs for the dropdown
  const { data: jobs } = useQuery({
    queryKey: ['/api/technicians/1/jobs'],  // Hardcoded technician ID for now
    queryFn: async () => apiRequest('/api/technicians/1/jobs'),
  });

  // Search for parts by text query
  const { 
    data: textSearchResults, 
    refetch: refetchTextSearch, 
    isLoading: isLoadingTextSearch, 
    isError: isErrorTextSearch
  } = useQuery({
    queryKey: ['/api/stores/search', searchQuery],
    queryFn: async () => {
      return apiRequest(`/api/stores/search?query=${encodeURIComponent(searchQuery)}`);
    },
    enabled: false,
    retry: false
  });
  
  // Search for parts by image
  const {
    data: imageSearchResults,
    refetch: refetchImageSearch,
    isLoading: isLoadingImageSearch,
    isError: isErrorImageSearch
  } = useQuery({
    queryKey: ['/api/stores/search-by-image', imageData],
    queryFn: async () => {
      if (!imageData) return null;
      return searchPartsByImage(imageData);
    },
    enabled: false,
    retry: false
  });
  
  // Analyze image from a job
  const {
    data: jobImageAnalysisResults,
    refetch: refetchJobImageAnalysis,
    isLoading: isLoadingJobImageAnalysis,
    isError: isErrorJobImageAnalysis
  } = useQuery({
    queryKey: ['/api/jobs/identify-parts', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      return identifyPartsFromJobImages(parseInt(jobId));
    },
    enabled: false,
    retry: false
  });
  
  // Get mapbox token using our token hook
  const { token: mapboxToken } = useMapboxToken();
  
  // Compute derived values
  const searchResults = searchType === 'text' ? textSearchResults?.stores : imageSearchResults?.stores;
  const aiGeneratedDescription = 
    searchType === 'image' && imageSearchResults?.query ? 
    `AI identified: "${imageSearchResults.query}"` : null;
  const isLoading = 
    (searchType === 'text' && isLoadingTextSearch) || 
    (searchType === 'image' && isLoadingImageSearch) ||
    isLoadingJobImageAnalysis;
  const isError = 
    (searchType === 'text' && isErrorTextSearch) || 
    (searchType === 'image' && isErrorImageSearch) ||
    isErrorJobImageAnalysis;

  // Format price as currency
  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };
  
  // Add a part to the estimate
  const addPartToEstimate = async (part: any, store: any) => {
    if (!jobId) {
      toast({
        title: 'No job selected',
        description: 'Please select a job to add parts to.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Create a new estimate item for this part
      const response = await apiRequest('/api/estimate-items', {
        method: 'POST',
        body: JSON.stringify({
          jobId: parseInt(jobId),
          type: 'material',
          description: part.name,
          quantity: 1,
          unitPrice: part.price,
          storeSource: store.name
        })
      } as RequestInit);
      
      // Update UI to show item was added
      const partKey = part.id;
      setSelectedParts({...selectedParts, [partKey]: {...part, added: true}});
      
      toast({
        title: 'Part added to estimate',
        description: `${part.name} has been added to the job estimate.`,
      });
      
      return response;
    } catch (error) {
      toast({
        title: 'Error adding part',
        description: 'Failed to add part to the estimate. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchType('text');
      refetchTextSearch();
    }
  };
  
  // Handle image-based part search
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const imageData = event.target.result as string;
          setImageData(imageData);
          setSearchType('image');
          refetchImageSearch();
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Handle identifying parts from a job's photos
  const handleIdentifyFromJobPhotos = () => {
    if (!jobId) {
      toast({
        title: 'No job selected',
        description: 'Please select a job to analyze photos from.',
        variant: 'destructive',
      });
      return;
    }
    
    refetchJobImageAnalysis();
  };
  
  // Capture image from camera
  const captureImage = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      setTimeout(() => {
        // Create canvas to capture frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Get image data
          const capturedImage = canvas.toDataURL('image/jpeg');
          
          // Stop stream
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
          
          // Process image
          setImageData(capturedImage);
          setSearchType('image');
          refetchImageSearch();
        }
        
        // Stop stream
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }, 500);
    } catch (error) {
      toast({
        title: 'Camera Error',
        description: 'Could not access camera. Please check permissions and try again.',
        variant: 'destructive',
      });
    }
  };

  // Check if a part has been added to the estimate
  const isPartAdded = (partId: number) => {
    return !!selectedParts[partId]?.added;
  };

  return (
    <div className="flex flex-col min-h-screen overflow-auto pb-16 md:pb-0">
      <TopNavigation />
      
      <div className="container py-6 flex-1">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Hardware Store Parts Search</h1>
            <p className="text-muted-foreground">
              Search for parts across all local hardware stores
            </p>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Options</CardTitle>
            <CardDescription>
              Find parts at local hardware stores and add them to a job estimate
            </CardDescription>
            {aiGeneratedDescription && (
              <Badge variant="outline" className="mt-2 text-blue-400 border-blue-400">
                {aiGeneratedDescription}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="job-select" className="text-sm font-medium">
                  Select Job
                </label>
                <Select value={jobId} onValueChange={setJobId}>
                  <SelectTrigger id="job-select">
                    <SelectValue placeholder="Select a job..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs?.map((job: any) => (
                      <SelectItem key={job.id} value={job.id.toString()}>
                        WO #{job.workOrderNumber} - {job.description.substring(0, 30)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="text">Text Search</TabsTrigger>
                  <TabsTrigger value="camera">Camera</TabsTrigger>
                  <TabsTrigger value="job">From Job</TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="mt-0">
                  <form onSubmit={handleTextSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="text"
                        placeholder="Search for parts (e.g., copper pipe, sink faucet)..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button type="submit" disabled={!searchQuery.trim() || isLoading}>
                      {isLoadingTextSearch ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                      Search
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="camera" className="mt-0">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={captureImage} 
                        className="flex-1 h-20" 
                        disabled={isLoading}
                        variant="outline"
                      >
                        <div className="flex flex-col items-center">
                          <Camera className="h-6 w-6 mb-2" />
                          <span>Take Photo</span>
                        </div>
                      </Button>
                      
                      <Button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="flex-1 h-20" 
                        disabled={isLoading}
                        variant="outline"
                      >
                        <div className="flex flex-col items-center">
                          <FileImage className="h-6 w-6 mb-2" />
                          <span>Upload Image</span>
                        </div>
                      </Button>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                    
                    {imageData && (
                      <div className="w-full flex justify-center border border-border rounded-md p-2">
                        <img 
                          src={imageData} 
                          alt="Uploaded part" 
                          className="max-h-48 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="job" className="mt-0">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Use AI to analyze the most recent photo from the selected job and find matching parts.
                    </p>
                    
                    <Button 
                      onClick={handleIdentifyFromJobPhotos} 
                      className="w-full"
                      disabled={!jobId || isLoadingJobImageAnalysis}
                    >
                      {isLoadingJobImageAnalysis ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Analyze Job Photos
                    </Button>
                    
                    {jobImageAnalysisResults && (
                      <Card className="mt-4 border-blue-500">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-blue-400" />
                            AI Analysis Results
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <span className="font-semibold">Part Type:</span> {jobImageAnalysisResults.partIdentified.partType}
                            </div>
                            <div>
                              <span className="font-semibold">Description:</span> {jobImageAnalysisResults.partIdentified.description}
                            </div>
                            <div>
                              <span className="font-semibold">Estimated Cost:</span> {formatPrice(jobImageAnalysisResults.partIdentified.estimatedReplacementCost)}
                            </div>
                            <div>
                              <span className="font-semibold">Possible Issues:</span>
                              <ul className="list-disc list-inside ml-2 mt-1">
                                {jobImageAnalysisResults.partIdentified.possibleIssues.map((issue: string, i: number) => (
                                  <li key={i}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                            <Button 
                              onClick={() => {
                                setSearchQuery(jobImageAnalysisResults.partIdentified.partType);
                                setSearchType('text');
                                setTimeout(() => refetchTextSearch(), 100);
                              }}
                              variant="outline"
                              className="w-full mt-2 border-blue-400 text-blue-400 hover:bg-blue-400/10"
                            >
                              <Search className="h-4 w-4 mr-2" />
                              Search for this part
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-muted-foreground">Searching local hardware stores...</p>
            </div>
          )}
          
          {isError && (
            <Card className="border-destructive">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <p className="font-medium text-destructive mb-2">Error searching for parts</p>
                  <p className="text-muted-foreground">
                    There was a problem connecting to local hardware stores. Please try again later.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {!isLoading && !isError && searchResults && (
            searchResults.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <ShoppingBag className="h-8 w-8 mb-4 text-muted-foreground" />
                    <p className="font-medium mb-2">No parts found</p>
                    <p className="text-muted-foreground">
                      We couldn't find any parts matching "{searchQuery}" in local stores.
                      Try different search terms or check back later.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              searchResults.map((store: any) => (
                <Card key={store.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Store className="h-5 w-5" />
                          {store.name}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {store.distance ? `${store.distance} away` : store.address}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {/* Add store location map */}
                    {store.latitude && store.longitude && (
                      <div className="mb-4 border border-border rounded-md overflow-hidden">
                        <IframeStoreMap 
                          stores={[store]} 
                          selectedPartName={store.parts && store.parts[0] ? store.parts[0].name : 'Parts'}
                          height="250px"
                        />
                      </div>
                    )}
                    <div className="space-y-3">
                      {store.parts.map((part: any) => {
                        const isAdded = isPartAdded(part.id);
                        return (
                          <div key={part.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                            <div className="flex items-start gap-3">
                              <div className="h-12 w-12 rounded-md bg-background flex items-center justify-center shrink-0">
                                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{part.name}</p>
                                <p className="text-sm text-muted-foreground line-clamp-2">{part.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm font-medium text-primary">
                                    {formatPrice(part.price)}
                                  </span>
                                  <Badge variant={part.inStock ? "outline" : "secondary"}>
                                    {part.inStock ? "In Stock" : "Out of Stock"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant={isAdded ? "secondary" : "default"}
                              onClick={() => addPartToEstimate(part, store)}
                              disabled={isAdded || !part.inStock || !jobId}
                              className="ml-4"
                            >
                              {isAdded ? (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Added
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Add to Estimate
                                </>
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          )}
          
          {!searchResults && !isLoading && (
            <Card>
              <CardContent className="p-10">
                <div className="flex flex-col items-center text-center">
                  <Search className="h-12 w-12 mb-4 text-muted-foreground" />
                  <p className="font-medium text-lg mb-2">Search for Hardware Store Parts</p>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Enter a search term above to find parts at local hardware stores. 
                    You can add parts directly to a job's estimate.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}