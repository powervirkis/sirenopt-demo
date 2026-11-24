# PlasmaSmart™ batch results prototype

Operational demo for SirenOpt PlasmaSmart batch decisions with a shared escalation workflow.

## Roles

- **Maya** — routine Accept / Send for rework; escalate with a confirmed reason.
- **Derek** — owns escalated cases; Accept / Rework / Request verification; record returned evidence.

Navigation is Maya / Derek only. There is no 20-minute / 2-minute switch in the product UI (present that comparison offline).

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

See `PRESENTER_NOTES` in [`src/data.js`](src/data.js): illustrative uncertainty, interval rules, ownership assumption, and #203/#205 boundary cases.

## Stack

Vite · React 19 · Tailwind CSS 4 · Vitest
