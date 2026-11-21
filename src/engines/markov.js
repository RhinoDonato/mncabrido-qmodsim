import { assertProbability, validateTransitionMatrix } from './validation.js';

export const MARKOV_STATES = [
  'S0 Intake', 'S1 Diagnosis', 'S2 Quoted', 'S3 Parts On Order', 'S4 Under Repair',
  'S5 Ready for Pickup', 'S6 Released/Paid', 'S7 Canceled/Abandoned', 'S8 Warranty Rework',
];
export const TRANSIENT_STATES = [0, 1, 2, 3, 4, 5, 8];
export const ABSORBING_STATES = [6, 7];

function solve(matrix, vector) {
  const size = vector.length;
  const augmented = matrix.map((row, index) => [...row, vector[index]]);
  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) pivot = row;
    [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];
    const divisor = augmented[column][column];
    if (Math.abs(divisor) < 1e-12) throw new RangeError('Transition system is singular and cannot be absorbed.');
    for (let index = column; index <= size; index += 1) augmented[column][index] /= divisor;
    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = augmented[row][column];
      for (let index = column; index <= size; index += 1) augmented[row][index] -= factor * augmented[column][index];
    }
  }
  return augmented.map(row => row[size]);
}

export function buildTransitionMatrix({ approval, partsAvailable, pickup, deposit }) {
  [approval, partsAvailable, pickup, deposit].forEach((value, index) => assertProbability(value, ['approval', 'partsAvailable', 'pickup', 'deposit'][index]));
  const matrix = Array.from({ length: 9 }, () => Array(9).fill(0));
  matrix[0][1] = 1;
  matrix[1][2] = 1;
  matrix[2][3] = approval * (1 - partsAvailable);
  matrix[2][4] = approval * partsAvailable;
  matrix[2][7] = 1 - approval;
  matrix[3][4] = 0.88 + 0.12 * deposit;
  matrix[3][7] = 1 - matrix[3][4];
  matrix[4][5] = 0.94;
  matrix[4][8] = 0.06;
  matrix[5][6] = pickup;
  matrix[5][7] = 1 - pickup;
  matrix[6][6] = 1;
  matrix[7][7] = 1;
  matrix[8][4] = 0.35;
  matrix[8][6] = 0.65;
  return matrix;
}

export function calculateMarkov(params) {
  const transitionMatrix = buildTransitionMatrix(params);
  const rowChecks = validateTransitionMatrix(transitionMatrix);
  if (rowChecks.some(check => !check.valid)) throw new RangeError('Every Markov transition row must sum to one.');
  const q = TRANSIENT_STATES.map(from => TRANSIENT_STATES.map(to => transitionMatrix[from][to]));
  const r = TRANSIENT_STATES.map(from => ABSORBING_STATES.map(to => transitionMatrix[from][to]));
  const identityMinusQ = q.map((row, index) => row.map((value, column) => (index === column ? 1 : 0) - value));
  const inverseColumns = Array.from({ length: q.length }, (_, column) => solve(identityMinusQ, Array.from({ length: q.length }, (_, row) => Number(row === column))));
  const fundamentalMatrix = Array.from({ length: q.length }, (_, row) => inverseColumns.map(column => column[row]));
  const expectedSteps = fundamentalMatrix.map(row => row.reduce((sum, value) => sum + value, 0));
  const absorptionMatrix = fundamentalMatrix.map(row => ABSORBING_STATES.map((_, outcome) => row.reduce((sum, value, column) => sum + value * r[column][outcome], 0)));
  return {
    transitionMatrix,
    q,
    r,
    fundamentalMatrix,
    absorptionMatrix,
    expectedSteps,
    expectedStepsFromIntake: expectedSteps[0],
    paidProbability: absorptionMatrix[0][0],
    canceledProbability: absorptionMatrix[0][1],
    rowChecks,
  };
}
