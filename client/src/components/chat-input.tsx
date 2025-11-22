import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

type InputMode = "text" | "voice";

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [mode, setMode] = useState<InputMode>("text");
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real implementation, this would start/stop Web Speech API
    // For now, it's a visual toggle
  };

  useEffect(() => {
    if (mode === "text") {
      textareaRef.current?.focus();
    }
  }, [mode]);

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant={mode === "text" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("text")}
            data-testid="button-mode-text"
          >
            <Keyboard className="h-4 w-4 mr-2" />
            Text
          </Button>
          <Button
            variant={mode === "voice" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("voice")}
            data-testid="button-mode-voice"
          >
            <Mic className="h-4 w-4 mr-2" />
            Voice
          </Button>
        </div>

        {mode === "text" ? (
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response..."
              className="resize-none min-h-[60px] max-h-32"
              disabled={disabled}
              data-testid="input-message"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              size="icon"
              className="h-[60px] w-[60px] flex-shrink-0"
              data-testid="button-send"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 gap-4">
            <Button
              size="icon"
              variant={isRecording ? "destructive" : "default"}
              className={cn(
                "h-20 w-20 rounded-full transition-all",
                isRecording && "animate-pulse"
              )}
              onClick={toggleRecording}
              disabled={disabled}
              data-testid="button-record"
            >
              {isRecording ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              {isRecording ? "Recording... Tap to stop" : "Tap to start recording"}
            </p>
            {isRecording && (
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 20 + 10}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
