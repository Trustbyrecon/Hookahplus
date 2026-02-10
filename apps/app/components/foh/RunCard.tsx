"use client";

import { sendCmd } from "@/lib/cmd";

export function RunCard({
  id,
  onResult,
}: {
  id: string;
  onResult?: (result: any) => void;
}) {
  const run = async (cmd: string, data: any, actor: "foh" | "boh" = "foh") => {
    const r = await sendCmd(id, cmd, data, actor);
    onResult?.(r);
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-zinc-900/40 p-4">
      <div className="text-sm text-zinc-200">Floor · Session {id}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => run("DELIVER_NOW", {}, "foh")}
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Deliver Now
        </button>
        <button
          onClick={() => run("MARK_DELIVERED", {}, "foh")}
          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          Delivered
        </button>
        <button
          onClick={() => run("MOVE_TABLE", { table: "T-14" }, "foh")}
          className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
        >
          Move → T-14
        </button>
        <button
          onClick={() => run("ADD_COAL_SWAP", {}, "foh")}
          className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
        >
          Coal Swap
        </button>
        <button
          onClick={() => run("CLOSE_SESSION", {}, "foh")}
          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          Close
        </button>
      </div>
      <div className="mt-2 text-xs text-zinc-500">
        Uses <code className="text-zinc-300">/api/sessions/[id]/command</code>
      </div>
    </div>
  );
}

