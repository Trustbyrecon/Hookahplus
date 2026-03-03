"use client";

import { sendCmd } from "@/lib/cmd";

export function PrepCard({
  id,
  onResult,
}: {
  id: string;
  onResult?: (result: any) => void;
}) {
  const run = async (cmd: string, data: any, actor: "boh" | "foh" = "boh") => {
    const r = await sendCmd(id, cmd, data, actor);
    onResult?.(r);
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-zinc-900/40 p-4">
      <div className="text-sm text-zinc-200">Prep Room · Session {id}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => run("CLAIM_PREP", {}, "boh")}
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Claim Prep
        </button>
        <button
          onClick={() => run("HEAT_UP", {}, "boh")}
          className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
        >
          Heat Up
        </button>
        <button
          onClick={() => run("READY_FOR_DELIVERY", {}, "boh")}
          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          Ready
        </button>
        <button
          onClick={() => run("REMAKE", { reason: "harsh" }, "boh")}
          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          Remake
        </button>
        <button
          onClick={() => run("STOCK_BLOCKED", { sku: "coal_cube" }, "boh")}
          className="rounded-lg bg-yellow-600 px-3 py-2 text-sm font-medium text-black hover:bg-yellow-500 transition-colors"
        >
          Stock Blocked
        </button>
      </div>
      <div className="mt-2 text-xs text-zinc-500">
        Uses <code className="text-zinc-300">/api/sessions/[id]/command</code>
      </div>
    </div>
  );
}

