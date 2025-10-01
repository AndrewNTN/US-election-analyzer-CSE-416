import { Outlet, createRootRoute } from "@tanstack/react-router";
import Header from "@/components/header";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => <div>404 Not Found</div>,
});

function RootComponent() {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
