import { describe, expect, it } from 'vitest';
import { arrivalRate, integrateExpectedArrivals, sampleExponential, sampleLognormalService, sampleNhpp } from '../../src/engines/arrival.js';
import { createSeededRandom } from '../../src/engines/validation.js';

describe('arrival engine', () => {
  it('integrates a constant Poisson rate to rate multiplied by time', () => {
    const expected = integrateExpectedArrivals({ base: 6, surge: 0, peak: 4, sigma: 0.72 }, 8);

    expect(expected).toBeCloseTo(48, 10);
  });

  it('returns the baseline plus full surge at the peak', () => {
    const rate = arrivalRate(4.5, { base: 6, surge: 18, peak: 4.5, sigma: 0.72 });

    expect(rate).toBe(24);
  });

  it('samples a mean inter-arrival time within two percent of 1/λ', () => {
    const random = createSeededRandom(4101);
    const samples = Array.from({ length: 100_000 }, () => sampleExponential(5, random));
    const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;

    expect(Math.abs(mean - 0.2) / 0.2).toBeLessThan(0.02);
  });

  it('provides positive optional lognormal service times', () => {
    const serviceTime = sampleLognormalService(2, 0.65, createSeededRandom(8));

    expect(serviceTime).toBeGreaterThan(0);
  });

  it('samples NHPP daily counts close to the integrated intensity', () => {
    const params = { base: 6, surge: 18, peak: 4.5, sigma: 0.72 };
    const expected = integrateExpectedArrivals(params, 8);
    const random = createSeededRandom(3301);
    const days = 2_000;
    let total = 0;
    for (let day = 0; day < days; day += 1) total += sampleNhpp(params, 8, random).length;

    expect(Math.abs(total / days - expected) / expected).toBeLessThan(0.03);
  });
});
