# World-Top-Notch Gap Plan (One-Go Execution)

## Objective
Move QREX/QREX_Flutter from hardened baseline to production-evidence-ready, top-notch SaaS/CRM/ERP.

## Execution status (this pass)
- [x] WhatsApp webhook signature check, idempotent message/status logging, config-based secrets
- [x] WhatsApp listener fixes (enabled gate, template component format)
- [x] FCM service config guard + status return; device token throttles already present
- [x] Audit trait safer old/new capture and redaction of password/remember_token
- [x] Commission object checks for non-admin agent access
- [x] Report export endpoints paginated/filtered
- [x] Tenant audit command + test
- [ ] Full RBAC/object policy matrix for all sensitive controllers/endpoints
- [ ] Full tenant-scope audit for exports/files/jobs/cache/downloads
- [ ] P1 inventory holds/TTL/stacking/repricing audit
- [ ] P1 finance lifecycle (demands/ageing/penalties/refund/cancel/transfer approvals)
- [ ] CP/buyer portal 2.0 + comms inbox abstraction
- [ ] Flutter FCM v1 contract, deep links, signed Android release evidence

## External blockers (cannot be verified locally)
- Rotate exposed GitHub tokens
- Live Sentry DSN event/alert verification
- Connected-env composer audit triage/remediation
- Staging browser/E2E smoke and production-like tenant rehearsal
- Firebase/FCM device E2E, Play signing/store assets, Meta WhatsApp app secrets/webhook verification
