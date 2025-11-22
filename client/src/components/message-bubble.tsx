import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";

interface MessageBubbleProps {
  role: "ai" | "user";
  content: string;
  timestamp: Date;
  autoSpeak?: boolean;
}

export function MessageBubble({ role, content, timestamp, autoSpeak = false }: MessageBubbleProps) {
  const isAI = role === "ai";
  const { speak, stop, pause, isPaused, isPlaying, isSupported } = useTextToSpeech();
  const [hasSpoken, setHasSpoken] = useState(false);

  const handlePlayAudio = () => {
    if (!isAI) return;
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      speak(content);
    } else {
      speak(content);
      setHasSpoken(true);
    }
  };

  const handleStop = () => {
    if (!isAI) return;
    stop();
  };

  // Auto-speak AI messages on component mount if requested
  if (autoSpeak && isAI && !hasSpoken && isSupported) {
    setHasSpoken(true);
    speak(content);
  }

  return (
    <div 
      className={cn(
        "flex gap-3 mb-4 animate-in slide-in-from-bottom-2 duration-150",
        isAI ? "flex-row" : "flex-row-reverse"
      )}
      data-testid={`message-${role}`}
    >
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarFallback className={isAI ? "bg-primary text-primary-foreground" : "bg-muted"}>
          {isAI ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn("flex flex-col gap-2 max-w-[75%]", !isAI && "items-end")}>
        <div 
          className={cn(
            "rounded-md px-4 py-3",
            isAI 
              ? "bg-card border border-card-border" 
              : "bg-primary text-primary-foreground"
          )}
        >
          <p className={cn(
            "text-base leading-relaxed whitespace-pre-wrap",
            isAI ? "font-medium" : ""
          )}>
            {content}
          </p>
        </div>
        
        {isAI && isSupported && (
          <div className="flex gap-1 px-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handlePlayAudio}
              className="h-7 w-7"
              data-testid="button-play-audio"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            {isPlaying && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleStop}
                className="h-7 w-7"
                data-testid="button-stop-audio"
              >
                <Square className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        
        <span className="text-xs text-muted-foreground px-2">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}
