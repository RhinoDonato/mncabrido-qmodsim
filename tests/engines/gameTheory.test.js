import { describe, expect, it } from 'vitest';
import { buildDepositGame, compareDepositPolicies, findNashEquilibrium } from '../../src/engines/gameTheory.js';

describe('deposit game engine', () => {
  it('finds and verifies a pure Nash equilibrium in a dominant-strategy game', () => {
    const equilibrium = findNashEquilibrium([[3, 3], [1, 1]], [[2, 0], [2, 0]]);

    expect(equilibrium?.verified).toBe(true);
    expect(equilibrium?.shopMix).toEqual([1, 0]);
    expect(equilibrium?.customerMix).toEqual([1, 0]);
  });

  it('builds the three documented shop and customer strategies', () => {
    const game = buildDepositGame({ partCost: 6_000, margin: 3_000, labor: 1_000, friction: 0.04, customerValue: 25_000 });

    expect(game.policies).toHaveLength(3);
    expect(game.choices).toHaveLength(3);
    expect(game.equilibrium?.verified).toBe(true);
  });

  it('shows that full parts payment removes parts exposure but retains labor risk', () => {
    const policies = compareDepositPolicies({ partCost: 6_000, margin: 3_000, labor: 1_000, friction: 0.04, customerValue: 25_000 });

    expect(policies[2].abandonmentExposure).toBeCloseTo(180, 10);
    expect(policies[2].abandonmentExposure).toBeLessThan(policies[0].abandonmentExposure);
  });
});
