"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  type Node,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

import SeatNode from "@/components/SeatNode";
import { CODIGO_SEATS } from "@/lib/codigoSeats";
import { CODIGO_MENU } from "@/lib/codigoMenu";
import type { FireSession } from "@/types/enhancedSession";

const BASE_PRICE = 60;
const OVER_MINUTES = 90;

type SeatStatus = "empty" | "active" | "over" | "request";

// Session states considered "on floor" (active hookah)
const FLOOR_ACTIVE_STATES = ["ACTIVE", "DELIVERED", "OUT_FOR_DELIVERY"] as const;

function formatElapsed(ms: number) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${totalMin}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

// Match session.tableId to seat label (e.g. "401", "313")
function sessionMatchesSeat(session: FireSession | any, seatLabel: string): boolean {
  const tid = (session?.tableId || session?.table_id || "").toString().trim();
  return tid === seatLabel || tid === `seat-${seatLabel}` || tid === `T-${seatLabel}`;
}

export interface CodigoFloorPlanProps {
  sessions: FireSession[] | any[];
  loungeId?: string;
  onStartSession: (payload: {
    seatLabel: string;
    flavorId: string;
    flavorName: string;
  }) => Promise<void>;
  onEndSession: (sessionId: string) => Promise<void>;
  onOpenSession: (sessionId: string) => void;
  refreshSessions?: () => void | Promise<void>;
}

export default function CodigoFloorPlan({
  sessions,
  loungeId = "CODIGO",
  onStartSession,
  onEndSession,
  onOpenSession,
  refreshSessions,
}: CodigoFloorPlanProps) {
  const [now, setNow] = useState(() => Date.now());
  const [activeSeatId, setActiveSeatId] = useState<string | null>(null);
  const [selectedFlavorId, setSelectedFlavorId] = useState<string>(CODIGO_MENU[0].id);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const nodeTypes: NodeTypes = useMemo(() => ({ seat: SeatNode }), []);

  // Derive seat status from Fire sessions: empty | active | over | request (refill/service)
  const nodes: Node[] = useMemo(() => {
    return CODIGO_SEATS.map((s) => {
      const session = sessions.find((sess) => sessionMatchesSeat(sess, s.label));
      const isActive = !!session && FLOOR_ACTIVE_STATES.includes((session.status || session.state) as any);
      const needsService = !!session && (session.refillStatus === "requested" || session.edgeCase === "refill_requested");

      const sessionStartMs = session?.sessionStartTime ?? session?.createdAt ?? 0;
      const elapsedMs = isActive ? now - sessionStartMs : 0;
      const elapsedMin = isActive ? Math.floor(elapsedMs / 60000) : 0;

      const status: SeatStatus = !isActive
        ? "empty"
        : needsService
          ? "request"
          : elapsedMin >= OVER_MINUTES
            ? "over"
            : "active";

      return {
        id: s.id,
        type: "seat",
        position: { x: s.x, y: s.y },
        data: {
          label: s.label,
          status,
          elapsedLabel: isActive ? formatElapsed(elapsedMs) : undefined,
        },
        draggable: false,
        selectable: true,
      };
    });
  }, [sessions, now]);

  const selectedLabel = activeSeatId
    ? CODIGO_SEATS.find((s) => s.id === activeSeatId)?.label
    : undefined;

  const selectedSession = activeSeatId && selectedLabel
    ? sessions.find((s) => sessionMatchesSeat(s, selectedLabel))
    : null;

  const isSelectedActive = !!selectedSession && FLOOR_ACTIVE_STATES.includes((selectedSession.status || selectedSession.state) as any);

  async function handleStartSession() {
    if (!activeSeatId || !selectedLabel || isStarting) return;
    const flavor = CODIGO_MENU.find((f) => f.id === selectedFlavorId);
    if (!flavor) return;
    setIsStarting(true);
    try {
      await onStartSession({
        seatLabel: selectedLabel,
        flavorId: selectedFlavorId,
        flavorName: flavor.name,
      });
      setActiveSeatId(null);
      await refreshSessions?.();
    } catch (e) {
      console.error("[CodigoFloorPlan] Start session failed:", e);
    } finally {
      setIsStarting(false);
    }
  }

  async function handleEndSession() {
    if (!selectedSession?.id) return;
    try {
      await onEndSession(selectedSession.id);
      setActiveSeatId(null);
      await refreshSessions?.();
    } catch (e) {
      console.error("[CodigoFloorPlan] End session failed:", e);
    }
  }

  return (
    <div className="flex h-full min-h-[400px] flex-col gap-4 lg:flex-row">
      {/* Left: React Flow floor plan - Toast handheld optimized: no MiniMap, no Controls, no scroll */}
      <div className="min-h-[400px] flex-1 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={[]}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.1, maxZoom: 1, minZoom: 0.5 }}
          minZoom={0.3}
          maxZoom={1}
          panOnScroll={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          onNodeClick={(_, node) => setActiveSeatId(node.id)}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
        </ReactFlow>
      </div>

      {/* Right: Session Inspector panel */}
      {activeSeatId && (
        <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 lg:w-80 lg:flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-base font-semibold">Seat {selectedLabel}</div>
              <div className="text-sm text-zinc-400">Quick Actions</div>
            </div>
            <button
              type="button"
              className="text-zinc-300 hover:text-white"
              onClick={() => setActiveSeatId(null)}
            >
              ✕
            </button>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 mb-4">
            <div className="text-sm text-zinc-300">Base Price</div>
            <div className="text-xl font-semibold">${BASE_PRICE}</div>
          </div>

          {!isSelectedActive ? (
            <>
              <div className="mb-4">
                <div className="text-sm text-zinc-300 mb-2">Flavor</div>
                <select
                  value={selectedFlavorId}
                  onChange={(e) => setSelectedFlavorId(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-3 text-zinc-100"
                >
                  {CODIGO_MENU.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — {f.profile}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                disabled={isStarting}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-3 font-semibold"
                onClick={handleStartSession}
              >
                {isStarting ? "Starting…" : "Start Session"}
              </button>
            </>
          ) : (
            <>
              <div className="space-y-2 mb-4 text-sm">
                <div>
                  <span className="text-zinc-400">Flavor:</span>{" "}
                  {selectedSession?.flavor ?? "—"}
                </div>
                <div>
                  <span className="text-zinc-400">Elapsed:</span>{" "}
                  {selectedSession?.sessionStartTime
                    ? formatElapsed(now - (selectedSession.sessionStartTime as number))
                    : selectedSession?.createdAt
                      ? formatElapsed(now - (selectedSession.createdAt as number))
                      : "—"}
                </div>
                <div>
                  <span className="text-zinc-400">Price:</span> $
                  {BASE_PRICE}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-3 font-semibold"
                  onClick={() => {
                    if (selectedSession?.id) {
                      onOpenSession(selectedSession.id);
                    }
                  }}
                >
                  View Full Session
                </button>
                <button
                  type="button"
                  className="w-full rounded-xl bg-red-600 hover:bg-red-500 px-4 py-3 font-semibold"
                  onClick={handleEndSession}
                >
                  End Session
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
