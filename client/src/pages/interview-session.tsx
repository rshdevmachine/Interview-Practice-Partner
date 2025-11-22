import { useEffect, useRef, useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Session, Message, Feedback } from "@shared/schema";
import { MessageBubble } from "@/components/message-bubble";
import { FeedbackCard } from "@/components/feedback-card";
import { ChatInput } from "@/components/chat-input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { StopCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function InterviewSession() {
  const [, params] = useRoute("/session/:id");
  const sessionId = params?.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showEndDialog, setShowEndDialog] = useState(false);

  const { data: session, isLoading: sessionLoading } = useQuery<Session>({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/sessions", sessionId, "messages"],
    enabled: !!sessionId,
  });

  const { data: feedbackList = [] } = useQuery<Feedback[]>({
    queryKey: ["/api/sessions", sessionId, "feedback"],
    enabled: !!sessionId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/sessions/${sessionId}/messages`, {
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "feedback"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/sessions/${sessionId}/end`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Session Ended",
        description: "Your interview session has been completed.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to end session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (content: string) => {
    sendMessageMutation.mutate(content);
  };

  const handleEndSession = () => {
    setShowEndDialog(true);
  };

  const confirmEndSession = () => {
    setShowEndDialog(false);
    endSessionMutation.mutate();
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (sessionLoading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="border-b p-4">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-20 w-3/4" />
          <Skeleton className="h-20 w-3/4 ml-auto" />
          <Skeleton className="h-20 w-3/4" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Session not found</h2>
          <p className="text-muted-foreground mb-4">The interview session you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    software_engineer: "Software Engineer",
    product_manager: "Product Manager",
    retail_associate: "Retail Associate",
    customer_service: "Customer Service",
    sales: "Sales",
    healthcare: "Healthcare",
    teaching: "Teaching",
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b p-4 bg-background">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold" data-testid="text-session-title">
              {roleLabels[session.role]} Interview
            </h1>
            <p className="text-sm text-muted-foreground">
              {session.status === "active" ? "In progress" : "Completed"}
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={handleEndSession}
            disabled={session.status !== "active" || endSessionMutation.isPending}
            data-testid="button-end-session"
          >
            <StopCircle className="h-4 w-4 mr-2" />
            End Interview
          </Button>
        </div>
      </header>

      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="max-w-4xl mx-auto p-4 pb-24">
          {messagesLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-3/4" />
              <Skeleton className="h-20 w-3/4 ml-auto" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Waiting for the interview to begin...
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id}>
                  <MessageBubble
                    role={message.role as "ai" | "user"}
                    content={message.content}
                    timestamp={new Date(message.createdAt)}
                  />
                  {feedbackList
                    .filter((f) => f.messageId === message.id)
                    .map((feedback) => (
                      <FeedbackCard key={feedback.id} feedback={feedback} />
                    ))}
                </div>
              ))}
              {sendMessageMutation.isPending && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      <div className="sticky bottom-0">
        <ChatInput
          onSend={handleSendMessage}
          disabled={session.status !== "active" || sendMessageMutation.isPending}
        />
      </div>

      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Interview Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this interview? You'll be able to review the session history later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-end">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEndSession} data-testid="button-confirm-end">
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
