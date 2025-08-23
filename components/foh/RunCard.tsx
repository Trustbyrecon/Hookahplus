"use client";
import { sendCmd } from "@/lib/cmd";

export function RunCard({ id }: { id: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 p-4">
      <div className="text-sm">Floor · Session {id}</div>
      <div className="mt-3 flex gap-2 flex-wrap">
        <button 
          onClick={() => sendCmd(id, "DELIVER_NOW", {}, "foh")}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Deliver Now
        </button>
        <button 
          onClick={() => sendCmd(id, "MARK_DELIVERED", {}, "foh")}
          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Delivered
        </button>
        <button 
          onClick={() => sendCmd(id, "MOVE_TABLE", { table: "T-14" }, "foh")}
          className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Move → T-14
        </button>
        <button 
          onClick={() => sendCmd(id, "ADD_COAL_SWAP", {}, "foh")}
          className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
        >
          Coal Swap
        </button>
        <button 
          onClick={() => sendCmd(id, "CLOSE_SESSION", {}, "foh")}
          className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
