# QMODSIM Requirements Audit

Audit date: 2026-11-21 (Asia/Manila)  
Baseline: branch `feature/additional-modifications`, commit `f26d0edabebb67a57bcd7a1af970a4bb22e581be`  
Implementation branch: `feature/qmodsim-guide-compliance`

## Preservation baseline

Before implementation the working tree had no user changes. The only untracked files were two temporary PDF text extracts created during this audit. The baseline contained five pages (`index`, `lab`, `concepts`, `guides`, `about`), seven simulations, SVG charts, a light/dark preference, team art, and the homepage dispatch challenge. These remain present. No commit, push, merge, deployment, or destructive Git command was performed.

## Compliance matrix

Status vocabulary follows the request: **COMPLIANT**, **PARTIALLY COMPLIANT**, **MISSING**, **REQUIRES VERIFICATION**, **BLOCKED**.

| Requirement | Source PDF / page | Existing implementation at baseline | Final status | Required enhancement / evidence |
|---|---|---|---|---|
| Three experiences: SCENARIOS, LAB, CODEX | Student Guide pp.1–2, 16 | Scenarios cards, Lab, plain Concepts page | COMPLIANT | Added three decision walkthroughs and formal CODEX while retaining five-page navigation. |
| Single-page application | Student Guide p.1 | Five-page static artifact required to be preserved | PARTIALLY COMPLIANT | Implemented equivalent three archetypes across the preserved multipage structure; destructive conversion would conflict with preservation. |
| Real-time adjustable parameters and stress observation | Student Guide p.1 | Seven sliders/SVG simulations | COMPLIANT | Preserved and delegated calculations to pure engines; added Canvas alternatives. |
| Three decision-fork walkthroughs | Student Guide p.7, 15 | Scenario cards only linked to Lab | COMPLIANT | Queue, parts/deposit, and mock enumeration crises update real engine inputs and compare before/after values. |
| Decision forks must not be cosmetic | Student Guide p.15 | Not present | COMPLIANT | Buttons call queue, game, and entropy engines and redraw quantitative bars. |
| Reset/repeat each crisis | Master request §3 | Scheduling challenge only | COMPLIANT | Each crisis has an independent reset. |
| Preserve five pages, original challenge, art, guides, layout | Master request §1 | Present | COMPLIANT | No page/feature/art removal; additions are isolated. |
| Preserve all seven simulations and SVG charts | Master request §§1,4 | Present | COMPLIANT | Original models, controls, metrics, and SVG areas remain. |
| Live HTML5 Canvas in Lab | Student Guide pp.1,7,12,16 | Canvas used only for hidden portrait hit testing | COMPLIANT | Optional synchronized Canvas panel added to each model. |
| Domain-specific Canvas visuals | Student Guide p.15 | Missing | COMPLIANT | Arrival curve, workshop occupancy, nine-state lifecycle, risk histogram, reliability blocks, and synchronized alternatives added. |
| Theme-reactive Canvas | Student Guide p.12 | Missing | COMPLIANT | Canvas reads active CSS tokens on redraw/theme change. |
| Responsive, low-CPU, offscreen/reduced-motion Canvas | Master request §4.1 | Missing | COMPLIANT | Static models redraw on demand; Markov uses rAF, IntersectionObserver pause, ResizeObserver, and reduced-motion static rendering. |
| Animated nine-state Markov graph | MNCabrido pp.1–2; Student Guide pp.1,7 | Outcome SVG only; internal seven-transient representation | COMPLIANT | All S0–S8 nodes, transient/absorbing colors, transition labels, and nine-state pulse supplied. |
| Markov transition matrix expandable and row-stochastic | MNCabrido p.2; Master §4.2 | Missing | COMPLIANT | Expandable exact-value matrix with Σ column; engine validates rows. |
| Correct Intake-start expected steps | MNCabrido p.2; Master §6 Model 3 | Incorrect sum across all transient starting states | COMPLIANT | Corrected to `expectedSteps[0]`; regression test proves distinction. |
| Beta-PERT TEF, beta vulnerability, lognormal severity | MNCabrido p.2 | Implemented inline | COMPLIANT | Extracted to validated seeded FAIR engine. |
| 100,000-trial ALE, VaR95, ROSI | MNCabrido p.2 | 100,000 main-thread batches | COMPLIANT | Preserved 100,000 trials; worker path, seeded engine, and stale run IDs added. |
| FAIR Web Worker with fallback | Student Guide p.7; Master §4.3 | Missing | COMPLIANT | Module worker plus safe asynchronous main-thread fallback. |
| FAIR runtime completion in browser | Master §4.3 | Baseline completed via batches | COMPLIANT | Actual wall-clock headless Edge/CDP run completed 100,000 trials: ALE ₱88,877, VaR95 ₱259,651, ROSI 167%; Canvas present. |
| Illustrative assumption labels | MNCabrido p.2; Master §4.3 | Present in risk text | COMPLIANT | Retained and reinforced in CODEX/README. |
| Mathematical relationship validation | Master §4.4 | Slider limits only; risk silently reordered PERT bounds | COMPLIANT | Pure validators reject invalid rates, probabilities, K<c, PERT order, matrices, loss and reliability inputs; UI shows errors rather than silently reordering. |
| Pure engine separation under `src/engines` | Student Guide pp.6,16 | Math embedded in `app.js` | COMPLIANT | Eight pure modules created; UI delegates seven model computations. Legacy unused helpers remain only to honor no-deletion constraint. |
| Poisson/exponential/NHPP/numerical integration | MNCabrido p.1 | Inline NHPP and trapezoid approximation | COMPLIANT | Pure arrival engine plus analytical/invariant tests. |
| Optional Lognormal/Gamma service-time extension | MNCabrido p.1 | Missing | PARTIALLY COMPLIANT | Optional tested lognormal sampler added; Gamma service sampler not exposed. |
| M/M/c/K normalization, blocking, utilization, λeff, Little's Law, Wq/W | MNCabrido p.1 | Mostly correct inline | COMPLIANT | Pure engine returns and tests all values; UI explicitly labels queue vs total time. |
| Nine-state canonical absorbing Markov analysis | MNCabrido pp.1–2 | Seven transient arrays plus two implicit outcomes | COMPLIANT | Explicit 9×9 P, Q/R extraction, absorption and expected steps. |
| FAIR mitigation comparison | MNCabrido p.2 | Reduction/ROSI control | COMPLIANT | Preserved; pure ROSI contract and baseline/mitigated concepts documented. |
| Normal-form deposit game and Nash verification | MNCabrido pp.2–3 | Support solver and “Nash” label | COMPLIANT | Pure engine checks all candidate supports and profitable unilateral deviations. |
| PDF-proposed linear-program optimal threshold | MNCabrido p.3 | Simplified 3×3 game | PARTIALLY COMPLIANT | Preserved simplified support enumeration; CODEX explicitly distinguishes it from proposed LP optimization. |
| Shannon entropy, keyspace, guessing time, throttle factor | MNCabrido p.3 | Random-token entropy; sequential shown as zero uncertainty | COMPLIANT | Models four-digit space at ≈13.3 bits, base-62 tokens, rates, keyspaces, times, and factor. |
| Web Crypto secure token generation | Student Guide p.8 | Missing | COMPLIANT | `crypto.getRandomValues()` with rejection sampling; no insecure fallback. |
| Series/parallel reliability, MTBF/MTTR, downtime | MNCabrido p.3 | Implemented inline | COMPLIANT | Pure validated engine and analytical tests. |
| Distinguish theoretical offline intake | MNCabrido p.3 | Text could imply capability | COMPLIANT | UI/CODEX explicitly state scenario-only; no customer cache added. |
| Verification drawer with four executable checks | Student Guide pp.12–13 | Missing | COMPLIANT | Drawer computes live results and never hardcodes a pass. |
| Poisson invariant <2% | Student Guide p.13 | Missing | COMPLIANT | 100,000 seeded samples; Vitest and drawer. |
| Little's Law difference <10⁻⁵ | Student Guide p.13 | Missing | COMPLIANT | System values use consistent hours; drawer reports actual difference. |
| Markov row sums tolerance 10⁻⁵ | Student Guide p.13 | Missing | COMPLIANT | All nine rows checked and reported. |
| FAIR 10,000-trial/1.5% convergence | Student Guide p.13 | Missing | COMPLIANT | Seeds 101/202, actual ALEs and relative difference shown; UI permits legitimate failure. Observed CLI difference 0.2484% (pass). |
| Verification timestamp, parameters, error, details | Master §7 | Missing | COMPLIANT | Drawer records execution time, standard, measured value, error, parameters, pass/fail. |
| Automated tests for all seven engines | Student Guide pp.6–7; Master §8 | `npm test` placeholder | COMPLIANT | 8 files / 28 tests; default/boundary/invalid/invariant/security cases. |
| Vitest | Student Guide pp.4,7 | Not installed | COMPLIANT | Vitest added as development dependency; `npm test` runs suite. |
| Formal CODEX contents for each model | Student Guide p.2; Master §9 | Seven short cards | COMPLIANT | Standardized formal entries added without deleting cards/playground. |
| Clean Unicode math, no raw LaTeX UI | Student Guide p.12 | Existing Unicode UI | COMPLIANT | New UI uses Unicode equations; PDF extraction files are not shipped. |
| RA 10173 crosswalk | Student Guide p.2 | Risk description mentioned RA 10173 | COMPLIANT | NPC/Lawphil-sourced legal duties separated from engineering recommendations. |
| Light/dark persistence | Student Guide p.12 | Existing local-storage toggle | COMPLIANT | Preserved; new Canvas redraws with theme. |
| Contrast, keyboard, focus, mobile, reduced motion | Master §10 | Partial | PARTIALLY COMPLIANT | Focus/touch/responsive/reduced-motion implementation added; automated contrast ratios and assistive-technology testing remain human QA. |
| Repository XSS/secrets/input/dependency review | Student Guide p.8; Master §11 | No audit record | COMPLIANT | Scoped scan/manual review and `npm audit`; current results in `docs/SECURITY_AND_SKILL_AUDIT.md`. |
| Third-party skill inspection | Student Guide pp.2–5,8,14 | No record | COMPLIANT | Two activated skills read before use; scoped OWASP-oriented log in `AI_USAGE.md`. |
| Cloudflare security-audit skill pass | Student Guide p.16 | Skill unavailable | BLOCKED | Not claimed. Local security review used; formal Cloudflare skill execution requires that skill to be installed/available. |
| `SPEC.md` | Student Guide pp.3,6 | Missing | COMPLIANT | Added contracts, units, assumptions, outputs, verification and nonfunctional requirements. |
| `DESIGN_SYSTEM.md` | Student Guide p.6 | Missing | COMPLIANT | Existing tokens/components/themes documented. |
| `AI_USAGE.md` required sections and three real refinements | Student Guide pp.14–15 | Missing | COMPLIANT | Environment, skill vetting, four actual iterations, and attribution matrix recorded; unavailable history marked. |
| README overview/team/setup/models/security/limits | Student Guide p.16 | Missing | COMPLIANT | Added all requested sections and links. |
| Live deployment URL | Student Guide pp.9,16 | None | BLOCKED | No deployment was authorized or performed; README states unavailable. |
| Static-host relative paths and five-page build | Master §13 | Vite dev only; no build script/config | COMPLIANT | Relative Vite base, multipage inputs, and successful production build. |
| Deep Lab query links | Master §13 | Existing allowlisted `model` parameter | COMPLIANT | Preserved and smoke-tested with Markov/risk URLs. |
| No backend/runtime framework requirement | Master §13 | Static | COMPLIANT | Remains static; dependencies are development-only. |
| All five pages headless-browser load | Master §14 | Not previously recorded | COMPLIANT | Edge smoke markers found on index, lab, concepts, guides, and about; Markov dynamic matrix rendered. |
| 60 FPS measurement | Student Guide p.9 | Not measured | REQUIRES VERIFICATION | rAF/offscreen/reduced-motion architecture implemented, but no performance trace was captured. |
| Full manual slider/reset/theme/mobile regression | Master §14 | Not previously recorded | REQUIRES VERIFICATION | Engine tests/build/headless page smoke completed; exhaustive pointer/touch/assistive-tech interaction requires human browser QA. |

## Mathematical correction record

| Item | Old calculation | Correct formula | Test and reason |
|---|---|---|---|
| Markov expected steps | `expected.reduce((a,b) => a+b, 0)` summed expectations for every transient starting state | `expectedSteps[0]`, the Intake/S0 component of `t = N·1` | `markov.test.js` proves the displayed value is the Intake component and not the cross-state sum. |
| PERT invalid-order handling | `low = min(low,mode)` and `high = max(mode,high)` silently changed user inputs | Validate `low ≤ mode ≤ high`; display an actionable validation error | `fair.test.js` rejects invalid ordering. |
| Predictable ID entropy | Displayed zero bits because the next sequential ID may be inferred | Four-digit identifier space: `log₂(10⁴) ≈ 13.3` bits, while noting predictability weakens effective security | `entropy.test.js` checks 13.2877 bits and rate factor. |

## Test evidence

- `npm test`: **8 files passed, 28 tests passed**.
- `npm run build`: **5 HTML entries + FAIR worker built successfully**.
- `npm audit --omit=dev`: **0 vulnerabilities**.
- Headless Edge FAIR worker: **100,000 trials completed**; ALE ₱88,877, VaR95 ₱259,651, ROSI 167%.
- FAIR verification seeds 101 and 202: ALE ₱82,436.93 vs ₱82,641.74; relative difference **0.2484%**, below 1.5%.

