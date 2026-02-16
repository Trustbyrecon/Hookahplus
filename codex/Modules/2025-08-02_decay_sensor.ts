export class DecaySensor {
  constructor(private decayRate: number) {}

  sense(initial: number): number {
    return initial * Math.exp(-this.decayRate);
  }
}

export default DecaySensor;
