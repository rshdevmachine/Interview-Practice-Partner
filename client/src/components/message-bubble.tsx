import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "ai" | "user";
  content: string;
  timestamp: Date;
}

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isAI = role === "ai";

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
      
      <div className={cn("flex flex-col gap-1 max-w-[75%]", !isAI && "items-end")}>
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
        <span className="text-xs text-muted-foreground px-2">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}
