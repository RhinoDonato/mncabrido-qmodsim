import { describe, expect, it } from 'vitest';
import { assertProbability, validateTransitionMatrix } from '../../src/engines/validation.js';
import { runValidationChecks } from '../../src/ui/validation-drawer.js';

describe('mathematical input validation', () => {
  it('accepts probability boundaries and rejects values outside them', () => {
    expect(assertProbability(0)).toBe(0);
    expect(assertProbability(1)).toBe(1);
    expect(() => assertProbability(1.01)).toThrow(/between/);
  });

  it('reports a non-stochastic transition row without hardcoding a pass', () => {
    const checks = validateTransitionMatrix([[0.5, 0.5], [0.2, 0.7]]);

    expect(checks[0].valid).toBe(true);
    expect(checks[1].valid).toBe(false);
  });

  it('executes all four in-app verification contracts with measured evidence', () => {
    const checks = runValidationChecks();

    expect(checks.map(check => check.name)).toEqual(['Poisson Arrival Invariant', 'Little’s Law', 'Markov Row-Stochasticity', 'FAIR Monte Carlo Convergence']);
    expect(checks.every(check => check.measured && check.error && check.parameters)).toBe(true);
    expect(checks.every(check => check.passed)).toBe(true);
  });
});
