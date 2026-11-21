# AI Usage and Engineering Oversight

## 1. Agentic environment and model rationale

The original compliance enhancement was performed in Codex, an OpenAI coding-agent environment, on branch `feature/qmodsim-guide-compliance`. Final compliance and release-readiness verification was performed on `feature/qmodsim-final-compliance` from baseline commit `e201c50`. The model identifier exposed to the repository session was not available, so it is recorded as **Codex / model identifier requires platform or team input** rather than guessed. Codex was suitable because the task required repository inspection, surgical patches, local testing, headless browser checks, and preservation of the working-tree baseline.

Historical AI usage before commit `f26d0edabebb67a57bcd7a1af970a4bb22e581be` was not supplied and requires team input.

## 2. Skills activated and OWASP-oriented vetting log

| Skill | Why activated | Inspection performed before use | Vetting result |
|---|---|---|---|
| `ui-ux-pro-max` | Interface, accessibility, charts, responsive Canvas, and drawer work | Read the complete `SKILL.md`; ran only its local Python search for focus, chart alternatives, and reduced motion | No prompt override, secret request, destructive action, remote installer, or hidden write was present. Search output was treated as guidance. |
| `testing-best-practices` | Behavioral mathematical tests and deterministic randomness | Read the complete `SKILL.md` plus naming, assertions, isolation, security, and review rules | Laravel-specific instructions were identified as non-applicable. Only framework-neutral principles were used; no external PHPUnit fetch was needed. |

Manual vetting considered the OWASP Agentic Skills Top 10 themes requested by the guide: instruction injection, excessive agency, unsafe shell execution, secret leakage, untrusted remote dependencies, and hidden/destructive writes. No third-party skill was installed. The UI search script was local and read-only. Vitest was installed from the declared npm registry dependency after approval; `npm audit --omit=dev` reported zero runtime vulnerabilities.

This is a scoped manual review, not a claim that the unavailable Cloudflare security-audit skill or a complete formal OWASP certification was run.

## 3. Phase-by-phase prompt and refinement log

### Iteration 01 — Markov Intake-state defect

- **SE phase:** Audit and mathematical verification
- **Source prompt (exact excerpt):** “The current implementation appears to sum expected absorption steps across transient starting states when displaying the expected steps for a job beginning at Intake. Verify the issue using a mathematical test.”
- **Finding:** `app.js` displayed `expected.reduce((a,b)=>a+b,0)`, summing all seven transient starting-state expectations.
- **Surgical refinement instruction:** “Expose `expectedStepsFromIntake = expectedSteps[0]` from the pure Markov engine and keep the existing metric card, changing only its value and explanatory label.”
- **Verified result:** `tests/engines/markov.test.js` proves the Intake value is the first component, is smaller than the incorrect cross-state sum, and absorption probabilities sum to one. Full suite passed.

### Iteration 02 — Deposit-exposure test contract

- **SE phase:** Test-driven engine verification
- **Initial test prompt:** “Show that full parts payment removes modeled parts abandonment exposure.”
- **Finding:** The first Vitest run failed: expected ₱0 but received ₱180. Full parts payment covers the ₱6,000 part, but the model intentionally retains ₱1,000 labor risk weighted by 18% abandonment.
- **Surgical refinement instruction:** “Correct the test contract to distinguish covered parts cost from remaining labor exposure; do not alter the payoff implementation merely to make the test pass.”
- **Verified result:** The revised test independently expects ₱180 and verifies it is lower than no-deposit exposure. The final suite, including the in-app verification contract, passed 28/28 tests.

### Iteration 03 — Keyboard and nine-state visual audit

- **SE phase:** UI/accessibility regression
- **Audit prompt:** “Verify keyboard focus, chart alternatives, offscreen animation, reduced motion, and that the animated Markov visualization shows all nine required states.”
- **Finding:** The first Canvas pulse used modulo 7, so S7 and S8 were never highlighted; the drawer restored focus but did not contain Tab focus while open.
- **Surgical refinement instruction:** “Cycle the state pulse modulo nine and add a minimal Tab/Shift+Tab focus loop inside the existing drawer without changing its visual design.”
- **Verified result:** Production build passed, headless Edge rendered the dynamic Markov matrix, and source review confirms nine-state cycling and focus containment.

### Iteration 04 — Security scan command correction

- **SE phase:** Security hardening
- **Finding:** The first combined PowerShell secret/XSS grep did not execute because an embedded quote broke the command string.
- **Surgical refinement instruction:** “Rerun the scan as separate single-quoted ripgrep patterns; do not report a security pass for the failed command.”
- **Verified result:** The rerun found no credential patterns or dynamic-code execution. `innerHTML` findings were reviewed as controlled metadata/numeric SVG templates; free-form request preview output uses `textContent`.

### Iteration 05 — Missing FAIR Loss Exceedance Curve

- **SE phase:** Final mathematical compliance
- **Source prompt (exact excerpt):** “If missing, add a Loss Exceedance Curve (LEC) without removing the existing Monte Carlo histogram.”
- **Finding:** The FAIR engine returned sorted losses, ALE, VaR₉₅, and histogram bins, but no exceedance data or LEC view existed.
- **Surgical refinement instruction:** “Calculate `P(annual loss > threshold)` from the actual seeded annual-loss sample, retain the histogram, and add an optional theme-compatible SVG with a visible percentile table.”
- **Verified result:** A monotonicity regression test passes; the Worker returns the calculated LEC; the browser showed 50th/75th/90th/95th/99th thresholds from 100,000 simulated years and marked VaR₉₅ at ₱259,651.

### Iteration 06 — Production-only asset failure

- **SE phase:** Release readiness
- **Audit prompt:** “Inspect the generated `dist/` directory and verify that image references and deep Lab links work in the production version.”
- **Finding:** Development worked, but runtime guide strings were not transformed by Vite. Production preview returned 404 for `assets/characters/guide-4.png`.
- **Surgical refinement instruction:** “Resolve only the five existing guide portraits through `new URL(..., import.meta.url)` and pass those browser-native, Vite-compatible URLs to the unchanged guide component.”
- **Verified result:** The direct XAMPP site loads the original asset paths, while the rebuilt Lab loads a hashed `assets/guide-4-*.png` URL. All five HTML entries and the FAIR Worker remain intact.

## 4. Code attribution matrix

| Area | Attribution in this session |
|---|---|
| Existing HTML/CSS/artwork, scheduling challenge, seven simulation presentations, team/about content | Preserved team-authored baseline; surgically extended by Codex |
| `src/engines/*`, FAIR Worker and LEC, UI enhancement modules, Vitest files, Vite config | Generated and refined by Codex from the supplied PDFs and master requests |
| Mathematical verification expected values | Codex-authored using analytical identities and deterministic seeds; requires normal team review before academic submission |
| Documentation files | Codex-authored from observed repository state and actual command evidence |
| Human-authored/hand-verified routines | Not identified from available history; team input required |

No commit, push, merge, deployment, or Git history rewrite was performed.

