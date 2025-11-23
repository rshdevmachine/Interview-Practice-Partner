import {
  Briefcase,
  GraduationCap,
  ShoppingCart,
  Headphones,
  TrendingUp,
  Heart,
  Loader2,
} from "lucide-react";
import { RoleCard } from "@/components/role-card";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { InsertSession, Session } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const roles = [
  {
    id: "software_engineer",
    title: "Software Engineer",
    description:
      "Practice technical interviews with questions on algorithms, system design, and coding challenges.",
    icon: Briefcase,
  },
  {
    id: "product_manager",
    title: "Product Manager",
    description:
      "Prepare for product sense, strategy, and execution questions commonly asked in PM interviews.",
    icon: TrendingUp,
  },
  {
    id: "retail_associate",
    title: "Retail Associate",
    description:
      "Practice customer service scenarios, sales techniques, and handling difficult situations.",
    icon: ShoppingCart,
  },
  {
    id: "customer_service",
    title: "Customer Service",
    description:
      "Improve your communication skills and learn to handle customer complaints effectively.",
    icon: Headphones,
  },
  {
    id: "sales",
    title: "Sales",
    description:
      "Master sales pitches, objection handling, and closing techniques through realistic scenarios.",
    icon: TrendingUp,
  },
  {
    id: "healthcare",
    title: "Healthcare",
    description:
      "Prepare for healthcare interviews focusing on patient care, ethics, and clinical scenarios.",
    icon: Heart,
  },
  {
    id: "teaching",
    title: "Teaching",
    description:
      "Practice answering questions about pedagogy, classroom management, and curriculum design.",
    icon: GraduationCap,
  },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const createSessionMutation = useMutation({
    mutationFn: async (role: string) => {
      const sessionData: InsertSession = {
        role,
        status: "active",
      };

      // call API
      const res = await apiRequest("POST", "/api/sessions", sessionData);
      return (await res.json()) as Session;
    },

    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setLocation(`/session/${session.id}`);
    },

    onError: () => {
      setLoadingRole(null);
      toast({
        title: "Error",
        description: "Failed to start interview session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRoleSelect = (roleId: string) => {
    setLoadingRole(roleId);
    createSessionMutation.mutate(roleId);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {loadingRole && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Starting your interview...</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">Choose Your Interview Role</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select a role to begin practicing with our AI interviewer. You will
            directly enter the interview screen.
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
      </div>
    </div>
  );
}
