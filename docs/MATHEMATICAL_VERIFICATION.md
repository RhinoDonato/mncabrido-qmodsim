# Mathematical Verification

Verification date: 2026-11-24 (Asia/Manila)
Implementation reviewed: `src/engines/arrival.js`, `queue.js`, `markov.js`, `fair.js`, and `validation.js`; corresponding tests under `tests/engines/`; executable checks in `src/ui/validation-drawer.js`.

## Executive result

**PASS.** The full mathematical suite executed successfully: **8 test files and 42 tests passed**. A separate execution of the four Student Guide contracts passed Poisson inter-arrival, Little's Law, Markov row-stochasticity, and FAIR Monte Carlo convergence using actual engines and deterministic seeds.

No mathematical engine or test was changed during this verification.

## Commands executed

```powershell
npm.cmd test
npm.cmd run build
node --input-type=module -e "import { runValidationChecks } from './src/ui/validation-drawer.js'; console.log(JSON.stringify(runValidationChecks(), null, 2));"
```

- `npm.cmd test`: exit 0; Vitest 4.1.12; 8/8 files and 42/42 tests passed; reported duration 988 ms.
- `npm.cmd run build`: exit 0; Vite 8.3.8 transformed 20 modules and completed the build.
- Direct validation command: exit 0; four measured checks returned `passed: true`.

Initial npm attempts used `npm.ps1` and were blocked by PowerShell policy before tools ran. They are not counted as passes or failures; successful `npm.cmd` runs are the evidence.

## Student Guide invariant results

| Invariant | Parameters | Expected / acceptance rule | Actual | Error / tolerance | Result |
|---|---|---|---|---|---|
| Poisson inter-arrival mean | λ=5/hour; n=100,000; seed=4101 | E[T]=1/λ=**0.200000 h**; relative error < **2%** | **0.200476 h** | **0.238%** < 2% | **PASS** |
| Little's Law | λ=5/h; μ=1.5/h; c=3; K=12 | L=λeffW; absolute difference < **10⁻⁵** | L=**7.75373077**; λeffW=**7.75373077** | **0.000e+0** < 10⁻⁵ | **PASS** |
| Markov row sums | 9 states; approval=.78; parts=.65; pickup=.86; deposit=.30 | Every ΣPᵢⱼ=**1** within **10⁻⁵** | Largest error **0.000e+0** | **0.000e+0** < 10⁻⁵ | **PASS** |
| FAIR ALE convergence | 10,000 trials/run; seeds 101/202; low/mode/high=2/6/20; vulnerability=.35; median loss=₱25,000; σ=.65 | Independent ALEs differ by < **1.5%** | Seed 101: **₱82,437**; seed 202: **₱82,642** | **0.248%** < 1.5% | **PASS** |

Currency is rounded for display; relative error uses unrounded engine results.

## Engine and test review

### Poisson / arrival

`sampleExponential` implements −ln(U)/λ and validates a positive finite rate. The invariant is reproducible through seeded randomness. Executed tests also cover constant-rate integration, peak intensity, positive lognormal service time, and NHPP counts against integrated intensity. **Result: PASS.**

### Queue / Little's Law

`calculateQueue` implements finite M/M/c/K stationary probabilities, blocking, λeff=λ(1−PK), and derives W and Wq from L/λeff and Lq/λeff. Tests also verify the known M/M/1/2 distribution (4/7, 2/7, 1/7), conservation under multiple regimes, and invalid rates/dimensions. **Result: PASS** for system and queue forms in the suite.

### Absorbing Markov chain

The engine builds nine states, retains two absorbing states, extracts Q/R, solves N=(I−Q)⁻¹, and calculates B=NR and expected steps. Tests verify row sums, absorbing rows, probability conservation, the fundamental-matrix identity, rework routing, and Intake-based expected steps. **Result: PASS.**

### FAIR Monte Carlo

The engine validates PERT ordering, probability bounds, loss inputs, and integer trials and uses deterministic seeds for verification. Tests also cover replay, positive losses, VaR ordering, ROSI, invalid PERT input, monotone loss-exceedance probabilities, and zero vulnerability. **Result: PASS** for the guide's 1.5% convergence rule and existing tests.

## Verification boundaries

- Results cover the current implementation and shown parameters/seeds, not every possible input.
- Monte Carlo agreement is a convergence/reproducibility check, not proof that illustrative assumptions match operational data.
- No independent external solver, statistical package, or production dataset was supplied; cross-tool replication was **not performed**.
- Browser interaction was not needed for engine results; the production build did execute successfully.

## Final status

| Check | Status |
|---|---|
| Full Vitest suite | **PASS — 42/42** |
| Poisson invariant | **PASS** |
| Little's Law invariant | **PASS** |
| Markov invariant | **PASS** |
| FAIR convergence invariant | **PASS** |
| Production build | **PASS** |
| External-solver comparison | **NOT PERFORMED** |
