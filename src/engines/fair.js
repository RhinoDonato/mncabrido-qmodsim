import { assertFiniteNumber, assertProbability, createSeededRandom, validatePert } from './validation.js';

function normal(random) {
  const u1 = Math.max(Number.EPSILON, random());
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * random());
}

function gamma(shape, random) {
  if (shape < 1) return gamma(shape + 1, random) * random() ** (1 / shape);
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let value;
    let sample;
    do {
      sample = normal(random);
      value = 1 + c * sample;
    } while (value <= 0);
    value **= 3;
    const uniform = random();
    if (uniform < 1 - 0.0331 * sample ** 4 || Math.log(uniform) < 0.5 * sample ** 2 + d * (1 - value + Math.log(value))) return d * value;
  }
}

function beta(alpha, betaShape, random) {
  const x = gamma(alpha, random);
  const y = gamma(betaShape, random);
  return x / (x + y);
}

function poisson(mean, random) {
  if (mean <= 0) return 0;
  if (mean > 30) return Math.max(0, Math.round(mean + Math.sqrt(mean) * normal(random)));
  const threshold = Math.exp(-mean);
  let product = 1;
  let count = 0;
  do {
    count += 1;
    product *= random();
  } while (product > threshold);
  return count - 1;
}

export function sampleBetaPert(low, mode, high, random = Math.random) {
  validatePert(low, mode, high);
  if (low === high) return low;
  const alpha = 1 + 4 * (mode - low) / (high - low);
  const betaShape = 1 + 4 * (high - mode) / (high - low);
  return low + (high - low) * beta(alpha, betaShape, random);
}

export function validateFairParameters(params) {
  validatePert(params.low, params.mode, params.high);
  assertProbability(params.vulnerability, 'vulnerability');
  assertFiniteNumber(params.medianLoss, 'median loss', { min: Number.EPSILON });
  assertFiniteNumber(params.sigma, 'loss spread', { min: 0 });
  assertFiniteNumber(params.trials, 'trial count', { min: 1, integer: true });
  return params;
}

export function simulateFair(params) {
  validateFairParameters(params);
  const random = params.random ?? createSeededRandom(params.seed ?? 1);
  const alpha = Math.max(0.1, params.vulnerability * 12);
  const betaShape = Math.max(0.1, (1 - params.vulnerability) * 12);
  const losses = new Float64Array(params.trials);
  let total = 0;
  for (let trial = 0; trial < params.trials; trial += 1) {
    const frequency = sampleBetaPert(params.low, params.mode, params.high, random);
    const vulnerability = params.vulnerability === 0
      ? 0
      : params.vulnerability === 1
        ? 1
        : beta(alpha, betaShape, random);
    const eventCount = poisson(frequency * vulnerability, random);
    let annualLoss = 0;
    for (let event = 0; event < eventCount; event += 1) annualLoss += Math.exp(Math.log(params.medianLoss) + params.sigma * normal(random));
    losses[trial] = annualLoss;
    total += annualLoss;
  }
  const sorted = Array.from(losses).sort((a, b) => a - b);
  const percentile = probability => sorted[Math.min(sorted.length - 1, Math.floor(probability * (sorted.length - 1)))];
  return { ale: total / params.trials, var95: percentile(0.95), losses: sorted, trials: params.trials, seed: params.seed ?? null };
}

export function calculateRosi(baselineAle, mitigatedAle, controlCost) {
  [baselineAle, mitigatedAle, controlCost].forEach((value, index) => assertFiniteNumber(value, ['baseline ALE', 'mitigated ALE', 'control cost'][index], { min: 0 }));
  if (controlCost === 0) return null;
  return ((baselineAle - mitigatedAle) - controlCost) / controlCost;
}

export function histogram(losses, binCount = 18, capPercentile = 0.995) {
  assertFiniteNumber(binCount, 'bin count', { min: 1, integer: true });
  const maximum = losses[Math.min(losses.length - 1, Math.floor(capPercentile * losses.length))] || 1;
  const bins = Array(binCount).fill(0);
  for (const loss of losses) bins[Math.min(binCount - 1, Math.floor(loss / maximum * binCount))] += 1;
  return { bins, maximum, largestBin: Math.max(...bins) };
}

export function lossExceedanceCurve(losses, pointCount = 21, capPercentile = 0.995) {
  if (!losses?.length) throw new RangeError('Annual loss samples are required for an exceedance curve.');
  assertFiniteNumber(pointCount, 'LEC point count', { min: 2, integer: true });
  assertProbability(capPercentile, 'LEC cap percentile');
  const sorted = Array.from(losses);
  sorted.forEach(loss => assertFiniteNumber(loss, 'annual loss', { min: 0 }));
  sorted.sort((a, b) => a - b);
  const maximum = sorted[Math.min(sorted.length - 1, Math.floor(capPercentile * (sorted.length - 1)))] || 1;
  const exceedanceAt = threshold => {
    let low = 0;
    let high = sorted.length;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (sorted[middle] <= threshold) low = middle + 1;
      else high = middle;
    }
    return (sorted.length - low) / sorted.length;
  };
  const points = Array.from({ length: pointCount }, (_, index) => {
    const threshold = maximum * index / (pointCount - 1);
    return { threshold, exceedanceProbability: exceedanceAt(threshold) };
  });
  const references = [0.5, 0.75, 0.9, 0.95, 0.99].map(percentile => {
    const threshold = sorted[Math.min(sorted.length - 1, Math.floor(percentile * (sorted.length - 1)))];
    return { percentile, threshold, exceedanceProbability: exceedanceAt(threshold) };
  });
  return { points, references, maximum, samples: sorted.length };
}
