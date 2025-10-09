import { createFileRoute } from "@tanstack/react-router";
import SplashPage from "@/pages/splash-page.tsx";
import TestApiConnection from "@/components/TestApiConnection"; // 👈 add this line

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <SplashPage />
      <div className="mt-6 border-t pt-4">
        <TestApiConnection /> {/* 👈 add this line */}
      </div>
    </div>
  );
}
