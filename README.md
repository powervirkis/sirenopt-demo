# PlasmaSmart™ batch results prototype

Operational demo for SirenOpt PlasmaSmart batch decisions.

## Roles

- **Maya** — every sample must be **Accepted** or **Sent for rework** before the line moves on. Uncertain results can be **Sent to engineer** (unresolved).
- **Derek** — select any sample and inspect ranges, repeatability, and reference coverage. Escalated samples are marked pending.

Navigation is Maya / Derek only. There is no 20-minute / 2-minute switch in the product UI.

## Run

```bash
npm install
npm run dev
npm test
```

Decisions are session-only (clear on reload). Large text and High contrast store in `localStorage` (`plasmasmart-display`).

## Suggestions vs decisions

Suggestions come from illustrative uncertainty ranges vs inclusive specs:

1. Any trustworthy interval entirely outside → **Send for rework suggested**
2. Else all three entirely inside → **Accept suggested**
3. Else → **Send to engineer suggested**

Maya’s property icons (✓ / Near limit / High / Low) follow the point estimate plus interval; they are separate from the sample suggestion. Suggestions never auto-record a decision. Every fresh sample starts **Awaiting decision**.

## Presenter notes (not in Maya’s operational UI)

See `PRESENTER_NOTES` in [`src/data.js`](src/data.js):

- Uncertainty ranges and lab scatters are **illustrative**.
- Proposed interval rules to validate with quality; #203 boundary overlap → engineer; #205 mass 14.48–14.65.
- Escalation is in-app only (one record per sample). Awaiting engineer is not final disposition.

## Stack

Vite · React 19 · Tailwind CSS 4 · Vitest
