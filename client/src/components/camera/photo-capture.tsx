import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, X, Image, Save, Loader2 } from "lucide-react";
import { usePhotoCapture } from "@/hooks/use-photo-capture";
import { useToast } from "@/hooks/use-toast";

interface PhotoCaptureProps {
  onCapture: (dataUrl: string, caption: string) => void;
  onCancel: () => void;
  photoType: 'before' | 'after';
}

export default function PhotoCapture({ onCapture, onCancel, photoType }: PhotoCaptureProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [caption, setCaption] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { initializeCamera, startVideoStream, stopVideoStream, capturePhoto } = usePhotoCapture();
  
  // Initialize camera on component mount
  useEffect(() => {
    const setup = async () => {
      try {
        if (videoRef.current) {
          await initializeCamera();
          await startVideoStream(videoRef.current);
        }
      } catch (error) {
        toast({
          title: "Camera Error",
          description: "Could not access the camera. Please check permissions.",
          variant: "destructive",
        });
        onCancel();
      }
    };
    
    setup();
    
    // Clean up on unmount
    return () => {
      stopVideoStream();
    };
  }, [initializeCamera, startVideoStream, stopVideoStream, onCancel, toast]);
  
  // Handle capture click
  const handleCaptureClick = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      const dataUrl = capturePhoto(videoRef.current, canvasRef.current);
      setCapturedImage(dataUrl);
      stopVideoStream();
    } catch (error) {
      toast({
        title: "Capture Error",
        description: "Could not capture photo.",
        variant: "destructive",
      });
    }
  };
  
  // Handle retake
  const handleRetake = async () => {
    setCapturedImage(null);
    setCaption("");
    
    try {
      if (videoRef.current) {
        await startVideoStream(videoRef.current);
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not restart camera.",
        variant: "destructive",
      });
      onCancel();
    }
  };
  
  // Handle save
  const handleSave = () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    onCapture(capturedImage, caption);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">
          {capturedImage ? 'Review Photo' : 'Take a Photo'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col p-4">
        <div className="relative rounded-lg overflow-hidden mb-4 bg-black flex-1 flex items-center justify-center">
          {capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="object-contain max-h-full max-w-full"
            />
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full h-14 w-14 bg-background/80 hover:bg-background"
                  onClick={handleCaptureClick}
                >
                  <Camera className="h-6 w-6" />
                </Button>
              </div>
            </>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        {capturedImage && (
          <>
            <div className="mb-4">
              <Textarea
                placeholder="Add a caption for this photo..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="resize-none"
              />
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleRetake}>
                <Camera className="mr-2 h-4 w-4" />
                Retake
              </Button>
              
              <Button onClick={handleSave} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save {photoType === 'before' ? 'Before' : 'After'} Photo
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
