# MNCabrido iFix QMODSIM

An interactive mathematical modeling and simulation artifact for MNCabrido iFix, a local laptop, desktop, and printer repair shop in Barangay West Rembo, Taguig City. It helps students and defense panelists test repair demand, capacity, job outcomes, financial risk, deposit strategy, tracking-reference security, and system availability.

## Objectives

- Turn repair-shop operational and cybersecurity questions into adjustable quantitative models.
- Provide narrative Scenarios, an experimentation Lab, and a formal QMODSIM CODEX.
- Make mathematical assumptions, units, limitations, and verification results inspectable.
- Preserve the original team artwork, blue/white identity, scheduling challenge, guides, SVG charts, and five-page structure.

## Team roster

- Ronen Marces — Intake Guide
- Rhino Angelo Donato — Workshop Guide
- Lourdes Carmela Arevalo — Workflow Guide
- Danica Deramas — Risk Guide
- Ma. Azriel Garcia — Parts Guide

## Technology

Static HTML, CSS, JavaScript ES modules, HTML5 Canvas, SVG, Web Workers, Web Crypto, Vite, and Vitest. No backend, database, authentication system, or customer-record connection is included.

## Setup and commands

```bash
npm install
npm run dev
npm test
npm run build
```

Open the URL printed by Vite. The production-ready static files are generated in `dist/` by `npm run build`.

## Experiences

- **Scenarios (`index.html`)** retains the scheduling challenge and adds three engine-backed crises: queue saturation, parts deposits, and mock identifier enumeration.
- **Lab (`lab.html`)** retains all seven simulations and SVG charts, adds synchronized Canvas views, a nine-state Markov matrix, worker-backed FAIR simulation, and a Verification & Validation drawer.
- **CODEX (`concepts.html`)** retains the original explanations and queue playground, then adds formal derivations, units, examples, limitations, and an RA 10173 engineering crosswalk.
- **Guides and About** remain available as the original team and business context pages.

## Seven-model and curriculum map

| Model | QMODSIM module | Main output |
|---|---|---|
| Device Arrivals | Modules 1 & 3 | NHPP rate, sampled/expected daily arrivals |
| Technician Queue | Module 6 | M/M/c/K blocking, utilization, Wq and W |
| Job Order Journey | Module 5 | absorption probabilities and Intake-start steps |
| Annual Risk | Module 4 | seeded ALE, VaR95, Loss Exceedance Curve, ROSI |
| Deposit Strategy | Module 7 | payoff matrix and verified Nash support |
| Tracking ID Security | Modules 2 & 10 | entropy, keyspace, guess time, throttling factor |
| System Reliability | Module 12 | series/parallel availability and annual downtime |

## Security notes

- The enumeration walkthrough is isolated math against mock identifiers; it sends no attack traffic.
- Secure sample references use `crypto.getRandomValues()` with rejection sampling.
- Random identifiers do not replace server-side authorization, rate limiting, monitoring, or audit logs.
- This static artifact stores only the light/dark preference. It does not store real customer details or claim implemented offline customer-data caching.
- RA 10173 material is educational, distinguishes legal text from recommended controls, and is not legal advice.

## Known limitations

- Inputs are illustrative until replaced with measured shop data.
- Queue, Markov, FAIR, game, and reliability assumptions simplify real operations.
- The strict FAIR convergence check may legitimately fail for some independent seeds; the drawer reports the actual outcome.
- The project has not been deployed by this implementation session, so no live deployment URL is available.
- Browser interaction was smoke-tested in headless Edge; exhaustive assistive-technology and device testing still requires a human QA pass.

## Deployment status

**Live URL: Pending team deployment.** Do not replace this line until the deployed site has been opened and verified.

For GitHub Pages after reviewing and merging the work:

1. In repository **Settings → Pages**, select **GitHub Actions** as the source.
2. Open **Actions → Deploy GitHub Pages → Run workflow**. The workflow is manual-only and runs `npm ci`, tests, and the production build before deployment.
3. Open all five generated HTML pages and `lab.html?model=risk` under the repository subpath.
4. Confirm the FAIR Worker loads, then record the verified URL here.

See [AI_USAGE.md](AI_USAGE.md), [SPEC.md](SPEC.md), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [the final compliance audit](docs/QMODSIM_FINAL_COMPLIANCE_AUDIT.md), and [the security report](docs/SECURITY_AUDIT_REPORT.md).

