import fs from "fs";
import DecaySensor from "./2025-08-02_decay_sensor";

interface SessionConfig {
  decay_rate?: number;
  default_duration?: number;
}

export interface ReceiptMetadata {
  durationMs: number;
}

export interface TrustLogEntry {
  timestamp: number;
  event: string;
  durationMs?: number;
}

export class ChronosKairos {
  private startTime?: number;
  private elapsed = 0;
  private trustLog: TrustLogEntry[] = [];
  private config: SessionConfig;
  private decaySensor: DecaySensor;

  constructor(configPath: string) {
    this.config = this.loadConfig(configPath);
    const rate = this.config.decay_rate ?? 0.1;
    this.decaySensor = new DecaySensor(rate);
  }

  private loadConfig(path: string): SessionConfig {
    const raw = fs.readFileSync(path, "utf8");
    const cfg: SessionConfig = {};
    raw.split(/\r?\n/).forEach((line) => {
      const [key, value] = line.split(":").map((s) => s.trim());
      if (key && value) {
        const num = Number(value);
        cfg[key as keyof SessionConfig] = isNaN(num) ? value as any : num;
      }
    });
    return cfg;
  }

  checkIn(customerId: string) {
    this.trustLog.push({ timestamp: Date.now(), event: `check-in:${customerId}` });
    this.start();
  }

  start() {
    if (this.startTime) return;
    this.startTime = Date.now();
    this.trustLog.push({ timestamp: this.startTime, event: "start" });
  }

  pause() {
    if (!this.startTime) return;
    const now = Date.now();
    this.elapsed += now - this.startTime;
    this.trustLog.push({ timestamp: now, event: "pause", durationMs: this.elapsed });
    this.startTime = undefined;
  }

  end() {
    if (this.startTime) {
      const now = Date.now();
      this.elapsed += now - this.startTime;
      this.trustLog.push({ timestamp: now, event: "end", durationMs: this.elapsed });
      this.startTime = undefined;
    }
    const duration = this.elapsed;
    return {
      receipt: this.buildReceipt(duration),
      trustLog: this.trustLog,
    };
  }

  private buildReceipt(duration: number): ReceiptMetadata {
    return { durationMs: duration };
  }

  reflexLevel(initial: number): number {
    return this.decaySensor.sense(initial);
  }
}

export default ChronosKairos;
