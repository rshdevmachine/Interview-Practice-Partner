import { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface RoleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

export function RoleCard({ icon: Icon, title, description, onClick }: RoleCardProps) {
  return (
    <Card 
      className="hover-elevate active-elevate-2 cursor-pointer transition-all"
      onClick={onClick}
      data-testid={`card-role-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <CardHeader className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-md bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-2">{title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
