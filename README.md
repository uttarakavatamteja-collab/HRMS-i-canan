# HRMS Pro — SaaS HR Management System

A scalable, production-ready HRMS application with a premium glassmorphism UI.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS v4   |
| Backend    | Node.js + Express 4                 |
| Database   | PostgreSQL + Knex.js                |
| Auth       | JWT + bcrypt + Role-Based Access    |

## Features

- **Admin Dashboard** — Stats, charts, and recent activity
- **Employee Management** — Full CRUD with search and pagination
- **Attendance Tracking** — Date-wise marking and history
- **Leave Management** — Apply, approve/reject workflow
- **Payroll Module** — Auto-generate, process, and mark as paid
- **Role-Based Access** — Admin, HR, Employee roles with granular permissions

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Database Setup
```bash
createdb hrms_db
```

### 2. Backend
```bash
cd server
cp .env.example .env     # Edit with your DB credentials
npm install
npm run migrate           # Run database migrations
npm run seed              # Seed demo data
npm run dev               # Start server on :5000
```

### 3. Frontend
```bash
cd client
npm install
npm run dev               # Start on :5173
```

### 4. Login
Open [http://localhost:5173](http://localhost:5173) and log in with:
- **Admin:** `admin@hrms.com` / `admin123`
- **HR:** `hr@hrms.com` / `admin123`
- **Employee:** `john@hrms.com` / `employee123`

## Project Structure

```
├── server/
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── controllers/     # Business logic (6 controllers)
│   │   ├── middleware/       # JWT auth + RBAC + error handler
│   │   ├── migrations/      # 6 Knex migration files
│   │   ├── routes/          # 6 Express route modules
│   │   ├── seeds/           # Demo data
│   │   └── app.js           # Express entry point
│   ├── knexfile.js
│   └── package.json
├── client/
│   ├── src/
│   │   ├── api/             # Axios service layer
│   │   ├── components/      # Layout (sidebar + navbar)
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # 6 React pages
│   │   ├── App.jsx          # Router config
│   │   └── index.css        # Design system
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint                 | Auth       | Description             |
|--------|--------------------------|------------|-------------------------|
| POST   | /api/auth/login          | Public     | Login                   |
| POST   | /api/auth/register       | Admin      | Register user           |
| GET    | /api/auth/me             | Auth       | Get current user        |
| GET    | /api/employees           | Auth       | List employees          |
| POST   | /api/employees           | Admin/HR   | Create employee         |
| PUT    | /api/employees/:id       | Admin/HR   | Update employee         |
| DELETE | /api/employees/:id       | Admin      | Delete employee         |
| GET    | /api/attendance          | Auth       | List attendance         |
| POST   | /api/attendance          | Admin/HR   | Mark attendance         |
| POST   | /api/attendance/bulk     | Admin/HR   | Bulk mark attendance    |
| GET    | /api/leaves              | Auth       | List leaves             |
| POST   | /api/leaves              | Auth       | Apply for leave         |
| PUT    | /api/leaves/:id/status   | Admin/HR   | Approve/reject leave    |
| GET    | /api/payroll             | Auth       | List payroll            |
| POST   | /api/payroll/generate    | Admin/HR   | Generate payroll        |
| PUT    | /api/payroll/:id         | Admin/HR   | Update payroll status   |
| GET    | /api/dashboard/stats     | Auth       | Dashboard statistics    |
