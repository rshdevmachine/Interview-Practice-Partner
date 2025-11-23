import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
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
import { useTextToSpeech } from "@/hooks/use-text-to-speech";

export default function InterviewSession() {
  const [, params] = useRoute("/session/:id");
  const sessionId = params?.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [localEnded, setLocalEnded] = useState(false); // track if user ended session locally

  // TTS hook
  const { stop } = useTextToSpeech();

  // Fetch session meta
  const { data: session, isLoading: sessionLoading } = useQuery<Session>({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId,
  });

  // Fetch messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/sessions", sessionId, "messages"],
    enabled: !!sessionId,
  });

  // Fetch feedback items (per-message feedback + overall)
  const { data: feedbackList = [] } = useQuery<Feedback[]>({
    queryKey: ["/api/sessions", sessionId, "feedback"],
    enabled: !!sessionId,
  });

  // Send message mutation
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

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/sessions/${sessionId}/end`, {});
    },
    onSuccess: () => {
      // Refresh session list + this session's messages & feedback so feedback appears
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "feedback"] });

      // Set local ended so UI can adjust (we keep user on this page so they can review feedback)
      setLocalEnded(true);

      toast({
        title: "Session Ended",
        description: "Generating your post-interview feedback...",
      });
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
    // Immediately stop any TTS playing
    try {
      stop();
    } catch (e) {
      // ignore if stop fails
      console.warn("Failed to stop TTS:", e);
    }

    setShowEndDialog(false);
    endSessionMutation.mutate();
  };

  // Keep scroll at bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Stop any speech when user navigates away/unmounts
  useEffect(() => {
    return () => {
      try {
        stop();
      } catch (e) {
        // noop
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              {session.status === "active" && !localEnded ? "In progress" : "Completed"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* If ended locally, offer to go back home manually */}
            {localEnded ? (
              <Button onClick={() => setLocation("/")} variant="ghost">
                Back to Home
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleEndSession}
                disabled={session.status !== "active" || endSessionMutation.isPending}
                data-testid="button-end-session"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                End Interview
              </Button>
            )}
          </div>
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
              <p className="text-muted-foreground">Waiting for the interview to begin...</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={message.id}>
                  <MessageBubble
                    role={message.role as "ai" | "user"}
                    content={message.content}
                    timestamp={new Date(message.createdAt)}
                    autoSpeak={message.role === "ai" && index === messages.length - 1 && !localEnded}
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

          {/* If session ended, show a summary banner + feedback list (if any) */}
          {localEnded && feedbackList.length === 0 && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded">
              <p className="text-sm text-yellow-800">
                Session has ended. Feedback is being generated — please wait a few seconds.
              </p>
            </div>
          )}

          {localEnded && feedbackList.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-medium mb-2">Post-Interview Feedback</h2>
              <div className="space-y-4">
                {feedbackList.map((fb) => (
                  <FeedbackCard key={fb.id} feedback={fb} />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="sticky bottom-0">
        <ChatInput
          onSend={handleSendMessage}
          disabled={session.status !== "active" || sendMessageMutation.isPending || localEnded}
        />
      </div>

      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Interview Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this interview? You'll be able to review the session history and feedback on this page.
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
