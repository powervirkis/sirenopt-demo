# PlasmaSmart™ batch results prototype

Clickable SirenOpt PlasmaSmart batch-results demo for Maya (technician) and Derek (engineer).

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

```bash
npm test    # decision and workflow unit tests
npm run build
```

## Reset demo

Use **Reset demo** in the header, or reload the page. Recorded actions (Accepted / Held / Review requested) are **session-only** and are not persisted to a backend.

Display preferences (Large text, High contrast) are stored in `localStorage` under `plasmasmart-display`.

## Decision rule (stated in the UI)

Illustrative uncertainty ranges vs inclusive specs:

- **PASS** — all three ranges entirely within specification
- **NEEDS REVIEW** — a range overlaps a limit, or evidence is missing
- **FAIL** — a valid range is entirely outside (beats NEEDS REVIEW)

Disposition is separate and never rewrites the result: Awaiting decision / Accepted / Held / Review requested.

## Assumptions

- Repeat-tick intervals in `src/data.js` (`REPEAT_TICKS`) are **existing illustrative demo inputs**, not newly fabricated endpoints for this pass. Point estimates and specs are from the exercise.
- Lab-coupon scatter and coupon counts are illustrative diagnostics for the engineer view.
- Accepting passing samples does **not** authorize batch release while any sample is FAIL or NEEDS REVIEW (labeled in the UI).

## Stack

Vite · React 19 · Tailwind CSS 4 · Vitest
