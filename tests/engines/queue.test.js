import { describe, expect, it } from 'vitest';
import { calculateQueue } from '../../src/engines/queue.js';

describe('M/M/c/K queue engine', () => {
  it('normalizes the analytically known M/M/1/2 occupancy distribution', () => {
    const result = calculateQueue({ lambda: 1, mu: 2, servers: 1, capacity: 2 });

    expect(result.probabilities[0]).toBeCloseTo(4 / 7, 12);
    expect(result.probabilities[1]).toBeCloseTo(2 / 7, 12);
    expect(result.probabilities[2]).toBeCloseTo(1 / 7, 12);
    expect(result.probabilities.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 12);
  });

  it('satisfies Little’s Law for system and queue measurements', () => {
    const result = calculateQueue({ lambda: 5, mu: 1.5, servers: 3, capacity: 12 });

    expect(result.averageInSystem).toBeCloseTo(result.effectiveArrivalRate * result.averageTimeInSystem, 12);
    expect(result.averageInQueue).toBeCloseTo(result.effectiveArrivalRate * result.averageWaitTime, 12);
  });

  it('rejects a capacity smaller than the technician count', () => {
    expect(() => calculateQueue({ lambda: 5, mu: 1.5, servers: 4, capacity: 3 })).toThrow(/K/);
  });

  it.each([
    ['low demand', { lambda: 0.5, mu: 2, servers: 3, capacity: 10 }],
    ['high utilization', { lambda: 11.5, mu: 2, servers: 6, capacity: 18 }],
    ['multiple technicians', { lambda: 7, mu: 1.5, servers: 5, capacity: 15 }],
    ['capacity equal to technicians', { lambda: 4, mu: 1.25, servers: 4, capacity: 4 }],
  ])('keeps probabilities and conservation valid under %s', (_, params) => {
    const result = calculateQueue(params);

    expect(result.probabilities.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 12);
    expect(result.effectiveArrivalRate).toBeCloseTo(params.lambda * (1 - result.blockingProbability), 12);
    expect(result.averageInSystem).toBeCloseTo(result.effectiveArrivalRate * result.averageTimeInSystem, 12);
    expect(result.averageInQueue).toBeCloseTo(result.effectiveArrivalRate * result.averageWaitTime, 12);
  });

  it('rejects non-positive rates and non-integer dimensions', () => {
    expect(() => calculateQueue({ lambda: 0, mu: 1, servers: 1, capacity: 2 })).toThrow();
    expect(() => calculateQueue({ lambda: 1, mu: 0, servers: 1, capacity: 2 })).toThrow();
    expect(() => calculateQueue({ lambda: 1, mu: 1, servers: 1.5, capacity: 3 })).toThrow();
  });
});
