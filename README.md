# Nestera

> **Next-Gen Real Estate & Living Space Management Platform**  
> *Radical Cost Transparency, Algorithmic Roommate Matching, Plain-English Digital Leases, and End-to-End Tenancy Lifecycle Management.*

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black.svg)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org)
[![Express](https://img.shields.io/badge/Express-4.19.2-lightgrey.svg)](https://expressjs.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-emerald.svg)](https://supabase.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Key Features](#3-key-features)
4. [Tenant Features](#4-tenant-features)
5. [Owner Features](#5-owner-features)
6. [Roommate Compatibility System](#6-roommate-compatibility-system)
7. [Gender & Profile Avatar System](#7-gender--profile-avatar-system)
8. [Maintenance System](#8-maintenance-system)
9. [Property & Accommodation System](#9-property--accommodation-system)
10. [Checkout & Payments](#10-checkout--payments)
11. [Dashboards](#11-dashboards)
12. [Notifications & Messaging](#12-notifications--messaging)
13. [Technology Stack](#13-technology-stack)
14. [Project Structure](#14-project-structure)
15. [Database & Supabase Architecture](#15-database--supabase-architecture)
16. [Authentication Flow](#16-authentication-flow)
17. [Environment Variables](#17-environment-variables)
18. [Installation & Setup](#18-installation--setup)
19. [Supabase Setup](#19-supabase-setup)
20. [Security](#20-security)
21. [User Flows](#21-user-flows)
22. [Compatibility Matching Flow](#22-compatibility-matching-flow)
23. [Screens & UI Overview](#23-screens--ui-overview)
24. [Responsive Design](#24-responsive-design)
25. [Error Handling & Loading States](#25-error-handling--loading-states)
26. [Scripts](#26-scripts)
27. [Testing](#27-testing)
28. [Deployment](#28-deployment)
29. [Known Limitations](#29-known-limitations)
30. [Future Improvements](#30-future-improvements)
31. [Hackathon & Project Context](#31-hackathon--project-context)
32. [Contributors & Author](#32-contributors--author)

---

## 1. Project Overview

**Nestera** is a comprehensive, full-stack PropTech platform designed for university students, young working professionals, and property owners. It re-engineers modern residential renting by replacing opaque brokerages, confusing legal jargon, roommate conflicts, and fragmented maintenance calls with a unified, transparent digital operating system.

The platform provides:
- **Verified Property Discovery**: Direct landlord listings with zero brokerage fees, locality transit scores, and campus proximity benchmarks.
- **Radical Cost Transparency**: Dynamic living-cost simulators that project true monthly expenses (rent, electricity consumption, Wi-Fi, maintenance, and commute) before signing.
- **Algorithmic Roommate Compatibility**: A 14-dimension weighted compatibility engine calculating personalized compatibility scores (0–100%) and pinpointing matching habits.
- **Plain-English Digital Leases**: Side-by-side legal jargon translation with DigiLocker Aadhaar eSign authentication.
- **Deposit Safeguards (Proof Vault)**: Move-in/move-out photographic condition logs and meter readings to guarantee 100% deposit returns.
- **End-to-End Tenancy Hub**: UPI & Stripe escrow rent settlements, shared expense ledgers, and a 24/7 maintenance dispatch relay.
- **Owner Portfolio Management**: 10-module landlord control center for unit occupancy, tenant applications, rent collections, and technician workflows.

---

## 2. Problem Statement

Renting housing in urban education and tech hubs presents critical real-world friction:

1. **Brokerage & Hidden Charges**: First-time renters face arbitrary broker fees (often 1–2 months' rent) and surprise utility bills.
2. **Roommate Incompatibility**: Mismatched sleep schedules, conflicting cleanliness habits, diet restrictions, and irregular financial contributions cause severe domestic friction.
3. **Complex Legal Jargon**: Standard 20-page rental agreements contain archaic legal terminology that obscure notice periods, arbitrary lock-in clauses, and unfair forfeiture rules.
4. **Arbitrary Deposit Deductions**: Landlords frequently withhold security deposits citing unsubstantiated damages due to the lack of timestamped move-in condition evidence.
5. **Slow, Fragmented Maintenance**: Renters struggle to report urgent repairs (leaking geysers, faulty electrical wiring) without standardized service level agreements (SLAs).
6. **Inefficient Landlord Management**: Independent property owners lack modern tools to track multi-unit occupancies, screen tenant applicants, and collect on-time payments.

Nestera directly solves each of these problems through transparent software workflows validated against real market requirements.

---

## 3. Key Features

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Nestera PLATFORM                                │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│    TENANT ECOSYSTEM          │      ALGORITHMIC CORES       │ OWNER SUITE   │
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ • Campus Proximity Search    │ • 14-Factor Roommate Engine  │ • KPI Hub     │
│ • Living Cost Simulator      │ • Fair Rent "ValueIQ"        │ • Listings    │
│ • 6-Step Booking Checkout    │ • Plain-English Legal Engine │ • Screening   │
│ • Proof Vault Inspection     │ • 24/7 WhatsApp Relay Bot    │ • Collections │
│ • Shared Expense Splitter    │ • Gender-Based Avatar System │ • Tech Dispatch│
└──────────────────────────────┴──────────────────────────────┴───────────────┘
```

### Authentication & Identity Management
- **Permanent Role Isolation**: Users designate their permanent role (`Tenant` or `Owner`) prior to registration; this role is strictly maintained across sessions.
- **Supabase Cloud Authentication**: Direct email/password registration with tokenized session management (`@supabase/supabase-js`) and seamless offline mock failover.
- **Comprehensive Profile Attributes**: User records capture Full Name, Email, Phone Number, Permanent Role, Gender (`Male`, `Female`, `Prefer not to say`), and Date of Birth (validated against future dates).
- **Clean Sign-In Experience**: The Sign-In modal asks exclusively for Email and Password. Demographic fields (Gender, Date of Birth) only appear during Sign-Up.
- **Profile Completion Safeguard**: If an existing user logs in with missing demographic attributes, an automated `ProfileCompletionModal` prompts them to complete their record.

---

## 4. Tenant Features

- **Multi-Parameter Space Discovery**: Filter listings by city, university proximity (CEPT, Nirma, IIM-A, Gujarat University), lease duration (2 to 6 months), accommodation type, budget range, and furnishing status.
- **Interactive Ahmedabad Locality Map**: Neighborhood pins with real-time card previews, transit ratings, and safety indexes.
- **Dynamic Cost Simulator**: Real-time electricity consumption slider (kWh) with automated Torrent Power tariff calculations and grocery/commute projections.
- **Roommate Matching Stack**: Interactive card deck displaying match percentage, bio, habit tags, diet, study routine, and mutual connection triggers.
- **18-Question Compatibility Questionnaire**: 7 multi-question categories calibrating living styles with persistent cloud syncing.
- **Active Tenancy Dashboard**: Countdown timer to next rent payment due date, security deposit escrow monitor, and roommate balance indicators.
- **Shared Household Expense Ledger**: Add shared flat expenses (electricity, groceries, internet, water cans), split equally, and trigger instant balance settlement.
- **Move-In / Out Proof Vault**: Upload and inspect timestamped photos of walls, appliances, and meters with condition tags (`Mint`, `Fair`, `Damaged`) to protect deposits.
- **Roommate Constitution**: Signed flatmate charter covering quiet hours (11 PM), chore rotations, guest limits, and dispute guidelines.
- **Plain-English Legal Lease**: Side-by-side legalese translator with Aadhaar DigiLocker eSign simulation and downloadable agreement previews.
- **6-Step Accommodation Checkout**: Step-by-step space summary, rental duration selector, transparent itemized bill, KYC verification, and Stripe escrow execution.
- **Saved Properties**: 1-click bookmarking of listings across browsing sessions.

---

## 5. Owner Features

The **Owner / Host Control Center** provides 10 purpose-built subpanels:

1. **Dashboard Overview**:
   - Portfolio KPIs: Total Monthly Revenue, Portfolio Occupancy Rate, Active Maintenance Tickets, On-Time Collection Rate.
   - Quick Action triggers: Add New Unit, Verify Property, Dispatch Technician.
   - Live tenant activity feed.
2. **Properties Inventory**:
   - Tabular and card inventory of managed spaces (address, unit number, rent, security deposit, lease end date).
   - Instant Occupancy toggle (`Available` ↔ `Occupied`).
   - Modal form for listing new units with zero brokerage.
3. **Tenant Applications**:
   - Review incoming tenant rental requests with DigiLocker Aadhaar KYC verification status.
   - Instant 1-click `Accept` or `Decline` actions that auto-notify the tenant.
4. **Maintenance Management**:
   - Active repair tickets grouped by urgency (`High`, `Medium`, `Low`).
   - 5-stage SLA timeline stepper (`Reported` → `Assigned` → `Technician Scheduled` → `In Progress` → `Resolved`).
   - One-click technician dispatch and status advancement.
5. **Rent Collections & Payments**:
   - Transaction log showing payment status (`Paid`, `Pending`, `Overdue`), payment methods, and GST invoice downloads.
   - Manual mark-as-paid toggle for cash/direct transfers.
6. **Tenant Messages**:
   - Direct tenant messaging hub with WhatsApp quick-launch and unified chat relays.
7. **Owner Notifications**:
   - Actionable alert feed with unread counts and deep-link routing to relevant tickets or applications.
8. **Analytics & Portfolio Yield**:
   - Gross rental yields, occupancy trends, expense tracking, and income projections.
9. **Host Profile**:
   - Verified Landlord badge, government ID verification records, and emergency contact details.
10. **Settings**:
    - Payout bank account configuration, UPI VPA routing, automated rent reminder toggles, and notification preferences.

---

## 6. Roommate Compatibility System

Nestera does not use arbitrary or randomized match percentages. Compatibility is computed by an algorithmic matching engine (`compatibilityEngine.js` in Next.js and `compatibility.js` in the prototype) evaluating user questionnaire answers against candidate profiles.

```
┌─────────────────────────────────────────────────────────────┐
│            14-DIMENSION COMPATIBILITY CALIBRATION           │
├──────┬──────────────────────────────────┬────────┬──────────┤
│ Step │ Category                         │ Weight │ % Share  │
├──────┼──────────────────────────────────┼────────┼──────────┤
│ 1    │ Food Preference & Flexibility    │ 15     │ 14.3%    │
│ 2    │ Monthly Budget Variance          │ 12     │ 11.4%    │
│ 3    │ Cleanliness Standards            │ 10     │ 9.5%     │
│ 4    │ Sleep Schedule (Hours)           │ 10     │ 9.5%     │
│ 5    │ Smoking Habits                   │ 8      │ 7.6%     │
│ 6    │ Personality Type                 │ 8      │ 7.6%     │
│ 7    │ Roommate Relationship Preference │ 8      │ 7.6%     │
│ 8    │ Drinking Habits                  │ 7      │ 6.7%     │
│ 9    │ Sound & Sleep Environment        │ 7      │ 6.7%     │
│ 10   │ Study / Work Location            │ 5      │ 4.8%     │
│ 11   │ Pet Policies                     │ 5      │ 4.8%     │
│ 12   │ Personal Space Importance        │ 5      │ 4.8%     │
│ 13   │ Occupation / Student Status      │ 3      │ 2.9%     │
│ 14   │ Age Proximity                    │ 2      │ 1.9%     │
├──────┴──────────────────────────────────┼────────┼──────────┤
│ TOTAL WEIGHT POINTS                     │ 105    │ 100.0%   │
└─────────────────────────────────────────┴────────┴──────────┘
```

### Mathematical Formula
$$\text{Raw Score} = \sum_{i=1}^{14} (\text{Category Score}_i \times \text{Weight}_i)$$

$$\text{Raw Percentage} = \text{round}\left(\frac{\text{Raw Score}}{105} \times 100\right)$$

### Gender Preference & Boundary Rules
- **Explicit Gender Filter**: If the user specifies `Male` or `Female` (not `Any`), candidates with matching gender receive a priority factor; differing genders receive a **15% penalty** (clamped to a minimum of 30%).
- **Score Clamping**: Final scores are constrained between a minimum of **35%** and a maximum of **98%** to reflect real-world human dynamics.
- **Unanswered State**: When a user has not completed the questionnaire, a baseline score of **75%** is displayed alongside the notice: *"Lifestyle compatibility pending quiz completion"*.
- **Retaking the Quiz**: Users can update answers anytime via `RoommateQuizModal.jsx`. The engine immediately recalculates all candidate percentages and saves responses to Supabase (`roommate_preferences`) and `localStorage`.

---

## 7. Gender & Profile Avatar System

To ensure representative, inclusive, and accurate user profiles without making assumptions from user names, Nestera enforces an exact fallback priority:

```
                  ┌──────────────────────────────┐
                  │ Does user have a valid       │
                  │ custom uploaded avatar?      │
                  └──────────────┬───────────────┘
                                 │
                     ┌───────────┴───────────┐
                    YES                      NO
                     │                       │
         ┌───────────────────────┐ ┌───────────────────────────────────┐
         │ Show Custom Avatar    │ │ Check User's Selected Gender      │
         └───────────────────────┘ └─────────────────┬─────────────────┘
                                                     │
                             ┌───────────────────────┼───────────────────────┐
                             │                       │                       │
                          Female                    Male             Prefer not to say /
                             │                       │                     Unknown
                 ┌───────────────────────┐ ┌───────────────────┐ ┌───────────────────────┐
                 │  /avatars/            │ │  /avatar.png      │ │  /avatars/            │
                 │  avatar-female.png    │ │  (avatar-male.png)│ │  avatar-neutral.svg   │
                 └───────────────────────┘ └───────────────────┘ └───────────────────────┘
```

### Avatar Logic Specification
1. **Custom Upload**: Uploaded images are recognized by inspecting URL signatures (ignoring stock placeholders). Custom avatars always take top priority.
2. **Female**: Users selecting `Female` automatically receive `/avatars/avatar-female.png`.
3. **Male**: Users selecting `Male` receive `/avatar.png` (`avatar-male.png`).
4. **Prefer not to say**: Users selecting `Prefer not to say` receive `/avatars/avatar-neutral.svg`.
5. **Undefined / Missing**: Users without recorded gender automatically receive `/avatars/avatar-neutral.svg`.
6. **No Name Inference**: Gender is never guessed from first names or emails.
7. **Storage & Immutability**: Gender is stored in the Supabase `profiles` table and client session. Switching accounts or logging out resets the state completely.

---

## 8. Maintenance System

Nestera includes a 2-tier maintenance system: an asynchronous ticketing dashboard and a real-time 24/7 in-app relay bot.

```
[Tenant Issue] ──► [Report Ticket / Relay Bot] ──► [maintenance_tickets]
                                                          │
   ┌──────────────────────────────────────────────────────┴──────────────────────────────────────────────────────┐
   ▼                                                                                                             ▼
[Auto-Assign Technician]                                                                           [Notify Property Owner]
• Ramesh Prajapati / Kumar                                                                          • Instant in-app alert
• 4.9★ Verified Pro                                                                                 • Push/WhatsApp relay
• ETA: Within 2–3 hours                                                                             • 1-click ticket link
   │                                                                                                             │
   └───────────────────────────────────┬─────────────────────────────────────────────────────────────────────────┘
                                       ▼
                       [5-Stage SLA Timeline Stepper]
                       1. Reported (Immediate)
                       2. Assigned (Within 30m)
                       3. Technician Scheduled
                       4. In Progress
                       5. Resolved (Verified)
```

### Ticket Schema Fields
- `id`: Unique identifier (e.g., `maint-101`).
- `title` & `issue`: Concise issue description.
- `category`: Plumbing, Electrical / HVAC, Carpentry & Security, Appliances.
- `urgency`: `High`, `Medium`, `Low` (auto-evaluated based on keywords like *leak*, *spark*, *lock*).
- `status`: `Reported`, `Assigned`, `In Progress`, `Completed`, `Escalated`.
- `technician`: Certified technician profile with full name, contact number, verified rating, and guaranteed ETA.
- `timeline`: 5 step array with completion flags and timestamps.
- `property` & `location`: Target property and room identifier.

---

## 9. Property & Accommodation System

Each property listing represents verified rental inventory with full transparency metrics:

```
┌─────────────────────────────────────────────────────────────────────┐
│ PALM GROVE LUXURY LIVING (FLAT 402)                                 │
├────────────────────────────────┬────────────────────────────────────┤
│ Location: SG Highway, Ahmedabad│ Transparency Score: 98/100         │
│ Monthly Rent: ₹18,000 / month  │ Security Deposit: ₹36,000 (Escrow) │
│ Configuration: 2 BHK (920 sqft)│ Furnishing: Fully Furnished        │
├────────────────────────────────┴────────────────────────────────────┤
│ ITEMIZED TRANSPARENT PRICING BREAKDOWN                              │
│ • Base Rent: ₹18,000                                                │
│ • Maintenance Sinking Fund: ₹1,200                                  │
│ • Piped Gas (Adani Total): ₹450                                     │
│ • 200Mbps Fiber Internet: ₹800                                      │
│ • Brokerage Fee: ₹0 (Guaranteed Zero Brokerage)                     │
├─────────────────────────────────────────────────────────────────────┤
│ LIVING COST SIMULATOR                                               │
│ • Slider: [======●====] 180 kWh/mo (Torrent Power slab: ₹1,420)     │
│ • Estimated Commute: ₹1,200/mo (BRTS AC Transit)                    │
│ • Projected Out-of-Pocket Budget: ₹23,070 / month                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Implemented Filter Attributes
- **Campuses**: CEPT University, Nirma University, IIM Ahmedabad, Gujarat University, Adani Institute of Digital Technology.
- **Lease Durations**: Flexible short-stay rentals (2, 3, 4, and 6 months) with verified student terms.
- **Space Types**: Full Apartments, Private Rooms, Shared Rooms, Student PGs, Co-Living Suites.
- **Neighborhood Metrics**: Sourced from sub-registrar transactions to compute safety ratings, average ₹/sqft, and walkability scores.

---

## 10. Checkout & Payments

Accommodation checkout is handled by a dedicated 6-step modal (`CheckoutModal.jsx`):

```
Step 1: Space Summary
   └── Visual confirmation of verified property, landlord, and base monthly rent.
Step 2: Rental Duration & Move-In Dates
   └── Select 2–6 month student duration; auto-calculates move-out date.
Step 3: Transparent Price Breakdown
   └── Itemizes 1st month rent, 100% refundable deposit, and ₹0 platform fee.
Step 4: True Cost of Living
   └── Transparent projections for utility tariffs, Wi-Fi, and neighborhood transit.
Step 5: Resident KYC Details & Payment
   └── Name, Email, Phone, Aadhaar KYC ID, and simulated Stripe AES-256 card payment.
Step 6: Booking Confirmed & Instant Receipt
   └── Generates unique transaction ID, receipt reference, and activates tenancy.
```

### Payment Features & Status
- **Stripe Escrow Integration**: Built-in Stripe checkout workflow (`StripePaymentModal.jsx` & `PaymentAPI.accommodationCheckout`) that simulates card charging with loading states, webhooks verification, and GST receipt generation.
- **UPI Fast Pay**: 1-click UPI deep-link modal (`PayRentModal.jsx`) displaying dynamic QR codes and VPA addresses.
- **Invoice Records**: Rent payments are recorded in the `payments` table with itemized utility splits and downloadable receipts.

---

## 11. Dashboards

### Tenant Dashboard (`DashboardView.jsx`)
- **Tenancy Header**: Displays the tenant's verified name, rented flat, and locality.
- **Rent Countdown Clock**: Visual countdown showing remaining days until rent is due.
- **Financial Status Widgets**:
  - Security Deposit held in escrow (`₹36,000`).
  - Balance owed to roommates (`You Owe`).
  - Reimbursements due from roommates (`Owed to You`).
  - Current co-residents list.
- **Quick Actions**:
  - Open Proof Vault (move-in photographic condition log).
  - Open Roommate Constitution (signed charter).
  - Stripe Secure Rent Payment.
  - UPI Fast Pay.
- **Household Expense Ledger**: Categorized list (Electricity ⚡, Internet 🌐, Water 💧, Groceries 🛒) with a **Settle All Balances** action.

### Owner Dashboard (`OwnerView.jsx`)
- **Responsive Sidebar**: 10 distinct navigation tabs with dynamic notification and message badge counters.
- **KPI Metrics**: Monthly revenue, portfolio occupancy rate, open maintenance tickets, on-time collection rate.
- **Unit Management**: Listing cards, live tenant status, and new property submission modal.
- **Applicant Screening**: Review prospective tenant profiles with Aadhaar verification tags.
- **Maintenance Dispatch**: Move maintenance tickets through the 5-step SLA progression.

---

## 12. Notifications & Messaging

- **Slide-out Notification Drawer** (`NotificationDrawer.jsx`): Real-time alert list with unread counter badge.
- **Deep-Link Routing**: Clicking a notification opens the relevant modal or switches views:
  - Maintenance alerts open the ticket details in the Maintenance view.
  - Rent due notices open the payment modal.
  - Roommate requests open the contract review modal.
- **Mark As Read**: Individual dismiss or global *Mark All as Read* button syncing with the `notifications` table.
- **Messaging Channel**: Integrated WhatsApp launch links and in-app chat widget with automated relay bot responses.

---

## 13. Technology Stack

| Technology | Implementation & Purpose |
|:---|:---|
| **Frontend Framework** | **Next.js 14.2.5** (App Router architecture with React 18.3.1) |
| **Language** | **JavaScript / JSX (ES6+)** |
| **Styling** | **Vanilla CSS Design Tokens** (`globals.css` with 100+ responsive CSS variables) |
| **Backend API** | **Express.js 4.19.2** (Node.js REST API with modular controllers and routes) |
| **Primary Cloud Database** | **Supabase Cloud (PostgreSQL)** via `@supabase/supabase-js 2.45.4` |
| **Local Database** | **MongoDB / Mongoose 8.5.1** (Configured local database alternative) |
| **Authentication** | **Supabase Auth** (Email/Password session persistence, RLS integration) |
| **State Management** | **React Context API** (`AppContext.jsx` managing user sessions and UI states) |
| **Payment Gateway** | **Stripe Escrow Simulation** + **UPI Fast Pay** |
| **Reference Prototype** | **Project-3** (Vanilla HTML5, CSS3, and ES6 JavaScript single-page implementation) |
| **Icons & Typography** | **Plus Jakarta Sans** (Google Fonts) & Native UTF-8 Glyphs |

---

## 14. Project Structure

```
Project/
├── README.md                           # Master Project Documentation (Single Source of Truth)
├── addme.md                            # Feature specifications and design requirements
│
├── frontend/                           # Next.js 14 Production Frontend
│   ├── public/                         # Static assets and avatars
│   │   ├── avatar.png                  # Default male profile avatar
│   │   ├── avatar-female.png           # Default female profile avatar
│   │   ├── avatar-neutral.svg          # Default unisex/neutral vector avatar
│   │   └── avatars/                    # High-resolution avatar assets
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css             # Comprehensive design tokens, utilities & themes
│   │   │   ├── layout.jsx              # Root layout with AppProvider & dynamic metadata
│   │   │   └── page.jsx                # Dynamic view router orchestrating all views
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── MaintenanceChatWidget.jsx # 24/7 in-app floating maintenance assistant
│   │   │   │   └── Toast.jsx           # Transient notification alert toaster
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx          # Header navigation, avatar menu & role switcher
│   │   │   │   └── BottomNav.jsx       # Mobile bottom navigation bar
│   │   │   ├── modals/                 # 18 Modular modals & interactive overlays
│   │   │   │   ├── AddPropertyModal.jsx
│   │   │   │   ├── AuthModal.jsx       # Sign-in & sign-up modal
│   │   │   │   ├── CheckoutModal.jsx   # 6-step accommodation checkout flow
│   │   │   │   ├── MatchCelebrationModal.jsx
│   │   │   │   ├── NotificationDrawer.jsx
│   │   │   │   ├── PayRentModal.jsx    # UPI Fast Pay modal
│   │   │   │   ├── ProfileCompletionModal.jsx
│   │   │   │   ├── ProfileModal.jsx    # DigiLocker KYC profile viewer
│   │   │   │   ├── ProofVaultModal.jsx # Move-in/out photographic checklist
│   │   │   │   ├── PropertyDetailsModal.jsx # Detail modal with cost slider
│   │   │   │   ├── ReportIssueModal.jsx
│   │   │   │   ├── RoleSelectModal.jsx # Permanent role chooser (Tenant/Owner)
│   │   │   │   ├── RoommateContractModal.jsx
│   │   │   │   ├── RoommateModal.jsx
│   │   │   │   ├── RoommateQuizModal.jsx # 18-question compatibility quiz
│   │   │   │   ├── SplitExpenseModal.jsx
│   │   │   │   ├── StripePaymentModal.jsx # Stripe escrow rent payment
│   │   │   │   └── UtilityVerificationModal.jsx
│   │   │   └── views/                  # 8 Full-screen interactive application views
│   │   │       ├── AgreementView.jsx   # Plain-English digital lease agreement
│   │   │       ├── DashboardView.jsx   # Active Tenancy Hub
│   │   │       ├── DiscoveryView.jsx   # Space discovery with map & filters
│   │   │       ├── LandingView.jsx     # Hero landing page & guarantees
│   │   │       ├── MaintenanceView.jsx # Maintenance & repair tracking hub
│   │   │       ├── OwnerView.jsx       # 10-module landlord control center
│   │   │       ├── RoommatesView.jsx   # Tinder-style roommate matching deck
│   │   │       └── ValuationView.jsx   # Algorithmic Fair Rent "ValueIQ" calculator
│   │   ├── context/
│   │   │   └── AppContext.jsx          # Global React state, auth listeners & avatar logic
│   │   └── services/
│   │       ├── api.js                  # Multi-tier API client (Supabase -> Express -> Mock)
│   │       ├── compatibilityEngine.js  # 14-dimension weighted compatibility algorithm
│   │       ├── mockData.js             # Offline resilient JSON fixture fallback
│   │       └── supabaseClient.js       # Initialized Supabase client instance
│   ├── .env.example                    # Sample frontend environment configuration
│   ├── .env.local                      # Preconfigured cloud credentials
│   ├── next.config.js                  # Next.js bundler and image config
│   └── package.json                    # Frontend dependencies and dev scripts
│
├── backend/                            # Express.js REST API
│   ├── config/
│   │   ├── db.js                       # Mongoose MongoDB connection handler
│   │   └── supabase.js                 # Backend Supabase client initialization
│   ├── controllers/                    # 15 Business logic controllers
│   │   ├── agreementController.js
│   │   ├── authController.js           # Registration, login & profile handling
│   │   ├── contractController.js
│   │   ├── expenseController.js
│   │   ├── maintenanceBotController.js
│   │   ├── neighborhoodController.js
│   │   ├── notificationController.js
│   │   ├── ownerController.js
│   │   ├── paymentController.js
│   │   ├── proofVaultController.js
│   │   ├── propertyController.js
│   │   ├── roommateController.js
│   │   ├── ticketController.js
│   │   ├── valuationController.js
│   │   └── verificationController.js
│   ├── models/                         # 7 Mongoose Schemas (MongoDB)
│   │   ├── AgreementClause.js
│   │   ├── Expense.js
│   │   ├── Notification.js
│   │   ├── OwnerProperty.js
│   │   ├── Property.js
│   │   ├── Roommate.js
│   │   └── Ticket.js
│   ├── routes/                         # 16 Express REST route definitions
│   ├── seed/
│   │   ├── data.json                   # Initial database seed fixtures
│   │   └── seedData.js                 # MongoDB automated seeding script
│   ├── .env                            # Backend environment configuration
│   ├── .env.example
│   ├── package.json                    # Backend dependencies and nodemon scripts
│   └── server.js                       # Express app entry point & middleware setup
│
└── Project-3/                          # Reference Single-Page Prototype
    ├── css/style.css                   # Complete design system styles
    ├── images/avatars/                 # Gender-specific avatar assets
    ├── js/
    │   ├── app.js                      # Prototype client application logic
    │   ├── compatibility.js            # Standalone prototype compatibility engine
    │   └── data.js                     # Global dataset fixtures
    └── index.html                      # Standalone single-page prototype
```

---

## 15. Database & Supabase Architecture

Nestera connects directly to a live **Supabase PostgreSQL** cloud database (`flzbgvhampusyphopqax.supabase.co`) while maintaining full compatibility with Express/MongoDB.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SUPABASE POSTGRESQL SCHEMA                            │
├──────────────────────────┬──────────────────────────────────────────────────┤
│ Table Name               │ Core Purpose & Queried Columns                   │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `profiles`               │ User records: `id`, `full_name`, `email`, `phone`│
│                          │ `role`, `gender`, `date_of_birth`, `avatar_url`  │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `properties`             │ Listings: `id`, `title`, `locality`, `city`,     │
│                          │ `rent`, `deposit`, `carpet_area`, `amenities`,   │
│                          │ `images`, `true_cost`, `transparency_score`      │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `roommates`              │ Roommate profiles: `id`, `name`, `age`, `gender`,│
│                          │ `role`, `budget`, `lifestyle`, `tags`, `about`   │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `roommate_preferences`   │ Questionnaire answers: 18 lifestyle fields,      │
│                          │ `user_id`, `monthly_budget`, `quiz_completed`    │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `roommate_contracts`     │ Co-living charters: `property_id`, `roommates`,  │
│                          │ `rent_split`, `utilities`, `chores`, `signatures`│
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `shared_expenses`        │ Flatmate ledger: `title`, `total_amount`,        │
│                          │ `category`, `paid_by`, `split_between`, `status` │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `maintenance_tickets`    │ Repair workflows: `title`, `category`, `urgency`,│
│                          │ `status`, `technician`, `timeline`, `tenant`     │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `notifications`          │ User alerts: `user_id`, `title`, `message`,      │
│                          │ `read`, `action_target`, `action_text`, `type`   │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `owner_properties`       │ Landlord units: `title`, `unit_number`, `rent`,  │
│                          │ `deposit`, `tenant_name`, `status`, `lease_end`  │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `agreement_clauses`      │ Digital leases: `clause_title`, `standard_legal`,│
│                          │ `plain_english`, `highlight_value`               │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `proof_vault`            │ Condition proofs: `property_id`, `room`, `notes`,│
│                          │ `item_name`, `condition`, `photo_url`, `status`  │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `payments`               │ Transactions: `property_id`, `amount`, `status`, │
│                          │ `payment_method`, `invoice_url`, `paid_at`       │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `applications`           │ Tenant applications: `applicant_name`, `email`,  │
│                          │ `phone`, `aadhaar_verified`, `status`            │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `verification_documents` │ Deed/utility checks: `property_id`, `doc_type`,  │
│                          │ `consumer_number`, `verification_status`         │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `neighborhood_metrics`   │ Sub-registrar market comps: `locality`, `rent`,  │
│                          │ `price_per_sqft`, `transit_score`, `safety_score`│
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `verified_reviews`       │ Past tenant reviews: `ratings`, `comment`,       │
│                          │ `tenant_name`, `owner_response`                  │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

---

## 16. Authentication Flow

```
1. ROLE SELECTION (Pre-Auth)
   User clicks "Join Nestera" ──► RoleSelectModal.jsx
   ├── Select "Find Accommodation & Roommates" ──► Role = 'tenant'
   └── Select "List & Manage Properties"       ──► Role = 'owner'
   (Role is locked into selectedPreRole & permanent storage)

2. SIGN UP WORKFLOW
   AuthModal.jsx (Mode: 'signup')
   ├── Collects: Full Name, Email, Password, Confirm Password, Phone
   ├── Collects: Gender (Male / Female / Prefer not to say)
   ├── Collects: Date of Birth (Validated against future dates)
   └── Validates Terms & 0% Brokerage Policy
         │
         ▼
   Supabase Auth / Express /api/auth/register
   ├── Inserts user record into Supabase Auth & 'profiles' table
   ├── Assigns gender-based default avatar
   └── Persists session in localStorage ('Nestera_auth_user')

3. SIGN IN WORKFLOW
   AuthModal.jsx (Mode: 'login')
   ├── Form contains ONLY: Email and Password
   ├── Authenticates session via Supabase / Local verification
   ├── Loads user profile and permanent role from 'profiles'
   └── Route user to Dashboard (Tenant Hub or Owner Hub)

4. PROFILE COMPLETION SAFEGUARD
   If existing user account has null gender or date_of_birth:
   └── Automatically opens ProfileCompletionModal.jsx to gently complete records.
```

---

## 17. Environment Variables

### Backend (`backend/.env`)
| Variable | Purpose | Status |
|:---|:---|:---|
| `PORT` | Local Express server port (Default: `5000`) | Optional |
| `NODE_ENV` | Environment runtime flag (`development` / `production`) | Optional |
| `CLIENT_URL` | Permitted CORS frontend origin (Default: `http://localhost:3000`) | Required |
| `MONGO_URI` | MongoDB connection URI (`mongodb://127.0.0.1:27017/Nestera_db`) | Optional (fallback) |
| `SUPABASE_URL` | Supabase cloud endpoint URL | **Required** |
| `SUPABASE_ANON_KEY` | Public anonymous Supabase key | **Required** |

### Frontend (`frontend/.env.local`)
| Variable | Purpose | Status |
|:---|:---|:---|
| `NEXT_PUBLIC_API_URL` | Base endpoint for Express backend (`http://localhost:5000/api`) | Optional |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase cloud project URL | **Required** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public API key | **Required** |

> **Security Note**: Never commit service-role keys, database passwords, or private Stripe credentials to public git repositories.

---

## 18. Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com) (v9 or higher)
- Active internet connection for Supabase cloud PostgreSQL syncing.

### 1. Clone the Repository
```bash
git clone https://github.com/VirRadadiya/Tech-shafters.git
cd Tech-shafters
```

### 2. Configure Environment Files
Preconfigured files are provided. Verify both `.env` configurations:
```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration
cp frontend/.env.example frontend/.env.local
```

### 3. Start the Backend API (Express)
```bash
cd backend
npm install
npm run dev
```
*The backend REST API initializes at `http://localhost:5000` and verifies connectivity to Supabase Cloud.*

### 4. Start the Frontend (Next.js)
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The Next.js application will launch at `http://localhost:3000`.*

### 5. Running the Reference Single-Page Prototype (Optional)
The project includes a standalone, dependency-free reference prototype in `Project-3/`:
- Open `Project-3/index.html` directly in any modern browser (or use VS Code Live Server).

---

## 19. Supabase Setup

The live project is already configured with Supabase Cloud. To provision your own Supabase instance:

1. **Create Project**: Sign up at [supabase.com](https://supabase.com) and create a new project.
2. **Retrieve API Credentials**: Navigate to **Project Settings → API** and copy:
   - Project URL (`https://your-project.supabase.co`)
   - `anon` / `public` Key
3. **Execute Table Schema**: Run the schema creation queries in the Supabase SQL Editor for all 16 tables listed in the [Database Architecture](#15-database--supabase-architecture) section.
4. **Enable Email Auth**: Under **Authentication → Providers**, ensure Email/Password sign-in is enabled.
5. **Update Environment Files**: Paste your new URL and Anon Key into `backend/.env` and `frontend/.env.local`.

---

## 20. Security

- **Row Level Security (RLS) Ready**: Supabase queries utilize authenticated user session tokens.
- **Client-Side Credential Protection**: Nestera never stores plain-text credit card credentials or bank account passwords. Payments are processed through simulated AES-256 compliant escrow gateways.
- **Immutable Account Attributes**: Permanent roles (`Tenant` vs `Owner`) and user `gender` selections are locked to prevent impersonation or cross-role state pollution.
- **Graceful Failover Resilience**: If remote API endpoints or database connections encounter network timeouts, the frontend seamlessly degrades to verified in-memory fallback fixtures (`mockData.js`) so the user experience is never interrupted.

---

## 21. User Flows

### Tenant User Journey
```
1. Landing Page (Explore zero-brokerage guarantees & cost sliders)
       │
2. Sign Up / Sign In (Select 'Tenant', enter gender, date of birth)
       │
3. Space Discovery (Filter by campus proximity, duration, true living cost)
       │
4. Accommodation Booking (6-step transparent checkout & KYC)
       │
5. Roommate Matching (Take 18-question quiz, view match %, swipe deck)
       │
6. Tenancy Management (Pay rent, split utility bills, report repairs, open Proof Vault)
```

### Owner User Journey
```
1. Landing Page ──► Role Selection ("List & Manage Properties" ──► 'Owner')
       │
2. Sign Up / Sign In (Authenticated as Verified Host)
       │
3. Owner Control Center
       ├── Add Property (Submit unit with carpet area, rent, photos)
       ├── Screen Applications (Review tenant Aadhaar verification & accept/decline)
       ├── Track Rent Collections (Inspect paid vs pending payments)
       ├── Dispatch Maintenance (Advance 5-stage repair SLA timeline)
       └── Monitor Portfolio Analytics (Occupancy %, gross revenue)
```

---

## 22. Compatibility Matching Flow

```
[Tenant Opens Roommates View]
          │
          ▼
[Is Quiz Completed?]
  ├── NO  ──► Display 75% baseline with "Pending quiz completion" badge
  │           User clicks "Take Compatibility Quiz" ──► RoommateQuizModal.jsx
  └── YES ──► Compatibility Engine executes automatically
                    │
                    ▼
          [14-Factor Scoring Computation]
          • Food (15 pts) + Budget (12 pts) + Cleanliness (10 pts)
          • Sleep (10 pts) + Smoking (8 pts) + Personality (8 pts)
          • Relationship (8 pts) + Drinking (7 pts) + Sound (7 pts)
          • Location (5 pts) + Pets (5 pts) + Space (5 pts)
          • Occupation (3 pts) + Age (2 pts)
                    │
                    ▼
          [Normalized to 100% Score (Clamped 35% - 98%)]
          [Apply Gender Preference Penalty if applicable]
                    │
                    ▼
          [Generate Match Explanation Tags]
          (e.g., "Identical cleanliness standards", "Budget aligns within ₹1,500")
                    │
                    ▼
          [Card Deck Displayed: Match / Pass / Connect]
```

---

## 23. Screens & UI Overview

### 8 Full-Screen Views
1. `LandingView.jsx`: Hero search, zero-brokerage comparison cards, live property carousel.
2. `DiscoveryView.jsx`: Split-screen property discovery with Ahmedabad map pins and filter bar.
3. `RoommatesView.jsx`: Tinder-style roommate cards with swipe controls and compatibility tags.
4. `DashboardView.jsx`: Active Tenancy Hub with rent countdown, deposit escrow, and expense splitter.
5. `MaintenanceView.jsx`: 24/7 service dispatch tracker with 5-stage SLA timelines.
6. `ValuationView.jsx`: Algorithmic Fair Rent "ValueIQ" benchmark calculator.
7. `AgreementView.jsx`: Plain-English legal lease translator with Aadhaar eSign.
8. `OwnerView.jsx`: 10-subpanel landlord portfolio management hub.

### 18 Interactive Modals & Drawers
1. `RoleSelectModal.jsx`: Pre-signup role selection (`Tenant` vs `Owner`).
2. `AuthModal.jsx`: Authenticated sign-up and sign-in.
3. `ProfileCompletionModal.jsx`: Demographic completion safeguard.
4. `CheckoutModal.jsx`: 6-step accommodation booking and payment flow.
5. `PropertyDetailsModal.jsx`: Image gallery and interactive living cost slider.
6. `RoommateQuizModal.jsx`: 18-question multi-step compatibility quiz.
7. `RoommateModal.jsx`: Detailed roommate profile inspection modal.
8. `MatchCelebrationModal.jsx`: Mutual roommate match celebration overlay.
9. `RoommateContractModal.jsx`: Roommate Constitution flatmate charter.
10. `PayRentModal.jsx`: Fast UPI rent payment QR code generator.
11. `StripePaymentModal.jsx`: Stripe Escrow card rent settlement.
12. `SplitExpenseModal.jsx`: Shared flat expense creator.
13. `ProofVaultModal.jsx`: Move-in / move-out photographic inspection evidence.
14. `ReportIssueModal.jsx`: Rapid maintenance issue submission modal.
15. `AddPropertyModal.jsx`: Owner property listing form.
16. `NotificationDrawer.jsx`: Slide-out alert and deep-linking center.
17. `ProfileModal.jsx`: DigiLocker verified identity credential modal.
18. `UtilityVerificationModal.jsx`: Landlord ownership deed verification modal.

---

## 24. Responsive Design

Nestera is built with a responsive design system supporting:
- **Mobile Handsets (< 640px)**: Bottom navigation bar (`BottomNav.jsx`), touch-friendly swipe cards, full-width modal drawers, and single-column listing stacks.
- **Tablets (641px – 1024px)**: Adaptive grid layouts, collapsible filter bars, and touch-optimized form inputs.
- **Desktop (1025px+)**: Dual-pane map and card layouts, multi-column KPI grids, sticky filter headers, and desktop navigation headers with user avatar drop-downs.

---

## 25. Error Handling & Loading States

- **Visual Toaster Alerts**: System-wide toast notification system (`showToast`) indicating `success`, `error`, `warning`, and `info` events with auto-dismiss timers.
- **Non-Blocking Form Validations**: Instant feedback for passwords shorter than 6 characters, invalid email formats, and future birth dates.
- **Fallback Loading Skeletons**: Smooth spinner and skeleton states while fetching property datasets.
- **Graceful Network Fallback**: If backend endpoints or cloud databases are unreachable, the client displays a non-intrusive notification and switches to local mock fixtures.

---

## 26. Scripts

### Frontend Scripts (`frontend/package.json`)
| Command | Purpose |
|:---|:---|
| `npm run dev` | Launches the Next.js development server on `http://localhost:3000` |
| `npm run build` | Compiles and builds the production Next.js bundle |
| `npm run start` | Launches the production Next.js server |
| `npm run lint` | Executes ESLint analysis to verify code quality |

### Backend Scripts (`backend/package.json`)
| Command | Purpose |
|:---|:---|
| `npm run dev` | Starts Express server with `nodemon` auto-reload on port 5000 |
| `npm run start` | Runs the production Express server (`node server.js`) |
| `npm run seed` | Executes the MongoDB automated database seeder (`seedData.js`) |

---

## 27. Testing

- **Automated Tests**: No external test suites (Jest/Cypress) are currently configured in `package.json`.
- **Manual End-to-End Verification Procedures**:
  1. *Role Switching*: Navigate between Tenant view and Owner view using the role switcher in the navbar.
  2. *Authentication Test*: Register a new user with Gender and Date of Birth; confirm gender avatar fallback behaves as expected (`avatar-female.png`, `/avatar.png`, or `avatar-neutral.svg`).
  3. *Compatibility Quiz*: Complete all 18 questions in `RoommateQuizModal`; verify that roommate match percentages update deterministically.
  4. *Maintenance Bot Relay*: Send a repair message (e.g., *"geyser leaking"*) in the floating chat widget; verify ticket creation and technician assignment.
  5. *Checkout & Escrow*: Complete the 6-step accommodation checkout and confirm the transaction receipt is displayed.

---

## 28. Deployment

Nestera is architected for cloud deployment:

- **Frontend (Next.js)**:
  - Recommended Host: [Vercel](https://vercel.com)
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Required Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`
- **Backend (Express)**:
  - Recommended Host: [Render](https://render.com), [Railway](https://railway.app), or [Heroku](https://heroku.com)
  - Start Command: `npm run start`
  - Required Environment Variables: `PORT`, `CLIENT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- **Database**:
  - Hosted directly on **Supabase Cloud (PostgreSQL)**.

---

## 29. Known Limitations

- **Stripe Gateway Simulation**: Payment processing uses an escrow simulation flow. Integrating production credit card charges requires your live `STRIPE_SECRET_KEY` and client tokens.
- **Aadhaar DigiLocker eSign**: The Aadhaar OTP signature and verification workflow operates in demo verification mode.
- **Real-Time WhatsApp API**: WhatsApp dispatch links use the `https://wa.me/` direct URL schema. Automated enterprise WhatsApp Business messaging requires Meta Cloud API webhooks.
- **Local MongoDB Dependency**: Local MongoDB is optional; the platform defaults to Supabase Cloud and local in-memory fallbacks when MongoDB is not running locally.

---

## 30. Future Improvements

1. **Native Mobile Application**: Porting core views to React Native / Flutter for push-enabled mobile notifications.
2. **Open Banking UPI Autopay**: Automated recurring rent debits using RBI e-Mandate protocols.
3. **AI Vision Condition Scanner**: Automated inspection comparing move-in vs move-out photos using Gemini Vision API to score room condition changes.
4. **Sub-Registrar Digital Registry**: Direct API integration with municipal land record databases for instant title verification.

---

## 31. Hackathon & Project Context

**Nestera** was built as a solution for the **PropTech: Next-Gen Real Estate & Living Space Management** challenge.

It directly addresses the friction of university and youth housing by combining:
- Algorithmic fairness in roommate matching.
- Elimination of broker rent seeking.
- Plain-English legal accessibility.
- Financial escrow security for tenant security deposits.

---

## 32. Contributors & Author

- **Het Darji** — *Lead Full-Stack Architect & Developer* ([GitHub](https://github.com/VirRadadiya))

---

*Nestera PropTech Platform — Designed and engineered for radical transparency in modern urban living.*
