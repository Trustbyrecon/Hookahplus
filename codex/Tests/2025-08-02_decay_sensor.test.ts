import { DecaySensor } from "../Modules/2025-08-02_decay_sensor";

// Simple test to verify decay calculation
const sensor = new DecaySensor(1);
const result = sensor.sense(Math.E);

if (Math.abs(result - 1) > 1e-6) {
  throw new Error(`DecaySensor expected ~1, got ${result}`);
}
