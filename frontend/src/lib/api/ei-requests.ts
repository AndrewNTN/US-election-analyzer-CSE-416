import { fetchJson } from "@/lib/api/api-client";

export interface EIPoint {
  x: number;
  y: number;
}

export interface EIData {
  id: string;
  type: string;
  state: string;
  demographics: Record<string, Record<string, EIPoint[]>>;
  summary?: string;
}

export const getEIEquipmentData = async (stateFips: string): Promise<EIData> =>
  fetchJson(`/ei/equipment/${stateFips}`);

export const getEIRejectedBallotsData = async (
  stateFips: string,
): Promise<EIData> => fetchJson(`/ei/rejected-ballots/${stateFips}`);
