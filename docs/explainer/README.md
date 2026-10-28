# How QREX Works

*Qodeigence Infocircle Private Limited — a visual companion to the QREX User Manual and Technical Documentation.*

---

## What this set is

The **User Manual** tells you how to *do things* in QREX. The **Technical Documentation** tells you how the software is *built*. This set sits between them: it shows **how the pieces fit together**, using drawings, screen designs and data tables.

Every diagram in this set is generated from the same source of truth as the rest of the documentation — the migrations, seeders, controllers and routes in the application. If a diagram and the running system disagree, that is a bug in the diagram.

## Who should read this

| Reader | Read in this order |
| --- | --- |
| New agent or marketing executive | [01 System at a Glance](01-system-at-a-glance.md) → [02 The Sales Lifecycle](02-sales-lifecycle.md) → [05 Screen Designs](05-screen-designs.md) |
| Sales manager | [02 The Sales Lifecycle](02-sales-lifecycle.md) → [06 Operations and Automation](06-operations-and-automation.md) |
| Engineer joining the project | [01 System at a Glance](01-system-at-a-glance.md) → [03 The Data Model](03-data-model.md) → [04 Roles and Permissions](04-roles-and-permissions.md) |
| Anyone reviewing the product | [01 System at a Glance](01-system-at-a-glance.md) → [05 Screen Designs](05-screen-designs.md) |

## The six chapters

| # | Chapter | What it covers |
| --- | --- | --- |
| 01 | [System at a Glance](01-system-at-a-glance.md) | The three surfaces, the 17 admin modules, the repository layout, the request lifecycle and the stack. |
| 02 | [The Sales Lifecycle](02-sales-lifecycle.md) | The nine steps from enquiry to closed deal, the lead statuses, the 12 pipeline stages, bookings and payments. |
| 03 | [The Data Model](03-data-model.md) | The 30 tables as entity diagrams, the relationships that carry the business, readable IDs and indexing. |
| 04 | [Roles and Permissions](04-roles-and-permissions.md) | The six roles, the 17 permission modules, field-level control and row-level scoping. |
| 05 | [Screen Designs](05-screen-designs.md) | Annotated wireframes of the nine screens that matter most, with a table of what each region does. |
| 06 | [Operations and Automation](06-operations-and-automation.md) | Every automatic behaviour, the 09:00 follow-up sweep, the notification catalogue, settings, deletion rules — and what QREX deliberately does not do. |

## How to read the drawings

| Drawing type | How to recognise it | What it means |
| --- | --- | --- |
| **Flowchart** | Rounded boxes and arrows | A sequence of steps, or how one thing leads to another. Arrows point in the direction of flow. |
| **Sequence diagram** | Lifelines with numbered messages | What one part of the system says to another, in order. |
| **State diagram** | Rounded state capsules with labelled transitions | The states a single record can be in, and what moves it between them. Solid arrow = normal move, dashed arrow = end state. |
| **Entity diagram** | Boxes with field lists | Tables and how they relate. `||--o{` means "one to many". |
| **Screen wireframe** | A greyed-out application screen | The layout of a real screen, with numbered notes explaining the regions. |

Colour is used sparingly and only to draw the eye. A **green** block marks the part of the flow the diagram is about, a **gold** block marks the alternative or the boundary case, a **grey** block is supporting context, and a **dark** block means a person or a system acting.

## Vocabulary used throughout

These eleven words carry the domain. Every other term in this set is defined in one of the chapters.

| Term | Plain meaning |
| --- | --- |
| **Property** | A listing — an apartment, plot, villa, shop or office that the agency sells or rents. |
| **Lead** | A person who expressed interest. The raw contact, before they are a customer. |
| **Deal** | A lead that is serious enough to carry a value and a probability. |
| **Customer** | A person who has been recorded as a buyer, independent of any single deal. |
| **Site visit** | A scheduled meeting to show a property to a lead. |
| **Task** | A to-do, most often the next follow-up with a lead. |
| **Booking** | The commercial commitment: who, which property, for how much. |
| **Payment** | Money that has moved, or is expected to. QREX records it; it never collects it. |
| **Campaign** | A marketing effort with a budget, a spend and a lead count. |
| **Pipeline stage** | Where a deal sits on the 12-column board. |
| **Permission** | A single "may do X on Y" rule, optionally narrowed to one field. |

## A note on the drawings

Diagrams are rendered from Mermaid source embedded in the chapter files, and screen designs are drawn from declarations in `scripts/wireframes.mjs`. Both are rebuilt from scratch by `npm run docs:html`, so a change to the application can be followed by a change to a drawing.

---

**Next:** [01 — System at a Glance](01-system-at-a-glance.md)
