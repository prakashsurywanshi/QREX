# Yearly Budget & Pricing Plan — QREX (SaaS + PaaS), Mumbai Launch

**Project:** QREX — Qodeigence Real Estate Experience
**Company:** Qodeigence Inc.
**Market:** Mumbai Metropolitan Region (MMR), India
**Currency:** INR (₹). All figures are **indicative**, ex-GST unless noted, and carry source labels for market data.
**Model:** Two-layer commercial model — **SaaS** (software subscription) **+ PaaS** (platform as a service — managed/enterprise platform layer).

---

## 1. Context & Objectives

QREX is launching in Mumbai, India's largest residential market. Objectives for year 1:

| Objective | Target |
| --- | --- |
| Paying SaaS customers by month 12 | 25–40 agencies |
| Paying PaaS subscribers by month 12 | 8–15 agencies |
| Recurring revenue run-rate (month 12) | ₹4–10 L MRR |
| Time to break-even (monthly) | Months 9–15 |
| Channel mix | Direct sales + channel-partner associations + developer referrals |

**Why Mumbai first:**
- **5,477 real-estate agencies** in Mumbai (Apr 2026); 96.7% are single-owner operations, ~181 are larger multi-branch brands (Rentech Digital).
- The MMR hosts **45,000–60,000 active channel partners (CPs)**, of which **12,000–18,000 are institutional/semi-organised businesses**; CPs drive **50–60% of MMR residential transactions** (CREDAI-MCHI; Ghar.TV).
- MMR accounts for **≈ ₹2.5 lakh crore of annual residential sales, roughly 40% of India's total** (CREDAI-MCHI).
- Organised brokerage firms in MMR are growing **18–25% annually** vs. 10–15% for the wider CP ecosystem (CREDAI-MCHI; Ghar.TV) — an accessible, professionalising buyer base for a CRM + website + operations platform.

---

## 2. Market & Competitive Pricing Research

### 2.1 India real-estate CRM price benchmarks (per user / per month)

| Platform | Entry price | Typical plan | Source |
| --- | --- | --- | --- |
| ClosingFox (India) | ₹499/u | ₹699/u (Growth), ₹1,499/u (Developer/Mandate) | ClosingFox pricing, Apr 2026 |
| TeleCRM (India) | ₹799/u (annual) | ₹1,049/u (quarterly) | TeleCRM pricing, Apr 2026 |
| Realatic (India) | ₹0 (3 users) | ₹499/u (Pro) | Realatic pricing |
| Zoho CRM | ₹800/u | ₹1,400/u (Professional) | Zoho pricing, 2026 |
| Kylas | ₹1,999 flat (unlimited users) | flat | Kylas pricing |
| Salesforce | ₹2,075/u | ₹5,500+/u | Salesforce pricing |
| Follow Up Boss (US) | $69/u | $499/mo (10 users), $1,000/mo (30 users) | FUB pricing, 2026 |
| BoomTown (US) | quote | ~$1,000–3,000+/mo | Third-party estimates |

**Takeaways for pricing design:**
- The Indian mid-market clears **₹500–1,500 per user/month**; **₹1,999 flat** (Kylas) is the disruptive low-anchor for small teams.
- US platforms price per-seat ($69/seat) or flat bundles with seats included ($499/10); effective per-seat cost drops with team size — a useful pattern to copy.
- **No India-native player sells an integrated public website + CRM + site-visit/booking/payment operations + platform management as one product.** QREX can price per-agency (not just per-seat), justified by the consolidated value.

### 2.2 India SaaS operating-cost benchmarks (2026)

| Item | Typical range/month | Source |
| --- | --- | --- |
| Hosting (early-stage VPS, 4 vCPU/8 GB) | ₹5,000–8,000 | ZenoCloud; ZoopCoder |
| Infra at seed stage (50–500 users) | ₹15,000–30,000 | ZenoCloud |
| Transactional email / SMS | ₹500–3,000 | ZoopCoder / Jaison Christopher |
| Payment gateway | ~1.9–2% per transaction | Razorpay (via Nevatrix/ZoopCoder) |
| Maintenance & updates | ₹3,000–15,000 | ZoopCoder |
| Google Ads CPC (SaaS keywords, India) | ₹50–500/click | Codingclave, 2026 |
| B2B SaaS sales cycle | 4–8 months (plan ≥18-month runway) | Codingclave, 2026 |
| Months to SaaS break-even (custom build) | 9–18 months | Codingclave, 2026 |

---

## 3. Pricing — SaaS (Layer A)

Flat per-agency plans with included seats. Extra seats are billed as incremental per-user passes.

| Plan | ₹/mo (monthly billing) | ₹/mo (annual billing, 2 months free) | Seats included | Extra seat pass ₹/mo | Best for |
| --- | --- | --- | --- | --- | --- |
| **Starter** | ₹4,999 | ₹4,166 | 3 | ₹800 | Single-owner / small broker offices (96.7% of Mumbai agencies) |
| **Growth** | ₹9,999 | ₹8,333 | 10 | ₹600 | 5–15 agent teams, channel-partner firms |
| **Enterprise** | Custom | Custom | 25+ | Quote | Developer sales teams, multi-branch brands |

**What every plan includes:** public website (branded), property listings & enquiries→lead capture, leads + pipeline, tasks/notifications + follow-up automation, properties & customers, CMS & settings basics, reports (CSV on Starter; +PDF on Growth), SMTP/test-mail (super-admin).

**Feature gating by layer split:**
- Starter: site visits only if added; no PDF export, no bookings/payments gate (available on Growth).
- Growth: full operations (site visits, bookings, payments), marketing campaigns, media center, PDF export.
- Enterprise: everything + API access eligible, on-prem eligible via PaaS.

**One-time onboarding fee:**
- Starter ₹25,000 · Growth ₹50,000 · Enterprise custom (scope-based).
- Includes setup, branding, data migration (CSV import), agent training, import template.

**Annual billing incentive:** 2 months free (standard 2026 India pattern). Quarterly invoicing accepted at ₹/mo monthly rate (no discount).

---

## 4. Pricing — PaaS (Layer B) "Platform as a Service"

Stackable, per-instance add-ons that turn QREX from software into a managed platform. Any SaaS plan can carry one PaaS tier. Price bands are indicative; small-platform agencies rarely need B2.

| PaaS tier | ₹/mo | Included | Target |
| --- | --- | --- | --- |
| **B1 · Core Ops** | ₹2,500 | Managed hosting (application server + database + backups), uptime monitoring + alerts, security patching & updates, scheduled automation ops (`php artisan leads:check-followups` cron), storage for uploads, 1×/mo maintenance window | Any SaaS customer who wants "it just runs" |
| **B2 · Pro / Managed** | ₹9,999 | Everything in B1, **plus**: REST API access & integration support, custom integrations (WhatsApp, portals, Excel/CSV automation), data-migration retainers, SMTP/deliverability management, priority support, dedicated solutions engineer (named contact) | Growth + Enterprise agencies, channel-partner firms scaling |
| **B3 · Private / On-prem** | Custom (est. ₹25,000–60,000/mo) | Dedicated/private-cloud or on-premise deployment, white-label branding, custom development days, compliance support (DPDP/India data residency), custom SLA + business-hours support, monthly platform reporting | Developers, multi-branch corporates, data-residency-sensitive firms |

**Bundling guidance:** Starter + B1 is the natural "get us running" offer (≈ ₹7.5K/mo all-in for a small office). Growth + B2 is the midline managed-platform offer (≈ ₹20K/mo all-in for ~10 seats). Enterprise/B3 is quote-driven.

**Why PaaS matters in this market:** 96.7% of Mumbai's agencies are single-owner shops with no IT staff; raw SaaS self-serve would stall on hosting/SMTP/backups. Packaging managed platform services captures that revenue and differentiates vs ₹499/seat commodity CRMs.

---

## 5. Revenue Model

### 5.1 Assumptions (year 1, base scenario)

| Parameter | Base | Notes |
| --- | --- | --- |
| Sales cycle (decision → paid) | 2–3 months | Faster than generic B2B (4–8 mo) for the Starter micro-segment; Growth takes 3–5 mo |
| Churn (monthly) | 2.5% (Starter), 1.5% (Growth+), 1.0% (PaaS) | SaaS norms for SMB |
| Seat mix | Starter avg 3 seats · Growth avg 12 seats | Growth earns ₹10K base + 2 extra seats |
| PaaS attach | 30% of customers take B1, 15% B2, 5% B3 | Higher for Growth/Enterprise |
| Onboarding fee capture | 80% of new Starter, 100% of Growth | One-time revenue stream |

### 5.2 Quarterly ramp (base scenario, indicative)

| Quarter | New SaaS customers (cum.) | SaaS MRR (₹) | PaaS MRR (₹) | One-time revenue (₹) | Total revenue Y1 (₹) |
| --- | --- | --- | --- | --- | --- |
| Q1 | 5 | 24,995 | 7,500 | 1,36,000 | 2,38,000 |
| Q2 | 12 | 60,000 | 20,000 | 93,000 | 4,70,000 |
| Q3 | 21 | 1,10,000 | 40,000 | 1,11,000 | 9,20,000 |
| Q4 | 32 | 1,70,000 | 62,000 | 1,30,000 | 16,70,000 |

*Q1 revenue includes partial start; Y1 total ≈ ₹16–17 L under the base scenario. Optimistic scenario ≈ ₹25–30 L; conservative ≈ ₹10–12 L.*

### 5.3 Month-12 run-rate (base)

- **SaaS MRR ≈ ₹1.7 L** (32 customers: ~17 Starter + 12 Growth + 3 Enterprise-equivalent)
- **PaaS MRR ≈ ₹62 K** (out of the above: ~11 B1 + 4 B2 + 1 B3)
- **Total MRR ≈ ₹2.3 L** → annualized ≈ ₹28 L (before churn discount it to ~₹24–26 L)
- vs. the 2026 India benchmark of "₹1–3 L MRR with 10–25 paying customers by day 90–180" (Codingclave), this is a healthy but ambitious trajectory for an enterprise-informed product.

---

## 6. Year-1 Budget — Mumbai Launch

### 6.1 One-time setup costs (pre-launch)

| Item | ₹ (range) |
| --- | --- |
| Company incorporation (Pvt Ltd) + PAN/TAN/DSC + GST + MSME + DPIIT Startup registration | 20,000 – 45,000 |
| Legal docs (ToS, Privacy, DPA, customer contract) + DPDP Act compliance basics | 30,000 – 80,000 |
| Branding (logo, design system, landing page), domain + SSL | 40,000 – 1,00,000 |
| Infrastructure setup & hardening (server, backups, monitoring, CI) | 15,000 – 35,000 |
| **Subtotal (one-time)** | **₹1,05,000 – 2,60,000** |

### 6.2 Monthly operating opex (post-launch)

| Line | ₹/month (range) | Notes |
| --- | --- | --- |
| **Payroll (70–80% of burn)** | 2,50,000 – 4,50,000 | Founder/tech lead (~₹1.2–1.8L), 1–2 full-stack devs (₹60K–1.2L each), 1 sales/BDE (₹40–70K incl. variable). Mumbai salaries run ~40% above tier-2 cities |
| Cloud infrastructure | 5,000 – 12,000 | Single VPS → ₹15–30K as users scale (ZenoCloud stages) |
| Tools: Sentry, analytics, email (transactional), SMS, SMTP, backups | 5,000 – 12,000 | Per-seat stack + email/SMS (ZoopCoder) |
| Domain/SSL amortized | 400 – 1,500 | |
| Marketing & sales | 50,000 – 1,50,000 | Google/LinkedIn (₹50–500 CPC), content/SEO, CREDAI-MCHI & CP-association expos, referral program |
| Office / misc / banking | 10,000 – 30,000 | Coworking, travel for demos |
| **Fixed/month before buffer** | **3,20,000 – 6,55,000** | |
| Contingency buffer (10–15%) | 32,000 – 98,000 | |
| **Total monthly burn** | **₹3,50,000 – 7,50,000** | |

### 6.3 Full-year cash requirement

| Scenario | Assumptions | Year-1 cash (₹) |
| --- | --- | --- |
| Lean | Founder-led sales, 1 dev, minimal ads (₹50K/mo marketing) | ~₹42–45 L |
| Base | 2 devs + 1 BDE, ₹1L/mo marketing | ~₹65–75 L |
| Ambitious | Full team, ₹1.5L/mo marketing, stronger infrastructure | ~₹85–95 L |

> **Planning rule (2026):** B2B SaaS sales cycles are 4–8 months; carry **≥18 months of runway**, not 12. If raising/investing, the recommendation is ₹1.2–1.5 Cr to burn ≥18 months comfortably in the base scenario.

---

## 7. Unit Economics & Break-Even

### 7.1 Unit economics by channel

| Channel | CAC (₹) | Payback (months) | LTV (₹, 3-yr) |
| --- | --- | --- | --- |
| Direct sales (BDE-led, demos at expos) | 15,000 – 30,000 | 3 – 6 | 1,50,000 – 2,50,000 |
| Google/LinkedIn paid | 8,000 – 20,000 | 2 – 4 | 1,20,000 – 2,00,000 |
| Referral / CP-association & developer partnerships | 0 – 5,000 | < 1 | same |

*LTV assumes Growth-tier avg ₹12K/month gross, ~60% gross margin after hosting/support → ~₹7K net, 70% retention over 3 years.*

### 7.2 Break-even

- **Fixed monthly opex (lean/base):** ₹3.5L (lean) to ₹5.5L (base).
- **Blended gross margin per customer:** Starter ≈ ₹4.5K/mo, Growth ≈ ₹8.5K/mo, PaaS B1 ≈ ₹2.2K/mo, B2 ≈ ₹8.5K/mo net of admin.
- **Break-even customer base:** ≈ 35–45 paying accounts at an average ₹7–9K net/month, or ≈ **₹3.5–5.5 L MRR**.
- **Expected month of break-even:** base scenario ≈ **months 11–15** (matches the 9–18-month India benchmark).

### 7.3 Cumulative month-12 view (base)

| | ₹ |
| --- | --- |
| Year-1 expenses (lean but realistic, ~₹55–65 L) | 60,00,000 |
| Year-1 revenue (base, §5) | 16,00,000 |
| **Year-1 net cash position** | **≈ −₹44 L** |
| Monthly run-rate at month 12 (MRR) | ₹2.3 L |
| Projected break-even (if growth holds) | Month ~12–15 |

---

## 8. Billing, GST & Payment Operations

- **GST 18%** added to all SaaS/PaaS/onboarding invoices (standard software-service rate). Input credit claimed on infra/tools.
- **Billing:** annual (2-months-free) preferred; quarterly at monthly rate; monthly at monthly rate + no discount. Razorpay (or Stripe) at **~1.9–2% + GST** per transaction (Razorpay via Nevatrix/ZoopCoder benchmarks).
- **Automatic GST-compliant invoicing** per customer; recurring billing with dunning on failed cards.
- **Contract:** monthly/quarterly/annual; no long-term lock-in — **full CSV data export guarantee** (matches product's built-in CSV export capability).
- **Refund:** 14-day money-back on first paid month (Starter/Growth); on-prem POCs priced separately.

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| B2B sales cycle longer than modeled (4–8 mo) | Cash gap | ≥18-month runway; Starter self-serve to shorten cycle; freemium 14-day trial |
| Adoption stalls at agency (industry #1 failure) | Churn | Minimal-field lead intake, auto-created tasks/leads, included training, quarterly adoption reviews |
| ₹499–1,499/seat commodity pricing pressure | Margin squeeze | Position per-agency value (website+CRM+ops+PaaS); emphasize ROI (§12 of proposal); avoid a price war on per-seat alone |
| Concentration on single-owner micro-agencies (96.7%) | Low ARPU | Growth-tier focus via 12–18K institutional CP firms; developer/B3 pathway for large brands |
| Infra/SMTP/backup failures | Trust damage | PaaS-managed ops, monitoring, backups with defined RPO/RTO in SLA |
| DPDP compliance (India) | Legal | Compliance in one-time budget line; consent + data-residency flow in B3 |

---

## 10. Summary Recommendation

1. **Launch three SaaS plans** (Starter ₹4,999 · Growth ₹9,999 · Enterprise custom) with **annual 2-months-free** and **extra-seat passes**.
2. **Sell PaaS as the differentiator** — B1 core ops (₹2,500/mo) bundled into most deals, B2 managed (₹9,999/mo) for channel-partner firms, B3 private/on-prem (custom) for developers/corporates.
3. **Fund ≈ ₹1.2–1.5 Cr runway** (≥18 months) OR keep burn lean (~₹45 L/yr) with founder-led sales and a ₹50K/mo marketing budget.
4. **Target the 12,000–18,000 institutional channel partners + ~181 multi-branch Mumbai brands** as anchor customers; single-owner agencies via referral + self-serve.
5. **Measure break-even at ≈ ₹3.5–5.5 L MRR** (months 11–15 base case).

---

## Appendix A — Source Notes

| Figure | Source |
| --- | --- |
| 5,477 Mumbai agencies; 96.7% single-owner; ~181 larger brands | Rentech Digital business directory (Apr 2026) |
| 45–60K active MMR channel partners; 12–18K institutional; 50–60% of transactions; 18–25% organised-brokerage growth; ₹2.5L Cr MMR residential (~40% of India) | CREDAI-MCHI (2026); Ghar.TV India Broker Report (2026); GeoSquare (2026) |
| India CRM prices (ClosingFox, TeleCRM, Realatic, Zoho, Kylas, Salesforce) | Vendor pricing pages / ClosingFox India comparison (Apr 2026) |
| US CRMs (Follow Up Boss, BoomTown, Sierra, Real Geeks) | Vendor pricing & third-party reports (2026) |
| Hosting/infra stage costs | ZenoCloud SaaS infrastructure guide (2026); ZoopCoder SaaS cost guide (2026) |
| Email/SMS, gateway ~2%, maintenance | ZoopCoder (2026); Nevatrix (2026) |
| CPC ₹50–500; 4–8 mo sales cycle; ≥18-mo runway; ₹1–3L MRR / 10–25 customers day-90 benchmark; 9–18 mo break-even | Codingclave India SaaS guide (2026) |
| Payroll 70–80% of burn; fully-loaded multiplier; cost-of-run categories | RunFutureProof startup budget template (2026); Awasero (2026) |

*All pricing and budget figures are indicative planning numbers for discussion, not contractual offers. Market figures carry their public sources; full titles available on request.*