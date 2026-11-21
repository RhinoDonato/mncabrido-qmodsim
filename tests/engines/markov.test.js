import { describe, expect, it } from 'vitest';
import { ABSORBING_STATES, calculateMarkov, MARKOV_STATES } from '../../src/engines/markov.js';

const defaults = { approval: 0.78, partsAvailable: 0.65, pickup: 0.86, deposit: 0.3 };

describe('repair lifecycle Markov engine', () => {
  it('builds all nine required states with row-stochastic transitions', () => {
    const result = calculateMarkov(defaults);

    expect(MARKOV_STATES).toHaveLength(9);
    expect(result.rowChecks.every(check => check.valid)).toBe(true);
  });

  it('keeps Released and Canceled as absorbing states', () => {
    const { transitionMatrix } = calculateMarkov(defaults);

    for (const state of ABSORBING_STATES) {
      expect(transitionMatrix[state][state]).toBe(1);
      expect(transitionMatrix[state].reduce((sum, value) => sum + value, 0)).toBe(1);
    }
  });

  it('reports expected steps from Intake rather than summing every starting state', () => {
    const result = calculateMarkov(defaults);

    expect(result.expectedStepsFromIntake).toBe(result.expectedSteps[0]);
    expect(result.expectedStepsFromIntake).toBeLessThan(result.expectedSteps.reduce((sum, value) => sum + value, 0));
    expect(result.paidProbability + result.canceledProbability).toBeCloseTo(1, 12);
  });

  it('returns the fundamental matrix N=(I-Q)⁻¹ and B=N·R', () => {
    const result = calculateMarkov(defaults);
    const identityMinusQ = result.q.map((row, index) => row.map((value, column) => Number(index === column) - value));

    identityMinusQ.forEach((row, i) => row.forEach((_, j) => {
      const product = row.reduce((sum, value, k) => sum + value * result.fundamentalMatrix[k][j], 0);
      expect(product).toBeCloseTo(Number(i === j), 10);
    }));
    expect(result.absorptionMatrix[0][0]).toBeCloseTo(result.paidProbability, 12);
    expect(result.absorptionMatrix[0][1]).toBeCloseTo(result.canceledProbability, 12);
  });

  it('keeps warranty rework transient and routes it back to repair or paid release', () => {
    const { transitionMatrix } = calculateMarkov(defaults);

    expect(transitionMatrix[8][4]).toBe(0.35);
    expect(transitionMatrix[8][6]).toBe(0.65);
    expect(transitionMatrix[8].reduce((sum, value) => sum + value, 0)).toBe(1);
  });
});
