import { Button } from "@/components/ui/button.tsx";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar.tsx";
import { BarChart3, Database, FileText, Users } from "lucide-react";

interface AnalysisDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AnalysisDrawer({
  open,
  onOpenChange,
}: AnalysisDrawerProps) {
  const nationalAnalysisItems = [
    {
      title: "US Voting Equipment",
      icon: Database,
      description: "National voting equipment by state table",
    },
    {
      title: "Equipment Summary",
      icon: FileText,
      description: "US voting equipment summary by provider",
    },
  ];

  const comparisonItems = [
    {
      title: "Republican vs Democratic",
      icon: Users,
      description: "Compare selected Republican and Democratic states",
    },
    {
      title: "Voter Registration Changes",
      icon: BarChart3,
      description: "Compare registration changes over time",
    },
    {
      title: "Opt-in vs Opt-out",
      icon: Users,
      description: "Compare opt-in and opt-out registration states",
    },
    {
      title: "Early Voting Comparison",
      icon: BarChart3,
      description: "Republican vs Democratic early voting data",
    },
  ];

  const advancedAnalysisItems = [
    {
      title: "Drop Box Voting Chart",
      icon: BarChart3,
      description: "Drop box voting bubble chart by party",
    },
    {
      title: "Equipment vs Rejected Ballots",
      icon: BarChart3,
      description: "Equipment quality vs ballot rejection rates",
    },
    {
      title: "Political Party Bubble Chart + Regression Line",
      icon: Users,
      description: "Political party dominance by census block",
    },
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="text-left border-b">
          <DrawerTitle>Election Analysis Tools</DrawerTitle>
          <DrawerDescription>
            Comprehensive analysis tools for election data exploration
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-auto">
          <SidebarProvider>
            <Sidebar variant="sidebar" className="w-full border-0">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>National Equipment</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {nationalAnalysisItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            tooltip={item.description}
                            onClick={() => {
                              console.log(`Navigate to ${item.title}`);
                            }}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                  <SidebarGroupLabel>State Comparisons</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {comparisonItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            tooltip={item.description}
                            onClick={() => {
                              console.log(`Navigate to ${item.title}`);
                            }}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                  <SidebarGroupLabel>Advanced Analysis</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {advancedAnalysisItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            tooltip={item.description}
                            onClick={() => {
                              console.log(`Navigate to ${item.title}`);
                            }}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
          </SidebarProvider>
        </div>

        <DrawerFooter className="border-t">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
