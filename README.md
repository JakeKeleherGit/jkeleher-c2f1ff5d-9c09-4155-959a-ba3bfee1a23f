# Turbovets Task Management System

A **full-stack secure task management system** built for the TurboVets engineering challenge. The system implements **role-based access control (RBAC)**, JWT authentication, organizational data scoping, audit logging, and a dynamic Angular frontend — all within a modular **NX monorepo**.

---

## 🚀 Overview

### 🧩 Tech Stack

**Backend:** NestJS, TypeORM, JWT, SQLite
**Frontend:** Angular (standalone components), Tailwind-inspired CSS
**Monorepo:** NX Workspace
**Database:** SQLite (local, simple setup)

### 🔐 Core Features

* Role-Based Access Control (**owner**, **admin**, **viewer**)
* JWT Authentication with NestJS Guards
* Organization-scoped CRUD for Tasks
* Audit Logging for create/update/delete actions
* Angular Frontend with:

  * Login and persistent JWT session
  * Task creation, filtering, sorting
  * Role-based UI permissions
  * Drag & Drop task reordering
  * Audit Log view

---

## 🗂 Monorepo Structure

```
apps/
 ├─ api/           → NestJS backend (Auth, Tasks, Audit)
 └─ dashboard/     → Angular frontend

libs/
 ├─ auth/          → Reusable RBAC decorators & logic
 └─ data/          → Shared DTOs & interfaces (front + back)
```

---

## ⚙️ Setup & Running

### 1️⃣ Install dependencies
⚙️ 1. Ensure You Are in the Project Directory

Before running any commands, make sure you are in the root directory of the project — the one that contains the package.json file.
- cd jkeleher-c2f1ff5d-9c09-4155-959a-ba3bfee1a23f

To verify, run:
ls

You should see files like package.json, nx.json, and folders such as apps/ and libs/.

🟢 2. Ensure Node.js (and npm) Are Installed
Check if Node.js and npm are installed by running:

node -v
npm -v


If either command returns “command not found,” install Node.js using Homebrew
 or the official Node.js website
:

With Homebrew:
brew install node

Once installed, verify:
node -v
npm -v

🧩 3. Install Nx (if not already installed)
If you see an error like Unknown command: "nx", install Nx globally:
npm install -g nx


You can verify Nx installation with:
nx --version

🚀 4. Install Dependencies
After confirming Node and Nx are working, install the project dependencies:

```bash
npm install
```
*when installing npm, if you get prompted a y/n, click y*

### 2️⃣ Run backend

```bash
npx nx serve api
```

> Runs NestJS server at `http://localhost:3333`.

### 3️⃣ Run frontend

```bash
npx nx serve dashboard
```

> Runs Angular dashboard at `http://localhost:4200`.

---

## 🧱 Backend Breakdown (NestJS)

### **AuthN & AuthZ (Authentication & Authorization)**

* **Login:** `/auth/login` → validates credentials, returns signed JWT `{ sub, orgId, role, email }`.
* **JWT Guard:** verifies token and attaches `req.user`.
* **Roles Guard + Decorator (@RequireRole)** ensures only correct roles can perform actions.
* **Double-check:** service layer re-validates permissions even if route guard fails.

**Roles:**

| Role   | Permissions                                 |
| ------ | ------------------------------------------- |
| owner  | Full control (create, update, delete, view) |
| admin  | Manage tasks within organization            |
| viewer | Read-only                                   |

### **Tasks Service**

Handles business logic for CRUD and ordering.

* `create()` → adds new task with position ordering.
* `list()` → filters by user's organization.
* `update()` → modifies allowed fields only.
* `remove()` → deletes with role validation.
* `reorder()` → updates task positions after drag-drop.

### **Audit Service**

Lightweight logging for accountability.

* Logs every create/update/delete event with `userId` + `taskId`.
* `GET /audit-log` (admin/owner only) for review.

### **Entities (TypeORM)**

| Entity         | Purpose                              |
| -------------- | ------------------------------------ |
| `Organization` | Group for users/tasks                |
| `User`         | Role, org, email, password hash      |
| `Task`         | Title, category, done flag, position |

### **Seed Data**

At startup (`main.ts`):

* Org: **Acme**
* Users:

  * [owner@acme.test](mailto:owner@acme.test)
  * [admin@acme.test](mailto:admin@acme.test)
  * [viewer@acme.test](mailto:viewer@acme.test)
    (Password: `pass123`)

---

## 💻 Frontend Breakdown (Angular)

### **Bootstrap & Layout**

* **Standalone App** via `bootstrapApplication(AppComponent)` (no NgModule).
* `AppComponent` renders the main layout:

  * Gradient **Turbovets** logo + tagline
  * Centered card containing all routes

### **Routing**

| Route    | Component        | Guard       | Description         |
| -------- | ---------------- | ----------- | ------------------- |
| `/login` | `LoginComponent` | –           | Login form          |
| `/tasks` | `TasksComponent` | ✅ authGuard | Main task dashboard |
| `/audit` | `AuditComponent` | ✅ authGuard | Audit log viewer    |

### **Auth Service & Token Handling**

* `auth.service.ts` → manages login, logout, role helpers, and localStorage.
* `token.interceptor.ts` → attaches `Authorization: Bearer <jwt>` to every request.
* `auth.guard.ts` → redirects to `/login` if no valid token.

### **Tasks Component**

* Displays all tasks with filtering/sorting.
* **Drag & drop** support (`@angular/cdk/drag-drop`).
* Buttons disabled for viewers (UI & API enforced).
* **Logout** button pinned to top-right of card.

### **Audit Component**

Simple, read-only view of actions from `/audit-log`.

### **UI Design**

* **CSS Variables:** reusable color scheme and shadows.
* **Centered layout:** content is vertically + horizontally centered.
* **Gradient logo & tagline:** dynamic brand header.
* **Rounded buttons, soft shadows, focus states** for polish.

---

## 🧩 Shared Libraries

### `libs/auth`

* `require-role.decorator.ts` → `@RequireRole('admin' | 'owner' | 'viewer')`
* `roles.ts` → role constants and types

### `libs/data`

* Shared TypeScript DTOs and interfaces for consistency between backend and frontend.

---

## 🔄 Data Flow Example

### 1. **Login**

1. Angular → `POST /auth/login`
2. NestJS → validates, returns JWT
3. Angular → stores JWT → `TokenInterceptor` adds header automatically

### 2. **Create Task**

1. `POST /tasks` with `{ title, category }`
2. Server → verifies `role`, `orgId`, saves new task, logs audit

### 3. **Toggle Task**

1. `PUT /tasks/:id` with `{ done: true }`
2. Validated and updated by service, logs audit

### 4. **Reorder Tasks**

1. Angular drag-drop changes order
2. `POST /tasks/reorder` → updates all `position`s in DB

### 5. **Audit Log**

1. `GET /audit-log` → returns all task events (admin/owner only)

---

## 🧠 Security & Design Principles

* ✅ **Real JWT Authentication** using NestJS Guards
* ✅ **Defense in depth**: Guards + service checks
* ✅ **Row-level access control** via `orgId`
* ✅ **Role-aware UI**: disables actions on frontend
* ✅ **Scoped audit trail** for transparency
* ✅ **Shared typings** between front/back via `libs/data`

---

## 🧭 Demo Flow

1. Login as `admin@acme.test` / `pass123`.
2. Create tasks in different categories.
3. Toggle done, drag to reorder (persistence confirmed on refresh).
4. Visit **Audit Log** page.
5. Logout → login as `viewer@acme.test`.
6. Confirm viewer cannot modify tasks.

---

## 💡 Next Steps (if extended)

* Add refresh tokens + password reset flow.
* Store audit logs in DB with timestamps.
* Real-time task sync (WebSockets/SSE).
* Org hierarchy with nested permissions.
* E2E testing via Playwright or Cypress.

---

## 🧾 Summary

The **Turbovets Task Management System** demonstrates a secure, production-grade full-stack application with:

* **Clean architecture (NX monorepo)**
* **Strong security model (JWT + RBAC)**
* **Reusable modules (libs/auth, libs/data)**
* **Modern UI (Angular standalone)**

Perfect balance of **backend robustness** and **frontend usability**, built from the ground up for clarity, maintainability, and secure collaboration.
