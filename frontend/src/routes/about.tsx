import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <>
      <div>This is the about page.</div>
      <Button>Button Text</Button>
    </>
  );
}
