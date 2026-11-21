import { describe, expect, it } from 'vitest';
import { calculateRosi, lossExceedanceCurve, sampleBetaPert, simulateFair } from '../../src/engines/fair.js';
import { createSeededRandom } from '../../src/engines/validation.js';

const defaults = { low: 2, mode: 6, high: 20, vulnerability: 0.35, medianLoss: 25_000, sigma: 0.65 };

describe('FAIR Monte Carlo engine', () => {
  it('returns the fixed value for a degenerate valid PERT range', () => {
    expect(sampleBetaPert(5, 5, 5, createSeededRandom(1))).toBe(5);
  });

  it('reproduces the same ALE and VaR for the same seed', () => {
    const first = simulateFair({ ...defaults, trials: 2_000, seed: 7123 });
    const second = simulateFair({ ...defaults, trials: 2_000, seed: 7123 });

    expect(second.ale).toBe(first.ale);
    expect(second.var95).toBe(first.var95);
  });

  it('aggregates positive annual losses and orders VaR above typical loss', () => {
    const result = simulateFair({ ...defaults, trials: 10_000, seed: 99 });

    expect(result.ale).toBeGreaterThan(0);
    expect(result.var95).toBeGreaterThan(result.ale);
  });

  it('calculates return on security investment from ALE reduction', () => {
    expect(calculateRosi(100_000, 55_000, 15_000)).toBe(2);
    expect(calculateRosi(100_000, 55_000, 0)).toBeNull();
  });

  it('rejects invalid Beta-PERT ordering', () => {
    expect(() => simulateFair({ ...defaults, low: 8, mode: 6, trials: 10, seed: 1 })).toThrow(/≤/);
  });

  it('produces a monotone loss exceedance curve from the simulated loss sample', () => {
    const result = simulateFair({ ...defaults, trials: 5_000, seed: 409 });
    const curve = lossExceedanceCurve(result.losses);

    expect(curve.samples).toBe(5_000);
    expect(curve.points).toHaveLength(21);
    expect(curve.points.every((point, index) => index === 0 || point.exceedanceProbability <= curve.points[index - 1].exceedanceProbability)).toBe(true);
    expect(curve.references.find(reference => reference.percentile === 0.95)?.threshold).toBe(result.var95);
  });

  it('returns zero annual loss when vulnerability is exactly zero', () => {
    const result = simulateFair({ ...defaults, vulnerability: 0, trials: 1_000, seed: 77 });

    expect(result.ale).toBe(0);
    expect(result.var95).toBe(0);
    expect(result.losses.every(loss => loss === 0)).toBe(true);
  });
});
