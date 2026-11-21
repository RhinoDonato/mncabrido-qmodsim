import { arrivalRate, calculateArrivalModel } from './src/engines/arrival.js';
import { calculateQueue } from './src/engines/queue.js';
import { calculateMarkov } from './src/engines/markov.js';
import { histogram, simulateFair } from './src/engines/fair.js';
import { buildDepositGame } from './src/engines/gameTheory.js';
import { compareIdentifierSecurity, secureTrackingToken } from './src/engines/entropy.js';
import { calculateReliability } from './src/engines/reliability.js';
import { initLabEnhancements, updateLabEnhancements } from './src/ui/lab-enhancements.js';
import { initScenarioWalkthroughs } from './src/ui/scenarios.js';
import { initValidationDrawer } from './src/ui/validation-drawer.js';

const models=[
 {id:'arrival',icon:'↗',num:'01',module:'Modules 1 & 3',short:'Device Arrivals',title:'Device arrivals through the day',subtitle:'Model how customer drop-offs change over a business day.',about:'Each drop-off is treated as an event that can happen at any moment. The baseline rate describes an ordinary day; a smooth surge represents a weekend or payday rush. The model samples arrivals across an eight-hour day, so the count changes a little each run even when the settings stay the same.',formula:'λ(t) = λ₀ + A · exp(−(t − tₚ)² / 2σ²)　　N(8h) ≈ ∫₀⁸ λ(t)dt',terms:'λ₀ is the usual drop-off rate. A is the extra rush at its peak time tₚ. The curve’s fixed width σ keeps the example easy to compare. A Poisson process assumes independent arrivals; real customer behavior can be more clustered.',controls:[['base','Usual drop-offs','per hour',1,15,1,6],['surge','Extra at rush peak','per hour',0,35,1,18],['peak','Rush begins','hour of day',1,7,.25,4.5]],metrics:['Sampled drop-offs','Expected today','Busiest hour']},
 {id:'queue',icon:'≋',num:'02',module:'Module 6',short:'Technician Queue',title:'Technician capacity & the waiting shelf',subtitle:'See how staffing and repair time affect delays and turn-aways.',about:'Devices arrive at rate λ and each technician completes work at rate μ. The workshop has c technicians and room for K devices in total. When all K places are occupied, a new arrival is turned away. Even when average demand looks manageable, random bursts can fill a small shelf.',formula:'ρ = λ / (cμ)　　Pₙ ∝ (cρ)ⁿ / c! for n ≥ c　　W = L / λeff',terms:'ρ is technician utilization. Pₖ is the chance the shop is full. λeff is the rate of arrivals the shop can accept. Little’s Law connects average devices in the system L to the time they spend there W. This steady-state model assumes arrivals and service times are memoryless.',controls:[['lambda','Arrivals','devices / hour',1,14,.5,5],['mu','Repairs per technician','devices / hour',.25,4,.25,1.5],['techs','Active technicians','people',1,8,1,3],['capacity','Shelf capacity','devices total',3,30,1,12]],metrics:['Turn-away chance','Technician use','Average time here']},
 {id:'markov',icon:'⇢',num:'03',module:'Module 5',short:'Job Order Journey',title:'A repair job’s path to completion',subtitle:'Follow a ticket from intake to pickup, cancellation, or warranty return.',about:'A repair ticket moves through a small set of stages. At each stage, the next step is uncertain: a client may approve a quote, parts may be available, or a pickup may be missed. The chart shows the chance that a ticket ends paid and released or canceled / abandoned. Warranty returns can send a ticket back into repair before it reaches a final outcome.',formula:'N = (I − Q)⁻¹　　t = N·1　　B = N·R',terms:'Q records transitions among active repair stages. N is the fundamental matrix: its entries count expected visits before a ticket ends. t gives expected stage steps to an outcome. B gives the probability of each final outcome. The displayed outcome probabilities are editable teaching assumptions.',controls:[['approval','Quote approval','of clients',20,100,1,78],['parts','Parts available now','of jobs',10,100,1,65],['pickup','Pickup completed','of ready jobs',30,100,1,86],['deposit','Parts deposit','of parts cost',0,100,5,30]],metrics:['Paid & released','Canceled / abandoned','Expected stage steps']},
 {id:'risk',icon:'⌁',num:'04',module:'Module 4',short:'Annual Risk',title:'Annual risk from parts & customer data',subtitle:'Estimate how often a threat may occur, and what a loss could cost in Philippine pesos.',about:'Risk combines how often a threat may occur, the chance it succeeds, and the size of the resulting loss. This model samples uncertain event frequency, vulnerability, and financial impact many times. It includes customer-data exposure under RA 10173, uncollected devices with special-order parts, and inventory loss as one simplified annual-loss scenario.',formula:'ALE = average annual loss　　VaR₉₅ = loss at the 95th percentile　　ROSI = (risk reduction − control cost) / control cost',terms:'PERT sampling places most values near the stated “most likely” frequency while allowing low and high outcomes. Vulnerability is a probability from 0 to 1. Loss severity is lognormal, which keeps losses positive and allows occasional large events. Peso loss and annual control-cost values are illustrative teaching assumptions, not quotes or observed shop data. Monte Carlo results are estimates, not predictions.',controls:[['low','Events / year · low','events',0,15,1,2],['mode','Most likely','events',1,25,1,6],['high','Events / year · high','events',2,50,1,20],['vuln','Chance a threat succeeds','percent',5,90,1,35],['severity','Typical loss if it succeeds','PHP',1000,300000,5000,25000],['sigma','Loss variability','spread',.2,1.5,.1,.65],['reduction','Risk reduction from controls','percent',0,90,5,45],['controlCost','Annual control cost','PHP',0,60000,2500,15000]],metrics:['Expected annual loss','95% annual loss','Control return']},
 {id:'game',icon:'◇',num:'05',module:'Module 7',short:'Deposit Strategy',title:'Choosing a parts-deposit policy',subtitle:'Compare what the shop keeps or loses under different client decisions.',about:'A shop chooses a deposit rule; a customer then accepts, abandons after a special order, or cancels mid-repair. Deposits reduce the shop’s exposure to parts it cannot return, but demanding more money up front can add friction. This payoff table makes those trade-offs visible using the estimates you set.',formula:'Expected shop result = Σ P(customer choice) × payoff(choice, deposit policy)',terms:'Each cell is a simplified shop net outcome, not a guaranteed profit. The model checks strategy supports to find a mixed-strategy Nash equilibrium; neither side can gain by switching alone. Utilities are estimates; the equilibrium describes this game table, not actual customer behavior or legal policy.',controls:[['partCost','Special-order part cost','PHP',500,30000,500,6000],['markup','Repair margin if completed','PHP',0,15000,500,3000],['labor','Bench labor at risk','PHP',0,5000,250,1000],['friction','Approval lost per deposit step','percent',0,12,1,4],['customerValue','Customer value of repaired device','PHP',2000,80000,1000,25000]],metrics:['Recommended policy','Expected result','Abandonment exposure']},
 {id:'entropy',icon:'⌘',num:'06',module:'Modules 2 & 10',short:'Tracking ID Security',title:'Can someone guess a job number?',subtitle:'Compare predictable ticket numbers with a secure random reference.',about:'If job IDs increase one by one, an outsider can guess nearby numbers and may reach another customer’s record. A random token is harder to enumerate. Entropy measures the uncertainty in a uniformly random identifier; the time estimate assumes an attacker can keep making guesses at a fixed rate.',formula:'H = L · log₂(|Σ|)　　T ≈ |Σ|ᴸ / (2R)',terms:'L is token length; |Σ| is the number of possible characters. R is guesses per second. The one-half factor estimates the average number of guesses needed. Entropy alone does not protect a record: authorization, rate limits, and safe data handling still matter.',controls:[['length','Secure token length','characters',6,24,1,12],['rate','Unthrottled lookup rate','guesses / sec',1,1000,1,100],['limited','Rate after back-off','guesses / sec',.01,10,.01,.05]],metrics:['Predictable ID entropy','Random token entropy','Average guess time']},
 {id:'reliability',icon:'▣',num:'07',module:'Module 12',short:'System Reliability',title:'Will intake stay available?',subtitle:'Combine shop systems and see the value of a communication fallback.',about:'The intake workflow depends on the terminal, API, and database all working. Notifications can use either the primary SMS service or an email fallback. Series components multiply because every one must work; parallel communication paths raise availability because either path can deliver the message. Offline browser caching can keep intake and ticket printing available during a short internet outage.',formula:'A = MTBF / (MTBF + MTTR)　　Acomm = 1 − (1 − ASMS)(1 − Afallback)',terms:'MTBF is mean time between failures; MTTR is mean time to repair. Availability is the long-run fraction of time a component works. The annual downtime estimate is 8,760 × (1 − Asystem). This simple model assumes independent failures and immediate failover.',controls:[['terminal','Intake terminal MTBF','hours',100,30000,100,4000],['api','Shop API MTBF','hours',100,30000,100,3500],['database','Parts ledger MTBF','hours',100,30000,100,5000],['repair','Average repair time','hours',.5,48,.5,4],['sms','SMS service availability','percent',90,99.99,.1,99.5],['fallback','Email fallback availability','percent',90,99.99,.1,99.2]],metrics:['System availability','Expected downtime / year','With offline intake']}
];
const defaults=Object.fromEntries(models.map(m=>[m.id,Object.fromEntries(m.controls.map(c=>[c[0],c[6]]))]));
const settings=Object.fromEntries(models.map(m=>[m.id,{...defaults[m.id]}]));
let current='arrival';let inputFrame=0;let riskTimer=0;let riskRunId=0;let riskCache=null;let riskWorker=null;
let sliderAudio=null;let lastSliderTick=0;
const guides={
 arrival:['guide-1.png','Intake Guide · Ronen Marces','Drop-offs stay steady most of the day, with a rush around the selected hour.','Move Rush begins and Extra at rush peak to compare the busiest hour with the expected daily total.'],
 queue:['guide-2.png','Workshop Guide · Rhino Angelo Donato','Random arrivals meet limited repair capacity and shelf space.','Raise arrivals or slow repairs to see when the shelf fills and the turn-away chance rises.'],
 markov:['guide-3.png','Workflow Guide · Lourdes Carmela Arevalo','A repair can move between diagnosis, parts, and pickup—or end as collected or abandoned.','Change quote approval, parts availability, or pickup completion and watch the outcome probabilities shift.'],
 risk:['guide-4.png','Risk Guide · Danica Deramas','Annual loss combines threat frequency, the chance it succeeds, and the financial impact.','Increase the threat range or loss variability, then compare the 95% estimate with the expected loss.'],
 game:['guide-5.png','Parts Guide · Ma. Azriel Garcia','Deposit policies trade protection from special-order costs against customer friction.','Adjust customer value or deposit friction to see how the equilibrium strategy mix changes.'],
 entropy:['guide-3.png','Workflow Guide · Lourdes Carmela Arevalo','Predictable ticket numbers are easier to enumerate than long random references.','Increase token length or lower the lookup rate to see how much the estimated guessing time grows.'],
 reliability:['guide-2.png','Workshop Guide · Rhino Angelo Donato','Workflow availability depends on connected services, with backup options adding resilience.','Lower a service MTBF or raise repair time to see annual downtime increase; compare the offline intake estimate.']
};
const byId=id=>document.getElementById(id), clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
function playSliderTick(){const now=performance.now();if(now-lastSliderTick<70)return;lastSliderTick=now;try{sliderAudio??=new (window.AudioContext||window.webkitAudioContext)();if(sliderAudio.state==='suspended')sliderAudio.resume();const oscillator=sliderAudio.createOscillator(),gain=sliderAudio.createGain();oscillator.type='sine';oscillator.frequency.setValueAtTime(720,sliderAudio.currentTime);oscillator.frequency.exponentialRampToValueAtTime(460,sliderAudio.currentTime+.025);gain.gain.setValueAtTime(.0001,sliderAudio.currentTime);gain.gain.exponentialRampToValueAtTime(.045,sliderAudio.currentTime+.004);gain.gain.exponentialRampToValueAtTime(.0001,sliderAudio.currentTime+.032);oscillator.connect(gain);gain.connect(sliderAudio.destination);oscillator.start();oscillator.stop(sliderAudio.currentTime+.035)}catch{}}
function initSliderSounds(){document.addEventListener('input',event=>{if(event.target.matches('input[type="range"]'))playSliderTick()})}
const fmt=(n,d=1)=>Number.isFinite(n)?n.toLocaleString('en-US',{maximumFractionDigits:d}):'—';
const money=n=>new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',minimumFractionDigits:0,maximumFractionDigits:0}).format(n);
const pct=n=>fmt(n*100,2)+'%';
const val=(key)=>Number(byId('c-'+key)?.value ?? settings[current][key]);
function nav(){byId('moduleNav').innerHTML=models.map(m=>`<button type="button" class="module-button ${m.id===current?'selected':''}" role="tab" aria-selected="${m.id===current}" data-model="${m.id}"><span class="module-icon">${m.icon}</span><span><strong>${m.short}</strong><small>${m.module}</small></span></button>`).join('');byId('moduleNav').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{if(riskTimer){clearTimeout(riskTimer);riskTimer=0}riskRunId++;current=b.dataset.model;nav();render()}))}
function controlHTML(c){const [key,label,unit,min,max,step,initial]=c;const displayUnit=unit==='PHP'?'Philippine pesos':unit==='hour of day'?'hour after opening':unit==='spread'?'lognormal spread':unit;return `<label class="control" for="c-${key}"><span class="control-label"><span>${label}</span><output id="o-${key}"></output></span><small>${displayUnit}</small><input id="c-${key}" data-key="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${settings[current][key]??initial}" /></label>`}
// Presentation viewports only: keep the underlying SVG coordinates and scales intact.
const chartLayouts={
 arrival:{viewBox:'-24 10 624 232',width:624,height:232,labelSize:18},
 queue:{viewBox:'-24 10 624 244',width:624,height:244,labelSize:17},
 markov:{viewBox:'28 20 520 226',width:520,height:226,labelSize:16},
 risk:{viewBox:'-28 10 628 232',width:628,height:232,labelSize:16},
 game:{viewBox:'32 20 500 210',width:500,height:210,labelSize:15},
 entropy:{viewBox:'40 56 490 190',width:490,height:190,labelSize:15},
 reliability:{viewBox:'40 54 584 198',width:584,height:198,labelSize:16}
};
function chartHTML(model){
 const layout=chartLayouts[model];
 return `<div class="chart-stage" style="--chart-aspect:${layout.width}/${layout.height};--chart-label-size:${layout.labelSize}px"><svg class="chart" id="chart" viewBox="${layout.viewBox}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Simulation chart"></svg></div>`;
}
function guideCardHTML(image,role,message){
 const [guideRole,guideName]=role.split(' \u00b7 ');
 const tip=guides[current][3];
 return `<aside class="character-guide"><img src="assets/characters/${image}" alt="${role}"/><div class="guide-profile"><span class="guide-role"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v15M3 4c3-1 6-1 9 1 3-2 6-2 9-1v15c-3-1-6-1-9 1-3-2-6-2-9-1V4Z"/></svg>${guideRole}</span><h3 class="guide-name">${guideName}</h3><p class="guide-description">${message}</p></div><div class="guide-tip" role="note"><span class="guide-tip-icon" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M9 18h6m-5 3h4M8.1 13.3a6 6 0 1 1 7.8 0c-1 .8-1.4 1.6-1.4 2.7h-5c0-1.1-.4-1.9-1.4-2.7ZM12 1v1M3.5 4.5l1 1m15-1-1 1M1 10h1m20 0h1"/></svg></span><p><strong>Guide tip:</strong> ${tip}</p></div></aside>`;
}
function render(){const m=models.find(x=>x.id===current);const controls=m.controls.map(controlHTML).join('');const [image,role,message]=guides[current];byId('simulation').innerHTML=`<header class="sim-head"><div class="sim-title-wrap"><div class="sim-index">Simulation ${m.num} · ${m.module}</div><h2 class="sim-title">${m.title}</h2><p class="sim-subtitle">${m.subtitle}</p></div><span class="module-chip">${m.module}</span></header><div class="sim-body"><section class="visual-panel" data-chart="${m.id}"><div class="panel-top"><span class="panel-title" id="chartTitle">Live model view</span><span class="live-label">Interactive</span></div>${chartHTML(m.id)}<div class="chart-legend" id="legend"></div></section><section class="control-panel controls-${Math.min(m.controls.length,4)} controls-count-${m.controls.length}"><div class="control-head">Adjust the scenario</div>${controls}<div class="run-row"><button class="reset-button" id="resetButton" type="button">Reset</button></div></section>${guideCardHTML(image,role,message)}</div><div class="metrics" id="metrics"></div><div class="learn-row"><article class="explain-card"><h3>What this model shows</h3><p>${m.about}</p></article><article class="formula-card"><h3>Math in plain view</h3><div class="formula">${m.formula}</div><p class="glossary">${m.terms}</p></article></div>`;
 byId('simulation').querySelectorAll('input[type=range]').forEach(i=>i.addEventListener('input',()=>{settings[current][i.dataset.key]=Number(i.value);if(current==='risk'&&!['reduction','controlCost'].includes(i.dataset.key))riskRunId++;showOutput(i.dataset.key);scheduleUpdate()}));byId('resetButton').addEventListener('click',()=>{if(riskTimer)clearTimeout(riskTimer);settings[current]={...defaults[current]};byId('simulation').querySelectorAll('input[type=range]').forEach(i=>i.value=settings[current][i.dataset.key]);riskTimer=0;update();byId('simulation').querySelectorAll('input').forEach(i=>showOutput(i.dataset.key))});initLabEnhancements(byId('simulation'));update();byId('simulation').querySelectorAll('input').forEach(i=>showOutput(i.dataset.key));}
function scheduleUpdate(){if(current==='risk'){if(riskTimer)clearTimeout(riskTimer);riskTimer=setTimeout(()=>{riskTimer=0;update()},120);return}if(inputFrame)return;inputFrame=requestAnimationFrame(()=>{inputFrame=0;update()})}
function showOutput(k){const input=byId('c-'+k);const o=byId('o-'+k);if(!input||!o)return;const control=models.find(m=>m.id===current).controls.find(c=>c[0]===k);let v=Number(input.value),unit=control[2];o.value=unit==='PHP'?money(v):unit==='percent'?fmt(v,1)+'%':unit==='spread'?fmt(v,1):fmt(v,unit==='hour of day'?2:unit.includes('sec')?2:0)}
function metricCards(items){byId('metrics').innerHTML=items.map(x=>`<div class="metric"><div class="metric-label">${x[0]}</div><div class="metric-value">${x[1]}</div><div class="metric-detail">${x[2]||''}</div></div>`).join('')}
function layoutChartLabels(chart){
 if(current!=='entropy')return;
 const label=chart.querySelector('text:last-child');
 const parts=label.textContent.match(/^(\S+) (.+)$/);
 if(!parts)return;
 // Retain the exact axis-label text, separating its scale annotation visually.
 const tick=document.createElementNS('http://www.w3.org/2000/svg','tspan');
 tick.textContent=parts[1]+' ';
 const annotation=document.createElementNS('http://www.w3.org/2000/svg','tspan');
 annotation.setAttribute('x','330');annotation.setAttribute('dy','20');annotation.setAttribute('text-anchor','middle');
 annotation.textContent=parts[2];label.replaceChildren(tick,annotation);
}
const svg=(s)=>{const chart=byId('chart');chart.innerHTML=s;layoutChartLabels(chart)};
function axes(yMax,yUnit=''){let s='';for(let i=0;i<=4;i++){let y=205-i*43.75,v=yMax*i/4,label=yUnit==='%'?fmt(v*100,0)+'%':fmt(v,1)+yUnit;s+=`<line class="gridline" x1="48" y1="${y}" x2="582" y2="${y}"/><text x="39" y="${y+3}" text-anchor="end">${label}</text>`}s+='<line class="axis" x1="48" y1="205" x2="582" y2="205"/>';return s}
function chartTitle(t,l=''){byId('chartTitle').textContent=t;byId('legend').innerHTML=l}
function update(){try{if(current==='arrival')arrival();if(current==='queue')queue();if(current==='markov')markov();if(current==='risk')risk();if(current==='game')gameTheory();if(current==='entropy')entropy();if(current==='reliability')reliability();updateLabEnhancements(current,{...settings[current]})}catch(error){chartTitle('Check the highlighted mathematical relationship');svg(`<text x="48" y="105">${String(error.message).replace(/[<>&]/g,'')}</text>`);metricCards([['Input validation','Needs attention',error.message]])}}
function clockLabel(hour){const total=Math.round(hour*60),h=Math.floor(total/60),m=total%60,suffix=h>=12?'PM':'AM',twelve=h%12||12;return `${twelve}:${String(m).padStart(2,'0')} ${suffix}`}
function arrival(){const base=val('base'),surge=val('surge'),peak=val('peak'),sigma=.72,params={base,surge,peak,sigma},result=calculateArrivalModel(params),pts=[];for(let i=0;i<=80;i++){const t=i/10;pts.push([t,arrivalRate(t,params)])}let path=pts.map((p,i)=>`${i?'L':'M'} ${48+p[0]/8*534} ${205-p[1]/50*175}`).join(' ');svg(`${axes(50,'/h')}<path class="area" d="${path} L 582 205 L 48 205 Z"/><path class="plot" d="${path}"/><text x="48" y="226">8:00 AM</text><text x="310" y="226" text-anchor="middle">Business hours →</text><text x="582" y="226" text-anchor="end">4:00 PM</text>`);chartTitle('Drop-off rate across an 8-hour day','<span><i class="legend-dot"></i>Expected arrivals per hour · fixed scale 0–50/h</span>');metricCards([[`Sampled drop-offs`,fmt(result.sampledCount,0),`Poisson sample · sampled arrivals`],['Expected today',fmt(result.expected,1),'Average count across many days'],['Busiest hour',`${fmt(result.peakRate,1)}/h`,`Rush peak at ${clockLabel(8+peak)}`]])}
function queue(){
 const l=val('lambda'),mu=val('mu'),c=val('techs'),K=val('capacity'),result=calculateQueue({lambda:l,mu,servers:c,capacity:K}),p=result.probabilities,block=result.blockingProbability,busy=result.technicianUtilization,L=result.averageInSystem,W=result.averageTimeInSystem,Wq=result.averageWaitTime,rho=result.rho;
 const topPercent=100,scale=1;
 const axis=Array.from({length:topPercent/10+1},(_,i)=>{const percent=i*10,y=205-percent/topPercent*175;return `<line class="gridline" x1="48" y1="${y}" x2="582" y2="${y}"/><text x="39" y="${y+3}" text-anchor="end">${percent}%</text>`}).join('')+'<line class="axis" x1="48" y1="205" x2="582" y2="205"/>';
 const bars=p.map((value,n)=>{const x=53+n*(520/(K+1)),width=Math.max(2,450/(K+1)),height=value/scale*160,y=205-height;return `<rect class="${n===K?'danger':'bar'}" x="${x}" y="${y}" width="${width}" height="${height}"/><text x="${x+width/2}" y="220" text-anchor="middle">${K<=14||n%5===0||n===K?n:''}</text>`}).join('');
 svg(`${axis}${bars}<text x="315" y="238" text-anchor="middle">Devices in workshop (0 → shelf limit)</text>`);
 chartTitle('Chance of each workshop occupancy','<span><i class="legend-dot"></i>Occupancy probability · fixed scale 0–100%</span><span><i class="legend-dot alt"></i>Full shelf · arrival turned away</span>');
 metricCards([['Turn-away chance',pct(block),`Pₖ · ${fmt(l*block,2)} devices / hour`],['Technician use',pct(busy),`${c} technicians · ρ = ${fmt(rho,2)}`],['Average time here',`${fmt(W,2)} h`,`Queue ${fmt(Wq,2)} h · ${fmt(L,1)} devices in system`]]);
}
function fact(n){let x=1;for(let i=2;i<=n;i++)x*=i;return x}
function invertSolve(A,b){const n=b.length,M=A.map((r,i)=>[...r,b[i]]);for(let i=0;i<n;i++){let max=i;for(let j=i+1;j<n;j++)if(Math.abs(M[j][i])>Math.abs(M[max][i]))max=j;[M[i],M[max]]=[M[max],M[i]];let div=M[i][i];if(Math.abs(div)<1e-10)return Array(n).fill(0);for(let j=i;j<=n;j++)M[i][j]/=div;for(let k=0;k<n;k++)if(k!==i){let f=M[k][i];for(let j=i;j<=n;j++)M[k][j]-=f*M[i][j]}}return M.map(r=>r[n])}
function markov(){
 const approval=val('approval')/100,parts=val('parts')/100,pickup=val('pickup')/100,dep=val('deposit')/100,result=calculateMarkov({approval,partsAvailable:parts,pickup,deposit:dep}),absPaid=result.paidProbability,absLost=result.canceledProbability;
 const outcomes=[['Paid & released',absPaid,'success'],['Canceled / abandoned',absLost,'danger']];
 const bars=outcomes.map(([name,value,color],i)=>{const y=82+i*58,w=value*300;return `<text x="45" y="${y+13}">${name}</text><rect class="${color}" x="190" y="${y}" width="${w}" height="22" rx="4"/><text x="${Math.min(510,198+w)}" y="${y+15}">${pct(value)}</text>`}).join('');
 const ticks=[0,.5,1].map((value,i)=>{const x=190+i*150;return `<line class="axis" x1="${x}" y1="70" x2="${x}" y2="180"/><text x="${x}" y="198" text-anchor="middle">${fmt(value*100,0)}%</text>`}).join('');
 svg(`${bars}${ticks}<line class="axis" x1="190" y1="180" x2="490" y2="180"/><text x="340" y="229" text-anchor="middle">Probability of final outcome</text>`);
 chartTitle('Likelihood of each repair outcome','<span><i class="legend-dot"></i>Paid & released</span><span><i class="legend-dot danger"></i>Canceled or abandoned</span>');
 metricCards([['Paid & released',pct(absPaid),'Absorbing outcome: collected'],['Canceled / abandoned',pct(absLost),'Absorbing outcome: no collection'],['Expected stage steps',fmt(result.expectedStepsFromIntake,2),'From Intake to an absorbing outcome']]);
}
function gamma(shape){let d,c,x,v;if(shape<1)return gamma(shape+1)*Math.pow(Math.random(),1/shape);d=shape-1/3;c=1/Math.sqrt(9*d);for(;;){do{x=normal();v=1+c*x}while(v<=0);v=v*v*v;let u=Math.random();if(u<1-.0331*x*x*x*x||Math.log(u)<.5*x*x+d*(1-v+Math.log(v)))return d*v}}
function normal(){let u=Math.random()||1e-10,v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function beta(a,b){const x=gamma(a),y=gamma(b);return x/(x+y)}
function poisson(l){let L=Math.exp(-l),p=1,k=0;do{k++;p*=Math.random()}while(p>L&&k<200);return k-1}
function renderRiskResult(cache,reduce,cost){
 const netReduction=cache.ale*reduce,rosi=cost?((netReduction-cost)/cost*100):0;
 const bars=cache.bins.map((count,i)=>{const width=26,y=205-count/cache.bmax*150;return '<rect class="bar" x="'+(54+i*29)+'" y="'+y+'" width="'+width+'" height="'+(205-y)+'"/>'}).join('');
 const varX=54+Math.min(17,cache.var95/cache.max*18)*29;
 svg(axes(cache.bmax)+bars+'<text x="48" y="226">'+money(0)+'</text><text x="582" y="226" text-anchor="end">'+money(cache.max)+' annual loss →</text><line x1="'+varX+'" y1="40" x2="'+varX+'" y2="205" stroke="#ee9a3b" stroke-dasharray="4 4" stroke-width="2"/>');
 chartTitle('Annual loss distribution · 100,000 simulated years','<span><i class="legend-dot"></i>Simulated outcomes · Philippine pesos</span><span><i class="legend-dot alt"></i>95th percentile</span>');
 metricCards([['Expected annual loss',money(cache.ale),'Average across simulated years'],['95% annual loss',money(cache.var95),'5% of simulated years were higher'],['Control return',cost?fmt(rosi,0)+'%':'No cost entered','Net annual benefit '+money(netReduction-cost)+' · risk reduction '+money(netReduction)+' · cost '+money(cost)]]);
}
function risk(){
 const low=val('low'),mode=val('mode'),high=val('high'),vuln=val('vuln')/100,median=val('severity'),sigma=val('sigma'),reduce=val('reduction')/100,cost=val('controlCost'),N=100000,seed=20261121,signature=[low,mode,high,vuln,median,sigma,seed].join('|');
 if(riskCache&&riskCache.signature===signature){renderRiskResult(riskCache,reduce,cost);return}
 const runId=++riskRunId,params={low,mode,high,vulnerability:vuln,medianLoss:median,sigma,trials:N,seed};
 chartTitle('Sampling 100,000 possible years…','<span>The risk graph will update when sampling finishes.</span>');
 const finish=result=>{if(runId!==riskRunId||current!=='risk')return;const chart=result.chart;const cache={signature,ale:result.ale,var95:result.var95,max:chart.maximum,bins:chart.bins,bmax:chart.largestBin};riskCache=cache;renderRiskResult(cache,reduce,cost);updateLabEnhancements(current,{...settings[current],riskResult:cache})};
 if(typeof Worker!=='undefined'){
  riskWorker??=new Worker(new URL('./src/workers/fair.worker.js',import.meta.url),{type:'module'});
  riskWorker.onmessage=event=>{if(event.data.runId!==runId)return;if(event.data.error){metricCards([['Simulation error','Unable to run',event.data.error]]);return}finish(event.data.result)};
  riskWorker.postMessage({runId,params});
 }else{
  setTimeout(()=>{const result=simulateFair(params),chart=histogram(result.losses);finish({...result,chart})},0);
 }
}
function supportSets(n,k,start=0,prefix=[]){if(prefix.length===k)return [prefix];let out=[];for(let i=start;i<n;i++)out.push(...supportSets(n,k,i+1,[...prefix,i]));return out}
function gameEquilibrium(A,B){for(let k=1;k<=3;k++)for(const I of supportSets(3,k))for(const J of supportSets(3,k)){let M=J.map(j=>[...I.map(i=>B[i][j]),-1]);M.push([...Array(k).fill(1),0]);let p=invertSolve(M,[...Array(k).fill(0),1]);let N=I.map(i=>[...J.map(j=>A[i][j]),-1]);N.push([...Array(k).fill(1),0]);let q=invertSolve(N,[...Array(k).fill(0),1]);if(p.some(x=>x< -1e-7)||q.some(x=>x< -1e-7))continue;let ps=Array(3).fill(0),qs=Array(3).fill(0);I.forEach((i,n)=>ps[i]=p[n]);J.forEach((j,n)=>qs[j]=q[n]);let u=ps.reduce((z,x,i)=>z+x*qs.reduce((v,y,j)=>v+y*A[i][j],0),0),v=qs.reduce((z,y,j)=>z+y*ps.reduce((w,x,i)=>w+x*B[i][j],0),0);if(A.some((row,i)=>row.reduce((z,x,j)=>z+x*qs[j],0)>u+1e-5)||B[0].some((_,j)=>ps.reduce((z,x,i)=>z+x*B[i][j],0)>v+1e-5))continue;return {p:ps,q:qs,u,v}}return null}
function gameTheory(){const cost=val('partCost'),margin=val('markup'),labor=val('labor'),fric=val('friction')/100,value=val('customerValue'),game=buildDepositGame({partCost:cost,margin,labor,friction:fric,customerValue:value}),policies=game.policies.map(policy=>[policy.name,policy.deposit]),choices=game.choices,A=game.shopPayoffs,B=game.customerPayoffs,rawEq=game.equilibrium,eq=rawEq?{p:rawEq.shopMix,q:rawEq.customerMix,u:rawEq.shopUtility,v:rawEq.customerUtility}:null;if(!eq){chartTitle('Payoff game needs a different scenario');svg('<text x="48" y="100">No verified Nash equilibrium support was found for these assumptions.</text>');metricCards([['Shop strategy mix','—','Adjust customer value or deposit friction'],['Customer choices','—','The engine checks profitable unilateral deviations'],['Expected shop result','—','Try another scenario']]);return}const mix=eq.p.map((x,i)=>`${policies[i][0]} ${fmt(100*x,0)}%`).filter((_,i)=>eq.p[i]>.005).join(' · '),client=eq.q.map((x,i)=>`${choices[i]} ${fmt(100*x,0)}%`).filter((_,i)=>eq.q[i]>.005).join(' · '),exposure=eq.p.reduce((z,x,i)=>z+x*eq.q[1]*Math.max(0,-A[i][1]),0),max=Math.max(1,...A.flat().map(Math.abs)),scale=205/max,rows=policies.map((p,i)=>{const y=82+i*47;return `<text x="48" y="${y+4}">${p[0]}</text>${A[i].map((v,j)=>{const w=Math.abs(v)*scale,x=v<0?304-w:304;return `<rect class="${v<0?'danger':['bar','bar-alt','success'][j]}" x="${x}" y="${y+10}" width="${Math.max(1,w)}" height="12" rx="4"/><text x="${j===0?145:j===1?310:455}" y="${y+39}" text-anchor="middle">${money(v)}</text>`}).join('')}`}).join('');svg(`<text x="145" y="44" text-anchor="middle">Approve &amp; collect</text><text x="310" y="44" text-anchor="middle">Abandon after order</text><text x="455" y="44" text-anchor="middle">Cancel mid-repair</text><line class="axis" x1="304" y1="60" x2="304" y2="216"/>${rows}`);chartTitle('Shop payoff by deposit policy & client choice (Philippine pesos)','<span><i class="legend-dot"></i>Approval</span><span><i class="legend-dot alt"></i>Abandonment</span><span><i class="legend-dot" style="background:#26ad7e"></i>Cancellation</span>');metricCards([['Shop strategy mix',mix,'Verified Nash equilibrium'],['Customer choices',client,'No profitable unilateral deviation'],['Expected shop result',money(eq.u),`Expected abandonment loss ${money(exposure)}`]]);let old=byId('simulation').querySelector('.payoff-wrap');if(old)old.remove();let table=document.createElement('div');table.className='payoff-wrap';table.style.cssText='grid-column:1/-1;overflow:auto;margin-top:8px';table.innerHTML=`<table class="payoff-table"><thead><tr><th>Shop policy</th>${choices.map(x=>`<th>${x}<br><small>shop net</small></th>`).join('')}<th>Vs. client mix</th></tr></thead><tbody>${A.map((row,i)=>`<tr><th>${policies[i][0]}</th>${row.map(x=>`<td class="${x>=0?'positive':'negative'}">${money(x)}</td>`).join('')}<td>${money(row.reduce((z,x,j)=>z+x*eq.q[j],0))}</td></tr>`).join('')}</tbody></table><small style="display:block;color:var(--muted);font-size:9px;margin-top:6px">Customer utility compares repair value with quote, forfeited deposit, and cancellation labor. Payoffs are illustrative assumptions; equilibrium applies only to this payoff table.</small>`;byId('simulation').querySelector('.sim-body').appendChild(table)}
function humanTime(s){if(!Number.isFinite(s)||s>3.154e16)return 'Over 1 billion years';if(s<1)return `${fmt(s*1000,1)} ms`;if(s<60)return `${fmt(s,1)} sec`;if(s<3600)return `${fmt(s/60,1)} min`;if(s<86400)return `${fmt(s/3600,1)} hr`;if(s<31557600)return `${fmt(s/86400,1)} days`;return `${fmt(s/31557600,1)} years`}
function entropy(){const L=val('length'),R=val('rate'),Rt=val('limited'),result=compareIdentifierSecurity({length:L,rawRate:R,limitedRate:Rt}),H=result.random.entropyBits,seq=result.sequential.entropyBits,time=result.random.averageGuessSeconds,limited=result.limited.averageGuessSeconds,axisMax=160,bars=[seq,H].map((x,i)=>{let y=73+i*42;return `<text x="48" y="${y+14}">${i?'Secure token':'4-digit ID space'}</text><rect class="${i?'bar':'bar-alt'}" x="165" y="${y}" width="${Math.max(x/axisMax*350,1)}" height="20"/><text x="${Math.min(522,172+x/axisMax*350)}" y="${y+14}">${fmt(x,1)} bits</text>`}).join(''),rateWidth=x=>(Math.log10(x)+2)/5*350,token=secureTrackingToken(L);svg(`${bars}<text x="48" y="163">Guess rate</text><text x="48" y="177">Raw</text><rect class="bar" x="165" y="168" width="${rateWidth(R)}" height="7"/><text x="48" y="190">Back-off</text><rect class="bar-alt" x="165" y="181" width="${rateWidth(Rt)}" height="7"/><line class="axis" x1="165" y1="191" x2="515" y2="191"/><text x="165" y="207">0.01</text><text x="305" y="207" text-anchor="middle">1</text><text x="445" y="207" text-anchor="middle">100</text><text x="515" y="207" text-anchor="end">1,000 guesses/sec · log scale</text>`);chartTitle('Token entropy and lookup rates','<span><i class="legend-dot alt"></i>Predictable · JO-1001</span><span><i class="legend-dot"></i>Random · Web Crypto token</span><span>Rate bars use logarithmic scale</span>');metricCards([['Predictable ID entropy',`${fmt(seq,1)} bits`,'10,000-value identifier space'],['Random token entropy',`${fmt(H,1)} bits`,`${L} characters · sample ${token}`],['Average guess time',humanTime(time),`Back-off: ${humanTime(limited)} · ${fmt(result.protectionFactor,0)}× slower`]])}
function reliability(){
 const result=calculateReliability({terminalMtbf:val('terminal'),apiMtbf:val('api'),databaseMtbf:val('database'),mttr:val('repair'),smsAvailability:val('sms')/100,fallbackAvailability:val('fallback')/100}),series=result.systemAvailability,down=result.annualDowntimeHours,downOffline=result.offlineScenarioDowntimeHours;
 const names=['Intake terminal','Shop API','Parts ledger','SMS or email'],values=[result.components.terminal,result.components.api,result.components.database,result.components.communication];
 const lower=Math.max(0,Math.min(.998,Math.floor(Math.min(...values)*1000)/1000-.001));
 const scale=value=>Math.max(0,(value-lower)/(1-lower));
 const bars=values.map((value,i)=>{const y=66+i*38,w=scale(value)*390,labelX=Math.min(570,172+w);return `<text x="48" y="${y+13}">${names[i]}</text><rect class="bar" x="166" y="${y}" width="${w}" height="20"/><text x="${labelX}" y="${y+14}">${pct(value)}</text>`}).join('');
 const ticks=[lower,(lower+1)/2,1].map((value,i)=>{const x=166+i*195;return `<line class="axis" x1="${x}" y1="220" x2="${x}" y2="225"/><text x="${x}" y="237" text-anchor="${i===0?'start':i===2?'end':'middle'}">${pct(value)}</text>`}).join('');
 svg(`${bars}<line class="axis" x1="166" y1="220" x2="556" y2="220"/>${ticks}`);
 chartTitle('Availability of each link in the workflow',`<span><i class="legend-dot"></i>Focused scale · ${pct(lower)}–100%</span>`);
 metricCards([['System availability',pct(series),'Terminal × API × ledger × messaging'],['Expected downtime / year',`${fmt(down,1)} h`,`About ${fmt(down/24,1)} days over a year`],['Theoretical offline intake',`${fmt(downOffline,1)} h`,`Modeled scenario only · not an implemented customer-data cache`]]);
}
function ensureSkipLink(){const main=document.querySelector('main');if(!main)return;if(!main.id)main.id='mainContent';const link=document.createElement('a');link.className='skip-link';link.href=`#${main.id}`;link.textContent='Skip to main content';document.body.prepend(link)}
function syncThemeToggle(){const dark=document.body.classList.contains('dark');if(byId('themeText'))byId('themeText').textContent=dark?'Light':'Dark';byId('themeToggle')?.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode')}
function theme(){const dark=document.body.classList.toggle('dark');try{localStorage.setItem('qmod-theme',dark?'dark':'light')}catch{}syncThemeToggle();if(byId('simulation'))updateLabEnhancements(current,{...settings[current],riskResult:riskCache})}
function initRequestForm(){const form=byId('requestForm');if(!form)return;const params=new URLSearchParams(location.search),service=params.get('service'),select=byId('requestService');if(service&&[...select.options].some(o=>o.value===service||o.text===service))select.value=service;let draft='';form.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(form);draft=[`Service request`, `Name: ${data.get('name')}`,`Preferred reply contact: ${data.get('contact')}`,`Service: ${data.get('service')}`,`Device: ${data.get('device')}`,`Issue: ${data.get('issue')}`].join('\n');let box=byId('requestDraft');if(!box){box=document.createElement('div');box.id='requestDraft';box.className='request-draft';box.tabIndex=0;byId('requestPreview').appendChild(box)}box.textContent=draft;byId('requestPreview').querySelector('.preview-actions').hidden=false;byId('copyStatus').textContent='Draft ready to copy or print.';box.focus()});byId('copyRequest').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(draft)}catch{const t=document.createElement('textarea');t.value=draft;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}byId('copyStatus').textContent='Request draft copied.'});byId('printRequest').addEventListener('click',()=>window.print())}
function initScenarioFilters(){const filters=[...document.querySelectorAll('[data-filter]')],cards=[...document.querySelectorAll('.scenario-card[data-category]')];if(!filters.length)return;filters.forEach(button=>button.addEventListener('click',()=>{const filter=button.dataset.filter;filters.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active))});cards.forEach(card=>card.hidden=filter!=='all'&&card.dataset.category!==filter)}))}
function initQuickRush(){
 const list=byId('dispatchJobs'),timeline=byId('dispatchTimeline'),run=byId('quickRun');
 if(!list||!timeline||!run)return;
 const jobs={screen:{name:'Phone screen',duration:2,due:4},battery:{name:'Tablet battery',duration:1,due:2},laptop:{name:'Laptop board',duration:3,due:6}};
 const rows=()=>[...list.querySelectorAll('.dispatch-job')];
 list.addEventListener('click',event=>{
  const button=event.target.closest('[data-move]');if(!button)return;
  const row=button.closest('.dispatch-job'),items=rows(),index=items.indexOf(row);
  if(button.dataset.move==='up'&&index>0)list.insertBefore(row,items[index-1]);
  if(button.dataset.move==='down'&&index<items.length-1)list.insertBefore(items[index+1],row);
  rows().forEach((item,i)=>item.querySelector('.job-rank').textContent=String(i+1).padStart(2,'0'));
  timeline.innerHTML='<p class="dispatch-placeholder">Order changed. Run the shift to see your pickup results.</p>';
  byId('dispatchScore').textContent='—';byId('quickExpected').textContent='Your next order is ready to try.';byId('quickSample').textContent='Run the shift to reveal the outcome.';
 });
 run.addEventListener('click',()=>{
  let time=0,lateJobs=0,totalLate=0;
  const result=rows().map(row=>{const job=jobs[row.dataset.job];time+=job.duration;const late=Math.max(0,time-job.due);if(late>0){lateJobs++;totalLate+=late}return{...job,finish:time,late}});
  timeline.innerHTML=result.map(job=>`<div class="dispatch-outcome ${job.late?'is-late':'is-on-time'}"><span class="outcome-time">${job.finish}h</span><span class="outcome-info"><strong>${job.name}</strong><small>${job.late?`${job.late}h past pickup promise`:'Ready by pickup promise'}</small></span><span class="outcome-mark">${job.late?'Late':'On time'}</span></div>`).join('');
  const onTime=result.length-lateJobs;byId('dispatchScore').textContent=`${onTime} / ${result.length}`;
  byId('quickExpected').textContent=lateJobs===0?'Perfect shift: every repair is ready by its promised pickup.':`${lateJobs} pickup${lateJobs===1?' is':'s are'} late by ${totalLate} total hour${totalLate===1?'':'s'}. Try reordering the jobs to improve the result.`;
  byId('quickSample').textContent=onTime===result.length?'Excellent dispatch!':'Try another job order.';
 });
}
initQuickRush();
function initConceptPlayground(){const arrivals=byId('conceptArrivals'),techs=byId('conceptTechs');if(!arrivals||!techs)return;const update=()=>{const a=Number(arrivals.value),c=Number(techs.value),load=a/(c*1.5),value=byId('conceptWorkload');byId('conceptArrivalsValue').textContent=fmt(a,1);byId('conceptTechsValue').textContent=fmt(c,0);value.textContent=pct(load);value.dataset.level=load>=1?'over':load>=.8?'busy':'steady';byId('conceptWorkloadNote').textContent=load>=1?'Incoming work exceeds the assumed repair capacity.':load>=.8?'Capacity is close to demand; random bursts may build a queue.':'Combined technician capacity is above the average arrival rate. Assumes 1.5 repairs per technician each hour.'};arrivals.addEventListener('input',update);techs.addEventListener('input',update);update()}
ensureSkipLink();const themeButton=byId('themeToggle');if(themeButton)themeButton.addEventListener('click',theme);try{if(localStorage.getItem('qmod-theme')==='dark')document.body.classList.add('dark')}catch{}syncThemeToggle();if(byId('moduleNav')&&byId('simulation')){const requested=new URLSearchParams(location.search).get('model');if(models.some(m=>m.id===requested))current=requested;nav();render()}initSliderSounds();initScenarioFilters();initConceptPlayground();initScenarioWalkthroughs();initValidationDrawer();if(document.body.dataset.page==='requests')initRequestForm();

// Homepage greetings: native buttons support touch, Enter, and Space.
const heroPeople = [...document.querySelectorAll('.hero-person')];
function closeHeroGreetings(){heroPeople.forEach(person=>person.setAttribute('aria-pressed','false'));heroPeople[0]?.dispatchEvent(new Event('hero-greeting-change'))}
heroPeople.forEach(person=>{
 person.addEventListener('click',()=>{const open=person.getAttribute('aria-pressed')!=='true';closeHeroGreetings();person.setAttribute('aria-pressed',String(open));person.dispatchEvent(new Event('hero-greeting-change'))});
 person.addEventListener('blur',()=>{person.setAttribute('aria-pressed','false');person.dispatchEvent(new Event('hero-greeting-change'))});
});
if(heroPeople.length){
 document.addEventListener('pointerdown',event=>{if(!event.target.closest('.hero-person'))closeHeroGreetings()});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeHeroGreetings();if(document.activeElement?.matches('.hero-person'))document.activeElement.blur()}});
}

// Match pointer targets to opaque PNG pixels, in the same order as the visual stack.
// Native buttons remain in the tab order and retain Enter/Space activation.
const heroTeam = document.querySelector('.hero-team');
if(heroTeam){
 const heroPixels = new Map();
 const heroArt = heroTeam.closest('.welcome-art');
 const greetingLayer = document.createElement('div');
 greetingLayer.className = 'hero-greetings';
 heroArt.appendChild(greetingLayer);
 const heroBubbles = new Map(heroPeople.map(person=>{
  const bubble=document.getElementById(person.getAttribute('aria-describedby'));
  greetingLayer.appendChild(bubble);
  return [person,bubble];
 }));
 // Keep bubbles above every portrait without changing the portraits' stacking or geometry.
 const updateHeroGreeting = () => {
  const selected=heroPeople.find(p=>p.classList.contains('is-hovered')) || heroPeople.find(p=>p.matches(':focus-visible')) || heroPeople.find(p=>p.getAttribute('aria-pressed')==='true');
  heroBubbles.forEach((bubble,person)=>{
   bubble.classList.toggle('is-visible',person===selected);
   if(person!==selected)return;
   const image=person.querySelector('img'), rect=image.getBoundingClientRect(), artRect=heroArt.getBoundingClientRect(), heroRect=heroArt.closest('.welcome').getBoundingClientRect();
   const pixels=heroPixels.get(person), scale=pixels?Math.max(rect.width/pixels.width,rect.height/pixels.height):1;
   const head=pixels?.head;
   const headX=head?rect.left+(head.x*scale-(pixels.width*scale-rect.width)/2):rect.left+rect.width/2;
   const headTop=head?rect.top+(head.y*scale-(pixels.height*scale-rect.height)/2):rect.top;
   const half=bubble.offsetWidth/2;
   const center=Math.max(heroRect.left+10+half,Math.min(heroRect.right-10-half,headX));
   bubble.style.setProperty('--greeting-left',`${center-artRect.left}px`);
   bubble.style.setProperty('--greeting-top',`${Math.max(heroRect.top+10,headTop-10-bubble.offsetHeight)-artRect.top}px`);
   bubble.style.setProperty('--greeting-arrow',`${Math.max(8,Math.min(bubble.offsetWidth-8,headX-center+half))}px`);
  });
 };
 heroPeople.forEach(person=>person.addEventListener('hero-greeting-change',updateHeroGreeting));
 window.addEventListener('resize',updateHeroGreeting);
 const loadHeroPixels = person => {
  const image = person.querySelector('img');
  const read = () => {
   const canvas = document.createElement('canvas');
   canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
   const context = canvas.getContext('2d', {willReadFrequently:true});
   context.drawImage(image,0,0);
   const data=context.getImageData(0,0,canvas.width,canvas.height).data;
   let headY=0;
   for(let y=0;y<canvas.height;y++){
    let count=0;
    for(let x=0;x<canvas.width;x++)if(data[(y*canvas.width+x)*4+3]>128)count++;
    if(count>canvas.width*.05){headY=y;break}
   }
   const row=Math.min(canvas.height-1,headY+Math.round(canvas.height*.12));
   let min=canvas.width,max=0;
   for(let x=0;x<canvas.width;x++)if(data[(row*canvas.width+x)*4+3]>128){min=Math.min(min,x);max=Math.max(max,x)}
   heroPixels.set(person, {width:canvas.width,height:canvas.height,data,head:{x:(min+max)/2,y:headY}});
   updateHeroGreeting();
  };
  if(image.complete && image.naturalWidth)read();else image.addEventListener('load',read,{once:true});
 };
 heroPeople.forEach(loadHeroPixels);
 const heroAtPoint = (x,y) => [...heroPeople].sort((a,b)=>Number(getComputedStyle(b).zIndex)-Number(getComputedStyle(a).zIndex)||heroPeople.indexOf(b)-heroPeople.indexOf(a)).find(person=>{
  const pixels=heroPixels.get(person), image=person.querySelector('img'), teamRect=heroTeam.getBoundingClientRect();
  // Use the stationary portrait layout bounds for alpha hit testing.
  const rect={left:teamRect.left+person.offsetLeft+image.offsetLeft,top:teamRect.top+person.offsetTop+image.offsetTop,width:image.offsetWidth,height:image.offsetHeight};
  rect.right=rect.left+rect.width;rect.bottom=rect.top+rect.height;
  if(!pixels || x<rect.left || x>=rect.right || y<rect.top || y>=rect.bottom)return false;
  // object-fit:cover, centered: account for the transparent side margins cropped by CSS.
  const scale=Math.max(rect.width/pixels.width,rect.height/pixels.height);
  const px=Math.floor((x-rect.left+(pixels.width*scale-rect.width)/2)/scale);
  const py=Math.floor((y-rect.top+(pixels.height*scale-rect.height)/2)/scale);
  return px>=0 && py>=0 && px<pixels.width && py<pixels.height && pixels.data[(py*pixels.width+px)*4+3]>32;
 });
 const highlightHero = person => {heroPeople.forEach(item=>item.classList.toggle('is-hovered',item===person));updateHeroGreeting()};
 heroPeople.forEach(person=>person.addEventListener('focus',()=>highlightHero(null)));
 heroTeam.addEventListener('pointermove',event=>{if(event.pointerType!=='touch')highlightHero(heroAtPoint(event.clientX,event.clientY))});
 heroTeam.addEventListener('pointerleave',()=>highlightHero(null));
 heroTeam.addEventListener('click',event=>{
  if(event.target.closest('.hero-person'))return;
  const person=heroAtPoint(event.clientX,event.clientY);
  if(person){person.focus({preventScroll:true});person.click()}
 });
}
