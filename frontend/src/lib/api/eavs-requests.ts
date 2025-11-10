import { fetchJson } from "@/lib/api/api-client";

// caching keys
export const eavsKeys = {
  all: () => ["eavs"] as const,
  provisional: {
    root: () => [...eavsKeys.all(), "provisional"] as const,
    aggregate: (fipsPrefix: string) =>
      [...eavsKeys.provisional.root(), "aggregate", fipsPrefix] as const,
    state: (fipsPrefix: string) =>
      [...eavsKeys.provisional.root(), "state", fipsPrefix] as const,
  },
};

export interface ProvisionalAggregateResponse {
  E2a?: number;
  E2b?: number;
  E2c?: number;
  E2d?: number;
  E2e?: number;
  E2f?: number;
  E2g?: number;
  E2h?: number;
  E2i?: number;
  Other?: number;
}

export interface ProvisionalBallotsApiResponse {
  jurisdictionName: string;
  provisionalBallots?: {
    E1a?: number;
    E1b?: number;
    E1c?: number;
    E1d?: number;
    E1e?: number;
    E1e_Other?: string;
  };
}

export const getProvisionalAggregate = async (
  fipsPrefix: string,
): Promise<ProvisionalAggregateResponse> =>
  fetchJson(`/eavs/provisional/aggregate/${fipsPrefix}`);

export const getProvisionalState = async (
  fipsPrefix: string,
): Promise<ProvisionalBallotsApiResponse[]> =>
  fetchJson(`/eavs/provisional/state/${fipsPrefix}`);
