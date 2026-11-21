import { histogram, simulateFair } from '../engines/fair.js';

self.addEventListener('message', event => {
  const { runId, params } = event.data;
  try {
    const result = simulateFair(params);
    const chart = histogram(result.losses);
    self.postMessage({ runId, result: { ...result, losses: undefined, chart } });
  } catch (error) {
    self.postMessage({ runId, error: error instanceof Error ? error.message : String(error) });
  }
});
