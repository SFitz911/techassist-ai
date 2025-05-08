import { useState, useEffect, useCallback } from "react";

// Define the SpeechRecognition interface since TypeScript doesn't include it by default
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

// Declare the window.SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false);
  
  // Initialize speech recognition
  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setHasRecognitionSupport(true);
      
      const instance = new SpeechRecognition();
      instance.continuous = true;
      instance.interimResults = true;
      instance.lang = 'en-US';
      
      // Handle speech recognition results
      instance.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = '';
        
        // Combine all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        
        setTranscript(prev => {
          // Only update if this is a final result or significantly different
          const isFinal = event.results[event.results.length - 1].isFinal;
          if (isFinal || prev.trim() !== currentTranscript.trim()) {
            return currentTranscript;
          }
          return prev;
        });
      };
      
      // Handle errors
      instance.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      // Handle end of speech recognition
      instance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(instance);
    }
    
    // Cleanup
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);
  
  // Start listening
  const startListening = useCallback(() => {
    if (recognition) {
      try {
        setTranscript("");
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    }
  }, [recognition]);
  
  // Stop listening
  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);
  
  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport
  };
}
