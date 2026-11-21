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
});
