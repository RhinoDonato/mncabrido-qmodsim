import { arrivalRate } from '../engines/arrival.js';
import { calculateQueue } from '../engines/queue.js';
import { calculateMarkov, MARKOV_STATES } from '../engines/markov.js';
import { calculateReliability } from '../engines/reliability.js';

let active = null;
let animationFrame = 0;
let visible = true;

function colors() {
  const style = getComputedStyle(document.body);
  return {
    background: style.getPropertyValue('--card').trim() || '#ffffff',
    ink: style.getPropertyValue('--ink').trim() || '#18304f',
    muted: style.getPropertyValue('--muted').trim() || '#62738a',
    line: style.getPropertyValue('--line').trim() || '#d8e2f0',
    blue: style.getPropertyValue('--blue').trim() || '#246fd2',
    pale: style.getPropertyValue('--blue-3').trim() || '#e7f1ff',
    danger: '#d65f5f',
    success: '#24956c',
  };
}

function contextFor(canvas) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width) return null;
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(260 * ratio);
  const context = canvas.getContext('2d');
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, rect.width, 260);
  return { context, width: rect.width, height: 260 };
}

function drawGrid(context, width, palette) {
  context.strokeStyle = palette.line;
  context.lineWidth = 1;
  for (let y = 35; y <= 225; y += 38) {
    context.beginPath(); context.moveTo(36, y); context.lineTo(width - 20, y); context.stroke();
  }
}

function drawArrival(context, width, params, palette) {
  drawGrid(context, width, palette);
  const values = Array.from({ length: 81 }, (_, index) => arrivalRate(index / 10, { base: params.base, surge: params.surge, peak: params.peak, sigma: 0.72 }));
  const maximum = 50;
  context.beginPath();
  values.forEach((value, index) => {
    const x = 36 + index / 80 * (width - 58);
    const y = 225 - value / maximum * 180;
    if (index) context.lineTo(x, y); else context.moveTo(x, y);
  });
  context.strokeStyle = palette.blue; context.lineWidth = 3; context.stroke();
  context.fillStyle = palette.muted; context.font = '12px Nunito, sans-serif';
  context.fillText('8:00 AM', 36, 246); context.fillText('4:00 PM', width - 72, 246);
}

function drawQueue(context, width, params, palette) {
  const result = calculateQueue({ lambda: params.lambda, mu: params.mu, servers: params.techs, capacity: params.capacity });
  const columns = Math.min(params.capacity, 16);
  const cellWidth = Math.min(42, (width - 54) / columns);
  const expected = result.averageInSystem;
  context.font = '12px Nunito, sans-serif';
  for (let index = 0; index < params.capacity; index += 1) {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const x = 28 + column * cellWidth;
    const y = 64 + row * 54;
    context.fillStyle = index < expected ? palette.blue : palette.pale;
    context.strokeStyle = index < params.techs ? palette.success : palette.line;
    context.lineWidth = 2; context.fillRect(x, y, cellWidth - 7, 32); context.strokeRect(x, y, cellWidth - 7, 32);
  }
  context.fillStyle = palette.ink; context.font = '700 14px Nunito, sans-serif';
  context.fillText(`${params.techs} technician stations · ${result.averageInQueue.toFixed(1)} devices waiting`, 28, 34);
}

const MARKOV_POSITIONS = [[.08,.2],[.27,.2],[.46,.2],[.65,.08],[.65,.34],[.82,.34],[.92,.15],[.92,.58],[.65,.72]];
function drawMarkov(context, width, params, palette, phase = 0) {
  const result = calculateMarkov({ approval: params.approval / 100, partsAvailable: params.parts / 100, pickup: params.pickup / 100, deposit: params.deposit / 100 });
  const positions = MARKOV_POSITIONS.map(([x, y]) => [30 + x * (width - 70), 32 + y * 215]);
  result.transitionMatrix.forEach((row, from) => row.forEach((probability, to) => {
    if (!probability || from === to) return;
    const [x1, y1] = positions[from], [x2, y2] = positions[to];
    context.strokeStyle = palette.line; context.lineWidth = 1;
    context.beginPath(); context.moveTo(x1, y1); context.lineTo(x2, y2); context.stroke();
    if (probability < 1) { context.fillStyle = palette.muted; context.font = '10px Nunito, sans-serif'; context.fillText(probability.toFixed(2), (x1 + x2) / 2, (y1 + y2) / 2 - 3); }
  }));
  positions.forEach(([x, y], index) => {
    const absorbing = index === 6 || index === 7;
    const pulse = index === Math.floor(phase) % 9 ? 3 : 0;
    context.beginPath(); context.arc(x, y, 14 + pulse, 0, Math.PI * 2);
    context.fillStyle = absorbing ? (index === 6 ? palette.success : palette.danger) : palette.blue; context.fill();
    context.fillStyle = palette.ink; context.font = '700 10px Nunito, sans-serif'; context.textAlign = 'center';
    context.fillText(`S${index}`, x, y + 29); context.textAlign = 'start';
  });
}

function drawGeneric(context, width, model, params, palette) {
  if (model === 'reliability') {
    const result = calculateReliability({ terminalMtbf: params.terminal, apiMtbf: params.api, databaseMtbf: params.database, mttr: params.repair, smsAvailability: params.sms / 100, fallbackAvailability: params.fallback / 100 });
    const labels = ['Terminal', 'API', 'Ledger', 'SMS ∥ Email'];
    labels.forEach((label, index) => {
      const x = 24 + index * (width - 48) / 4;
      context.fillStyle = palette.pale; context.strokeStyle = palette.blue; context.lineWidth = 2;
      context.fillRect(x, 84, Math.max(78, (width - 88) / 4), 62); context.strokeRect(x, 84, Math.max(78, (width - 88) / 4), 62);
      context.fillStyle = palette.ink; context.font = '700 12px Nunito, sans-serif'; context.fillText(label, x + 10, 119);
      if (index < 3) { context.beginPath(); context.moveTo(x + Math.max(78, (width - 88) / 4), 115); context.lineTo(x + (width - 48) / 4, 115); context.stroke(); }
    });
    context.fillText(`System availability ${(result.systemAvailability * 100).toFixed(3)}%`, 24, 188);
    return;
  }
  if (model === 'risk' && params.riskResult) {
    const { bins, bmax } = params.riskResult;
    bins.forEach((value, index) => { const barWidth = (width - 54) / bins.length; const height = value / bmax * 170; context.fillStyle = palette.blue; context.fillRect(32 + index * barWidth, 215 - height, barWidth - 3, height); });
    return;
  }
  context.fillStyle = palette.pale; context.fillRect(24, 54, width - 48, 150);
  context.fillStyle = palette.blue; context.font = '800 18px Nunito, sans-serif';
  context.fillText(model === 'entropy' ? 'Secure keyspace and throttling comparison' : 'Payoff comparison remains synchronized above', 42, 126);
  context.fillStyle = palette.muted; context.font = '13px Nunito, sans-serif'; context.fillText('Adjust a slider to redraw this Canvas view.', 42, 154);
}

function updateMatrix(model, params) {
  const details = document.querySelector('.markov-matrix');
  if (!details) return;
  details.hidden = model !== 'markov';
  if (model !== 'markov') return;
  const result = calculateMarkov({ approval: params.approval / 100, partsAvailable: params.parts / 100, pickup: params.pickup / 100, deposit: params.deposit / 100 });
  const table = details.querySelector('tbody');
  table.replaceChildren(...result.transitionMatrix.map((row, index) => {
    const tr = document.createElement('tr');
    const heading = document.createElement('th'); heading.scope = 'row'; heading.textContent = `S${index}`; tr.appendChild(heading);
    row.forEach(value => { const td = document.createElement('td'); td.textContent = value.toFixed(2); tr.appendChild(td); });
    const total = document.createElement('td'); total.textContent = row.reduce((sum, value) => sum + value, 0).toFixed(2); tr.appendChild(total);
    return tr;
  }));
}

function draw(phase = 0) {
  if (!active?.canvas?.isConnected) return;
  const surface = contextFor(active.canvas);
  if (!surface) return;
  const { context, width } = surface;
  const palette = colors();
  context.fillStyle = palette.background; context.fillRect(0, 0, width, 260);
  if (active.model === 'arrival') drawArrival(context, width, active.params, palette);
  else if (active.model === 'queue') drawQueue(context, width, active.params, palette);
  else if (active.model === 'markov') drawMarkov(context, width, active.params, palette, phase);
  else drawGeneric(context, width, active.model, active.params, palette);
}

function animate(time) {
  draw(time / 700);
  if (active?.model === 'markov' && visible && !matchMedia('(prefers-reduced-motion: reduce)').matches) animationFrame = requestAnimationFrame(animate);
}

export function initLabEnhancements(simulation) {
  const visual = simulation?.querySelector('.visual-panel');
  if (!visual || visual.querySelector('.canvas-enhancement')) return;
  const section = document.createElement('details');
  section.className = 'canvas-enhancement'; section.open = true;
  section.innerHTML = '<summary>Optional live Canvas view</summary><canvas class="live-canvas" height="260" role="img" aria-label="Synchronized Canvas visualization of the selected mathematical model"></canvas><p class="canvas-description">A synchronized visual alternative; exact values remain available in the metric cards and SVG chart.</p>';
  visual.appendChild(section);
  const matrix = document.createElement('details'); matrix.className = 'markov-matrix'; matrix.hidden = true;
  matrix.innerHTML = `<summary>Nine-state transition matrix</summary><div class="matrix-scroll"><table><caption>Rows are source states; columns are destination states. S6 and S7 are absorbing.</caption><thead><tr><th>From</th>${MARKOV_STATES.map((_, index) => `<th>S${index}</th>`).join('')}<th>Σ</th></tr></thead><tbody></tbody></table></div>`;
  visual.appendChild(matrix);
  const observer = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; if (visible && active?.model === 'markov' && !animationFrame) animationFrame = requestAnimationFrame(animate); });
  observer.observe(section);
  new ResizeObserver(() => draw()).observe(section);
}

export function updateLabEnhancements(model, params) {
  const canvas = document.querySelector('.live-canvas');
  if (!canvas) return;
  cancelAnimationFrame(animationFrame); animationFrame = 0;
  active = { canvas, model, params };
  updateMatrix(model, params);
  draw();
  if (model === 'markov' && visible && !matchMedia('(prefers-reduced-motion: reduce)').matches) animationFrame = requestAnimationFrame(animate);
}
