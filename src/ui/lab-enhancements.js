import { arrivalRate } from '../engines/arrival.js';
import { calculateQueue } from '../engines/queue.js';
import { calculateMarkov, MARKOV_STATES } from '../engines/markov.js';
import { calculateReliability } from '../engines/reliability.js';
import { buildDepositGame } from '../engines/gameTheory.js';
import { compareIdentifierSecurity } from '../engines/entropy.js';

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
  const height = rect.height || 260;
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(height * ratio);
  const context = canvas.getContext('2d');
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, rect.width, height);
  return { context, width: rect.width, height };
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
  const compact = width < 480;
  const padding = compact ? 14 : 24;
  const gap = compact ? 6 : 12;
  const cardWidth = (width - padding * 2 - gap * 2) / 3;
  const cardY = 47;
  const cardHeight = 92;
  const queuePlaces = Math.max(0, params.capacity - params.techs);
  const queueRatio = queuePlaces ? Math.min(1, result.averageInQueue / queuePlaces) : 0;
  const utilization = Math.min(1, result.technicianUtilization);
  const blocking = Math.min(1, result.blockingProbability);
  const percent = value => `${(value * 100).toFixed(value < .1 ? 1 : 0)}%`;
  const roundRect = (x, y, boxWidth, boxHeight, radius = 10) => {
    const r = Math.min(radius, boxWidth / 2, boxHeight / 2);
    context.beginPath(); context.moveTo(x + r, y); context.lineTo(x + boxWidth - r, y);
    context.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + r); context.lineTo(x + boxWidth, y + boxHeight - r);
    context.quadraticCurveTo(x + boxWidth, y + boxHeight, x + boxWidth - r, y + boxHeight); context.lineTo(x + r, y + boxHeight);
    context.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - r); context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y); context.closePath();
  };
  const cards = [
    { label: compact ? 'TECHS' : 'ACTIVE TECHNICIANS', value: `${params.techs}`, unit: 'stations', ratio: utilization, color: palette.success },
    { label: compact ? 'WAITING' : 'AVERAGE QUEUE', value: result.averageInQueue.toFixed(1), unit: 'devices', ratio: queueRatio, color: palette.blue },
    { label: compact ? 'TURN-AWAY' : 'TURN-AWAY CHANCE', value: percent(blocking), unit: compact ? 'chance' : 'when the shop is full', ratio: blocking, color: palette.danger },
  ];

  context.fillStyle = palette.ink; context.font = `800 ${compact ? 13 : 15}px Nunito, sans-serif`;
  context.fillText('Queue capacity at a glance', padding, 27);
  context.fillStyle = palette.muted; context.font = `700 ${compact ? 9 : 11}px Nunito, sans-serif`; context.textAlign = 'right';
  context.fillText(`M/M/${params.techs}/${params.capacity}`, width - padding, 27); context.textAlign = 'start';

  cards.forEach((card, index) => {
    const x = padding + index * (cardWidth + gap);
    roundRect(x, cardY, cardWidth, cardHeight); context.fillStyle = palette.pale; context.fill();
    context.strokeStyle = palette.line; context.lineWidth = 1; context.stroke();
    context.fillStyle = palette.muted; context.font = `800 ${compact ? 8 : 10}px Nunito, sans-serif`;
    context.fillText(card.label, x + (compact ? 8 : 12), cardY + 19);
    context.fillStyle = palette.ink; context.font = `800 ${compact ? 20 : 27}px Nunito, sans-serif`;
    context.fillText(card.value, x + (compact ? 8 : 12), cardY + 52);
    context.fillStyle = palette.muted; context.font = `700 ${compact ? 9 : 11}px Nunito, sans-serif`;
    context.fillText(card.unit, x + (compact ? 8 : 12), cardY + 69);
    const barX = x + (compact ? 8 : 12), barY = cardY + 78, barWidth = cardWidth - (compact ? 16 : 24);
    roundRect(barX, barY, barWidth, 5, 3); context.fillStyle = palette.background; context.fill();
    if (card.ratio > 0) { roundRect(barX, barY, Math.max(5, barWidth * card.ratio), 5, 3); context.fillStyle = card.color; context.fill(); }
  });

  const shelfY = 170;
  context.fillStyle = palette.ink; context.font = `800 ${compact ? 10 : 12}px Nunito, sans-serif`;
  context.fillText(queuePlaces ? 'WAITING SHELF' : 'NO WAITING SHELF', padding, shelfY);
  context.fillStyle = palette.muted; context.font = `700 ${compact ? 9 : 11}px Nunito, sans-serif`; context.textAlign = 'right';
  context.fillText(queuePlaces ? `${result.averageInQueue.toFixed(1)} of ${queuePlaces} places used` : 'Capacity equals active stations', width - padding, shelfY); context.textAlign = 'start';
  const shelfTop = 184, shelfHeight = 31, shelfWidth = width - padding * 2;
  if (queuePlaces) {
    const slotGap = compact ? 2 : 4;
    const slotWidth = (shelfWidth - slotGap * (queuePlaces - 1)) / queuePlaces;
    for (let index = 0; index < queuePlaces; index += 1) {
      const x = padding + index * (slotWidth + slotGap);
      roundRect(x, shelfTop, slotWidth, shelfHeight, Math.min(6, slotWidth / 3)); context.fillStyle = palette.background; context.fill();
      context.strokeStyle = palette.line; context.stroke();
      const occupied = Math.max(0, Math.min(1, result.averageInQueue - index));
      if (occupied > 0) {
        roundRect(x + 2, shelfTop + 2 + (shelfHeight - 4) * (1 - occupied), Math.max(1, slotWidth - 4), (shelfHeight - 4) * occupied, Math.min(4, slotWidth / 4));
        context.fillStyle = palette.blue; context.fill();
      }
    }
  } else {
    roundRect(padding, shelfTop, shelfWidth, shelfHeight, 6); context.fillStyle = palette.background; context.fill(); context.strokeStyle = palette.line; context.stroke();
  }
  context.fillStyle = palette.muted; context.font = `700 ${compact ? 9 : 11}px Nunito, sans-serif`;
  context.fillText(`${percent(utilization)} technician use`, padding, 240);
  context.textAlign = 'right'; context.fillText(`${Math.max(0, queuePlaces - result.averageInQueue).toFixed(1)} shelf places available`, width - padding, 240); context.textAlign = 'start';
  active?.canvas?.setAttribute('aria-label', `${params.techs} active technician stations at ${percent(utilization)} utilization. ${result.averageInQueue.toFixed(1)} devices wait on average across ${queuePlaces} waiting-shelf places. Turn-away chance is ${percent(blocking)}.`);
}

const MARKOV_NODES = [
  { x: .06, y: .42, label: 'Intake' },
  { x: .20, y: .42, label: 'Diagnosis' },
  { x: .34, y: .42, label: 'Quote' },
  { x: .51, y: .08, label: 'Parts order' },
  { x: .51, y: .42, label: 'Repair' },
  { x: .68, y: .42, label: 'Ready' },
  { x: .87, y: .17, label: 'Released' },
  { x: .87, y: .70, label: 'Canceled' },
  { x: .51, y: .82, label: 'Rework' },
];

const MARKOV_EDGE_LAYOUT = {
  '0-1': { label: [.13, .36] },
  '1-2': { label: [.27, .36] },
  '2-3': { label: [.40, .30] },
  '2-4': { label: [.425, .36] },
  '2-7': { control: [.60, .68], label: [.56, .62] },
  '3-4': { control: [.55, .25], label: [.555, .27] },
  '3-7': { control: [.94, .03], label: [.74, .08] },
  '4-5': { label: [.595, .36] },
  '4-8': { control: [.55, .62], label: [.555, .63] },
  '5-6': { label: [.78, .25] },
  '5-7': { label: [.78, .59] },
  '8-4': { control: [.47, .62], label: [.465, .65] },
  '8-6': { control: [.98, .91], label: [.78, .88] },
};

function drawArrow(context, start, end, layout, probability, palette, plot, showLabel = true) {
  const control = layout.control ? plot(...layout.control) : null;
  const previous = control || start;
  const angle = Math.atan2(end[1] - previous[1], end[0] - previous[0]);
  const tip = [end[0] - Math.cos(angle) * 19, end[1] - Math.sin(angle) * 19];
  context.strokeStyle = palette.line; context.lineWidth = 1.35;
  context.beginPath(); context.moveTo(...start);
  if (control) context.quadraticCurveTo(control[0], control[1], tip[0], tip[1]);
  else context.lineTo(...tip);
  context.stroke();
  context.fillStyle = palette.muted;
  context.beginPath();
  context.moveTo(tip[0], tip[1]);
  context.lineTo(tip[0] - Math.cos(angle - .55) * 6, tip[1] - Math.sin(angle - .55) * 6);
  context.lineTo(tip[0] - Math.cos(angle + .55) * 6, tip[1] - Math.sin(angle + .55) * 6);
  context.closePath(); context.fill();
  if (!showLabel || probability >= 1 || !layout.label) return;
  const [labelX, labelY] = plot(...layout.label);
  const text = probability.toFixed(2);
  context.font = '700 10px Nunito, sans-serif'; context.textAlign = 'center';
  const labelWidth = context.measureText(text).width + 10;
  context.fillStyle = palette.background; context.fillRect(labelX - labelWidth / 2, labelY - 9, labelWidth, 16);
  context.strokeStyle = palette.line; context.strokeRect(labelX - labelWidth / 2, labelY - 9, labelWidth, 16);
  context.fillStyle = palette.muted; context.fillText(text, labelX, labelY + 2);
  context.textAlign = 'start';
}

function drawMarkov(context, width, height, params, palette, phase = 0) {
  const result = calculateMarkov({ approval: params.approval / 100, partsAvailable: params.parts / 100, pickup: params.pickup / 100, deposit: params.deposit / 100 });
  active?.canvas?.setAttribute('aria-label', 'Nine-state repair lifecycle from intake through diagnosis, quotation, parts ordering, repair, pickup readiness, release, cancellation, or warranty rework. Transition probabilities update with the controls.');
  const compact = width < 360;
  const plot = (x, y) => [32 + x * (width - 64), 24 + y * (height - 48)];
  const positions = MARKOV_NODES.map(node => plot(node.x, node.y));
  result.transitionMatrix.forEach((row, from) => row.forEach((probability, to) => {
    if (!probability || from === to) return;
    drawArrow(context, positions[from], positions[to], MARKOV_EDGE_LAYOUT[`${from}-${to}`] || {}, probability, palette, plot, !compact);
  }));
  positions.forEach(([x, y], index) => {
    const absorbing = index === 6 || index === 7;
    const pulse = index === Math.floor(phase) % 9 ? 3 : 0;
    context.beginPath(); context.arc(x, y, 14 + pulse, 0, Math.PI * 2);
    context.fillStyle = absorbing ? (index === 6 ? palette.success : palette.danger) : palette.blue; context.fill();
    context.fillStyle = palette.background; context.font = '800 10px Nunito, sans-serif'; context.textAlign = 'center';
    context.fillText(`S${index}`, x, y + 3);
    if (!compact) {
      context.fillStyle = palette.ink; context.font = '700 10px Nunito, sans-serif';
      context.fillText(MARKOV_NODES[index].label, x, y + 31);
    }
    context.textAlign = 'start';
  });
}

function drawGeneric(context, width, model, params, palette) {
  if (model === 'entropy') {
    const result = compareIdentifierSecurity({ length: params.length, rawRate: params.rate, limitedRate: params.limited });
    const compact = width < 520;
    const left = compact ? 100 : 142;
    const right = width - 22;
    const barRight = Math.max(left + 30, right - 58);
    const barWidth = barRight - left;
    const text = (value, x, y, font, color = palette.ink, align = 'start') => {
      context.fillStyle = color; context.font = font; context.textAlign = align; context.fillText(value, x, y);
    };
    text('IDENTIFIER UNCERTAINTY', 16, 24, '800 10px Nunito, sans-serif', palette.muted);
    text('More bits means more possible IDs to search', 16, 41, `600 ${compact ? 10 : 12}px Nunito, sans-serif`, palette.muted);
    const entropyRows = [
      { label: 'Sequential ID', bits: result.sequential.entropyBits, color: palette.muted },
      { label: `${params.length}-char random token`, bits: result.random.entropyBits, color: palette.blue },
    ];
    entropyRows.forEach((row, index) => {
      const y = 66 + index * 34;
      text(row.label, 16, y + 11, `700 ${compact ? 9 : 11}px Nunito, sans-serif`);
      context.fillStyle = palette.line; context.beginPath(); context.roundRect(left, y, barWidth, 12, 6); context.fill();
      context.fillStyle = row.color; context.beginPath(); context.roundRect(left, y, Math.max(3, barWidth * row.bits / 160), 12, 6); context.fill();
      text(`${row.bits.toFixed(1)} bits`, right, y + 11, '700 10px Nunito, sans-serif', palette.muted, 'right');
    });
    context.strokeStyle = palette.line; context.beginPath(); context.moveTo(16, 143); context.lineTo(width - 16, 143); context.stroke();
    text('GUESS RATE · LOG SCALE', 16, 164, '800 10px Nunito, sans-serif', palette.muted);
    const rateLeft = left, rateRight = barRight, rateWidth = Math.max(30, rateRight - rateLeft);
    const rateX = rate => rateLeft + (Math.log10(rate) + 2) / 5 * rateWidth;
    const rates = [
      { label: 'Unthrottled', value: params.rate, color: palette.blue },
      { label: 'After back-off', value: params.limited, color: palette.success },
    ];
    rates.forEach((rate, index) => {
      const y = 182 + index * 28;
      text(rate.label, 16, y + 8, `700 ${compact ? 9 : 11}px Nunito, sans-serif`);
      context.strokeStyle = palette.line; context.lineWidth = 3; context.beginPath(); context.moveTo(rateLeft, y + 3); context.lineTo(rateRight, y + 3); context.stroke();
      context.fillStyle = rate.color; context.beginPath(); context.arc(rateX(rate.value), y + 3, 5, 0, Math.PI * 2); context.fill();
      text(`${rate.value < 1 ? rate.value.toFixed(2) : rate.value.toLocaleString('en-PH')} / sec`, right, y + 8, '700 9px Nunito, sans-serif', palette.muted, 'right');
    });
    context.textAlign = 'start';
    active?.canvas?.setAttribute('aria-label', `Live identifier security comparison. A sequential ID has ${result.sequential.entropyBits.toFixed(1)} bits of entropy. A ${params.length}-character random token has ${result.random.entropyBits.toFixed(1)} bits. Guess rates are ${params.rate} per second unthrottled and ${params.limited} per second after back-off.`);
    return;
  }
  if (model === 'game') {
    const game = buildDepositGame({ partCost: params.partCost, margin: params.markup, labor: params.labor, friction: params.friction / 100, customerValue: params.customerValue });
    const compact = width < 520;
    const left = compact ? 124 : 166;
    const gap = compact ? 5 : 10;
    const cellWidth = Math.max(30, (width - left - 16 - gap * 2) / 3);
    const rowHeight = 61;
    const top = 64;
    const max = Math.max(1, ...game.shopPayoffs.flat().map(Math.abs));
    const money = value => `${value < 0 ? '−' : ''}₱${Math.round(Math.abs(value)).toLocaleString('en-PH')}`;
    context.fillStyle = palette.ink; context.font = `800 ${compact ? 9 : 11}px Nunito, sans-serif`;
    game.choices.forEach((choice, column) => {
      const label = compact ? ['Approve', 'Abandon', 'Cancel'][column] : choice;
      context.textAlign = 'center'; context.fillText(label, left + column * (cellWidth + gap) + cellWidth / 2, 36);
    });
    context.textAlign = 'start';
    game.policies.forEach((policy, row) => {
      const y = top + row * rowHeight;
      const policyLabel = compact ? ['No deposit', '30% deposit', 'Full payment'][row] : policy.name;
      context.textAlign = 'start'; context.fillStyle = palette.ink; context.font = `700 ${compact ? 9 : 11}px Nunito, sans-serif`;
      context.fillText(policyLabel, 12, y + 22, left - 24);
      game.shopPayoffs[row].forEach((value, column) => {
        const x = left + column * (cellWidth + gap);
        const center = x + cellWidth / 2;
        const barWidth = Math.max(2, Math.abs(value) / max * Math.max(4, (cellWidth - 16) / 2));
        const barX = value < 0 ? center - barWidth : center;
        context.strokeStyle = palette.line; context.lineWidth = 1;
        context.beginPath(); context.moveTo(center, y - 3); context.lineTo(center, y + 19); context.stroke();
        context.fillStyle = value < 0 ? palette.danger : [palette.blue, '#f0a13b', palette.success][column];
        context.beginPath(); context.roundRect(barX, y, barWidth, 12, 5); context.fill();
        context.fillStyle = palette.muted; context.font = `700 ${compact ? 9 : 11}px Nunito, sans-serif`; context.textAlign = 'center';
        context.fillText(money(value), center, y + 36);
      });
      context.strokeStyle = palette.line; context.lineWidth = 1;
      context.beginPath(); context.moveTo(8, y + 48); context.lineTo(width - 8, y + 48); context.stroke();
    });
    context.textAlign = 'start'; context.fillStyle = palette.muted; context.font = '11px Nunito, sans-serif';
    context.fillText('Shop payoff · bars extend from zero; length scales to the largest outcome', 12, 250);
    active?.canvas?.setAttribute('aria-label', `Live shop payoff matrix in Philippine pesos. ${game.policies.map((policy, row) => `${policy.name}: ${game.choices.map((choice, column) => `${choice} ${money(game.shopPayoffs[row][column])}`).join(', ')}`).join('. ')}. Values update with the sliders.`);
    return;
  }
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
    const { bins, bmax, var95, max, signature } = params.riskResult;
    const left = 38, right = width - 18, top = 48, bottom = 208;
    const plotWidth = right - left, plotHeight = bottom - top;
    const fresh = signature === [params.low, params.mode, params.high, params.vuln / 100, params.severity, params.sigma, 20261121].join('|');
    context.strokeStyle = palette.line; context.lineWidth = 1;
    for (let tick = 0; tick <= 4; tick += 1) {
      const y = top + tick * plotHeight / 4;
      context.beginPath(); context.moveTo(left, y); context.lineTo(right, y); context.stroke();
    }
    const slot = plotWidth / bins.length;
    bins.forEach((value, index) => {
      const barHeight = value / Math.max(1, bmax) * plotHeight;
      context.fillStyle = palette.blue;
      context.fillRect(left + index * slot + 1, bottom - barHeight, Math.max(1, slot - 2), barHeight);
    });
    const markerX = left + Math.min(1, var95 / Math.max(1, max)) * plotWidth;
    context.strokeStyle = '#f0a13b'; context.lineWidth = 2; context.setLineDash([5, 4]);
    context.beginPath(); context.moveTo(markerX, top); context.lineTo(markerX, bottom); context.stroke(); context.setLineDash([]);
    context.fillStyle = palette.ink; context.font = '800 11px Nunito, sans-serif';
    context.fillText(fresh ? 'Annual loss distribution · 100,000 simulated years' : 'Previous loss distribution · resampling', left, 27);
    context.fillStyle = palette.muted; context.font = '10px Nunito, sans-serif'; context.textAlign = 'right';
    context.fillText(`95th percentile ${Math.round(var95).toLocaleString('en-PH')} PHP`, right, 27); context.textAlign = 'start';
    context.fillText('₱0', left, 229); context.textAlign = 'right'; context.fillText(`${Math.round(max).toLocaleString('en-PH')} PHP`, right, 229); context.textAlign = 'start';
    active?.canvas?.setAttribute('aria-label', `${fresh ? 'Current' : 'Previous'} annual loss distribution from 100,000 simulated years. The 95th percentile loss is ${Math.round(var95).toLocaleString('en-PH')} Philippine pesos.${fresh ? '' : ' A new simulation is running for the changed slider settings.'}`);
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
  const { context, width, height } = surface;
  const palette = colors();
  context.fillStyle = palette.background; context.fillRect(0, 0, width, height);
  if (active.model === 'arrival') drawArrival(context, width, active.params, palette);
  else if (active.model === 'queue') drawQueue(context, width, active.params, palette);
  else if (active.model === 'markov') drawMarkov(context, width, height, active.params, palette, phase);
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
  section.innerHTML = `<summary>Optional live Canvas view</summary><canvas class="live-canvas" height="260" role="img" aria-label="Synchronized Canvas visualization of the selected mathematical model"></canvas><p class="canvas-description">A synchronized visual alternative; exact values remain available in the metric cards and SVG chart.</p><ul class="markov-state-key" aria-label="Repair lifecycle state key" hidden>${MARKOV_STATES.map((state, index) => `<li><strong>S${index}</strong><span>${state.replace(/^S\d+\s*/, '')}</span></li>`).join('')}</ul>`;
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
  canvas.classList.toggle('markov-canvas', model === 'markov');
  canvas.classList.toggle('queue-canvas', model === 'queue');
  const stateKey = canvas.closest('.canvas-enhancement')?.querySelector('.markov-state-key');
  if (stateKey) stateKey.hidden = model !== 'markov';
  cancelAnimationFrame(animationFrame); animationFrame = 0;
  active = { canvas, model, params };
  updateMatrix(model, params);
  draw();
  if (model === 'markov' && visible && !matchMedia('(prefers-reduced-motion: reduce)').matches) animationFrame = requestAnimationFrame(animate);
}
