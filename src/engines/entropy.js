import { assertFiniteNumber } from './validation.js';

export const TRACKING_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function calculateEntropy({ length, alphabetSize = TRACKING_ALPHABET.length, guessRate }) {
  assertFiniteNumber(length, 'token length', { min: 1, integer: true });
  assertFiniteNumber(alphabetSize, 'alphabet size', { min: 2, integer: true });
  assertFiniteNumber(guessRate, 'guess rate', { min: Number.EPSILON });
  const entropyBits = length * Math.log2(alphabetSize);
  const keyspace = alphabetSize ** length;
  return { entropyBits, keyspace, averageGuessSeconds: keyspace / (2 * guessRate) };
}

export function secureTrackingToken(length = 12, cryptoApi = globalThis.crypto) {
  assertFiniteNumber(length, 'token length', { min: 1, max: 128, integer: true });
  if (!cryptoApi?.getRandomValues) throw new Error('Web Crypto is required for secure tracking tokens.');
  const bytes = new Uint8Array(length);
  const unbiasedLimit = 256 - (256 % TRACKING_ALPHABET.length);
  let output = '';
  while (output.length < length) {
    cryptoApi.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte < unbiasedLimit) output += TRACKING_ALPHABET[byte % TRACKING_ALPHABET.length];
      if (output.length === length) break;
    }
  }
  return output;
}

export function compareIdentifierSecurity({ length, rawRate, limitedRate }) {
  const random = calculateEntropy({ length, guessRate: rawRate });
  const limited = calculateEntropy({ length, guessRate: limitedRate });
  const sequentialKeyspace = 10 ** 4;
  return {
    sequential: { entropyBits: Math.log2(sequentialKeyspace), keyspace: sequentialKeyspace, averageGuessSeconds: sequentialKeyspace / (2 * rawRate) },
    random,
    limited,
    protectionFactor: rawRate / limitedRate,
  };
}
