# PsyConnect - Detailed Project Map

This document provides a comprehensive technical breakdown of the PsyConnect platform, including its frontend architecture, backend routing, database schema, and core logic flows.

---

## 🖥️ Frontend Architecture

**Total Pages**: 9
**Core Technology**: HTML5, Vanilla CSS3, Vanilla JavaScript (ES6+), Socket.io-client, WebRTC.

### 📄 Page Inventory
| File Name | Role | Primary Goal |
| :--- | :--- | :--- |
| `index.html` | **Public Home** | Landing page, Hero section, and Doctor Directory. |
| `login.html` | **Authentication** | Secure entry point for all users. |
| `register.html` | **Registration** | Patient-only registration form. |
| `admin-dashboard.html` | **Admin Workspace** | Statistics, Management (Doctors/Admins/Patients), PDF Reporting. |
| `doctor-chat.html` | **Doctor Interface** | Real-time chat, Video call, and Prescription management. |
| `patient-chat.html` | **Patient Interface** | Real-time chat, Video call, and Viewing prescriptions. |
| `profile.html` | **Settings** | Personal info management and Secure password change. |
| `patient-dashboard.html` | **Patient Hub** | (Internal) Quick overview for patient activity. |
| `translations.json` | **i18n Asset** | The complete dictionary for EN, FR, and AR. |

---

## 🛡️ Backend API Map

**Total Route Categories**: 6
**Total Individual Endpoints**: ~18

### 1. Authentication (`/api/auth`)
*   `POST /register`: Registers a new patient.
*   `POST /login`: Validates credentials and returns a JWT token.

### 2. Admin Management (`/api/admin`)
*   `POST /create-doctor`: (Admin) Creates a new specialist account.
*   `POST /create-admin`: (Super Admin) Creates a new admin account.
*   `GET /dashboard`: Fetches global platform statistics.
*   `GET /doctors`: List of all doctors for management.
*   `GET /patients`: List of all registered patients.
*   `GET /admins`: List of all admins (Super Admin view).
*   `DELETE /doctors/:id`: Removes a doctor account.
*   `DELETE /patients/:id`: Removes a patient account.

### 3. Patient Portal (`/api/patient`)
*   `GET /doctors`: Publicly safe list of specialists for the directory.

### 4. User Profile (`/api/user`)
*   `PUT /profile`: Updates name or password (requires JWT).

### 5. Messaging System (`/api/messages`)
*   `POST /`: Sends a new encrypted message.
*   `GET /conversations`: Returns a list of all active chat threads.
*   `GET /:userId`: Fetches the message history between two users.

### 6. Prescription System (`/api/prescriptions`)
*   `POST /`: (Doctor) Issues a new digital prescription.
*   `GET /patient/:patientId`: Retrieves all prescriptions for a specific patient.

---

## 🗄️ Database Schema (MongoDB/Mongoose)

### 👤 User Model
*   `firstName`, `lastName`, `email`, `phone`, `password` (Hashed).
*   `role`: `patient` (Default), `doctor`, `admin`.
*   `isSuperAdmin`: Boolean (Access to Admin management).

### 💬 Message Model
*   `sender` (User Ref), `receiver` (User Ref), `content`.
*   `createdAt` (Automatic timestamping for order).

### 📜 Prescription Model
*   `doctor` (User Ref), `patient` (User Ref).
*   `medicines`: Array of `{ name, dosage, duration, notes }`.
*   `instructions`: General medical notes from the doctor.
*   `date`: Record date.

---

## 🔄 Core Logic Flows

### 🔑 The Login Flow
1.  **Request**: User submits Email/Password via `login.html`.
2.  **Verification**: Backend (`authController.js`) compares the input with the hashed DB password using `bcrypt`.
3.  **Token**: On success, an **8-hour JWT (JSON Web Token)** is generated.
4.  **Storage**: The Frontend saves the `token` and `user` object in `localStorage`.
5.  **Redirect**: 
    - Admin $\to$ `admin-dashboard.html`
    - Doctor $\to$ `doctor-chat.html`
    - Patient $\to$ `index.html` (or `patient-chat.html`)

### 🌍 Multi-language Engine
1.  **Init**: `i18n.js` loads `translations.json` on page start.
2.  **Detection**: Reads `localStorage.getItem('lang')` (Default: FR).
3.  **DOM Update**: Scans for `data-i18n` attributes and replaces inner text with the dictionary value.
4.  **RTL Switch**: If Arabic (`ar`), sets `document.documentElement.dir = 'rtl'` and flips navigation elements.

### 🏥 Prescription Process
1.  **Input**: Doctor fills out form in `doctor-chat.html`.
2.  **Save**: API stores the prescription linked to the patient ID.
3.  **Notify**: Patient sees new record in `patient-chat.html`.
4.  **Export**: `html2pdf.js` generates a professional medical document on-the-fly for download.

---

## 🛠️ Global Functions & Utilities
*   **`logout()`**: Clears `localStorage` and redirects to `index.html`.
*   **`auth` middleware**: Verifies the JWT on every restricted API call.
*   **Signaling Server**: WebSocket logic in `server.js` that handles peer-to-peer WebRTC connections for video privacy.
