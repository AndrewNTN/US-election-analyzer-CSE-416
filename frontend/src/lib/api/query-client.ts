import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        gcTime: 0,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: "always",
        refetchOnReconnect: "always",
      },
    },
  });

export const queryClient = createQueryClient();
