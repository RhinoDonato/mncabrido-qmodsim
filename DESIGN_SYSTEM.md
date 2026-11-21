# Existing MNCabrido Design System

This document records the existing system; it does not introduce a replacement theme.

## Visual identity

- Primary character: civic/repair-shop blue on white and pale-blue editorial surfaces.
- Typography: Nunito for interface/body text and Plus Jakarta Sans for established display accents.
- Surfaces: flat cards, crisp 1px borders, moderate rounded corners, restrained shadows.
- Existing logo, student character artwork, SVG illustrations, cards, navigation, and hover behavior remain authoritative.

## Tokens

The source of truth is the CSS custom-property set in `styles.css`, including `--blue`, `--blue-3`, `--ink`, `--muted`, `--line`, `--card`, `--surface`, and `--shadow`. New components consume these tokens rather than embedding a second theme.

## Layout and components

- Top navigation remains shared across all five pages.
- Content uses the existing centered page widths and responsive breakpoints.
- Cards use the established border, radius, background, and shadow patterns.
- Scenario controls, Canvas panels, CODEX accordions, and the validation drawer reuse existing buttons, kickers, type scale, and colors.

## Light and dark themes

- `body.dark` remains the theme state.
- The toggle persists `qmod-theme` in local storage.
- Canvas colors are read from active CSS tokens every redraw.
- No customer or simulation data is persisted with the theme.

## Accessibility rules

- Maintain visible focus indicators and native button/summary semantics.
- Interactive targets are at least 44×44 CSS pixels where practical.
- Do not rely on color alone: charts include labels, metrics, descriptions, or a table.
- Drawer focus stays inside while open; Escape closes it and focus returns to its trigger.
- Canvas animation pauses offscreen and is disabled for `prefers-reduced-motion: reduce`.
- Responsive layouts must avoid horizontal page scroll; the transition matrix has a contained scroll region.

## Chart styling

- Existing SVG charts are retained.
- Canvas alternatives use the established blue, surface, text, and line tokens.
- Exact quantitative results remain in metric cards; the Markov Canvas also has a full transition table.
- Live animation conveys lifecycle state only; static models redraw on parameter/theme/size changes.

