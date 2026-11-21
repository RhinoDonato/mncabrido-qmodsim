import { assertFiniteNumber } from './validation.js';

function factorial(value) {
  let result = 1;
  for (let index = 2; index <= value; index += 1) result *= index;
  return result;
}

export function calculateQueue({ lambda, mu, servers, capacity }) {
  assertFiniteNumber(lambda, 'λ', { min: Number.EPSILON });
  assertFiniteNumber(mu, 'μ', { min: Number.EPSILON });
  assertFiniteNumber(servers, 'c', { min: 1, integer: true });
  assertFiniteNumber(capacity, 'K', { min: servers, integer: true });
  const offeredLoad = lambda / mu;
  const rho = lambda / (servers * mu);
  const weights = Array.from({ length: capacity + 1 }, (_, count) => (
    count < servers
      ? offeredLoad ** count / factorial(count)
      : offeredLoad ** servers / factorial(servers) * rho ** (count - servers)
  ));
  const normalizer = weights.reduce((sum, value) => sum + value, 0);
  const probabilities = weights.map(value => value / normalizer);
  const blockingProbability = probabilities[capacity];
  const effectiveArrivalRate = lambda * (1 - blockingProbability);
  const averageInSystem = probabilities.reduce((sum, probability, count) => sum + count * probability, 0);
  const averageInQueue = probabilities.reduce((sum, probability, count) => sum + Math.max(0, count - servers) * probability, 0);
  const averageBusyServers = probabilities.reduce((sum, probability, count) => sum + Math.min(count, servers) * probability, 0);
  const averageTimeInSystem = averageInSystem / effectiveArrivalRate;
  const averageWaitTime = averageInQueue / effectiveArrivalRate;
  return {
    probabilities,
    rho,
    blockingProbability,
    effectiveArrivalRate,
    technicianUtilization: averageBusyServers / servers,
    averageInSystem,
    averageInQueue,
    averageTimeInSystem,
    averageWaitTime,
  };
}
