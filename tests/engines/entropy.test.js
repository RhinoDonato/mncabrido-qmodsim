import { describe, expect, it } from 'vitest';
import { calculateEntropy, compareIdentifierSecurity, secureTrackingToken, TRACKING_ALPHABET } from '../../src/engines/entropy.js';

describe('tracking identifier entropy engine', () => {
  it('calculates uniform token entropy and keyspace', () => {
    const result = calculateEntropy({ length: 12, alphabetSize: 62, guessRate: 100 });

    expect(result.entropyBits).toBeCloseTo(71.4503557, 6);
    expect(result.keyspace).toBe(62 ** 12);
  });

  it('models a four-digit sequential space as approximately 13.3 bits', () => {
    const comparison = compareIdentifierSecurity({ length: 12, rawRate: 100, limitedRate: 0.05 });

    expect(comparison.sequential.entropyBits).toBeCloseTo(13.2877, 3);
    expect(comparison.protectionFactor).toBe(2_000);
  });

  it('uses the supplied Web Crypto boundary and returns alphabet characters only', () => {
    const cryptoApi = { getRandomValues: bytes => { bytes.fill(7); return bytes; } };
    const token = secureTrackingToken(12, cryptoApi);

    expect(token).toHaveLength(12);
    expect([...token].every(character => TRACKING_ALPHABET.includes(character))).toBe(true);
  });

  it('refuses to present an insecure fallback when Web Crypto is absent', () => {
    expect(() => secureTrackingToken(12, null)).toThrow(/Web Crypto/);
  });

  it('keeps the largest UI-supported base-62 keyspace finite', () => {
    const result = calculateEntropy({ length: 24, alphabetSize: 62, guessRate: 0.01 });

    expect(Number.isFinite(result.keyspace)).toBe(true);
    expect(Number.isFinite(result.averageGuessSeconds)).toBe(true);
    expect(result.entropyBits).toBeCloseTo(142.9007115, 6);
  });
});
