import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Keyboard, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

type InputMode = "text" | "voice";

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [mode, setMode] = useState<InputMode>("text");
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError,
  } = useSpeechRecognition();

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

  const handleVoiceSend = () => {
    if (transcript.trim() && !disabled) {
      if (isListening) {
        stopListening();
      }
      onSend(transcript.trim());
      resetTranscript();
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    if (mode === "text") {
      textareaRef.current?.focus();
    }
  }, [mode]);

  useEffect(() => {
    if (mode === "voice") {
      setInput(transcript);
    }
  }, [transcript, mode]);

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
          <div className="space-y-4">
            {!isSupported && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.
                </AlertDescription>
              </Alert>
            )}
            {speechError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{speechError}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col items-center justify-center py-6 gap-4">
              <Button
                size="icon"
                variant={isListening ? "destructive" : "default"}
                className={cn(
                  "h-20 w-20 rounded-full transition-all",
                  isListening && "animate-pulse"
                )}
                onClick={toggleRecording}
                disabled={disabled || !isSupported}
                data-testid="button-record"
              >
                {isListening ? (
                  <MicOff className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                {isListening ? "Listening... Tap to stop" : "Tap to start recording"}
              </p>
              {isListening && (
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
            {transcript && (
              <div className="space-y-2">
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground mb-1">Transcript:</p>
                  <p className="text-base">{transcript}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleVoiceSend}
                    disabled={!transcript.trim() || disabled}
                    className="flex-1"
                    data-testid="button-send-voice"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Response
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetTranscript}
                    disabled={disabled}
                    data-testid="button-clear-transcript"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
