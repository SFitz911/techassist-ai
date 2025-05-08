import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { enhanceNote } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Note {
  id: number;
  enhancedContent: string | null;
}

export default function TextEnhancement({ note }: { note: Note }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // AI enhancement mutation
  const enhanceMutation = useMutation({
    mutationFn: () => enhanceNote(note.id),
    onSuccess: (data) => {
      setIsOpen(true);
      toast({
        title: "Note enhanced",
        description: "Your note has been professionally enhanced by AI.",
      });
    },
    onError: (error) => {
      toast({
        title: "Enhancement failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // If note already has enhanced content, show it in a collapsible
  if (note.enhancedContent) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            size="sm"
          >
            <Sparkles className="h-3.5 w-3.5 mr-2 text-primary" />
            {isOpen ? "Hide" : "Show"} Enhanced Version
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 p-3 bg-primary/5 rounded-md text-sm">
          {note.enhancedContent}
        </CollapsibleContent>
      </Collapsible>
    );
  }
  
  // If no enhanced content yet, show enhance button
  return (
    <Button 
      variant="outline" 
      size="sm"
      className="mt-2"
      onClick={() => enhanceMutation.mutate()}
      disabled={enhanceMutation.isPending}
    >
      {enhanceMutation.isPending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
          Enhancing...
        </>
      ) : (
        <>
          <Sparkles className="h-3.5 w-3.5 mr-2" />
          Enhance with AI
        </>
      )}
    </Button>
  );
}
