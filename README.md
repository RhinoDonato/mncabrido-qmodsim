# MNCabrido iFix QMODSIM

An interactive mathematical modeling and simulation artifact for MNCabrido iFix, a local laptop, desktop, and printer repair shop in Barangay West Rembo, Taguig City. It helps students and defense panelists test repair demand, capacity, job outcomes, financial risk, deposit strategy, tracking-reference security, and system availability.

## Objectives

- Turn repair-shop operational and cybersecurity questions into adjustable quantitative models.
- Provide narrative Scenarios, an experimentation Lab, and a formal QMODSIM CODEX.
- Make mathematical assumptions, units, limitations, and verification results inspectable.
- Preserve the original team artwork, blue/white identity, scheduling challenge, guides, SVG charts, and five-page structure.

## Team Roster (Group 2)

- Lourdes Carmela Arevalo
- Danica Deramas
- Rhino Angelo Donato
- Ma. Azriel Garcia
- Ronen Marces 

## Technology

Static HTML, CSS, JavaScript ES modules, HTML5 Canvas, SVG, Web Workers, Web Crypto, Vite, and Vitest.

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
- QMODSIM is a client-side educational simulation and does not include a production backend. Authentication, database storage, server-side authorization, and rate limiting are outside its current scope.
- RA 10173 material is educational, distinguishes legal text from recommended controls, and is not legal advice.

## Known limitations

- Inputs are illustrative until replaced with measured shop data.
- Queue, Markov, FAIR, game, and reliability assumptions simplify real operations.
- The strict FAIR convergence check may legitimately fail for some independent seeds; the drawer reports the actual outcome.
- The project notes report an earlier browser smoke test in headless Edge; this does not confirm the current public deployment or every simulation.
- Exhaustive assistive-technology and device testing still requires a human QA pass.

## Live Web Artifact

| Item | Details |
|---|---|
| Project | MNCabrido iFix QMODSIM |
| Repository | [github.com/RhinoDonato/mncabrido-qmodsim](https://github.com/RhinoDonato/mncabrido-qmodsim) |
| Live website | [https://rhinodonato.github.io/mncabrido-qmodsim/](https://rhinodonato.github.io/mncabrido-qmodsim/) |
| Hosting | GitHub Pages |
| Deployment method | GitHub Actions, using the `Deploy GitHub Pages` workflow |
| Deployment branch | `main` |
| Production build | Vite (`npm run build`) |
| Build output | `dist/` |
| Status | GitHub Actions deployment workflow completed successfully. The public website and every simulation have not been independently verified as part of this README update. |

### Project Documentation

- [AI Usage and Engineering Oversight](AI_USAGE.md)
- [Project Specification](SPEC.md)
- [Design System](DESIGN_SYSTEM.md)
- [Final Compliance Audit](docs/QMODSIM_FINAL_COMPLIANCE_AUDIT.md)
- [Security and Skill Audit](docs/SECURITY_AND_SKILL_AUDIT.md)
- [Mathematical Verification](docs/MATHEMATICAL_VERIFICATION.md)