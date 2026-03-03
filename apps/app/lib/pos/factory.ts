import type { PosAdapter } from "./types";
import { SquareAdapter } from "./square";
import { ToastAdapter } from "./toast";
import { CloverAdapter } from "./clover";

export function makePosAdapter(provider: "square" | "toast" | "clover", venueId: string): PosAdapter {
  switch (provider) {
    case "square":
      return new SquareAdapter({ venueId });
    case "toast":
      return new ToastAdapter({ venueId });
    case "clover":
      return new CloverAdapter({ venueId });
    default:
      throw new Error(`Unsupported POS provider: ${provider}`);
  }
}
