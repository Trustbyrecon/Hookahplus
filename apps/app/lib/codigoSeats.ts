// lib/codigoSeats.ts
export type SeatStatus = "empty" | "active" | "over";

export type SeatNodeData = {
  label: string;
  zone?: string;
  status: SeatStatus;
  startTs?: number | null;
  flavorId?: string | null;
};

export type SeatDef = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export const CODIGO_SEATS: SeatDef[] = [
  // Right column 301–313 (top to bottom)
  { id: "seat-313", label: "313", x: 860, y: 110 },
  { id: "seat-312", label: "312", x: 860, y: 180 },
  { id: "seat-311", label: "311", x: 860, y: 250 },
  { id: "seat-310", label: "310", x: 860, y: 320 },
  { id: "seat-309", label: "309", x: 860, y: 390 },
  { id: "seat-308", label: "308", x: 860, y: 460 },
  { id: "seat-307", label: "307", x: 860, y: 540 },
  { id: "seat-306", label: "306", x: 860, y: 610 },
  { id: "seat-305", label: "305", x: 860, y: 680 },
  { id: "seat-304", label: "304", x: 860, y: 760 },
  { id: "seat-303", label: "303", x: 860, y: 840 },
  { id: "seat-302", label: "302", x: 860, y: 910 },
  { id: "seat-301", label: "301", x: 860, y: 980 },

  // Middle 401–403
  { id: "seat-403", label: "403", x: 520, y: 140 },
  { id: "seat-402", label: "402", x: 520, y: 300 },
  { id: "seat-401", label: "401", x: 520, y: 470 },

  // Left 601–603
  { id: "seat-603", label: "603", x: 120, y: 150 },
  { id: "seat-602", label: "602", x: 120, y: 260 },
  { id: "seat-601", label: "601", x: 120, y: 370 },

  // VIP 501–502
  { id: "seat-502", label: "502", x: 140, y: 560 },
  { id: "seat-501", label: "501", x: 340, y: 560 },

  // Round tables 702–705
  { id: "seat-705", label: "705", x: 520, y: 650 },
  { id: "seat-704", label: "704", x: 640, y: 710 },
  { id: "seat-703", label: "703", x: 520, y: 820 },
  { id: "seat-702", label: "702", x: 640, y: 900 },

  // Bottom bar stools KB1–KB5
  { id: "seat-kb1", label: "KB1", x: 260, y: 1040 },
  { id: "seat-kb2", label: "KB2", x: 340, y: 1040 },
  { id: "seat-kb3", label: "KB3", x: 420, y: 1040 },
  { id: "seat-kb4", label: "KB4", x: 500, y: 1040 },
  { id: "seat-kb5", label: "KB5", x: 580, y: 1040 },
];
