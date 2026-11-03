# QREX - Master Execution Plan for World-Class Transformation

**Goal:** Transform QREX (Web + Flutter) into a sellable license product + multi-tenant hosted SaaS, with true white-labeling, app-store/play-store ready, premium modern redesign.

**Date:** November 2025  
**Status:** PLANNING PHASE - Awaiting Approval Before Execution

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Architecture Vision](#architecture-vision)
3. [Branch Strategy](#branch-strategy)
4. [Phase 0: Foundation & Audit](#phase-0-foundation--audit)
5. [Phase 1: Core P0 Features (Revenue Critical)](#phase-1-core-p0-features-revenue-critical)
6. [Phase 2: Growth & Adoption (P1)](#phase-2-growth--adoption-p1)
7. [Phase 3: Polish, UX & Scale (P2)](#phase-3-polish-ux--scale-p2)
8. [Phase 4: Multi-Tenancy, White-Labeling & SaaS Prep](#phase-4-multi-tenancy-white-labeling--saas-prep)
9. [Technical Implementation Details](#technical-implementation-details)
10. [Design System & Premium UI](#design-system--premium-ui)
11. [Testing Strategy](#testing-strategy)
12. [Deployment & Release Readiness](#deployment--release-readiness)
13. [File-Level Execution Checklist](#file-level-execution-checklist)
14. [Risk Mitigation](#risk-mitigation)
15. [Success Metrics](#success-metrics)

---

## 1. Executive Summary

Based on your answers, this plan focuses on:
- **Dual monetization**: Sellable license (self-hosted single-tenant) + Hosted SaaS (multi-tenant)
- **True white-labeling**: Parent brand QREX, but fully customizable per tenant/client
- **Store-ready**: Android (FCM first) + iOS ready for Play Store/App Store
- **Web-first, then Flutter**: Implement on web/API first, ensure parity, then Flutter
- **Both modules equally**: Brokerages and Builders treated as first-class
- **Full feature set**: All P0/P1/P2 + multi-tenancy architecture
- **Premium redesign**: Modern, refined, top-notch UI/UX

---

## 2. Architecture Vision

### 2.1 Multi-Tenancy Strategy (Hybrid Approach)
For supporting both **sellable license (single-tenant)** and **hosted SaaS (multi-tenant)**:

**Approach: Single Database with Tenant Scoping (Flexible)**
- Add `tenants` table with domain, branding, settings
- Add `tenant_id` to all business models (nullable for backward compatibility with single-tenant license)
- Use Global Scopes for automatic tenant filtering
- Middleware to resolve tenant from domain/subdomain/header
- Support both modes via config: `QREX_MODE=license|saas`

```php
// config/qrex.php
return [
    'mode' => env('QREX_MODE', 'license'), // license or saas
    'multi_tenant' => env('QREX_MULTI_TENANT', false),
    'white_label' => true,
];
```

### 2.2 White-Labeling System
- **Tenant Branding**: logo, app_name, favicon, primary/secondary colors, fonts
- **Custom Domain**: per tenant in SaaS mode
- **Email Templates**: customizable per tenant
- **Mobile App**: build-time or runtime config per white-label client
- **Legal/Terms**: customizable

### 2.3 API Architecture
- RESTful API under `/api/v1/` with versioning
- Sanctum tokens with tenant context
- Rate limiting per tenant/user
- Consistent response format via API Resources
- Permission middleware with tenant scoping

---

## 3. Branch Strategy

```bash
# Create Development branch from main
git checkout main
git pull origin main
git checkout -b Development
git push -u origin Development

# For each feature, create from Development
git checkout Development
git checkout -b feature/commissions
# ... work ...
git push -u origin feature/commissions
# PR to Development when complete
```

**Branch Naming Convention:**
- `Development` - Integration branch
- `feature/<module-name>` - New features (e.g., feature/commissions, feature/payment-plans)
- `feature/redesign-ui` - UI redesign
- `feature/multi-tenant` - Multi-tenancy work
- `hotfix/<issue>` - Critical fixes

---

## 4. Phase 0: Foundation & Audit (Days 1-3)

### Goals
Establish baseline, create branches, set up architecture for multi-tenancy/white-labeling.

### Tasks

#### 0.1 Git Setup
- [ ] Create `Development` branch from `main` in both repos
- [ ] Set up branch protection rules conceptually
- [ ] Create feature branch structure

#### 0.2 Comprehensive Audit (Read-Only)
- [ ] **API Parity Audit**: Map all web routes to API routes, identify gaps
- [ ] **Permission Matrix**: Document all permissions, ensure web/mobile alignment
- [ ] **DB Schema**: Review all migrations, relationships, indexes
- [ ] **Models Review**: Understand all models and their relationships
- [ ] **Flutter API Client**: Review how it consumes APIs vs web
- [ ] **Settings System**: Understand current settings implementation

#### 0.3 Architecture Prep
- [ ] Design multi-tenancy schema (tenants, tenant_user pivot, tenant_id additions)
- [ ] Design white-labeling config structure
- [ ] Design maps configuration system (Google Maps, Mapbox, OpenStreetMap/Leaflet)
- [ ] Design WhatsApp Meta Cloud API integration structure

**Deliverable:** Audit report + branch setup complete

---

## 5. Phase 1: Core P0 Features (Revenue Critical) - Weeks 1-6

All features implemented **Web-first**, then API parity ensured, then Flutter.

### 1.1 Commission Management (Priority: P0)
**Covers:** Per deal, per booking, team splits, co-broking

#### Database
```php
// migrations
commissions table:
  - id, tenant_id (nullable), deal_id, booking_id, property_id
  - agent_id (user), commission_type (percentage/fixed)
  - commission_rate, commission_amount
  - split_type (individual/team/co-broking)
  - parent_commission_id (for splits)
  - status (pending/approved/paid/rejected)
  - approved_by, approved_at, paid_at
  - notes, calculation_details (json)
  - created_by, timestamps, soft_deletes

commission_splits table:
  - id, commission_id, user_id
  - share_percentage, share_amount
  - role (primary/co-broker)
  - timestamps

commission_rules table (for slabs):
  - id, tenant_id, name, min_value, max_value
  - percentage, fixed_amount, applies_to
  - is_active, priority, timestamps
```

#### Implementation
- [ ] **Models:** `Commission`, `CommissionSplit`, `CommissionRule` with relationships
- [ ] **API (Web):** `CommissionController` (index, create, update, approve, pay, bulk approve)
- [ ] **API (REST):** `/api/commissions/*` with full CRUD + approve/pay
- [ ] **Web UI:** Commission list, create/edit, approval workflow, payout reports, agent-wise summary
- [ ] **Permissions:** `commissions.view/create/edit/delete/approve/pay/export`
- [ ] **Reports:** Commission reports integrated with Reports module
- [ ] **Flutter:** Full parity after web stable

### 1.2 Payment Plans & Installments (Priority: P0)
**Covers:** Fixed milestone plans + slab-wise/percentage-based schedules

#### Database
```php
payment_plans table:
  - id, tenant_id, booking_id, deal_id
  - plan_name, total_amount, booking_amount
  - plan_type (milestone/custom/slab)
  - status (active/completed/cancelled)
  - start_date, notes, terms (json)
  - timestamps, soft_deletes

installments table:
  - id, tenant_id, payment_plan_id
  - installment_no, milestone_name
  - due_date, amount, percentage
  - status (pending/partially_paid/paid/overdue/waived)
  - paid_amount, balance_amount
  - paid_at, payment_id (linked)
  - reminder_sent_at, notes
  - timestamps

receipts table:
  - id, tenant_id, payment_id, receipt_no (auto-generated)
  - amount, issued_to, issued_by
  - receipt_data (json), pdf_path
  - timestamps
```

#### Implementation
- [ ] **Models:** `PaymentPlan`, `Installment`, `Receipt`
- [ ] **Auto-generation:** Generate installments based on plan template
- [ ] **Payment linking:** When payment made, allocate to installments
- [ ] **Reminders:** Track overdue installments
- [ ] **Receipts:** Auto-generate receipt number, printable/PDF
- [ ] **Web UI:** Plan builder (milestone + slab), installment schedule, payment allocation, receipts
- [ ] **API:** Full REST endpoints
- [ ] **Flutter:** Parity

### 1.3 Project/Unit Inventory (Priority: P0)
**Covers:** Project > Tower/Block > Floors + Units (both models supported)

#### Database
```php
projects table:
  - id, tenant_id, name, slug, location, address
  - developer, rera_no, launch_date, possession_date
  - description, amenities (json), images (json)
  - status (upcoming/ongoing/completed)
  - featured, timestamps, soft_deletes

towers table:
  - id, tenant_id, project_id
  - name, floors_count, units_per_floor
  - timestamps

units table:
  - id, tenant_id, project_id, tower_id
  - unit_no, floor, unit_type (1bhk/2bhk/3bhk/villa/commercial)
  - carpet_area, built_up_area, super_area
  - price, price_per_sqft
  - status (available/hold/booked/sold/blocked)
  - facing, views, floor_plan_id
  - booking_id, deal_id
  - hold_expires_at, held_by, held_at
  - features (json), timestamps, soft_deletes
```

#### Implementation
- [ ] **Models:** `Project`, `Tower`, `Unit` with full relationships
- [ ] **Unit Status Management:** Hold with expiry, booking, release
- [ ] **Availability Matrix:** Grid view by tower/floor
- [ ] **Pricing:** Per unit or project-wide
- [ ] **Web UI:** Project wizard, tower/unit management, inventory board, availability chart
- [ ] **API:** Full REST
- [ ] **Public Integration:** Show projects/units on public website
- [ ] **Flutter:** Parity

### 1.4 WhatsApp Business (Meta Cloud API) (Priority: P0)
#### Configuration
```php
// settings table additions
whatsapp_provider (meta_cloud|interakt|gupshup|aisensy)
whatsapp_enabled
meta_app_id, meta_phone_number_id, meta_access_token, meta_waba_id
meta_verify_token, meta_webhook_url
whatsapp_templates (json)
```

#### Implementation
- [ ] **Service:** `App\Services\WhatsApp\MetaCloudService` with send template/message
- [ ] **Templates:** Manage approved templates
- [ ] **Triggers:** Lead created/assigned, site visit scheduled, booking created, payment received, follow-up reminder
- [ ] **Manual Send:** From Lead/Deal/Customer/Booking views
- [ ] **Webhook:** For incoming messages/status updates
- [ ] **Web UI:** Settings > WhatsApp, template manager, message logs
- [ ] **API:** Send endpoints
- [ ] **Flutter:** Send from mobile
- [ ] **Logging:** Message history per lead

### 1.5 Unified Communication Timeline (Priority: P0)
#### Database
```php
communications table:
  - id, tenant_id
  - communicable_type, communicable_id (polymorphic - Lead/Deal/Customer)
  - type (note/call/whatsapp/email/site_visit/status_change/assignment/reminder)
  - direction (inbound/outbound)
  - subject, content, meta (json)
  - duration_minutes (for calls)
  - call_outcome (connected/voicemail/no-answer/interested/not-interested)
  - next_follow_up_at
  - created_by, timestamps
```

#### Implementation
- [ ] **Model:** `Communication` polymorphic
- [ ] **Auto-logging:** Auto-create on status changes, assignments, activities
- [ ] **Log Call:** Quick form with outcome, duration, follow-up
- [ ] **Unified View:** Timeline UI with filters by type
- [ ] **Web:** Integrated in Lead/Deal/Customer detail pages
- [ ] **API:** Full CRUD
- [ ] **Flutter:** Timeline in detail screens

---

## 6. Phase 2: Growth & Adoption (P1) - Weeks 7-10

### 2.1 Push Notifications with FCM (Android First) (Priority: P1)
- [ ] **Laravel:** `kreait/laravel-firebase` or HTTP v1, device tokens table
- [ ] **Flutter:** `firebase_messaging`, `flutter_local_notifications`
- [ ] **Triggers:** Assignments, tasks, site visits, deals, payments
- [ ] **Topics/Users:** Per user + role-based
- [ ] **Deep linking:** Open relevant screen

### 2.2 Client/Buyer Portal (Priority: P1) - MUST HAVE
#### Database
```php
buyers table:
  - id, tenant_id, customer_id, user_id (portal account)
  - email, phone, password
  - status (active/inactive)
  - last_login_at, timestamps

// Portal access tied to customer
```

#### Implementation
- [ ] **Auth:** Separate portal guard/routes
- [ ] **Dashboard:** Booking overview, payment summary
- [ ] **Booking Details:** Unit details, agreement info
- [ ] **Payment Plan:** Installments with status, due amounts
- [ ] **Receipts:** Download/view receipts
- [ ] **Documents:** Access granted documents
- [ ] **Site Visits:** History
- [ ] **Profile:** Update basic info
- [ ] **Web:** `/portal/*` routes with minimal UI
- [ ] **Security:** Email/OTP or password, token-based

### 2.3 Workflow Automation/Rules Engine (Priority: P1)
#### Database
```php
automations table:
  - id, tenant_id, name, description
  - trigger_event (lead_created/lead_status_changed/deal_moved/etc)
  - conditions (json), actions (json)
  - is_active, priority, run_count
  - created_by, timestamps

automation_logs table:
  - id, automation_id, trigger_data (json)
  - executed_actions (json), status, error
  - executed_at
```

#### Implementation
- [ ] **Engine:** Event-driven with Laravel Events/Listeners
- [ ] **Rule Builder UI:** Condition groups, action selector
- [ ] **Actions:** Assign agent, change status, create task, send WhatsApp, send notification, add note
- [ ] **Testing:** Dry run/test rule
- [ ] **Logs:** Execution history

### 2.4 Duplicate Detection (Priority: P1)
- [ ] **Detection:** On lead/customer create, check phone/email (fuzzy)
- [ ] **UI:** "Possible Duplicates" modal with match %
- [ ] **Actions:** Merge, link, create anyway
- [ ] **Import:** Check during CSV import
- [ ] **Prevention:** Configurable strictness

### 2.5 Enhanced Reports & Analytics (Priority: P1)
- [ ] Lead Funnel Analysis
- [ ] Source-wise Conversion %
- [ ] Agent Performance Leaderboard (with targets)
- [ ] Booking Pipeline Value
- [ ] Collection vs Due (aging)
- [ ] Overdue Follow-ups Report
- [ ] Campaign ROI
- [ ] Team Performance Dashboard

---

## 7. Phase 3: Polish, UX & Scale (P2) - Weeks 11-13

### 3.1 Maps Configuration (Priority: P2)
Settings-driven: Google Maps, Mapbox, OpenStreetMap (Leaflet)

```php
// settings
map_provider (google|mapbox|osm)
google_maps_api_key, mapbox_access_token
map_default_lat, map_default_lng
```

- [ ] Property location picker
- [ ] Public property map
- [ ] Site visit directions
- [ ] Autocomplete (Google/Mapbox) or Nominatim (OSM)

### 3.2 Unified Calendar (Priority: P2)
- [ ] Month/Week/Day views
- [ ] Merge Tasks, Site Visits, Follow-ups
- [ ] Filter by agent/type
- [ ] Quick actions from calendar
- [ ] Flutter calendar view

### 3.3 Document Vault (Priority: P2)
- [ ] Entity attachments (Lead/Customer/Booking/Deal/Property)
- [ ] Document types, expiry tracking
- [ ] Access control by role
- [ ] Upload from web/Flutter

### 3.4 Dark Mode (Priority: P2) - Both Web + Flutter
- [ ] CSS variables for theming
- [ ] Tailwind dark: classes
- [ ] Flutter ThemeData with dark theme
- [ ] System/light/dark toggle, persistence

### 3.5 Biometric Auth (Flutter) + Deep Linking
- [ ] local_auth integration
- [ ] App lock on resume
- [ ] Deep links (qrex://, https)
- [ ] Notification deep linking

### 3.6 UI/UX Polish - Premium Redesign
- [ ] New design tokens (colors, spacing, typography, radius, shadows)
- [ ] shadcn/ui component library on web
- [ ] Custom Flutter widget library
- [ ] Skeleton loaders everywhere
- [ ] Empty states with illustrations
- [ ] Micro-animations
- [ ] Consistent forms/tables/modals
- [ ] Mobile-responsive perfection

### 3.7 Performance & Audit Logs
- [ ] N+1 query fixes, eager loading
- [ ] Pagination everywhere
- [ ] Caching where appropriate
- [ ] Audit log for critical actions
- [ ] Activity tracking

---

## 8. Phase 4: Multi-Tenancy, White-Labeling & SaaS Prep - Weeks 14-16

### 4.1 Multi-Tenancy Implementation
```php
// migrations
tenants table:
  - id, name, slug, domain, subdomain
  - status (active/suspended/trial)
  - plan_id, trial_ends_at
  - settings (json)
  - timestamps, soft_deletes

tenant_users table:
  - tenant_id, user_id, role_in_tenant
  - timestamps
```

- [ ] `BelongsToTenant` trait
- [ ] Global scopes for tenant filtering
- [ ] Tenant resolution middleware (domain/subdomain/headers)
- [ ] Tenant-aware auth
- [ ] Data isolation verification
- [ ] Single-tenant mode compatibility

### 4.2 True White-Labeling
```php
tenant_branding table:
  - tenant_id, app_name, logo_light, logo_dark, favicon
  - primary_color, secondary_color, accent_color
  - font_family, custom_css
  - login_background, sidebar_style
  - hide_powered_by, custom_footer
```

- [ ] Branding service
- [ ] Dynamic theme injection (web)
- [ ] Flutter runtime config
- [ ] Email branding
- [ ] PDF/report branding
- [ ] Login page customization

### 4.3 SaaS Features
- [ ] Plans/subscription management (basic structure)
- [ ] Usage tracking (users, leads, properties)
- [ ] Feature flags per plan
- [ ] Tenant onboarding flow
- [ ] Super Admin panel for tenants
- [ ] Billing placeholders (for future Stripe/Razorpay)

### 4.4 App Store/Play Store Readiness
- [ ] **Android:** Update package name config, signing, versioning, permissions, Play Console ready
- [ ] **iOS:** Bundle ID, Info.plist, App Store ready
- [ ] **Assets:** App icons, splash screens, store listings
- [ ] **Privacy Policy/Terms:** Templates
- [ ] **Firebase:** Proper setup for FCM
- [ ] **In-App Updates:** Keep existing in_app_update
- [ ] **Build Configs:** Flavors for different white-label builds

---

## 9. Technical Implementation Details

### 9.1 Database Strategy
- All new tables with `tenant_id` (nullable for license mode)
- Foreign keys with cascading where appropriate
- Indexes on frequently queried columns
- Use UUIDs? Or auto-increment (keep existing style)
- Migrations in order, reversible

### 9.2 API Versioning
```php
Route::prefix('v1')->middleware(['auth:sanctum'])->group(function() {
    // all new APIs here
});
```

### 9.3 Permission System Extension
Add new permissions to seeder:
```php
'commissions' => ['view','create','edit','delete','approve','pay','export'],
'payment_plans' => ['view','create','edit','delete'],
'projects' => ['view','create','edit','delete'],
'units' => ['view','create','edit','delete','hold','book'],
'communications' => ['view','create','edit','delete'],
'automations' => ['view','create','edit','delete','execute'],
'portal' => ['view','manage'],
'buyer_portal' => ['view','manage'],
```

### 9.4 Event System
```php
// Events
LeadCreated, SiteVisitScheduled, BookingCreated, PaymentReceived, DealMoved
// Listeners
SendWhatsAppNotification, CreateCommunicationLog, CreateTaskReminder, SendFCMNotification
```

### 9.5 File Structure

**Laravel (Web):**
```
app/
├── Models/Tenant.php, Commission.php, Project.php, Unit.php, ...
├── Services/WhatsApp/, Maps/, Branding/, Automation/
├── Events/, Listeners/
├── Http/Controllers/Api/V1/, Web/
├── Policies/
├── Traits/BelongsToTenant.php
```

**Flutter:**
```
lib/
├── core/config/branding_config.dart, maps_config.dart
├── core/services/fcm_service.dart, biometric_service.dart
├── features/commissions/, projects/, payment_plans/, ...
├── widgets/design_system/ (new premium components)
```

---

## 10. Design System & Premium UI

### 10.1 Color Palette
```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --accent: 221.2 83.2% 53.3%;
  /* ... full shadcn-inspired palette */
}
```

### 10.2 Typography
- Inter, Geist, or Jost for modern look
- Fluid typography
- Proper hierarchy

### 10.3 Components (Web - shadcn/ui style)
- Button, Input, Select, Checkbox, Radio
- Card, Sheet, Dialog, Dropdown
- Table with sorting/filtering
- Form with react-hook-form + zod
- Toast notifications
- Skeleton, Badge, Avatar
- Calendar, DatePicker

### 10.4 Components (Flutter)
- AppButton, AppTextField, AppCard
- AppBottomSheet, AppDialog
- AppDataTable/CardList
- AppSkeleton
- AppBadge, AppAvatar
- Consistent spacing (4pt grid)

### 10.5 UX Principles
- **Clarity:** Clear hierarchy, obvious CTAs
- **Efficiency:** Minimal clicks, smart defaults
- **Consistency:** Same patterns everywhere
- **Feedback:** Loading, success, error states
- **Accessibility:** Semantic HTML, ARIA, contrast
- **Mobile-first:** Responsive at every step

---

## 11. Testing Strategy

### 11.1 Backend (Laravel)
- [ ] Feature tests for P0 modules
- [ ] Permission tests
- [ ] Tenant isolation tests (multi-tenant mode)
- [ ] API resource tests
- [ ] Validation tests

### 11.2 Frontend (React)
- [ ] Component tests for critical components
- [ ] Form validation tests

### 11.3 Flutter
- [ ] Unit tests for repositories/services
- [ ] Widget tests for forms
- [ ] Integration tests for auth flow

### 11.4 Manual Testing Checklist
- [ ] Lead lifecycle end-to-end
- [ ] Booking + Payment Plan + Installment flow
- [ ] Commission calculation + approval
- [ ] Unit hold/book flow
- [ ] WhatsApp sending
- [ ] Role/permission enforcement
- [ ] Multi-tenant isolation
- [ ] White-labeling

---

## 12. Deployment & Release Readiness

### 12.1 Environment Variables
```env
# Mode
QREX_MODE=license|saas
QREX_MULTI_TENANT=false|true

# WhatsApp Meta
META_APP_ID=
META_PHONE_NUMBER_ID=
META_ACCESS_TOKEN=
META_WABA_ID=

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_CREDENTIALS=

# Maps
GOOGLE_MAPS_API_KEY=
MAPBOX_ACCESS_TOKEN=

# White-label
APP_NAME=QREX
```

### 12.2 Build Process
- **Web:** `npm run build`, optimize assets
- **Flutter Android:** `flutter build appbundle` / `apk`
- **Flutter iOS:** `flutter build ipa`

### 12.3 Documentation
- [ ] README updates
- [ ] API documentation
- [ ] Installation guide (license)
- [ ] SaaS deployment guide
- [ ] White-labeling guide
- [ ] User manual

---

## 13. File-Level Execution Checklist

### Week 1-2: Foundation
- [ ] Create branches
- [ ] Audit complete
- [ ] Multi-tenancy migrations
- [ ] White-labeling structure
- [ ] Design system setup

### Week 3-6: P0 Features
- [ ] Commissions (Models, Migrations, Controllers, API, Web UI)
- [ ] Payment Plans & Installments
- [ ] Projects/Units Inventory
- [ ] WhatsApp Meta Cloud
- [ ] Communication Timeline

### Week 7-10: P1 Features
- [ ] FCM Push Notifications
- [ ] Buyer Portal
- [ ] Automation Engine
- [ ] Duplicate Detection
- [ ] Enhanced Reports

### Week 11-13: P2 Polish
- [ ] Maps Config
- [ ] Calendar
- [ ] Document Vault
- [ ] Dark Mode (Web+Flutter)
- [ ] Biometric/Auth
- [ ] Premium Redesign Pass

### Week 14-16: Multi-Tenancy & Store Ready
- [ ] Full multi-tenancy
- [ ] White-labeling complete
- [ ] Android build ready
- [ ] iOS prep
- [ ] Testing & fixes

---

## 14. Risk Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Breaking existing functionality | High | Incremental changes, test after each module, keep backward compatible |
| Flutter/Web parity issues | High | API-first approach, test endpoints before Flutter |
| Multi-tenancy data leakage | Critical | Global scopes + tests + careful review |
| Complex commission calculations | High | Thorough testing with dummy data, clear calculation logic |
| WhatsApp API changes | Medium | Abstract provider, easy to switch |
| Scope creep | High | Stick to plan, prioritize P0 strictly |
| Performance degradation | Medium | Query optimization, eager loading, pagination |

---

## 15. Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Feature Completeness | 100% of P0+P1 | Checklist completion |
| API Parity | 100% | Web actions have API endpoints |
| Permission Coverage | 100% | All modules permission-protected |
| UI Consistency | Premium feel | Design review |
| Performance | <2s page load | Testing |
| Mobile Responsiveness | Perfect | All breakpoints |
| Store Readiness | Ready | Build succeeds, checks pass |

---

## Next Steps

1. **Review & Approve** this plan
2. **Confirm** any adjustments needed
3. **I will start with Phase 0** - Create branches in both repos, run comprehensive audit
4. **Report findings** and begin implementation module by module

**Ready to proceed upon your approval.** 
