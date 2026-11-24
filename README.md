# PlasmaSmart™ batch results prototype

Operational demo for SirenOpt PlasmaSmart batch decisions.

## Roles

- **Maya** — every sample must be **Accepted** or **Sent for rework** before the line moves on.
- **Derek** — select any sample and inspect ranges, repeatability, and reference coverage.

Navigation is Maya / Derek only. There is no 20-minute / 2-minute switch in the product UI.

## Run

```bash
npm install
npm run dev
npm test
```

Decisions are session-only (clear on reload). Large text and High contrast store in `localStorage` (`plasmasmart-display`).

## Suggestions vs decisions

Suggestions (✓ Accept suggested · ! Boundary uncertain · ↻ Rework suggested) come from illustrative uncertainty ranges vs inclusive specs. They never auto-record a decision. Maya always has the same two actions on every sample.

## Presenter notes (not in the operational UI)

See `PRESENTER_NOTES` in [`src/data.js`](src/data.js):

- Uncertainty ranges and lab scatters are **illustrative**.
- Interval rule and #205 mass precision (14.48–14.65 crosses 14.5).
- Take-home comparison of fuller vs compact Maya layouts belongs in the **presentation**, not a time-mode toggle in the app.

## Stack

Vite · React 19 · Tailwind CSS 4 · Vitest
