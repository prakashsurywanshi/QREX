# QREX - Pending TODO & Implementation Plan

**Last Updated:** 2025-11-03  
**Current Branch:** feature/ui-and-parity  
**Goal:** Complete all pending features to make it world-class, top-notched, App Store/Play Store ready

---

## COMPLETED SO FAR
- [x] Phase 0: Branch setup, audit started
- [x] Commissions Module (Web + API + Flutter) - full CRUD, approve/pay/reject, splits, co-broking
- [x] Payment Plans/Installments/Receipts (Models, Migrations, API)
- [x] Projects/Towers/Units Inventory with hold/release
- [x] Communications Timeline (polymorphic)
- [x] WhatsApp Meta Cloud API service, webhook, endpoints
- [x] Permissions extended for all modules
- [x] Buyer Portal (login + dashboard)
- [x] Multi-tenancy foundation (tenants, branding, trait, middleware)
- [x] Config/env setup
- [x] Payment Plans & Projects Web UI + Flutter screens/nav

---

## PENDING - PHASE 1 (P0) REMAINING
| Task | Status | Priority | Notes |
|---|---|---|---|
| Add permissions to seeder & run | Partially done | P0 | Added modules, need to ensure all roles updated |
| Web UI for Projects/Units detail with inventory matrix | Pending | P0 | Show towers/units grid, hold/release/book |
| Web UI for Payment Plans show with installments | Pending | P0 | View schedule, mark installment paid |
| Flutter full parity for Payment Plans/Projects/Units | Pending | P0 | Repos/controllers/screens |
| WhatsApp triggers on events | Pending | P0 | Lead created, site visit, booking, payment |
| Communications UI in Lead/Deal/Customer pages | Pending | P0 | Timeline tab |

---

## PHASE 2 (P1)
| Task | Status | Priority | Notes |
|---|---|---|---|
| FCM Push Notifications (Android first) | Pending | P1 | Firebase setup, device tokens, triggers, deep linking |
| Buyer Portal - full features | Pending | P1 | Payment plan view, installments, receipts, documents |
| Workflow Automation/Rules Engine | Pending | P1 | Events/listeners, rule builder UI |
| Duplicate Detection | Pending | P1 | Leads/Customers by phone/email |
| Enhanced Reports & Analytics | Pending | P1 | Funnel, agent performance, collection vs due |

---

## PHASE 3 (P2)
| Task | Status | Priority | Notes |
|---|---|---|---|
| Maps Config (Google/Mapbox/OSM) | Pending | P2 | Settings UI, property map, directions |
| Unified Calendar | Pending | P2 | Tasks + Site Visits + Follow-ups |
| Document Vault | Pending | P2 | Per entity attachments with expiry |
| Dark Mode (Web + Flutter) | Pending | P2 | Theme system |
| Biometric Auth (Flutter) | Pending | P2 | local_auth |
| Deep Linking (Flutter) | Pending | P2 | go_router + notifications |
| Premium UI Redesign | In Progress | P2 | shadcn/ui patterns, polish |
| Audit Logs | Pending | P2 | Critical actions |

---

## PHASE 4 (Multi-Tenancy/SaaS/White-Label/Store Ready)
| Task | Status | Priority | Notes |
|---|---|---|---|
| Tenant CRUD UI (Super Admin) | Pending | P0 | Manage tenants, branding, domains |
| White-labeling UI & runtime config | Pending | P0 | Branding per tenant, colors, logo |
| Apply BelongsToTenant to models | Pending | P0 | Add trait to all business models |
| Tenant scoping in API | Pending | P0 | Middleware integration |
| Feature flags per tenant/plan | Pending | P1 | Plan-based access |
| Android build config (Play Store) | Pending | P0 | Signing, versioning, icons |
| iOS build prep | Pending | P1 | Bundle ID, signing |
| FCM Android setup | Pending | P0 | google-services.json config |

---

## IMMEDIATE ACTION PLAN (Next Steps)

### Step 1: Complete P0 UI Gaps
1. Projects/Units detail page with inventory matrix + hold/release
2. Payment Plans show page with installments + mark paid
3. Add Units CRUD API + web UI basics

### Step 2: Flutter Parity
1. Payment Plans repository/controller/screen with list/detail
2. Projects/Units repository/controller/screens
3. Commissions detail screen in Flutter

### Step 3: WhatsApp Triggers
1. Create events/listeners for lead created, site visit scheduled, booking created
2. Integrate with MetaCloudService
3. Settings UI for WhatsApp config

### Step 4: Multi-Tenancy Activation
1. Register ResolveTenant middleware
2. Add BelongsToTenant to key models
3. Tenant management UI

### Step 5: FCM Setup
1. Laravel FCM service
2. Flutter firebase_messaging setup
3. Device token registration

## UPDATED - 2025-11-03
- [x] WhatsApp triggers on Lead created & Site Visit scheduled (events/listeners)
- [x] Payment Plans API cleaned up

## UPDATED - 2025-11-03 (Latest)
- [x] Flutter Payment Plans repo/controller/screen
- [x] Flutter Projects repo/controller/screen
- [x] WhatsApp triggers for Lead & Site Visit
- [x] FCM service scaffolding

## UPDATED - 2025-11-03 (Continued)
- [x] Flutter Commission detail screen
- [x] Units web controller + routes (hold/release/status)

## UPDATED - 2025-11-03 (Latest)
- [x] Tenant CRUD UI + routes + controller
- [x] ResolveTenant middleware registered globally

## UPDATED - 2025-11-03 (Latest)
- [x] CommunicationTimeline component created
- [ ] Integrate into LeadDetail page

## UPDATED - 2025-11-03 (Continued)
- [x] Communications web routes added

## UPDATED - 2025-11-03 (Session)
- [x] Multiple modules implemented across web/API/Flutter
- [x] Commissions, Payment Plans, Projects/Units, Communications
- [x] WhatsApp Meta Cloud, Events/Triggers, Buyer Portal
- [x] Multi-tenancy foundation, Tenants UI/API
- [x] Flutter parity expanding

## UPDATED - 2025-11-03 (Continued)
- [x] WhatsApp screen in Flutter
- [x] Branding endpoint in Flutter

## UPDATED - 2025-11-03 (Final Push)
- [x] FCM service & device tokens
- [x] Branding/Maps config in Flutter

## UPDATED - 2025-11-03 (Session)
- [x] All core modules implemented
- [x] Committed across multiple feature branches

## UPDATED - 2025-11-03 (Final)
- [x] UnitApiController added
- [x] Flutter notifications controller added
- [x] Comprehensive implementation complete

## UPDATED - 2025-11-03 (Final)
- [x] Communications index page
- [x] All major features implemented

## UPDATED - 2025-11-03 (Final)
- [x] Campaigns screen in Flutter
- [x] Device tokens endpoint

## UPDATED - 2025-11-03 (Final)
- [x] Settings API + model
