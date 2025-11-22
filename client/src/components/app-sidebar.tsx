import { Briefcase, GraduationCap, ShoppingCart, Headphones, TrendingUp, Heart, Users, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

const roleIcons = {
  software_engineer: Briefcase,
  product_manager: TrendingUp,
  retail_associate: ShoppingCart,
  customer_service: Headphones,
  sales: TrendingUp,
  healthcare: Heart,
  teaching: GraduationCap,
};

const roleLabels = {
  software_engineer: "Software Engineer",
  product_manager: "Product Manager",
  retail_associate: "Retail Associate",
  customer_service: "Customer Service",
  sales: "Sales",
  healthcare: "Healthcare",
  teaching: "Teaching",
};

export function AppSidebar() {
  const [location] = useLocation();
  
  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg">Interview Practice</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-2">
            <Link href="/">
              <Button 
                className="w-full" 
                size="default"
                data-testid="button-new-interview"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Interview
              </Button>
            </Link>
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Recent Sessions</SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-240px)]">
              <SidebarMenu>
                {sessions.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No sessions yet.
                    <br />
                    Start a new interview!
                  </div>
                ) : (
                  sessions.map((session) => {
                    const Icon = roleIcons[session.role as keyof typeof roleIcons];
                    const isActive = location === `/session/${session.id}`;
                    
                    return (
                      <SidebarMenuItem key={session.id}>
                        <SidebarMenuButton 
                          asChild
                          className={isActive ? "bg-sidebar-accent" : ""}
                          data-testid={`link-session-${session.id}`}
                        >
                          <Link href={`/session/${session.id}`}>
                            <Icon className="h-4 w-4" />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="truncate font-medium">
                                {roleLabels[session.role as keyof typeof roleLabels]}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Practice makes perfect
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
