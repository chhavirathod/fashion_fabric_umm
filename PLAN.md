# UMMS — Uniform Measurement Management System
## Internal Project Plan v1.0 | Fashion Fabric | March 2026

---

## 1. Project Overview

A private internal web tool for **Fashion Fabric** — a uniform supplier — to digitise the entire measurement collection workflow across hotels and large institutions.

**Data Flow:** Client/Hotel → Department → Employee → Uniform Type → Measurements

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React + Vite | SPA, mobile-first |
| Styling | Tailwind CSS | Utility-first, responsive |
| State | React Context + useReducer | Auth + App state |
| Routing | React Router v6 | Protected routes |
| Tables/Export | xlsx + file-saver | Excel/CSV download |
| Units | JS conversion logic | Inches ↔ CM |
| Backend (Phase 2) | Node.js REST API | Auth, CRUD |
| Auth (Phase 2) | Supabase Auth + Google OAuth | Row-level security |
| Database (Phase 2) | PostgreSQL on Supabase | Relational schema |
| Hosting | Vercel (FE) + Supabase (BE) | CI/CD via GitHub |

---

## 3. Folder Structure

```
umms/
├── public/
├── src/
│   ├── components/
│   │   ├── admin/          # Admin-specific components
│   │   ├── staff/          # Staff-specific components
│   │   └── shared/         # Reusable UI components
│   ├── pages/
│   │   ├── admin/          # Admin route pages
│   │   └── staff/          # Staff route pages
│   ├── context/            # AuthContext, AppContext
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Conversion, export helpers
│   └── data/               # Static seed data, constants
├── PLAN.md
└── package.json
```

---

## 4. Roles & Access

### Super Admin
- Full access to all hotels, departments, employees
- Can add/edit/archive Hotels & Departments
- Can view all measurement data
- Can export data (Excel/CSV) — filtered by hotel, department, role
- Can manage Staff accounts (Phase 2 — Supabase Auth)

### Staff
- Login → Select assigned hotel → Select department
- Add/edit employee measurements
- View measurements they've entered
- Cannot access admin dashboard or other hotels

---

## 5. Client Verticals (from image)

Fashion Fabric's clients span 7 industry verticals. Each has preset department templates:

| Vertical | Preset Departments |
|---|---|
| **Hospitality** | Front Desk, Housekeeping, Concierge, Bell Staff, Security, Management |
| **Restaurant & Chef** | Kitchen (Chef), Kitchen (Sous Chef), Serving Staff, Bar Staff, Host/Hostess |
| **Spa / Salons** | Therapist, Receptionist, Cleaning Staff, Management |
| **Healthcare** | Doctors, Nurses, Ward Staff, Admin Staff, Housekeeping |
| **Airline** | Cabin Crew, Ground Staff, Check-in Staff, Security, Cargo |
| **Corporate** | Management, Executive, Admin, Security, Housekeeping |
| **Schools** | Teaching Staff, Admin, Housekeeping, Security, Sports Staff |

---

## 6. Uniform Types & Measurement Fields

### Uniform Types (configurable per hotel)
- Shirt / Blouse
- Blazer / Jacket
- Trousers / Skirt
- Apron
- Chef Coat
- Full Suit
- Saree / Salwar (optional)
- Shoes
- Cap / Hat

### Measurement Fields (by uniform type)
**Upper Body (Shirt/Blouse/Blazer/Chef Coat):**
- Chest, Shoulder Width, Sleeve Length, Collar/Neck, Shirt Length

**Lower Body (Trousers/Skirt):**
- Waist, Hip, Inseam, Outseam, Thigh

**Full Body / Suit:**
- All of the above

**Shoes:**
- UK Size, Length (cm/in)

**Apron:**
- Length, Waist tie length

---

## 7. Module Breakdown

### Module 1 — Auth (Frontend shells, Supabase in Phase 2)
- Login page (email + password)
- Google OAuth button (wired in Phase 2)
- Role-based route guards
- Session persistence via localStorage (mock) → Supabase session (Phase 2)

### Module 2 — Hotel & Department Management (Admin)
- Hotels list with search, filter by vertical/industry type
- Add/Edit Hotel modal (name, address, contact, vertical type)
- Departments per hotel (add/edit/archive)
- Preset department templates per vertical

### Module 3 — Employee Management
- Employee list per department
- Add employee: Name, Gender, Role, Employee ID (auto-generated), Photo (Phase 2)
- Bulk CSV import (Phase 2)
- Status badge: Pending / Measured / In Production / Completed

### Module 4 — Uniform Configuration
- Per-hotel uniform types toggle
- Configure which measurement fields are required per uniform type
- Saved per hotel

### Module 5 — Measurement Entry (Staff)
- Flow: Select Hotel → Department → Employee → Uniform Type → Enter Measurements
- Default unit: Inches
- Unit toggle dropdown (Inches / Centimetres)
- Real-time conversion
- Auto-timestamp, staff ID logged
- Multiple uniforms per employee
- Edit anytime

### Module 6 — Order Status & Dashboard (Admin)
- Summary cards: Total Hotels, Total Employees, % Measured, Pending
- Per-hotel completion ring/progress bar
- Employee status table with filters
- Status update: Pending → Measured → In Production → Completed

### Module 7 — Export & Print
- Export buttons: Download CSV, Download Excel (.xlsx)
- Filter before export: by Hotel, Department, Role, Status
- Print-ready measurement sheet (formatted table, browser print)

---

## 8. API Endpoint Map (Phase 2 — Node.js + Supabase)

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/hotels
POST   /api/hotels
PUT    /api/hotels/:id
DELETE /api/hotels/:id

GET    /api/hotels/:id/departments
POST   /api/hotels/:id/departments
PUT    /api/departments/:id
DELETE /api/departments/:id

GET    /api/departments/:id/employees
POST   /api/departments/:id/employees
PUT    /api/employees/:id
DELETE /api/employees/:id

GET    /api/employees/:id/measurements
POST   /api/employees/:id/measurements
PUT    /api/measurements/:id
DELETE /api/measurements/:id

GET    /api/export/csv?hotelId=&deptId=&status=
GET    /api/export/excel?hotelId=&deptId=&status=
```

---

## 9. Supabase Schema (Phase 2)

```sql
-- roles: super_admin, staff
users (id, email, role, assigned_hotel_id, created_at)

hotels (id, name, address, contact, vertical_type, is_active, created_at)

departments (id, hotel_id, name, is_active, created_at)

employees (id, department_id, hotel_id, name, gender, role, emp_code, status, created_at)

uniform_types (id, hotel_id, name, is_active)

measurement_fields (id, uniform_type_id, field_name, display_order)

measurements (id, employee_id, uniform_type_id, field_id, value_inches, value_cm, recorded_by, recorded_at, updated_at)
```

---

## 10. Delivery Timeline

| Week | Phase | Deliverables |
|---|---|---|
| Week 1 | Discovery & Setup | Requirements, DB schema, wireframes, project setup ✅ |
| Week 2 | Core Modules | Auth, hotel/department mgmt, employee module |
| Week 3 | Measurement System | Uniform config, measurement entry, validation |
| Week 4 | Tracking & Export | Dashboard, order status, CSV/Excel export |
| Week 5 | Testing & Polish | E2E testing, responsive QA, bug fixes |
| Week 6 | Deploy & Handover | Production deploy, docs, handover session |

---

## 11. Team Rules (per brief)
- All client communication via **Piyush only**
- Written milestone sign-off before next phase
- 2 business days feedback window for client
- 30 days post-launch bug support (no new features)
- All features through code review before merge to main

---

*DevHub | Internal | March 2026*
