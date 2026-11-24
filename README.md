# PlasmaSmart™ batch results prototype

Operational demo for SirenOpt PlasmaSmart batch decisions with a shared escalation workflow.

## Roles

- **Maya** — routine Accept / Send for rework; escalate with a confirmed reason.
- **Derek** — owns escalated cases; Accept / Rework / Request verification; record returned evidence.

Top navigation is Maya / Derek. Inside Maya, a **20 min / 2 min** toggle changes how much she sees:

- **20 min** — batch-at-a-glance table (pass / fail / second look), then per-sample cards with specs and Accept / Rework / Send to engineer.
- **2 min** — triage: bulk **Accept N suggested passes**, then fail and second-look rows one at a time. No measurement rows. Escalation still requires a confirmed reason. Accept against a rework suggestion requires an override reason.

Uncertainty ranges, repeat scans, and lab-coupon charts stay in Derek's view.

## Ownership assumption (validate with SirenOpt)

Maya owns routine decisions. After she confirms an escalation, Derek owns resolution and may record the final disposition. Maya can see status but cannot finalize Derek-owned cases. Returning a case to Maya would require an explicit ownership transfer (not implemented). Reopen is limited to the disposition author.

## Run

```bash
npm install
npm run dev
npm test
```

Session state clears on reload. Large text and High contrast store in `localStorage` (`plasmasmart-display`).

## Workflow states

Pending: Awaiting decision · Awaiting engineer · Awaiting verification  
Completed: Accepted · Sent for rework

Escalation stores a snapshot of what Maya saw, with **System finding** and **Maya's reason** as separate fields. Verification: request → awaiting verification → record evidence → awaiting engineer → explicit Accept/Rework.

## Presenter notes

See `PRESENTER_NOTES` in [`src/data.js`](src/data.js): illustrative uncertainty, interval rules, ownership assumption, and #203/#205 boundary cases. #203 mass loading 15.46–15.70 straddles the limit (engineer / "too close to call"); #204 and #205 have ranges entirely outside (rework). Reference scatters do not invent a laboratory result for the current sample.

## Stack

Vite · React 19 · Tailwind CSS 4 · Vitest
