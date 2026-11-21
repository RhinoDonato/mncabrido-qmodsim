# Security Audit

Date: 2026-11-21 (Asia/Manila)

## Scope and commands

- Repository source scan with `rg` for credential/private-key patterns, dynamic code (`eval`, `new Function`), document writes, and HTML injection sinks.
- Dependency checks: `npm audit --omit=dev` and install audit.
- Manual review of query parameters, form rendering, local storage, token randomness, worker messages, scenario data, and external links.
- Manual pre-use inspection of the two activated skills, recorded in `AI_USAGE.md`.

## Findings

| Severity | Finding | Resolution/status |
|---|---|---|
| Corrected | Security demo previously described randomness but did not generate a secure token | `secureTrackingToken()` now uses Web Crypto with rejection sampling and refuses an insecure fallback. |
| Corrected | FAIR work ran in main-thread batches and used unseeded local helpers | Pure seeded engine plus module worker added; run IDs prevent stale result replacement; documented fallback remains available. |
| Informational | `innerHTML` is used in existing simulation/template rendering | Reviewed values are static model metadata, allowlisted model IDs, or calculated numbers. Free-form request fields render through `textContent`; no untrusted HTML path found. |
| Informational | `model` query parameter selects Lab content | It is accepted only when it matches the fixed `models` allowlist. |
| Informational | Theme preference uses local storage | Only `qmod-theme` is stored; no personal or simulation data is persisted. |
| Informational | Google Fonts are third-party runtime resources | Existing dependency retained for visual preservation. The app remains usable with fallback fonts if blocked. |
| Informational | Offline intake is modeled but not implemented | UI and CODEX explicitly label it theoretical; no customer data is cached. |
| Informational | Enumeration scenario discusses attack rates | It performs local arithmetic against mock identifiers only; no network target or real record exists. |

## Dependency result

`npm audit --omit=dev`: **0 vulnerabilities**. This is a point-in-time package audit, not a future guarantee.

## Remaining limitations

- No backend exists, so production authorization, authentication, audit logging, breach response, and server-side rate limiting cannot be tested here.
- No Cloudflare security-audit skill was available or executed; do not claim that specific checklist passed.
- A formal legal review and a production penetration test remain outside this educational static artifact.

