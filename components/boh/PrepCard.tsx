"use client";
import { sendCmd } from "@/lib/cmd";

export function PrepCard({ id }: { id: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 p-4">
      <div className="text-sm">Prep Room · Session {id}</div>
      <div className="mt-3 flex gap-2 flex-wrap">
        <button 
          onClick={() => sendCmd(id, "CLAIM_PREP", {}, "boh")}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Claim Prep
        </button>
        <button 
          onClick={() => sendCmd(id, "HEAT_UP", {}, "boh")}
          className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
        >
          Heat Up
        </button>
        <button 
          onClick={() => sendCmd(id, "READY_FOR_DELIVERY", {}, "boh")}
          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Ready
        </button>
        <button 
          onClick={() => sendCmd(id, "REMAKE", { reason: "harsh" }, "boh")}
          className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Remake
        </button>
        <button 
          onClick={() => sendCmd(id, "STOCK_BLOCKED", { sku: "coal_cube" }, "boh")}
          className="px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
        >
          Stock Blocked
        </button>
      </div>
    </div>
  );
}
