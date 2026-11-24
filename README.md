# PlasmaSmart™ batch results prototype

Clickable interactive prototype of SirenOpt’s PlasmaSmart batch results screen for the take-home exercise. Built for two users:

- **Maya** (Quality Lab Technician) — accept or escalate a batch fast (20-minute and 2-minute modes)
- **Derek** (Process/Quality Engineer) — see physical sources of uncertainty, not a confidence percentage

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## What you can click

1. **20 min** — full batch matrix: three properties per sample with spec bars and re-scan bands
2. **2 min** — same samples collapsed to one driving fact; use **What this view hides** for the design rationale
3. **Accept / Escalate / Hold** on each row; **Accept N passing** for the clear rows
4. Tap any sample → **detail** with two uncertainty views, then Derek’s dispositions
5. Escalate opens a sheet; send marks the row **Sent to Derek**

## Status rules (designed into the UI)

Production models only return point estimates. This prototype adds two physical uncertainty sources and classifies status from the **sensor repeat band** only:

| Property         | Spec window           | Sensor half-width |
| ---------------- | --------------------- | ----------------- |
| Mass loading     | 14.5–15.5 mg/cm²      | ±0.12             |
| Porosity         | 32–36%                | ±0.50 points      |
| Sheet resistance | 0.20–0.35 mΩ·cm²      | ±0.020            |

- Band fully inside spec → clear  
- Band crosses a limit → second look  
- Band fully outside → hold (fail)  
- Sample status = worst property  
- Calibration sparsity never recolors a row; it appears as Derek’s second chart (and a small “Thin lab data” mark on the 20-minute view)

Locked outcomes (header: **2 ready · 2 second look · 2 hold**):

| Sample | Values              | Status      | Why                                      |
| ------ | ------------------- | ----------- | ---------------------------------------- |
| #202   | 14.9 / 33.2 / 0.26  | Pass        | All bands inside                         |
| #206   | 15.2 / 34.8 / 0.30  | Pass        | All bands inside                         |
| #201   | 15.1 / 35.6 / 0.31  | Second look | Porosity band crosses 36%                |
| #203   | 15.6 / 34.0 / 0.29  | Second look | Mass band crosses 15.5                   |
| #204   | 15.0 / 36.4 / 0.24  | Hold        | Porosity band entirely above 36%         |
| #205   | 14.6 / 32.5 / 0.41  | Hold        | Sheet R band entirely above 0.35         |

Maya never opens Derek’s charts. **Send to Derek** packages sample id, points, bands, and specs only. Maya’s detail is labeled **Maya** (bars + one action).

## Uncertainty design (Derek)

1. **Would a re-scan change this?** — eight fixed plasma-pass ticks on a unit ruler. Physical cause: emission intensity drifting with gas flow and arc position. More passes narrow the spread; they do not add lab proof.
2. **Do we have lab proof in this range?** — predicted-vs-lab coupon scatter with a 1:1 line and this prediction as an open mark. Coupon counts (e.g. porosity: 51 / 5 / 3 by bin) show when the material sits outside dense reference data. A porosimetry / weigh-up / four-point check is a different experiment from another plasma scan.

No confidence percentage appears anywhere in the UI.

## Assumptions about mental models

- Maya dispositions from a **status word + one property phrase**. She will not open detail when she has two minutes, so escalate must work from the row.
- “Second look” means do not accept yet. The risk is that #201 looks like a pass because 35.6 is inside 36 — the band is what makes the risk visible.
- Derek treats a single percentage as unfinished work. He separates “scan it again” from “we are outside the lab coupons.”
- Spatial non-uniformity across the electrode and web-direction drift are plausible third/fourth sources this prototype leaves out.

## What to validate next with real users

1. Vocabulary: Pass / Second look / Hold vs plant terms (MRB, review, out-of-family)
2. Does Maya escalate #201 from the 2-minute phrase alone, without opening detail?
3. Is the coupon scatter readable on a shop-floor tablet?
4. Does Derek ask for a third uncertainty source (spatial / web drift) before he will trust a disposition?
5. Timing: can a technician clear a six-sample batch in under two minutes in 2-min mode?

## Stack

Vite · React 19 · Tailwind CSS 4
