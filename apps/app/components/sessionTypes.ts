export interface Session {
  id: number;
  table: string;
  flavors: string[];
  startTime: number;
  endTime: number | null;
  refills: number;
  notes?: string[];
}
