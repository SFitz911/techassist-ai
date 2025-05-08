import { useState, useCallback } from "react";

export function usePhotoCapture() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Request and check camera permissions
  const initializeCamera = useCallback(async () => {
    try {
      const mediaSupported = 'mediaDevices' in navigator;
      
      if (!mediaSupported) {
        throw new Error("Media devices not supported in this browser");
      }
      
      // Reset any previous errors
      setError(null);
      
      // We don't actually start the stream here, just check permissions
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Camera access denied";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);
  
  // Start the video stream
  const startVideoStream = useCallback(async (videoElement: HTMLVideoElement) => {
    try {
      // Request camera with preferred settings
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Prefer back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      // Save the stream for cleanup later
      setStream(stream);
      
      // Connect stream to video element
      videoElement.srcObject = stream;
      
      // Wait for the video to be ready
      return new Promise<void>((resolve) => {
        videoElement.onloadedmetadata = () => {
          videoElement.play().then(resolve);
        };
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start camera";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);
  
  // Stop the video stream
  const stopVideoStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);
  
  // Capture a photo from the video
  const capturePhoto = useCallback((videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) => {
    const width = videoElement.videoWidth;
    const height = videoElement.videoHeight;
    
    // Set canvas dimensions to match video
    canvasElement.width = width;
    canvasElement.height = height;
    
    // Draw the current video frame to the canvas
    const context = canvasElement.getContext('2d');
    if (!context) throw new Error("Could not get canvas context");
    
    context.drawImage(videoElement, 0, 0, width, height);
    
    // Convert the canvas to a data URL
    return canvasElement.toDataURL('image/jpeg', 0.9);
  }, []);
  
  return {
    initializeCamera,
    startVideoStream,
    stopVideoStream,
    capturePhoto,
    error
  };
}
