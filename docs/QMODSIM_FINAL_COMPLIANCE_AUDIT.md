# QMODSIM Final Compliance Audit

Audit date: 2026-11-21 (Asia/Manila)  
Current branch: `feature/qmodsim-final-compliance`  
Baseline commit: `e201c50` (`Merge pull request #12 from RhinoDonato/feature/qmodsim-guide-compliance`)  
Reference documents: `QMODSIM- MNCabrido iFix (1).pdf` (3 pages) and `QMODSIM-Student-Guide_-Designing-and-Engineering-an-Interactive-QMODSIM-Web-Artifact-through-Agentic-AI (2).pdf` (16 pages)

## Verdict

The artifact is **mostly compliant and release-ready for static deployment**, with transparent exceptions: the preserved five-page structure is not literally a single-page application, the PDF-suggested linear-program game solver is represented by a mathematically verified support-enumeration solver, the Cloudflare audit skill is unavailable, and a live URL requires the team’s GitHub access.

## Requirements matrix

| Requirement | PDF and page | Existing implementation | Verification method | Status | Action needed |
|---|---|---|---|---|---|
| SCENARIOS, LAB, and CODEX | Student Guide pp.1–2, 16 | Three engine-backed crises, seven-model Lab, formal CODEX | Browser smoke and source review | PASS | None |
| Literal single-page application | Student Guide p.1 | Five preserved HTML pages with shared navigation | Build inspection | PARTIAL | Accepted preservation conflict; do not remove required pages |
| Pure mathematical engines separated from UI | Student Guide pp.6, 16 | Eight JS modules under `src/engines/` | Import/build review | PASS | None |
| TypeScript-specific architecture recommendation | Student Guide pp.6–7 | Existing preserved JavaScript ES-module project | Repository inspection | NOT APPLICABLE | A TypeScript migration would violate the no-rewrite requirement |
| Device arrivals: Poisson, exponential, NHPP, numerical integration, lognormal service | MNCabrido p.1; Student Guide p.9 | `arrival.js` supplies every required operation | Analytical and seeded NHPP tests | PASS | Gamma service time remains optional, not required alongside lognormal |
| Arrival expected count distinguished from a sample | MNCabrido p.1 | Separate “Sampled drop-offs” and “Expected today” metrics | Browser/source review | PASS | None |
| M/M/c/K queue outputs and conservation | MNCabrido p.1; Student Guide p.10 | Normalized states, Pᴋ, λeff, utilization, L, Lq, W, Wq | Low/high/c=K/multi-server/invalid tests and Little’s Law | PASS | None |
| Nine required Markov states and absorbing S6/S7 | MNCabrido pp.1–2 | Explicit 9×9 transition model and visualization | Tests, matrix UI, browser count of 9 rows | PASS | None |
| Fundamental matrix, expected steps, and absorption matrix | MNCabrido p.2; Student Guide p.10 | N=(I−Q)⁻¹, t=N·1, B=N·R returned by engine | Matrix-product regression test | PASS | None |
| Intake expected-step correction remains fixed | MNCabrido p.2 | Uses `expectedSteps[0]` | Regression test and numeric result 4.8196 steps | PASS | None |
| Warranty rework transitions | MNCabrido p.1 | S8 routes 0.35 to S4 and 0.65 to S6 | Dedicated test | PASS | None |
| FAIR Beta-PERT, beta vulnerability, lognormal severity, annual aggregation | MNCabrido p.2 | Seeded FAIR engine | Deterministic and boundary tests | PASS | None |
| 100,000-trial ALE, VaR₉₅, ROSI | MNCabrido p.2 | Worker-backed Lab simulation | Browser result: ALE ₱88,877; VaR₉₅ ₱259,651; ROSI 167% | PASS | Inputs remain illustrative |
| Loss Exceedance Curve from actual sample | MNCabrido p.2 | Added optional LEC beside retained histogram with VaR marker and table | Engine monotonicity test and browser values | PASS | None |
| Worker execution, stale-result protection, and fallback | Student Guide p.7 | Module Worker, run IDs, guarded same-engine fallback | Production Worker resource observed; source/error-path review | PASS | None |
| FAIR convergence check | Student Guide pp.12–13 | Independent 10,000-trial seeds 101 and 202 | 0.248% ALE difference against 1.5% target | PASS | Keep genuine failures visible for other configurations |
| Deposit normal-form game and Nash result | MNCabrido pp.2–3 | 3×3 payoff model with support enumeration and deviation checks | Pure and mixed equilibrium tests | PASS | None for educational objective |
| PDF-suggested linear-program method | MNCabrido p.3 | Support enumeration, explicitly distinguished in CODEX | Method review | PARTIAL | Optional future independent LP verifier; no Python/backend added |
| Entropy, keyspace, guess time, rate factor | MNCabrido p.3; Student Guide p.9 | H=Llog₂|Σ|, S=|Σ|ᴸ, T=S/(2R) | Unit tests including 24-character keyspace | PASS | None |
| Secure random token generation | Student Guide p.8 | Web Crypto rejection sampling; no insecure fallback | Boundary-injection unit test | PASS | None |
| Mock-only IDOR demonstration | MNCabrido p.3 | Local arithmetic and mock tokens only | Network/source review | PASS | Real authorization remains a backend responsibility |
| Series/parallel reliability and downtime | MNCabrido p.3; Student Guide p.11 | Terminal/API/database series plus SMS/email parallel path | Analytical tests | PASS | None |
| Offline intake requirement | MNCabrido p.3 | Explicitly theoretical availability scenario; no customer cache | UI/CODEX/source review | PASS | A real offline customer-record system is intentionally excluded |
| Three decision forks alter real parameters | Student Guide p.15 | Queue, deposit, and entropy engines recalculate | Browser interaction and accessible chart labels | PASS | None |
| Scenario reset and repeated use | Final prompt §4.1 | Independent reset for all three cards | Browser interaction | PASS | None |
| Seven Lab simulations, controls, SVG, and Canvas | Student Guide pp.1, 7, 16 | All retained and synchronized | Browser and build review | PASS | None |
| Input validation and no unexpected NaN/Infinity | Final prompt §4.2 | Validated engine boundaries and range controls | Invalid/boundary tests and browser smoke | PASS | None observed |
| CODEX contents for all seven models | Student Guide p.2 | Problem, equation, symbols/units, derivation, example, interpretation, assumptions, limits, Lab link | Complete source review | PASS | None |
| RA 10173 legal/engineering distinction | Student Guide p.2 | Statutory summary separated from recommended controls | Source review of official links and wording | PASS | Human legal review remains recommended |
| Clean Unicode mathematics | Student Guide pp.11–12, 16 | Unicode equations in visible UI | Source scan/browser review | PASS | None |
| Four executable validation checks | Student Guide pp.12–13 | Drawer executes current engines | Actual run values recorded below | PASS | None |
| Validation metadata and truthful status | Final prompt §5 | Standard, measured value, error, parameters, seeds/sample sizes, timestamp | Browser and source review | PASS | None |
| Drawer keyboard containment and focus return | Final prompt §5 | Tab loop, Escape close, trigger restoration | Browser keyboard-event audit | PASS | Human screen-reader pass remains recommended |
| Automated mathematical tests | Student Guide pp.6–7, 16 | Vitest suite | 8 files, 42 tests, all passing | PASS | None |
| Repository security audit | Student Guide pp.7–8, 16 | Final report and source/dependency scans | `docs/SECURITY_AND_SKILL_AUDIT.md` | PASS | Backend security remains out of scope |
| Cloudflare security audit skill | Student Guide pp.4, 7, 16 | Skill absent from installed catalog | Skill inventory | BLOCKED | Team may install from a trusted source and rerun after review |
| OWASP-oriented skill vetting log | Student Guide pp.4–5, 14 | Actual activated/inspected skills documented | Complete SKILL.md review | PASS | None |
| Existing civic-blue design and five pages preserved | Student Guide pp.11–12; preservation rules | No redesign or page removal | Visual/source comparison | PASS | None |
| Light/dark Canvas behavior | Student Guide pp.11–12, 16 | CSS-token-driven Canvas redraws | Browser theme test | PASS | None |
| Responsive desktop/tablet/mobile layouts | Final prompt §8 | Existing breakpoints retained | 375, 768, and 1440 px plus 844×390 landscape across all pages; no page overflow | PASS | Physical-device QA recommended |
| Reduced-motion behavior | Student Guide p.8 | Static Markov Canvas when preference is reduce | Browser media emulation and source review | PASS | None |
| Smooth Canvas rendering around 60 FPS | Student Guide pp.8, 16 | rAF Markov animation, offscreen pause | 120-frame headless sample: 59.0 FPS mean, 16.95 ms/frame | PASS | Headless result is indicative, not a hardware guarantee |
| Images, internal links, and generated assets | Final prompt §9 | All required files present | Source/dist reference scan; production browser smoke | PASS | None |
| Static and production guide portrait paths | Final prompt §§9–10 | Browser-native `new URL(..., import.meta.url)` works directly in XAMPP and is transformed by Vite | Direct Apache Lab plus hashed production portrait URL loaded | PASS | None |
| Five-entry static production build | Final prompt §10 | Relative-base multipage Vite config and manual-only official Pages workflow | `npm run build`, `dist/` inspection, and workflow review | PASS | Run the workflow only after team review |
| Deep Lab query links and production Worker | Final prompt §10 | `lab.html?model=...` allowlist and bundled Worker | Production preview smoke | PASS | None |
| README, SPEC, DESIGN_SYSTEM, AI_USAGE | Student Guide pp.5–6, 13–16 | Required documentation retained and updated | Content review | PASS | Team must confirm unavailable historical attribution |
| Live deployment URL | Student Guide pp.8–9, 16 | README has an explicit pending placeholder | No deployment authorized | BLOCKED | Team must deploy and replace placeholder after verification |
| GitHub commit/push/release | Student Guide pp.8–9, 16 | Working tree intentionally left uncommitted | User’s Git safety instruction | BLOCKED | User will review, stage, commit, push, and configure Pages |

## Actual mathematical verification

| Check | Expected | Actual | Result |
|---|---|---|---|
| Poisson inter-arrival | Mean 1/λ; relative error <2% | 0.200476 h vs 0.200000 h; 0.238% | PASS |
| Little’s Law | `|L−λeff·W| < 10⁻⁵` | L=7.75373077; λeff·W=7.75373077; difference 0 | PASS |
| Markov row sums | Maximum row error <10⁻⁵ | 0 | PASS |
| FAIR convergence | Independent 10,000-trial ALEs differ <1.5% | ₱82,436.93 vs ₱82,641.74; 0.248% | PASS |

Additional default outputs: queue blocking 0.1401765, effective arrivals 4.2991175 devices/hour, W=1.8035634 hours; Markov paid probability 0.6553007 and canceled probability 0.3446993; 12-character base-62 entropy 71.4504 bits and rate-limit factor 2,000×; system availability 0.9970231 with 26.078 hours/year modeled downtime.

## Validation evidence

- `npm test`: exit 0; 8 files and 42 tests passed.
- `npm run build`: exit 0; all five HTML entries, bundled assets, and FAIR Worker emitted.
- `npm audit`: exit 0; zero vulnerabilities.
- `npm audit --omit=dev`: exit 0; zero runtime vulnerabilities.
- JavaScript syntax checks: exit 0.
- Development browser audit: all five pages at 375/768/1440 px, no broken images, no horizontal page overflow.
- Production preview: deep Lab links, hashed guide image, Worker, LEC, and model metrics loaded successfully.

## Remaining manual actions

1. Review the working-tree diff and academic wording with the project team.
2. Perform a physical-device and assistive-technology pass.
3. If required by the professor, install and inspect the Cloudflare skill from a trusted source, then record its actual results.
4. Commit and push on the user-managed branch.
5. Configure GitHub Pages to publish `dist/`, verify the deployed Worker and five pages, then replace the pending README URL.
