# PsyConnect - Technical Component Checklist

This document provides a task-style breakdown of all implemented components, routes, and logical flows within the PsyConnect platform.

## 🖥️ Frontend Page Inventory
- [x] **index.html**: Homepage with Hero section and Doctor directory.
- [x] **login.html**: Secure login form with role-based redirection.
- [x] **register.html**: Patient registration form with validation.
- [x] **admin-dashboard.html**: Statistics, User management, and PDF reporting.
- [x] **doctor-chat.html**: Specialized workspace with WebRTC video and Prescriptions.
- [x] **patient-chat.html**: Communication hub with Prescription viewing and PDF downloads.
- [x] **profile.html**: Centralized profile and password management page.
- [x] **patient-dashboard.html**: (Internal) High-level patient activity hub.
- [x] **translations.json**: Multilingual dictionary (EN, FR, AR).

## 🛡️ Backend API Routes
### Authentication (/api/auth)
- [x] `POST /register`: Creates new patient accounts.
- [x] `POST /login`: Primary authentication entry point.

### Admin Tools (/api/admin)
- [x] `POST /create-doctor`: Specialist account creation.
- [x] `POST /create-admin`: Admin account creation (Super Admin only).
- [x] `GET /dashboard`: Platform overview statistics.
- [x] `GET /doctors`: Management list of all specialists.
- [x] `GET /patients`: Management list of all registered patients.
- [x] `GET /admins`: Management list of all admins (Super Admin only).
- [x] `DELETE /doctors/:id`: Remove specialist access.
- [x] `DELETE /patients/:id`: Remove patient access.

### User & Support (/api/user, /api/patient)
- [x] `PUT /api/user/profile`: Personal settings and password update.
- [x] `GET /api/patient/doctors`: Public-facing specialist list.

### Communication & Medical (/api/messages, /api/prescriptions)
- [x] `POST /api/messages/`: Send real-time messages.
- [x] `GET /api/messages/conversations`: List active chat threads.
- [x] `GET /api/messages/:userId`: Fetch conversation history.
- [x] `POST /api/prescriptions/`: Issue new digital prescriptions.
- [x] `GET /api/prescriptions/patient/:patientId`: Patient medical history.

## 🗄️ Database Schema (Models)
- [x] **User**: Identity, Hashed Password, Role (`patient`, `doctor`, `admin`).
- [x] **Message**: Sender, Receiver, Content, Timestamp.
- [x] **Prescription**: Doctor, Patient, Medicine Array, General Instructions.

## 🔄 Core Functional Flows
### Authentication (Login) Process
- [x] User enters credentials in `login.html`.
- [x] Frontend sends POST request to `/api/auth/login`.
- [x] Backend verifies email exists and password matches (via `bcrypt`).
- [x] Backend generates a secure **JWT token**.
- [x] Frontend stores `token` and `user` data in `localStorage`.
- [x] System redirects according to role:
    - **Admin** → `admin-dashboard.html`
    - **Doctor** → `doctor-chat.html`
    - **Patient** → `index.html` (or `patient-chat.html`)

### Multi-language Logic
- [x] Language preference saved/loaded from `localStorage`.
- [x] `i18n.js` scans page for `data-i18n` attributes.
- [x] Content dynamically replaced from `translations.json`.
- [x] RTL directionality triggered for Arabic (`ar`).

### Medical Consultation Workflow
- [x] Message history loaded via `/api/messages/:userId`.
- [x] Video signaling handled via Socket.io (WebRTC).
- [x] Prescription issued via `/api/prescriptions/`.
- [x] PDF generated in the browser using `html2pdf.js`.
