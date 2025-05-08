import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Save, Sparkles, Mic, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SpeechRecognition from "@/components/ai/speech-recognition";
import TextEnhancement from "@/components/ai/text-enhancement";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Note {
  id: number;
  jobId: number;
  content: string;
  timestamp: string;
  technicianId: number;
  enhancedContent: string | null;
}

export default function NotesTab({ jobId, technicianId }: { jobId: number, technicianId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  
  // Fetch notes for this job
  const { data: notes, isLoading } = useQuery({
    queryKey: [`/api/jobs/${jobId}/notes`],
    retry: false,
  });
  
  // Save a new note
  const saveNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/notes', {
        jobId,
        technicianId,
        content
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}/notes`] });
      setNewNote("");
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving note",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle save button click
  const handleSaveNote = () => {
    if (newNote.trim()) {
      saveNoteMutation.mutate(newNote);
    }
  };
  
  // Handle speech recognition result
  const handleSpeechResult = (text: string) => {
    setNewNote((prev) => prev + " " + text);
    setIsSpeechActive(false);
  };

  return (
    <div className="p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Job Notes</h2>
      
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="mb-2">
            <Textarea
              placeholder="Add your note here..."
              className="min-h-[120px]"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={() => setIsSpeechActive(true)}
              disabled={isSpeechActive}
            >
              <Mic className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={handleSaveNote}
              disabled={!newNote.trim() || saveNoteMutation.isPending}
            >
              {saveNoteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Note
                </>
              )}
            </Button>
          </div>
          
          {isSpeechActive && (
            <SpeechRecognition 
              onResult={handleSpeechResult}
              onCancel={() => setIsSpeechActive(false)}
            />
          )}
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="mb-4">
              <CardContent className="p-4">
                <div className="h-4 bg-muted animate-pulse rounded mb-2 w-1/3" />
                <div className="h-20 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notes && notes.length > 0 ? (
        <div className="space-y-4">
          {notes.map((note: Note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            No notes found for this job. Add your first note using the form above.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function NoteCard({ note }: { note: Note }) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Pencil className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {format(new Date(note.timestamp), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
          {note.enhancedContent && (
            <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Enhanced
            </div>
          )}
        </div>
        
        <p className="mb-4">{note.content}</p>
        
        <TextEnhancement note={note} />
      </CardContent>
    </Card>
  );
}
