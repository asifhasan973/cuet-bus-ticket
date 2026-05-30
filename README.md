# 🚌 CUETGo — University Bus Seat Booking & Management System

[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-purple?style=for-the-badge&logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-black?style=for-the-badge&logo=socket.io)](https://socket.io)

**CUETGo** is a full-stack, real-time MERN application designed for **Chittagong University of Engineering & Technology (CUET)** to modernize the traditional token-based university bus ticketing system. It provides a visual, real-time seat booking platform with role-based access control (RBAC) for Students, Supervisors, and Administrators.

---

## 🔑 Recruiter Quick Access (Demo Credentials)

> [!TIP]
> The login pages contain a **Recruiter Quick Access** banner. Clicking any role's button will automatically pre-fill the credentials and sign you in immediately.

| Role           | Demo Email                | Password     | Quick Login Button           |
| :------------- | :------------------------ | :----------- | :--------------------------- |
| **Student**    | `asif@student.cuet.ac.bd` | `student123` | **"Try as Demo Student"**    |
| **Supervisor** | `rahman@cuet.ac.bd`       | `super123`   | **"Try as Demo Supervisor"** |
| **Admin**      | `admin@cuet.ac.bd`        | `admin123`   | **"Try as Demo Admin"**      |

---

## 🔗 Live Links

- **Live Frontend Portal:** [https://cuet-bus-ticket-main.vercel.app/](https://cuet-bus-ticket-main.vercel.app/)
- **GitHub Repository:** [https://github.com/asifhasan973/cuet-bus-ticket](https://github.com/asifhasan973/cuet-bus-ticket)
- **Detailed System Architecture:** [docs/architecture.md](docs/architecture.md)

---

## 🛠️ Architectural & Technical Highlights

This project was built with a strong focus on **reliability**, **data integrity**, and **real-time interactivity**. Below are the primary engineering challenges solved in the codebase:

### 1. Concurrency-Safe Booking (Zero Double Bookings)

In a high-concurrency environment (e.g. multiple students booking the same seat simultaneously), traditional check-then-save routines cause race conditions.

- **Solution:** Implemented a database-level compound unique index on `{ bus, travelDate, shift, seatNumber }` filtered by `{ isActive: true }` in MongoDB. If two concurrent requests try to book the same seat, MongoDB throws a duplicate key error (code 11000). The backend catches this, automatically rolls back transaction states, and informs the user safely.

### 2. Atomic Token Lifecycle & Balance Protection

To prevent students from exploiting latency to double-book seats using the same single token:

- **Solution:** Applied an atomic database update: `User.findOneAndUpdate({ _id: studentId, points: { $gt: 0 } }, { $inc: { points: -1 } })`. The check and deduction happen in a single, atomic thread-safe database transaction. If the student has 0 points, the query condition fails immediately and blocks booking creation.

### 3. Persistent WebSockets (Socket.io)

- **Solution:** Deployed the Node.js Express backend to a persistent environment on **Render** (moving away from serverless environments). This supports persistent TCP connections, enabling Socket.io to push real-time seat grid state updates instantly to all connected clients when a seat is reserved or cancelled.

### 4. Digital QR Attendance & Smart Token Rules

- **Solution:** Booked tickets generate a digital boarding pass with a unique QR code. Supervisors scan this QR code using their device's camera to mark attendance.
- **Attendance Penalty Rules:** To discourage students from booking seats and not showing up, the attendance marking system uses smart token deductions:
  - **Present:** 0 extra tokens deducted (1 token was already spent during booking).
  - **Absent:** **-2 extra tokens** deducted (total penalty of 3 tokens for missing the bus).

---

## 🛠️ Key Engineering Decisions

To ensure high data integrity, reliability, and low latency under peak concurrent loads, the following key engineering design patterns were implemented:

- **Database-Level Concurrency Protection:** Used compound unique indexes on `{ bus, travelDate, shift, seatNumber }` filtered by `{ isActive: true }` in MongoDB to prevent double bookings at the database layer rather than relying on memory-level checks.
- **Atomic Token Lifecycle Operations:** Employed atomic MongoDB operations (`$inc` and `$gt` validation within a single query) to avoid race conditions during token balance deductions, protecting against double-spends.
- **Persistent WebSockets for Real-time Sync:** Utilized Socket.io on a persistent Node.js web service to push instant seat state updates to clients, optimizing network overhead and rendering latency compared to polling.
- **Digital Boarding & Audit Trail:** Implemented unique QR code tokens scanned by supervisors to verify attendance, enforcing strict point-deduction penalty rules for no-shows to incentivize booking compliance.
- **Secure Environment & Configuration Separation:** Enforced absolute isolation of credentials using environment variables, integrated Firebase Admin for safe server-side OAuth token verification, and added git push protection policies.

---

## 📷 UI Previews & Portals

Here are the interactive portals and features of **CUETGo**:

<details open>
<summary><b>🏠 Public Portal & Authentication</b></summary>
<br>

- **Interactive Landing Page & Hero Section:**
  ![Home](docs/Preview%20Images/Home.png)
- **Services & Benefits Section:**
  ![Home 2](docs/Preview%20Images/Home2.png)
- **System Highlights & Statistics Section:**
  ![Home 3](docs/Preview%20Images/Home3.png)
- **Student Login Portal:**
  ![Student Login](docs/Preview%20Images/student%20login.png)
- **Supervisor & Admin Login Portal:**
![Supervisor & Admin Login](docs/Preview%20Images/supervisor%26admin%20login.png)
</details>

<details open>
<summary><b>🎓 Student Portal</b></summary>
<br>

- **Student Dashboard (Bookings Overview & Point History):**
  ![Student Dashboard](docs/Preview%20Images/student_dashboard.png)
- **Seat Booking & Bus Selection:**
  ![Book Seat Select Bus](docs/Preview%20Images/Book%20Seat%20with%20from%20bus.png)
- **Interactive Seat Selection Layout:**
  ![Book Seat Select Layout](docs/Preview%20Images/Book_seat.png)
- **View & Print Boarding Ticket (with QR Code):**
  ![View and Print Ticket](docs/Preview%20Images/View%20%26%20print%20tcket.png)
- **Real-time Routes & Bus Schedules:**
![Routes and Schedules](docs/Preview%20Images/Routes%20%26%20schedule.png)
</details>

<details open>
<summary><b>👮 Supervisor Portal</b></summary>
<br>

- **Supervisor Dashboard (Assigned Buses & Schedules):**
  ![Supervisor Dashboard](docs/Preview%20Images/supevisor%20dashboard.png)
- **Digital Boarding Attendance Management & QR Scanner:**
![Supervisor Attendance Management](docs/Preview%20Images/supervisor%20attendance%20management.png)
</details>

<details open>
<summary><b>🛡️ Admin Control Panel</b></summary>
<br>

- **Admin Dashboard (Global Stats & Analytics Graphs):**
  ![Admin Dashboard](docs/Preview%20Images/Admin%20dashboard.png)
- **Supervisor Registration Approvals:**
  ![Supervisor Registration Approvals](docs/Preview%20Images/Supervisor%20approval%20by%20admin.png)
- **User Accounts & Point Balances Manager:**
  ![Admin User Management](docs/Preview%20Images/Admin%20user%20management.png)
- **Global Bus Fleet Management:**
  ![Admin Bus Management](docs/Preview%20Images/Admin%20bus%20management.png)
- **Assigning Buses to Supervisors:**
![Assign Bus to Supervisor](docs/Preview%20Images/Assign%20bus%20to%20supervisor%20by%20admin.png)
</details>

---

## 💻 Tech Stack

| Layer               | Technologies Used                                                  |
| :------------------ | :----------------------------------------------------------------- |
| **Frontend**        | React 19, Vite, Tailwind CSS v4, Framer Motion, Axios              |
| **Backend**         | Node.js, Express, Socket.io, Firebase Admin                        |
| **Database**        | MongoDB Atlas, Mongoose ODM                                        |
| **Hosting & CI/CD** | Frontend: Vercel (SPA) \| Backend: Render (Persistent Web Service) |

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

## 🛠️ Local Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/asifhasan973/cuet-bus-ticket.git
   cd cuet-bus-ticket
   ```
2. **Install all dependencies**
   ```bash
   npm run install-all
   ```
3. **Configure Environment Files**
   - Create `server/.env` based on `server/.env.example`
   - Create `client/.env` based on `client/.env.example`
4. **Seed Database (Generates 14 default buses and demo users)**
   ```bash
   npm run seed
   ```
5. **Start Development Servers**

   ```bash
   npm run dev
   ```

   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5001`

---

## 🔒 Security Notes

- **Input Validation:** Enforces strict server-side request payload validation using `express-validator` to prevent SQL/NoSQL injection, sanitize body parameters, and assert schema type safety.
- **API Rate Limiting:** All authentication endpoints (`/api/auth/*`) and booking endpoints (`/api/bookings/*`) are protected with `express-rate-limit` to prevent brute force attacks and resource-exhaustion booking spam.
- **Environment Isolation:** Real production environment variables and credentials are never committed to this Git repository. Local development configuration uses `.env` files which are strictly ignored in `.gitignore`.
- **Configuration Templates:** Tracked `.env.example` files are only dummy templates containing non-sensitive placeholder configurations.
- **Production Secrets:** Production database connections, JWT secrets, and admin access keys must be configured inside the deployment settings of the hosting provider (e.g., Render Environment Variables, Vercel Project Settings).
- **Incident Response:** If any credential is accidentally committed or exposed in a public branch, it must be rotated immediately in its respective platform dashboard (MongoDB Atlas database access, Firebase keys, or Render settings) and the Git history must be purged.
- **GitHub Code Security:** We recommend enabling GitHub's **Secret scanning** and **Push protection** (under Repository settings → Code security and analysis) to detect and block secret leaks prior to code check-in.
- **Firebase Safety:** Client-side Firebase configurations (API keys, App IDs) are public metadata needed by the browser. Access is secured by setting strict domain whitelisting (Authorized Domains) in the Firebase console and locking down database security rules.
