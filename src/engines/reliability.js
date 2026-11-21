import { assertFiniteNumber, assertProbability } from './validation.js';

export function availability(mtbf, mttr) {
  assertFiniteNumber(mtbf, 'MTBF', { min: Number.EPSILON });
  assertFiniteNumber(mttr, 'MTTR', { min: 0 });
  return mtbf / (mtbf + mttr);
}

export function calculateReliability({ terminalMtbf, apiMtbf, databaseMtbf, mttr, smsAvailability, fallbackAvailability, offlineCacheAvailability = 0.995 }) {
  [smsAvailability, fallbackAvailability, offlineCacheAvailability].forEach((value, index) => assertProbability(value, ['SMS availability', 'fallback availability', 'offline cache availability'][index]));
  const terminal = availability(terminalMtbf, mttr);
  const api = availability(apiMtbf, mttr);
  const database = availability(databaseMtbf, mttr);
  const communication = 1 - (1 - smsAvailability) * (1 - fallbackAvailability);
  const systemAvailability = terminal * api * database * communication;
  const connectedCore = api * database;
  const intakePath = 1 - (1 - connectedCore) * (1 - offlineCacheAvailability);
  const offlineScenarioAvailability = terminal * intakePath * communication;
  return {
    components: { terminal, api, database, communication },
    systemAvailability,
    annualDowntimeHours: (1 - systemAvailability) * 8760,
    offlineScenarioAvailability,
    offlineScenarioDowntimeHours: (1 - offlineScenarioAvailability) * 8760,
  };
}
