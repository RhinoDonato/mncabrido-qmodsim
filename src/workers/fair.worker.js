import { histogram, lossExceedanceCurve, simulateFair } from '../engines/fair.js';

self.addEventListener('message', event => {
  const { runId, params } = event.data;
  try {
    const result = simulateFair(params);
    const chart = histogram(result.losses);
    const lec = lossExceedanceCurve(result.losses);
    self.postMessage({ runId, result: { ...result, losses: undefined, chart, lec } });
  } catch (error) {
    self.postMessage({ runId, error: error instanceof Error ? error.message : String(error) });
  }
});
