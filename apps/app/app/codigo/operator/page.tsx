"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type NodeChange,
  applyNodeChanges,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

import SeatNode from "@/components/SeatNode";
import { CODIGO_SEATS } from "@/lib/codigoSeats";
import { CODIGO_MENU } from "@/lib/codigoMenu";

const BASE_PRICE = 60;
const OVER_MINUTES = 90;

type SeatRuntime = { startTs: number | null; flavorId: string | null };
type SeatStatus = "empty" | "active" | "over";

function formatElapsed(ms: number) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${totalMin}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function toSeatConfig(nodes: Node[]) {
  return nodes
    .filter((n) => typeof n.data?.label === "string")
    .map((n) => ({
      id: n.id,
      label: n.data.label as string,
      x: Math.round(n.position.x),
      y: Math.round(n.position.y),
    }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true })
    );
}

export default function CodigoOperatorPage() {
  const [seats, setSeats] = useState<Record<string, SeatRuntime>>(() => {
    const init: Record<string, SeatRuntime> = {};
    for (const s of CODIGO_SEATS) init[s.id] = { startTs: null, flavorId: null };
    return init;
  });

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const [activeSeatId, setActiveSeatId] = useState<string | null>(null);
  const [selectedFlavorId, setSelectedFlavorId] = useState<string>(CODIGO_MENU[0].id);
  const [calibrationMode, setCalibrationMode] = useState(false);

  const nodeTypes: NodeTypes = useMemo(() => ({ seat: SeatNode }), []);

  const [nodes, setNodes] = useState<Node[]>(() => {
    return CODIGO_SEATS.map((s) => ({
      id: s.id,
      type: "seat",
      position: { x: s.x, y: s.y },
      data: { label: s.label, status: "empty" as SeatStatus },
      draggable: false,
      selectable: true,
    }));
  });

  useEffect(() => {
    setNodes((prev) =>
      prev.map((n) => {
        const rt = seats[n.id];
        const isActive = !!rt?.startTs;
        const elapsedMs = isActive ? now - (rt.startTs as number) : 0;
        const elapsedMin = isActive ? Math.floor(elapsedMs / 60000) : 0;

        const status: SeatStatus = !isActive
          ? "empty"
          : elapsedMin >= OVER_MINUTES
            ? "over"
            : "active";

        return {
          ...n,
          data: {
            ...n.data,
            status,
            elapsedLabel: isActive ? formatElapsed(elapsedMs) : undefined,
          },
        };
      })
    );
  }, [seats, now]);

  function onNodesChange(changes: NodeChange[]) {
    if (calibrationMode) {
      setNodes((nds) => applyNodeChanges(changes, nds));
    }
  }

  const selected = activeSeatId ? seats[activeSeatId] : null;
  const selectedLabel = activeSeatId
    ? (nodes.find((n) => n.id === activeSeatId)?.data?.label as
        | string
        | undefined)
    : undefined;

  const isSelectedActive = !!selected?.startTs;

  function startSession(seatId: string) {
    setSeats((prev) => ({
      ...prev,
      [seatId]: {
        ...prev[seatId],
        startTs: Date.now(),
        flavorId: selectedFlavorId,
      },
    }));
  }

  function endSession(seatId: string) {
    setSeats((prev) => ({
      ...prev,
      [seatId]: { startTs: null, flavorId: null },
    }));
  }

  async function copyLayout() {
    const config = toSeatConfig(nodes);
    const text =
      "export const CODIGO_SEATS = " +
      JSON.stringify(config, null, 2) +
      " as const;\n";
    await navigator.clipboard.writeText(text);
    alert("Layout copied. Paste into lib/codigoSeats.ts");
  }

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100">
      <div className="flex-shrink-0 px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">
            District Hookah • CODIGO Pilot
          </div>
          <div className="text-sm text-zinc-400">
            Floor Dashboard • Base ${BASE_PRICE}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800"
            onClick={() => setCalibrationMode((c) => !c)}
          >
            {calibrationMode ? "Lock Layout" : "Calibrate"}
          </button>
          {calibrationMode && (
            <button
              type="button"
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800"
              onClick={copyLayout}
            >
              Copy Layout JSON
            </button>
          )}
          <div className="text-sm text-zinc-400" suppressHydrationWarning>
            {new Date(now).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-124px)] min-h-[300px]">
        <ReactFlow
          nodes={nodes.map((n) => ({
            ...n,
            draggable: calibrationMode,
          }))}
          edges={[]}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          fitView
          onNodeClick={(_, node) => setActiveSeatId(node.id)}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {activeSeatId && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-4">
          <div className="w-full sm:max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center justify-between">
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

            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
              <div className="text-sm text-zinc-300">Base Price</div>
              <div className="text-xl font-semibold">${BASE_PRICE}</div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-zinc-300 mb-2">Flavor</div>
              <select
                value={selectedFlavorId}
                onChange={(e) => setSelectedFlavorId(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-3 text-zinc-100"
                disabled={isSelectedActive}
              >
                {CODIGO_MENU.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.profile}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex gap-2">
              {!isSelectedActive ? (
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-3 font-semibold"
                  onClick={() => {
                    startSession(activeSeatId);
                    setActiveSeatId(null);
                  }}
                >
                  Start Session
                </button>
              ) : (
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-3 font-semibold"
                  onClick={() => {
                    endSession(activeSeatId);
                    setActiveSeatId(null);
                  }}
                >
                  End Session
                </button>
              )}
            </div>

            <div className="mt-3 text-xs text-zinc-500">
              Pilot mode: timers + seat control. Tap seat to start or end
              session.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
