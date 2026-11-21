import { sampleExponential } from '../engines/arrival.js';
import { simulateFair } from '../engines/fair.js';
import { calculateMarkov } from '../engines/markov.js';
import { calculateQueue } from '../engines/queue.js';
import { createSeededRandom } from '../engines/validation.js';

function result(name, standard, measured, error, passed, parameters) {
  return { name, standard, measured, error, passed, parameters };
}

export function runValidationChecks() {
  const lambda = 5;
  const arrivalRandom = createSeededRandom(4101);
  const count = 100_000;
  let total = 0;
  for (let index = 0; index < count; index += 1) total += sampleExponential(lambda, arrivalRandom);
  const mean = total / count;
  const poissonError = Math.abs(mean - 1 / lambda) / (1 / lambda);
  const queue = calculateQueue({ lambda: 5, mu: 1.5, servers: 3, capacity: 12 });
  const littleDifference = Math.abs(queue.averageInSystem - queue.effectiveArrivalRate * queue.averageTimeInSystem);
  const markov = calculateMarkov({ approval: 0.78, partsAvailable: 0.65, pickup: 0.86, deposit: 0.3 });
  const largestRowError = Math.max(...markov.rowChecks.map(check => Math.abs(check.sum - 1)));
  const fairA = simulateFair({ low: 2, mode: 6, high: 20, vulnerability: 0.35, medianLoss: 25_000, sigma: 0.65, trials: 10_000, seed: 101 });
  const fairB = simulateFair({ low: 2, mode: 6, high: 20, vulnerability: 0.35, medianLoss: 25_000, sigma: 0.65, trials: 10_000, seed: 202 });
  const fairDifference = Math.abs(fairA.ale - fairB.ale) / (fairA.ale || 1);
  return [
    result('Poisson Arrival Invariant', 'Mean inter-arrival approaches 1/λ with relative error < 2%.', `mean ${mean.toFixed(6)} h vs. ${(1 / lambda).toFixed(6)} h`, `${(poissonError * 100).toFixed(3)}% relative`, poissonError < 0.02, `λ=5/h; n=${count.toLocaleString()}; seed=4101`),
    result('Little’s Law', '|L − λeff·W| < 10⁻⁵ using consistent hours.', `L=${queue.averageInSystem.toFixed(8)}; λeff·W=${(queue.effectiveArrivalRate * queue.averageTimeInSystem).toFixed(8)}`, littleDifference.toExponential(3), littleDifference < 1e-5, 'λ=5/h; μ=1.5/h; c=3; K=12'),
    result('Markov Row-Stochasticity', 'Every transition row satisfies ΣPᵢⱼ=1 within 10⁻⁵.', `largest row error ${largestRowError.toExponential(3)}`, largestRowError.toExponential(3), largestRowError < 1e-5, '9 states; approval=.78; parts=.65; pickup=.86; deposit=.30'),
    result('FAIR Monte Carlo Convergence', 'Independent 10,000-trial ALE estimates differ by < 1.5%.', `seed 101: ₱${Math.round(fairA.ale).toLocaleString()}; seed 202: ₱${Math.round(fairB.ale).toLocaleString()}`, `${(fairDifference * 100).toFixed(3)}% relative`, fairDifference < 0.015, '10,000 trials/run; seeds=101,202; illustrative inputs'),
  ];
}

function renderResults(container, results) {
  container.replaceChildren(...results.map(check => {
    const article = document.createElement('article'); article.className = `validation-result ${check.passed ? 'passed' : 'failed'}`;
    const heading = document.createElement('h3'); heading.textContent = check.name;
    const badge = document.createElement('strong'); badge.textContent = check.passed ? 'PASS' : 'FAIL'; badge.className = 'validation-status';
    const standard = document.createElement('p'); standard.textContent = check.standard;
    const measured = document.createElement('dl');
    [['Measured', check.measured], ['Error', check.error], ['Parameters', check.parameters]].forEach(([term, value]) => { const dt = document.createElement('dt'); dt.textContent = term; const dd = document.createElement('dd'); dd.textContent = value; measured.append(dt, dd); });
    article.append(heading, badge, standard, measured); return article;
  }));
}

export function initValidationDrawer() {
  const trigger = document.getElementById('validationTrigger');
  const drawer = document.getElementById('validationDrawer');
  if (!trigger || !drawer) return;
  const close = drawer.querySelector('[data-close-validation]');
  const run = drawer.querySelector('[data-run-validation]');
  const results = drawer.querySelector('#validationResults');
  const stamp = drawer.querySelector('#validationTimestamp');
  const setOpen = open => { drawer.hidden = !open; trigger.setAttribute('aria-expanded', String(open)); if (open) close.focus(); else trigger.focus(); };
  trigger.addEventListener('click', () => setOpen(true)); close.addEventListener('click', () => setOpen(false));
  drawer.addEventListener('keydown', event => {
    if (event.key === 'Escape') { setOpen(false); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...drawer.querySelectorAll('button:not([disabled]),a[href],input,summary,[tabindex]:not([tabindex="-1"])')];
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  run.addEventListener('click', () => {
    run.disabled = true; run.textContent = 'Running…';
    setTimeout(() => { const checks = runValidationChecks(); renderResults(results, checks); stamp.textContent = `Executed ${new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date())}`; run.disabled = false; run.textContent = 'Run verification checks'; }, 20);
  });
}
