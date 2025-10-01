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

interface AnalysisDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AnalysisDrawer({
  open,
  onOpenChange,
}: AnalysisDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Analysis</DrawerTitle>
          <DrawerDescription>
            Additional analysis tools and options.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4">
          <div className="space-y-4">
            {/* Future analysis options can go here */}
            <div className="text-center text-gray-500 py-8">
              Additional analysis tools will be available here.
            </div>
          </div>
        </div>

        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
