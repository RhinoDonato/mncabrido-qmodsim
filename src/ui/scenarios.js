import { calculateQueue } from '../engines/queue.js';
import { compareDepositPolicies } from '../engines/gameTheory.js';
import { compareIdentifierSecurity, secureTrackingToken } from '../engines/entropy.js';

const money = value => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value);
const percent = value => `${(value * 100).toFixed(1)}%`;
const CHART_HEIGHT = 230;

function formatBarValue(value, format) {
  if (format === 'percent') return percent(value);
  if (format === 'currency') return money(value);
  if (format === 'bits') return `${value.toFixed(1)} bits`;
  if (format === 'log') return value.toFixed(1);
  return value.toFixed(1);
}

function roundedBar(context, x, y, width, height, fill) {
  context.beginPath();
  context.roundRect(x, y, Math.max(0, width), height, height / 2);
  context.fillStyle = fill;
  context.fill();
}

function drawBars(canvas, before, after, labels, formats = ['number', 'number']) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width) return;
  const ratio = Math.min(2, devicePixelRatio || 1);
  canvas.width = rect.width * ratio; canvas.height = CHART_HEIGHT * ratio;
  const context = canvas.getContext('2d'); context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const styles = getComputedStyle(document.body);
  const palette = { ink: styles.getPropertyValue('--ink').trim(), muted: styles.getPropertyValue('--muted').trim(), line: styles.getPropertyValue('--line').trim(), blue: styles.getPropertyValue('--blue').trim(), pale: styles.getPropertyValue('--blue-3').trim() };
  context.clearRect(0, 0, rect.width, CHART_HEIGHT);
  context.font = '700 10px Nunito, sans-serif';
  context.fillStyle = palette.muted;
  roundedBar(context, 18, 17, 22, 8, palette.muted);
  context.fillText('BASELINE', 47, 25);
  roundedBar(context, 119, 17, 22, 8, palette.blue);
  context.fillText('SELECTED', 148, 25);

  const barX = 78;
  const plotWidth = Math.max(80, rect.width - barX - 82);
  const valueX = rect.width - 16;
  const groupTops = [48, 137];

  labels.forEach((label, index) => {
    const top = groupTops[index];
    const maximum = formats[index] === 'percent' ? 1 : Math.max(before[index], after[index], Number.EPSILON);
    const baselineY = top + 24;
    const selectedY = top + 50;

    context.fillStyle = palette.ink;
    context.font = '700 13px Nunito, sans-serif';
    context.fillText(label, 18, top);
    context.font = '700 10px Nunito, sans-serif';
    context.fillStyle = palette.muted;
    context.fillText('Before', 18, baselineY + 10);
    context.fillStyle = palette.blue;
    context.fillText('After', 18, selectedY + 10);

    roundedBar(context, barX, baselineY, plotWidth, 12, palette.pale);
    roundedBar(context, barX, baselineY, plotWidth * before[index] / maximum, 12, palette.muted);
    roundedBar(context, barX, selectedY, plotWidth, 12, palette.pale);
    roundedBar(context, barX, selectedY, plotWidth * after[index] / maximum, 12, palette.blue);

    context.textAlign = 'right';
    context.font = '800 11px Nunito, sans-serif';
    context.fillStyle = palette.muted;
    context.fillText(formatBarValue(before[index], formats[index]), valueX, baselineY + 10);
    context.fillStyle = palette.blue;
    context.fillText(formatBarValue(after[index], formats[index]), valueX, selectedY + 10);
    context.textAlign = 'left';
  });

  context.strokeStyle = palette.line;
  context.beginPath(); context.moveTo(18, 124); context.lineTo(rect.width - 18, 124); context.stroke();
  canvas._scenarioChartData = { before, after, labels, formats };
  canvas.setAttribute('aria-label', labels.map((label, index) => `${label}: baseline ${formatBarValue(before[index], formats[index])}, selected ${formatBarValue(after[index], formats[index])}`).join('. '));
}

function queueDecision(option) {
  const baselineParams = { lambda: 8, mu: 1.5, servers: 3, capacity: 10 };
  const changed = { ...baselineParams };
  if (option === 'technician') changed.servers = 4;
  if (option === 'capacity') changed.capacity = 16;
  if (option === 'efficiency') changed.mu = 1.9;
  const before = calculateQueue(baselineParams), after = calculateQueue(changed);
  return {
    beforeText: `${percent(before.technicianUtilization)} use · ${percent(before.blockingProbability)} blocked · ${before.averageInQueue.toFixed(1)} waiting`,
    afterText: `${percent(after.technicianUtilization)} use · ${percent(after.blockingProbability)} blocked · ${after.averageInQueue.toFixed(1)} waiting`,
    explanation: option === 'capacity' ? 'More shelf space reduces immediate turn-away but does not add service capacity, so waiting can remain high.' : 'This decision changes a real M/M/c/K parameter and recalculates occupancy, blocking, utilization, and waiting.',
    barsBefore: [before.blockingProbability, before.averageInQueue], barsAfter: [after.blockingProbability, after.averageInQueue], labels: ['Blocking probability', 'Average devices waiting'], barFormats: ['percent', 'number'],
  };
}

function depositDecision(option) {
  const policies = compareDepositPolicies({ partCost: 6_000, margin: 3_000, labor: 1_000, friction: 0.04, customerValue: 25_000 });
  const index = { none: 0, partial: 1, full: 2 }[option];
  const baseline = policies[0], selected = policies[index];
  return {
    beforeText: `${money(baseline.expectedShopOutcome)} expected · ${money(baseline.abandonmentExposure)} exposure`,
    afterText: `${money(selected.expectedShopOutcome)} expected · ${money(selected.abandonmentExposure)} exposure`,
    explanation: index === 2 ? 'Full parts payment covers parts exposure in this payoff model, while labor risk and customer-friction assumptions remain visible.' : 'The chosen deposit changes the payoff matrix; the comparison uses 72% collection, 18% abandonment, and 10% cancellation as illustrative lifecycle probabilities.',
    barsBefore: [Math.max(0, baseline.expectedShopOutcome), baseline.abandonmentExposure], barsAfter: [Math.max(0, selected.expectedShopOutcome), selected.abandonmentExposure], labels: ['Expected shop outcome', 'Abandonment exposure'], barFormats: ['currency', 'currency'],
  };
}

function securityDecision(option) {
  const comparison = compareIdentifierSecurity({ length: 12, rawRate: 100, limitedRate: 0.05 });
  const protectedResult = option === 'limited' ? comparison.limited : comparison.random;
  const token = secureTrackingToken(12);
  const rate = option === 'limited' ? 0.05 : 100;
  return {
    beforeText: `${comparison.sequential.entropyBits.toFixed(1)} bits · 10,000 values · 100 guesses/s`,
    afterText: `${comparison.random.entropyBits.toFixed(1)} bits · ${comparison.random.keyspace.toExponential(2)} values · ${rate} guesses/s`,
    explanation: `Mock secure sample ${token}. ${option === 'limited' ? `Back-off adds a ${comparison.protectionFactor.toLocaleString()}× rate protection factor.` : 'Randomness expands the keyspace; server-side authorization is still essential.'}`,
    barsBefore: [comparison.sequential.entropyBits, Math.log10(comparison.sequential.averageGuessSeconds + 1)], barsAfter: [comparison.random.entropyBits, Math.log10(protectedResult.averageGuessSeconds + 1)], labels: ['Entropy', 'log₁₀ average guess seconds'], barFormats: ['bits', 'log'],
  };
}

function reset(card) {
  card.querySelectorAll('[data-option]').forEach(button => { button.classList.remove('selected'); button.setAttribute('aria-pressed', 'false'); });
  card.querySelector('[data-before]').textContent = 'Run a decision';
  card.querySelector('[data-after]').textContent = '—';
  const canvas = card.querySelector('canvas');
  canvas._scenarioChartData = null;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  canvas.setAttribute('aria-label', 'Choose a decision to draw the before-and-after comparison.');
}

export function initScenarioWalkthroughs() {
  const cards = [...document.querySelectorAll('.decision-scenario')];
  cards.forEach(card => {
    card.querySelectorAll('[data-option]').forEach(button => {
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        card.querySelectorAll('[data-option]').forEach(item => { item.classList.toggle('selected', item === button); item.setAttribute('aria-pressed', String(item === button)); });
        const model = card.dataset.scenario;
        const outcome = model === 'queue' ? queueDecision(button.dataset.option) : model === 'deposit' ? depositDecision(button.dataset.option) : securityDecision(button.dataset.option);
        card.querySelector('[data-before]').textContent = outcome.beforeText;
        card.querySelector('[data-after]').textContent = outcome.afterText;
        card.querySelector('[data-explanation]').textContent = outcome.explanation;
        drawBars(card.querySelector('canvas'), outcome.barsBefore, outcome.barsAfter, outcome.labels, outcome.barFormats);
      });
    });
    card.querySelector('[data-reset]').addEventListener('click', () => reset(card));
    const canvas = card.querySelector('canvas');
    new ResizeObserver(() => {
      const data = canvas._scenarioChartData;
      if (data) drawBars(canvas, data.before, data.after, data.labels, data.formats);
    }).observe(canvas);
  });
  if (cards.length) new MutationObserver(() => {
    cards.forEach(card => {
      const canvas = card.querySelector('canvas');
      const data = canvas._scenarioChartData;
      if (data) drawBars(canvas, data.before, data.after, data.labels, data.formats);
    });
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
}
