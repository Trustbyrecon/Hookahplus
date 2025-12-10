"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

interface RecreateLastMixButtonProps {
  customerId: string;
  onMixLoaded: (flavors: string[]) => void;
  className?: string;
}

export default function RecreateLastMixButton({
  customerId,
  onMixLoaded,
  className = "",
}: RecreateLastMixButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecreate = async () => {
    if (!customerId) {
      setError("No customer ID provided");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/customers/${customerId}/last-mix`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load last mix");
      }

      if (!data.hasLastMix || !data.lastMix) {
        setError("No previous mix found for this customer");
        setLoading(false);
        return;
      }

      // Extract flavors from mix
      // Handle different mix formats
      let flavors: string[] = [];
      if (Array.isArray(data.lastMix)) {
        flavors = data.lastMix;
      } else if (data.lastMix.flavors) {
        flavors = data.lastMix.flavors;
      } else if (data.lastMix.flavorIds) {
        flavors = data.lastMix.flavorIds;
      } else if (typeof data.lastMix === "object") {
        // Try to extract flavor IDs from object
        flavors = Object.values(data.lastMix)
          .filter((v): v is string => typeof v === "string")
          .slice(0, 4); // Limit to 4 flavors
      }

      if (flavors.length === 0) {
        setError("Could not extract flavors from last mix");
        setLoading(false);
        return;
      }

      // Call the callback to load flavors into selector
      onMixLoaded(flavors);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load last mix");
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleRecreate}
        disabled={loading || !customerId}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
      >
        <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Loading..." : "Recreate Last Mix"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

