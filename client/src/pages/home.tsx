import { Briefcase, GraduationCap, ShoppingCart, Headphones, TrendingUp, Heart } from "lucide-react";
import { RoleCard } from "@/components/role-card";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { InsertSession } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const roles = [
  {
    id: "software_engineer",
    title: "Software Engineer",
    description: "Practice technical interviews with questions on algorithms, system design, and coding challenges.",
    icon: Briefcase,
  },
  {
    id: "product_manager",
    title: "Product Manager",
    description: "Prepare for product sense, strategy, and execution questions commonly asked in PM interviews.",
    icon: TrendingUp,
  },
  {
    id: "retail_associate",
    title: "Retail Associate",
    description: "Practice customer service scenarios, sales techniques, and handling difficult situations.",
    icon: ShoppingCart,
  },
  {
    id: "customer_service",
    title: "Customer Service",
    description: "Improve your communication skills and learn to handle customer complaints effectively.",
    icon: Headphones,
  },
  {
    id: "sales",
    title: "Sales",
    description: "Master sales pitches, objection handling, and closing techniques through realistic scenarios.",
    icon: TrendingUp,
  },
  {
    id: "healthcare",
    title: "Healthcare",
    description: "Prepare for healthcare interviews focusing on patient care, ethics, and clinical scenarios.",
    icon: Heart,
  },
  {
    id: "teaching",
    title: "Teaching",
    description: "Practice answering questions about pedagogy, classroom management, and curriculum design.",
    icon: GraduationCap,
  },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createSessionMutation = useMutation({
    mutationFn: async (role: string) => {
      const sessionData: InsertSession = {
        role,
        status: "active",
      };
      return await apiRequest<{ id: string }>("POST", "/api/sessions", sessionData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setLocation(`/session/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start interview session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRoleSelect = (roleId: string) => {
    createSessionMutation.mutate(roleId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">Choose Your Interview Role</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select a role to begin practicing with our AI interviewer. 
            Get personalized feedback and improve your interview skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              icon={role.icon}
              title={role.title}
              description={role.description}
              onClick={() => handleRoleSelect(role.id)}
            />
          ))}
        </div>

        <div className="mt-12 p-6 bg-muted/50 rounded-md">
          <h2 className="font-semibold mb-2">How it works</h2>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-semibold text-foreground">1.</span>
              <span>Select a role that matches your target position</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-foreground">2.</span>
              <span>Answer questions from our AI interviewer using text or voice</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-foreground">3.</span>
              <span>Receive real-time feedback on your responses</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-foreground">4.</span>
              <span>Review your session history and track your progress</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
