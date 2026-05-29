# 🚌 CUETGo — University Bus Seat Booking & Management System

[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-purple?style=for-the-badge&logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)

**CUETGo** is a full-stack MERN web application designed for **Chittagong University of Engineering & Technology (CUET)** to modernize the traditional token-based university bus ticketing system. It provides a visual, real-time seat booking platform with role-based access for Students, Supervisors, and Administrators. Key capabilities include visual seat layouts, digital boarding passes with QR codes, supervisor mobile camera QR scanning for attendance marking, and automated point/token allocations.

---

## 🔗 Live Demo

- **Live URL:** [https://cuet-bus-ticket-main.vercel.app/](https://cuet-bus-ticket-main.vercel.app/)
- **GitHub Repository:** [https://github.com/asifhasan973/cuet-bus-ticket](https://github.com/asifhasan973/cuet-bus-ticket)

---

## 🔑 Demo Credentials (Quick Access)

For easy recruiter testing, the login pages contain a **Recruiter Quick Access** banner. Clicking any role's button will automatically pre-fill the credentials and sign you in immediately:

- **Student Dashboard:** `asif@student.cuet.ac.bd` (Click **"Try as Demo Student"** on the Student Login page to log in automatically)
- **Supervisor Dashboard:** `rahman@cuet.ac.bd` (Click **"Try as Demo Supervisor"** on the Supervisor Login page to log in automatically)
- **Admin Dashboard:** `admin@cuet.ac.bd` (Click **"Try as Demo Admin"** on the Supervisor/Admin Login page to log in automatically)

---

## 🚀 Key Features

- **🎫 Visual Seat Grid:** Interactive seat selector (2-aisle-3 bus configuration) with real-time status indicators (Available, Selected, Booked, and "My Booking" color states).
- **📷 Digital Boarding Passes & Mobile QR Scanner:** Confirmed bookings generate boarding passes with unique QR codes. Supervisors scan these tickets with their phone cameras to mark attendance instantly.
- **⚖️ Concurrency-Safe Booking:** Database-level compound unique indexes with partial filter expressions to eliminate race conditions (no double bookings for the same seat).
- **🪙 Atomic Token Lifecycle:** Atomic points decrement checks (`User.findOneAndUpdate`) to prevent negative token balances under high-concurrency requests.
- **🛡️ Secure RBAC & Auth:** Strict JSON Web Token (JWT) sessions and Google OAuth registration/login verified against strict university email domain limits.
- **🌓 Persistent Dark Theme:** Dynamic theme selector utilizing Tailwind CSS v4 custom variants, persisting preference using `localStorage`.

---

## 📷 Screenshots / Visual Proof

- **Landing Page:**
  ![Landing Page](https://raw.githubusercontent.com/asifhasan973/cuet-bus-ticket/main/readme-assets/landing.png)
- **Student Dashboard & QR Boarding Pass:**
  ![Student Dashboard](https://raw.githubusercontent.com/asifhasan973/cuet-bus-ticket/main/readme-assets/dashboard.png)
- **Seat Selector:**
  ![Seat Selector](https://raw.githubusercontent.com/asifhasan973/cuet-bus-ticket/main/readme-assets/seat-booking.png)
- **Supervisor Scanner:**
  ![Supervisor Scanner](https://raw.githubusercontent.com/asifhasan973/cuet-bus-ticket/main/readme-assets/supervisor.png)
- **Admin Bus Management:**
  ![Admin Dashboard](https://raw.githubusercontent.com/asifhasan973/cuet-bus-ticket/main/readme-assets/admin.png)

---

## 🏗️ Architecture & Database Schema

### Database Models

1.  **User Model (`User.js`):**
    - `name` (String): Full name.
    - `email` (String, Unique): Verified institutional email.
    - `role` (String): `'student'`, `'supervisor'`, or `'admin'`.
    - `studentId` / `employeeId` (String): Role-specific identification.
    - `points` (Number): Active token balance for booking rides.
    - `isApproved` (Boolean): supervisor approval flag.
2.  **Bus Model (`Bus.js`):**
    - `busName` (String, Unique): Name of the bus (e.g. _Buriganga_, _Halda_).
    - `busType` (String): `'regular'` or `'flyover'`.
    - `route` (Object): Name and array of stops with ordering.
    - `totalSeats` (Number): Seat capacity (default 50).
    - `supervisors` (Array of ObjectIds): Assigned supervisors.
3.  **Booking Model (`Booking.js`):**
    - `student` (ObjectId, ref User): Student who booked.
    - `bus` (ObjectId, ref Bus): Bus booked.
    - `seatNumber` (Number): Booked seat number.
    - `shift` (Number): Selected shift (1, 2, 3, or 4).
    - `travelDate` (String): Travel date in format `YYYY-MM-DD`.
    - `status` (String): `'confirmed'`, `'cancelled'`, or `'completed'`.
    - `attendance` (String): `'pending'`, `'present'`, or `'absent'`.
    - `isActive` (Boolean): True for active bookings; set to false on cancellation (frees seat constraint).

### Database Indexes (Concurrency Safety)

To ensure high performance and prevent race conditions, the Booking collection has the following indexes:

- `{ bus: 1, travelDate: 1, shift: 1, seatNumber: 1 }` (Unique, Partial filter: `{ isActive: true }`) -> Prevents two users from booking the same seat.
- `{ student: 1, travelDate: 1, shift: 1 }` (Unique, Partial filter: `{ isActive: true }`) -> Prevents a student from booking multiple seats on the same day and shift.
- `{ bus: 1, travelDate: 1, shift: 1, status: 1 }` -> Optimizes bus availability searches.
- `{ student: 1, travelDate: -1 }` -> Optimizes student dashboard history queries.

---

## 🔌 API Endpoints Summary

### 🔐 Authentication (`/api/auth`)

- `POST /api/auth/register` - Registers student or supervisor (requires `@cuet.ac.bd` domain).
- `POST /api/auth/login` - Local email/password login (Rate limited).
- `POST /api/auth/google` - Sign-in/Sign-up using Firebase Google OAuth.
- `GET /api/auth/me` - Fetch authenticated session user details.

### 🚌 Buses (`/api/buses`)

- `GET /api/buses` - List active buses and seat counts.
- `GET /api/buses/:id` - Fetch single bus layout with occupied seats.
- `POST /api/buses` - Create a bus (Admin only).
- `PUT /api/buses/:id` - Edit a bus (Admin only).
- `DELETE /api/buses/:id` - Remove a bus (Admin only).

### 🎫 Bookings (`/api/bookings`)

- `POST /api/bookings` - Create a seat booking (Student only, checks points & index).
- `GET /api/bookings/my` - Fetch booking history of logged-in student.
- `DELETE /api/bookings/:id` - Cancel seat booking and refund points (30m safety window).

### 👨‍🏫 Supervisor (`/api/supervisor`)

- `GET /api/supervisor/buses` - Get buses assigned to supervisor.
- `POST /api/supervisor/attendance` - Mark student attendance (Present: 0 extra points, Absent: 2 penalty points).

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

```env
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
CRON_SECRET=your_cron_secret_for_triggering_points_reset
ALLOWED_ORIGINS=http://localhost:5173,https://cuet-bus-ticket-main.vercel.app
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5001/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 💻 Local Setup & Testing

### Prerequisites

- Node.js (v18+)
- MongoDB Instance / Atlas Cluster

### Step-by-Step Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/asifhasan973/cuet-bus-ticket.git
    cd cuet-bus-ticket
    ```
2.  **Install dependencies in all folders**
    ```bash
    npm run install-all
    ```
3.  **Setup Environment Files**
    - Create `server/.env` based on `server/.env.example`
    - Create `client/.env` based on `client/.env.example`
4.  **Seed Database**
    ```bash
    npm run seed
    ```
5.  **Run Development Server**

    ```bash
    npm run dev
    ```

    - Frontend: `http://localhost:5173`
    - Backend: `http://localhost:5001`

### Running Integration Tests

The project contains Jest and Supertest suites for API route and controller validation.

```bash
cd server
npm test
```

---

## 🛡️ Security & Performance Best Practices

- **Helmet.js:** Configures secure HTTP response headers to defend against common web vulnerabilities.
- **Express Rate Limiter:** Applied on authentication routes to mitigate brute-force attacks.
- **MongoDB Sanitization:** Sanitizes client-supplied inputs via `express-mongo-sanitize` to protect against NoSQL injections.
- **Global Error Boundaries:** Reusable React boundary component traps rendering-level failures to protect UX continuity.

---

## ⚠️ Known Limitations

- **WebSockets on Free Tier Render:** Real-time seat updates use Socket.io. Deployed on Render's persistent environment, WebSockets are fully active and stable. However, if hosted on Render's Free tier, the server will spin down after 15 minutes of inactivity, causing the initial loading request to take ~50 seconds while it spins up. Once awake, Socket.io works instantly and persistently.

---

## 💼 CV / Resume Description

**Full Stack / MERN Developer Role Bullet Points:**

- **Concurrency & Reliability:** Implemented a robust booking validation system using MongoDB compound unique indexes with partial filters to prevent duplicate seat assignments under concurrent requests, lowering booking errors to zero.
- **Atomic Transactions:** Created transactional point-deduction flows using atomic `findOneAndUpdate` queries in Mongoose, ensuring data integrity and preventing negative token balances during high-traffic booking windows.
- **Full Stack Integration:** Built a role-based university booking platform using React, Node.js, Express, and MongoDB, integrating Firebase Google login, QR boarding pass generation, and mobile-based camera scanning for supervisor attendance tracking.

---

## 🎙️ Interview Prep & Technical Q&A

### 1. How did you resolve seat booking race conditions on the backend?

> **Answer:** Initially, the backend performed a `findOne` query to check if a seat was booked, followed by a separate `save()` query. In concurrent scenarios (e.g. two users clicking "Book" simultaneously), both requests could read the seat as available before either saved, resulting in double bookings.
> To resolve this, I introduced an `isActive` boolean field in the `Booking` schema and created a database-level compound unique index on `{ bus, travelDate, shift, seatNumber }` filtered by `{ isActive: true }`. If a concurrent request attempts to book the same seat, MongoDB throws a duplicate key error (code 11000) which the backend catches, rolls back point deductions, and returns a clear user-friendly warning.

### 2. Why did you use `User.findOneAndUpdate` instead of checking points in memory?

> **Answer:** Checking a student's point balance in memory (`if (user.points <= 0)`) before executing a decrement introduces a race condition where a student with 1 point can make multiple concurrent API requests and book several seats, driving their points balance negative.
> I resolved this by applying an atomic database update: `User.findOneAndUpdate({ _id: studentId, points: { $gt: 0 } }, { $inc: { points: -1 } })`. Mongoose executes this in a single atomic database operation. If the student has 0 points, the query condition fails, return value is null, and we block booking creation immediately.

### 3. Why did you choose a partial filter unique index instead of a standard unique index?

> **Answer:** In our system, when a student cancels a booking, its status changes to `'cancelled'`. If we had a standard unique index on `{ bus, travelDate, shift, seatNumber }`, a cancelled booking would still reside in the index and block other students from booking that seat.
> By using a partial filter index where `isActive: true`, cancelled bookings (which have `isActive: false`) are ignored by the index, freeing the seat instantly for others to book while preserving the cancelled record in the database for analytics.
