import { createFileRoute } from "@tanstack/react-router";
import SplashPage from "@/pages/splash-page.tsx";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <SplashPage />
      <div className="mt-6 border-t pt-4"></div>
    </div>
  );
}
