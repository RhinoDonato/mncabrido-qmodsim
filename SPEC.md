# MNCabrido iFix QMODSIM Specification

## Objective

Enhance the existing five-page MNCabrido iFix learning artifact without replacing its visual identity, pages, scheduling challenge, guide characters, SVG charts, or seven simulations. The artifact must expose three recognizable experiences: Scenarios, Lab, and QMODSIM CODEX.

## Functional contracts

| Experience | Contract |
|---|---|
| Scenarios | Three repeatable decision crises must change real engine parameters and show quantified before/after results. |
| Lab | Seven preserved models, continuous controls, retained SVG charts, synchronized Canvas alternatives, Markov graph/matrix, and 100,000-trial FAIR execution. |
| CODEX | Seven model references with problem, module, equation, symbols, units, derivation, assumptions, worked example, interpretation, limitations, and Lab link. |
| Verification | Execute Poisson, Little's Law, Markov row-sum, and FAIR convergence checks and display measured results, seeds, sample sizes, timestamp, and actual pass/fail. |

## Mathematical model contracts

| Engine | Inputs and units | Outputs | Preconditions |
|---|---|---|---|
| Arrival | base/surge in devices/hour; peak/sigma/horizon in hours | λ(t), expected count, NHPP event times, optional lognormal service time | rates ≥ 0; sigma and horizon > 0 |
| Queue | λ devices/hour; μ repairs/technician/hour; c technicians; K devices | normalized occupancy, Pₖ, λeff, utilization, L, Lq, W, Wq | λ, μ > 0; c integer ≥ 1; K integer ≥ c |
| Markov | approval, parts, pickup, deposit probabilities | 9×9 P, Q, R, t, absorption probabilities | each probability in [0,1]; every P row sums to 1 |
| FAIR | PERT frequency events/year; beta vulnerability; lognormal median/spread; trials/seed | loss sample, ALE, VaR95, histogram, Loss Exceedance Curve, ROSI | low ≤ mode ≤ high; probability in [0,1]; loss > 0; trials integer |
| Game | part cost, margin, labor, customer value in PHP; friction probability | payoff matrices, verified Nash support, policy comparisons | currency inputs ≥ 0; friction in [0,1] |
| Entropy | token length, alphabet size, guesses/second | entropy bits, keyspace, average guess time, protection factor | positive integer dimensions; rate > 0; Web Crypto for tokens |
| Reliability | MTBF/MTTR hours; service probabilities | component/system availability, annual downtime, theoretical offline scenario | MTBF > 0; MTTR ≥ 0; probabilities in [0,1] |

## Assumptions

- Business inputs are illustrative unless MNCabrido supplies measured observations.
- Queue arrivals/services use the M/M/c/K steady-state assumptions.
- Markov steps are transitions, not elapsed hours.
- FAIR output is an estimate and varies with seed; seeded runs exist for reproducibility.
- The Loss Exceedance Curve is calculated from the actual annual-loss sample as `P(annual loss > threshold)` and is capped visually at the 99.5th-percentile range without changing ALE or VaR calculations.
- Game equilibria apply only to the displayed payoff table.
- Random identifiers supplement—not replace—authorization.
- Offline intake is a theoretical reliability scenario; the site does not store customer data offline.

## Verification criteria

- Mean exponential inter-arrival relative error < 2% against 1/λ with a fixed 100,000-sample seed.
- `|L − λeff·W| < 10⁻⁵` in consistent hours.
- Every Markov row differs from one by < 10⁻⁵.
- Two independent 10,000-trial FAIR ALE estimates are compared against a 1.5% relative threshold; failure remains visible.
- Vitest covers all engines, invalid inputs, normalization, conservation, absorbing states, seeded reproducibility, equilibrium, entropy, and reliability.

## Nonfunctional requirements

- Static-host compatible five-page Vite build with relative base paths.
- Preserve current blue/white light/dark design and stored theme selection.
- Keyboard-visible controls, 44px interactive targets, responsive layouts, chart text alternatives, and reduced-motion support.
- Canvas animation uses `requestAnimationFrame`, stops offscreen, and becomes static with reduced motion.
- FAIR sampling uses a module Worker when available, rejects stale run IDs, and falls back to the same seeded engine if Worker construction or execution fails.
- No real attacks, customer records, authentication service, database, or backend.
- Avoid DOM injection from user-provided strings; use Web Crypto for security demonstrations.

