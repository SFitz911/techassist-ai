import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Mic, MicOff } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

interface SpeechRecognitionProps {
  onResult: (text: string) => void;
  onCancel: () => void;
}

export default function SpeechRecognition({ onResult, onCancel }: SpeechRecognitionProps) {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(true);
  
  const { 
    startListening, 
    stopListening, 
    hasRecognitionSupport,
    transcript: speechTranscript,
    isListening: speechIsListening
  } = useSpeechRecognition();
  
  // Start listening when component mounts
  useEffect(() => {
    if (hasRecognitionSupport) {
      startListening();
    }
    return () => {
      stopListening();
    };
  }, [hasRecognitionSupport, startListening, stopListening]);
  
  // Update transcript when speech recognition provides results
  useEffect(() => {
    setTranscript(speechTranscript);
  }, [speechTranscript]);
  
  // Update isListening state based on the speech recognition state
  useEffect(() => {
    setIsListening(speechIsListening);
  }, [speechIsListening]);
  
  // Handle toggle listening
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setTranscript("");
      startListening();
    }
  };
  
  // Handle use text
  const handleUseText = () => {
    if (transcript) {
      onResult(transcript);
    } else {
      onCancel();
    }
  };

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-sm">Speech Recognition</h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {!hasRecognitionSupport ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Your browser doesn't support speech recognition.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-secondary/50 p-3 rounded-md min-h-[100px] mb-3">
              {transcript ? (
                <p>{transcript}</p>
              ) : (
                <p className="text-muted-foreground">
                  {isListening ? "Speak now..." : "Click the microphone to start speaking"}
                </p>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                onClick={toggleListening}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              
              <Button 
                onClick={handleUseText}
                disabled={!transcript}
              >
                Use Text
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
