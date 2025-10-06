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
import AnalysisModal, { AnalysisOption } from "@/components/analysis-modal.tsx";
import { BarChart3, Database, FileText, Users } from "lucide-react";
import { useState } from "react";

interface AnalysisDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type AnalysisItem = {
  title: string;
  icon: typeof Database;
  description: string;
};

export default function AnalysisDrawer({
  open,
  onOpenChange,
}: AnalysisDrawerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisItem | null>(
    null,
  );

  const nationalAnalysisItems: AnalysisItem[] = [
    {
      title: AnalysisOption.US_VOTING_EQUIPMENT,
      icon: Database,
      description: "National voting equipment by state table",
    },
    {
      title: AnalysisOption.EQUIPMENT_SUMMARY,
      icon: FileText,
      description: "US voting equipment summary by provider",
    },
  ];

  const comparisonItems: AnalysisItem[] = [
    {
      title: AnalysisOption.REPUBLICAN_VS_DEMOCRATIC,
      icon: Users,
      description: "Compare selected Republican and Democratic states",
    },
    {
      title: AnalysisOption.OPT_IN_VS_OPT_OUT,
      icon: Users,
      description: "Compare opt-in and opt-out registration states",
    },
    {
      title: AnalysisOption.EARLY_VOTING_COMPARISON,
      icon: BarChart3,
      description: "Republican vs Democratic early voting data",
    },
  ];

  const advancedAnalysisItems: AnalysisItem[] = [
    {
      title: AnalysisOption.DROP_BOX_VOTING_CHART,
      icon: BarChart3,
      description: "Drop box voting bubble chart by party",
    },
    {
      title: AnalysisOption.EQUIPMENT_VS_REJECTED_BALLOTS,
      icon: BarChart3,
      description: "Equipment quality vs ballot rejection rates",
    },
    {
      title: AnalysisOption.POLITICAL_PARTY_BUBBLE_CHART,
      icon: Users,
      description: "Political party dominance by census block",
    },
  ];

  const handleItemClick = (item: AnalysisItem) => {
    setSelectedAnalysis(item);
    setModalOpen(true);
  };

  return (
    <>
      <AnalysisModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        selectedAnalysis={selectedAnalysis}
      />

      <Drawer open={open} onOpenChange={onOpenChange}>
        {/*
      TODO: functionality for tables and graphs here, use https://ui.shadcn.com/docs/components/data-table imo and then chart js
      TODO: for the rest, generate the mock data, table/chart labels should be in the use cases */}
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
                              onClick={() => handleItemClick(item)}
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
                              onClick={() => handleItemClick(item)}
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
                              onClick={() => handleItemClick(item)}
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
    </>
  );
}
