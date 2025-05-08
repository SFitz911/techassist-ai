import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Image, PlusCircle, Loader2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import PhotoCapture from "@/components/camera/photo-capture";
import ImageAnalysis from "@/components/ai/image-analysis";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Photo {
  id: number;
  jobId: number;
  caption: string;
  dataUrl: string;
  timestamp: string;
  aiAnalysis: any;
  beforePhoto: boolean;
}

export default function PhotosTab({ jobId }: { jobId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [captureMode, setCaptureMode] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photoType, setPhotoType] = useState<'before' | 'after'>('before');
  
  // Fetch photos for this job
  const { data: photos, isLoading } = useQuery({
    queryKey: [`/api/jobs/${jobId}/photos`],
    retry: false,
  });
  
  // Save a new photo
  const savePhotoMutation = useMutation({
    mutationFn: async (data: { dataUrl: string; caption: string; beforePhoto: boolean }) => {
      const response = await apiRequest('POST', '/api/photos', {
        jobId,
        dataUrl: data.dataUrl,
        caption: data.caption,
        beforePhoto: data.beforePhoto
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}/photos`] });
      setCaptureMode(false);
      toast({
        title: "Photo saved",
        description: "The photo has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving photo",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle photo capture completion
  const handlePhotoCapture = (dataUrl: string, caption: string) => {
    savePhotoMutation.mutate({ 
      dataUrl, 
      caption, 
      beforePhoto: photoType === 'before' 
    });
  };
  
  // Cancel photo capture
  const handleCaptureCancel = () => {
    setCaptureMode(false);
  };
  
  // Filter photos by type
  const beforePhotos = photos?.filter((photo: Photo) => photo.beforePhoto) || [];
  const afterPhotos = photos?.filter((photo: Photo) => !photo.beforePhoto) || [];
  
  if (captureMode) {
    return (
      <PhotoCapture 
        onCapture={handlePhotoCapture}
        onCancel={handleCaptureCancel}
        photoType={photoType}
      />
    );
  }

  return (
    <div className="p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Job Photos</h2>
        <Tabs defaultValue="before" onValueChange={(v) => setPhotoType(v as 'before' | 'after')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="before">Before</TabsTrigger>
            <TabsTrigger value="after">After</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Button 
        className="w-full mb-4"
        onClick={() => setCaptureMode(true)}
      >
        <Camera className="mr-2 h-4 w-4" />
        {photoType === 'before' ? 'Take Before Photo' : 'Take After Photo'}
      </Button>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-muted animate-pulse" />
              <CardContent className="p-3">
                <div className="h-5 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {photoType === 'before' ? (
              beforePhotos.length > 0 ? (
                beforePhotos.map((photo: Photo) => (
                  <PhotoCard 
                    key={photo.id} 
                    photo={photo} 
                    onClick={() => setSelectedPhoto(photo)} 
                  />
                ))
              ) : (
                <EmptyState type="before" />
              )
            ) : (
              afterPhotos.length > 0 ? (
                afterPhotos.map((photo: Photo) => (
                  <PhotoCard 
                    key={photo.id} 
                    photo={photo} 
                    onClick={() => setSelectedPhoto(photo)} 
                  />
                ))
              ) : (
                <EmptyState type="after" />
              )
            )}
          </div>
          
          {/* Photo detail dialog */}
          <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Photo Details</DialogTitle>
              </DialogHeader>
              
              {selectedPhoto && (
                <div>
                  <div className="relative">
                    <img 
                      src={selectedPhoto.dataUrl} 
                      alt={selectedPhoto.caption || 'Job photo'} 
                      className="w-full rounded-md"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <p className="font-medium">{selectedPhoto.caption || 'No caption'}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedPhoto.timestamp), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  
                  <ImageAnalysis photo={selectedPhoto} />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

function PhotoCard({ photo, onClick }: { photo: Photo, onClick: () => void }) {
  return (
    <Card className="overflow-hidden cursor-pointer hover:bg-secondary/40 transition-colors" onClick={onClick}>
      <div className="aspect-video bg-muted relative overflow-hidden">
        <img 
          src={photo.dataUrl} 
          alt={photo.caption || 'Job photo'} 
          className="w-full h-full object-cover"
        />
        {photo.aiAnalysis && (
          <div className="absolute top-2 right-2 bg-primary/90 rounded-full p-1">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <p className="font-medium truncate">{photo.caption || 'No caption'}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(photo.timestamp), 'MMM d, yyyy h:mm a')}
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ type }: { type: 'before' | 'after' }) {
  return (
    <div className="text-center py-12 border border-dashed rounded-lg">
      <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No {type} photos</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Take a {type} photo of the job site
      </p>
      <div className="flex justify-center mt-4">
        <Button variant="outline" className="gap-2" onClick={() => {}}>
          <PlusCircle className="h-4 w-4" />
          Add {type} photo
        </Button>
      </div>
    </div>
  );
}
