export function assertFiniteNumber(value, name, { min = -Infinity, max = Infinity, integer = false } = {}) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be a finite number.`);
  if (integer && !Number.isInteger(value)) throw new RangeError(`${name} must be an integer.`);
  if (value < min || value > max) throw new RangeError(`${name} must be between ${min} and ${max}.`);
  return value;
}

export function assertProbability(value, name = 'probability') {
  return assertFiniteNumber(value, name, { min: 0, max: 1 });
}

export function validatePert(low, mode, high) {
  [low, mode, high].forEach((value, index) => assertFiniteNumber(value, ['low', 'mode', 'high'][index], { min: 0 }));
  if (low > mode || mode > high) throw new RangeError('Beta-PERT parameters must satisfy low ≤ mode ≤ high.');
  return { low, mode, high };
}

export function validateTransitionMatrix(matrix, tolerance = 1e-10) {
  if (!Array.isArray(matrix) || !matrix.length || matrix.some(row => !Array.isArray(row) || row.length !== matrix.length)) {
    throw new TypeError('Transition matrix must be a non-empty square matrix.');
  }
  return matrix.map((row, index) => {
    row.forEach((value, column) => assertProbability(value, `P[${index}][${column}]`));
    const sum = row.reduce((total, value) => total + value, 0);
    return { index, sum, valid: Math.abs(sum - 1) <= tolerance };
  });
}

export function createSeededRandom(seed = 1) {
  assertFiniteNumber(seed, 'seed', { integer: true });
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
