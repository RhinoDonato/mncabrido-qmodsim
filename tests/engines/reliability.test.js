import { describe, expect, it } from 'vitest';
import { availability, calculateReliability } from '../../src/engines/reliability.js';

describe('reliability engine', () => {
  it('calculates inherent availability from MTBF and MTTR', () => {
    expect(availability(996, 4)).toBe(0.996);
  });

  it('combines series components and parallel communication paths', () => {
    const result = calculateReliability({ terminalMtbf: 4_000, apiMtbf: 3_500, databaseMtbf: 5_000, mttr: 4, smsAvailability: 0.995, fallbackAvailability: 0.992 });
    const communication = 1 - (1 - 0.995) * (1 - 0.992);
    const expected = (4_000 / 4_004) * (3_500 / 3_504) * (5_000 / 5_004) * communication;

    expect(result.systemAvailability).toBeCloseTo(expected, 12);
    expect(result.annualDowntimeHours).toBeCloseTo((1 - expected) * 8_760, 12);
  });

  it('labels offline caching as a theoretical scenario with higher modeled availability', () => {
    const result = calculateReliability({ terminalMtbf: 4_000, apiMtbf: 3_500, databaseMtbf: 5_000, mttr: 4, smsAvailability: 0.995, fallbackAvailability: 0.992 });

    expect(result.offlineScenarioAvailability).toBeGreaterThan(result.systemAvailability);
  });
});
