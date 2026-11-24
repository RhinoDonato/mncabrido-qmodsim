# Security and Skill Audit Results

Audit date: 2026-11-24 (Asia/Manila)
Scope: repository source, browser input/output paths, package manifests, deployment workflow, existing audit documentation, and skills recorded in `AI_USAGE.md`.

## Executive result

**PASS within the scope of this static educational artifact.** No high- or critical-severity vulnerability, exposed credential, dynamic-code execution, or path from free-form user input to an HTML injection sink was found. Full and production-only npm advisory checks completed with zero known vulnerabilities.

No application source fix was necessary during this audit. This report replaces the older summary with current, reproducible evidence. Previously implemented controls were verified in current source; they are not presented as changes made by this audit.

## Checks performed and evidence

| Check | Method / command | Result |
|---|---|---|
| HTML/DOM injection sinks | `rg` scan for `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, `textContent`, and input sources; manual data-flow review | **PASS.** Reviewed `innerHTML` values originate from fixed metadata, allowlisted identifiers, static markup, or validated/calculated numbers. Free-form request fields render with `textContent`. No dynamic-code or document-write use was found. |
| Query-string input | Manual review of `model` and `service` handling in `app.js` | **PASS.** `model` must match the fixed model list; `service` must match an existing select option. Neither is inserted as untrusted HTML. |
| Form input | Manual trace of `FormData` values in the request preview | **PASS.** Values form a local draft assigned through `textContent`. The form sends no network request and persists no customer data. |
| Numeric simulation input | Manual review of range conversion and engine validators | **PASS.** UI ranges use `Number`; engines enforce finite values, probabilities, integer dimensions, and valid PERT ordering. |
| Secrets/private keys | `rg -n -i "(api[_-]?key|secret|password|passwd|access[_-]?token|private[_-]?key|BEGIN (RSA|EC|OPENSSH|PRIVATE)|ghp_|github_pat_|AIza|sk-[A-Za-z0-9])" --glob "!package-lock.json" --glob "!dist/**" .` plus match review | **PASS.** Matches were explanatory prose only. No credential, token, private key, or environment file was found. |
| Browser storage | Review of `localStorage` calls | **PASS.** Only `qmod-theme` is stored. |
| Worker messages | Review of `src/workers/fair.worker.js` and caller | **PASS within scope.** Messages contain local numeric parameters/results; run IDs reject stale results. No cross-origin message listener exists. |
| External links/resources | HTML and generated-markup review | **PASS with informational exposure.** New-tab legal links use `rel="noopener noreferrer"`. Google Fonts remains a third-party runtime dependency. |
| Dependencies | `npm.cmd audit --json`; `npm.cmd audit --omit=dev --json` | **PASS.** Both exited 0 with 0 info, low, moderate, high, or critical vulnerabilities (76 total dependencies; 1 production dependency). |
| Production compilation | `npm.cmd run build` | **PASS.** Vite 8.3.8 transformed 20 modules and built successfully. |
| Existing security configuration | Review of `package.json`, `.github/workflows/deploy-pages.yml`, and repository configs | **PARTIAL.** The manual Pages workflow runs `npm ci`, tests, and build with scoped permissions. No dedicated SAST, secret-scanning, dependency-review, CSP, or security-audit configuration is committed. GitHub-hosted settings could not be inspected locally. |

### Execution note

Initial npm commands invoked `npm.ps1` and were blocked by the host PowerShell execution policy before npm ran. They are not project failures. Commands were repeated through `npm.cmd`. The first sandboxed full audit could not reach npm; its approved-network rerun exited 0. Only successful reruns support the results above.

## Findings and dispositions

| Severity | Finding | Evidence | Fix / status |
|---|---|---|---|
| None | No exploitable DOM-XSS path found | Free-form values terminate at `textContent`; query values are allowlisted; template values are controlled metadata or numbers | **Verified pass.** Preserve these boundaries. |
| None | No exposed secrets found | Pattern scan and review produced prose-only matches | **Verified pass.** |
| None | No known npm advisory found | Both audit variants exited 0 with an empty vulnerability map | **Verified pass as of audit date.** Point-in-time evidence only. |
| Informational | Controlled HTML sinks exist | `app.js` and `src/ui/lab-enhancements.js` use `innerHTML` for UI, SVG, tables, and fixed states | **Accepted.** Re-review if values later come from users or an API. |
| Low | No Content Security Policy is declared | No CSP meta element or server policy is present | **Not fixed.** Add a tested response-header CSP when hosting configuration is controlled. |
| Low | Workflow actions use major tags | Official actions use `@v4`/`@v5` rather than immutable SHAs | **Accepted.** Pin commit SHAs if institutional policy requires it. |
| Informational | Google Fonts is a runtime third party | Page styles request Google-hosted fonts | **Accepted.** Self-host for a fully offline/stricter privacy posture. |
| Not applicable | Backend security controls | This is a static client-only artifact | **Could not be performed.** A production backend requires separate review. |

## AI skill supply-chain review

`AI_USAGE.md` documents two skills used during historical engineering work. This audit reviewed that recorded evidence and locally available instructions; it did not invent additional historical use.

| Documented skill | Evidence reviewed | Result |
|---|---|---|
| `ui-ux-pro-max` | `AI_USAGE.md` records complete `SKILL.md` inspection, local read-only search use, and checks for prompt override, excessive agency, secret requests, remote installers, destructive commands, hidden writes, and untrusted exfiltration | **Vetted in the project record; no adverse behavior recorded.** A complete OWASP Agentic Skills Top 10 control-by-control artifact is not present. |
| `testing-best-practices` | Current `SKILL.md` and applicable assertion, security, and review rules were read; Laravel-only directions were non-applicable to Vitest | **Vetted and applied only for framework-neutral principles.** No external PHPUnit fetch was needed. |

The evidence covers the guide's recorded themes of instruction injection, excessive agency, unsafe shell execution, secret leakage, untrusted remote dependencies, and hidden/destructive writes. It is **not** an OWASP certification or complete independently scored Agentic Skills Top 10 assessment. No third-party skill was installed. The Cloudflare security-audit skill referenced in existing documentation is unavailable and was **not executed**.

## Checks that could not be performed

- Production penetration testing, HTTP-header validation, backend authorization/rate limiting, database security, and server logging: no deployed URL or backend was in scope.
- GitHub settings such as secret scanning, Dependabot, branch protection, and environment protection: not represented locally.
- Cloudflare security-audit skill execution: unavailable in the installed catalog.
- Formal OWASP Agentic Skills Top 10 certification: only a scoped manual vetting log exists.

## Final status

| Category | Status |
|---|---|
| Source XSS / unsafe HTML review | **PASS within reviewed data flows** |
| Secrets scan | **PASS** |
| Input handling | **PASS for the client-only artifact** |
| npm dependency audits | **PASS — 0 known vulnerabilities** |
| Security automation/configuration | **PARTIAL** |
| AI skill vetting evidence | **PARTIAL / scoped manual evidence** |
| Backend/deployed-environment controls | **NOT PERFORMED / not present** |

