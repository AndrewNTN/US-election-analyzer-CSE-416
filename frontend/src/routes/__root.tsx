import { Outlet, createRootRoute } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/api/query-client";
import Header from "@/components/header";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => <div>404 Not Found</div>,
});

function RootComponent() {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <QueryClientProvider client={queryClient}>
        <Header />
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </QueryClientProvider>
    </div>
  );
}
