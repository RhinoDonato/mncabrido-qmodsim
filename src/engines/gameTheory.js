import { assertFiniteNumber } from './validation.js';

function solve(matrix, vector) {
  const size = vector.length;
  const work = matrix.map((row, index) => [...row, vector[index]]);
  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) if (Math.abs(work[row][column]) > Math.abs(work[pivot][column])) pivot = row;
    [work[column], work[pivot]] = [work[pivot], work[column]];
    if (Math.abs(work[column][column]) < 1e-10) return null;
    const divisor = work[column][column];
    for (let index = column; index <= size; index += 1) work[column][index] /= divisor;
    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = work[row][column];
      for (let index = column; index <= size; index += 1) work[row][index] -= factor * work[column][index];
    }
  }
  return work.map(row => row[size]);
}

function supports(size, count, start = 0, prefix = []) {
  if (prefix.length === count) return [prefix];
  const result = [];
  for (let index = start; index < size; index += 1) result.push(...supports(size, count, index + 1, [...prefix, index]));
  return result;
}

export function findNashEquilibrium(shopPayoffs, customerPayoffs, tolerance = 1e-7) {
  const rows = shopPayoffs.length;
  const columns = shopPayoffs[0]?.length ?? 0;
  if (!rows || !columns || customerPayoffs.length !== rows || shopPayoffs.some(row => row.length !== columns) || customerPayoffs.some(row => row.length !== columns)) throw new TypeError('Payoff matrices must have matching non-empty dimensions.');
  for (let size = 1; size <= Math.min(rows, columns); size += 1) {
    for (const rowSupport of supports(rows, size)) for (const columnSupport of supports(columns, size)) {
      const customerSystem = columnSupport.map(column => [...rowSupport.map(row => customerPayoffs[row][column]), -1]);
      customerSystem.push([...Array(size).fill(1), 0]);
      const shopMixResult = solve(customerSystem, [...Array(size).fill(0), 1]);
      const shopSystem = rowSupport.map(row => [...columnSupport.map(column => shopPayoffs[row][column]), -1]);
      shopSystem.push([...Array(size).fill(1), 0]);
      const customerMixResult = solve(shopSystem, [...Array(size).fill(0), 1]);
      if (!shopMixResult || !customerMixResult || shopMixResult.some(value => value < -tolerance) || customerMixResult.some(value => value < -tolerance)) continue;
      const shopMix = Array(rows).fill(0);
      const customerMix = Array(columns).fill(0);
      rowSupport.forEach((row, index) => { shopMix[row] = shopMixResult[index]; });
      columnSupport.forEach((column, index) => { customerMix[column] = customerMixResult[index]; });
      const shopUtility = shopMix.reduce((sum, probability, row) => sum + probability * customerMix.reduce((subtotal, choiceProbability, column) => subtotal + choiceProbability * shopPayoffs[row][column], 0), 0);
      const customerUtility = customerMix.reduce((sum, probability, column) => sum + probability * shopMix.reduce((subtotal, policyProbability, row) => subtotal + policyProbability * customerPayoffs[row][column], 0), 0);
      const profitableShopDeviation = shopPayoffs.some(row => row.reduce((sum, value, column) => sum + value * customerMix[column], 0) > shopUtility + tolerance);
      const profitableCustomerDeviation = customerPayoffs[0].some((_, column) => shopMix.reduce((sum, probability, row) => sum + probability * customerPayoffs[row][column], 0) > customerUtility + tolerance);
      if (!profitableShopDeviation && !profitableCustomerDeviation) return { shopMix, customerMix, shopUtility, customerUtility, verified: true };
    }
  }
  return null;
}

export function buildDepositGame({ partCost, margin, labor, friction, customerValue }) {
  [partCost, margin, labor, customerValue].forEach((value, index) => assertFiniteNumber(value, ['part cost', 'margin', 'labor', 'customer value'][index], { min: 0 }));
  assertFiniteNumber(friction, 'friction', { min: 0, max: 1 });
  const policies = [{ name: 'No deposit', deposit: 0 }, { name: '30% parts deposit', deposit: 0.3 }, { name: 'Full parts payment', deposit: 1 }];
  const choices = ['Approve & collect', 'Abandon after order', 'Cancel mid-repair'];
  const shopPayoffs = policies.map(({ deposit }) => [margin + labor * (1 - deposit * friction * 2), deposit * partCost - partCost - labor, deposit * partCost - labor * 0.25]);
  const customerPayoffs = policies.map(({ deposit }) => [customerValue - (partCost + margin + labor) - deposit * partCost * friction * 10, -deposit * partCost - customerValue * 0.35, -deposit * partCost - labor * 0.25]);
  const equilibrium = findNashEquilibrium(shopPayoffs, customerPayoffs);
  return { policies, choices, shopPayoffs, customerPayoffs, equilibrium };
}

export function compareDepositPolicies(params, choiceProbabilities = [0.72, 0.18, 0.1]) {
  const game = buildDepositGame(params);
  const total = choiceProbabilities.reduce((sum, value) => sum + value, 0);
  if (choiceProbabilities.length !== 3 || Math.abs(total - 1) > 1e-10 || choiceProbabilities.some(value => value < 0)) throw new RangeError('Customer choice probabilities must be non-negative and sum to one.');
  return game.policies.map((policy, row) => ({
    policy: policy.name,
    deposit: policy.deposit,
    expectedShopOutcome: game.shopPayoffs[row].reduce((sum, value, column) => sum + value * choiceProbabilities[column], 0),
    abandonmentExposure: Math.max(0, -game.shopPayoffs[row][1]) * choiceProbabilities[1],
  }));
}
