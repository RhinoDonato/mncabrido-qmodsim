import { assertFiniteNumber } from './validation.js';

export function arrivalRate(time, { base, surge = 0, peak = 4.5, sigma = 0.72 }) {
  assertFiniteNumber(time, 'time');
  assertFiniteNumber(base, 'base arrival rate', { min: 0 });
  assertFiniteNumber(surge, 'surge arrival rate', { min: 0 });
  assertFiniteNumber(peak, 'peak time');
  assertFiniteNumber(sigma, 'surge width', { min: Number.EPSILON });
  return base + surge * Math.exp(-((time - peak) ** 2) / (2 * sigma ** 2));
}

export function integrateExpectedArrivals(params, hours = 8, steps = 800) {
  assertFiniteNumber(hours, 'hours', { min: Number.EPSILON });
  assertFiniteNumber(steps, 'steps', { min: 2, integer: true });
  const width = hours / steps;
  let total = 0;
  for (let index = 0; index <= steps; index += 1) {
    total += arrivalRate(index * width, params) * (index === 0 || index === steps ? 0.5 : 1);
  }
  return total * width;
}

export function sampleExponential(rate, random = Math.random) {
  assertFiniteNumber(rate, 'λ', { min: Number.EPSILON });
  return -Math.log(Math.max(Number.EPSILON, random())) / rate;
}

export function sampleNhpp(params, hours = 8, random = Math.random) {
  const ceiling = params.base + params.surge;
  if (ceiling <= 0) return [];
  const events = [];
  let time = 0;
  while (time < hours) {
    time += sampleExponential(ceiling, random);
    if (time < hours && random() < arrivalRate(time, params) / ceiling) events.push(time);
  }
  return events;
}

export function sampleLognormalService(median, sigma, random = Math.random) {
  assertFiniteNumber(median, 'service-time median', { min: Number.EPSILON });
  assertFiniteNumber(sigma, 'service-time spread', { min: 0 });
  const u1 = Math.max(Number.EPSILON, random());
  const u2 = random();
  const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.exp(Math.log(median) + sigma * normal);
}

export function calculateArrivalModel(params, { hours = 8, random = Math.random } = {}) {
  const events = sampleNhpp(params, hours, random);
  const expected = integrateExpectedArrivals(params, hours);
  return { events, sampledCount: events.length, expected, peakRate: params.base + params.surge };
}
