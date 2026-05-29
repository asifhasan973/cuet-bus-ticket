# 🚌 CUETGo — University Bus Seat Booking & Management System

[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-purple?style=for-the-badge&logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-black?style=for-the-badge&logo=socket.io)](https://socket.io)

**CUETGo** is a full-stack, real-time MERN application designed for **Chittagong University of Engineering & Technology (CUET)** to modernize the traditional token-based university bus ticketing system. It provides a visual, real-time seat booking platform with role-based access control (RBAC) for Students, Supervisors, and Administrators.

---

## 🔗 Live Links

- **Live Frontend Portal:** [https://cuet-bus-ticket-main.vercel.app/](https://cuet-bus-ticket-main.vercel.app/)
- **GitHub Repository:** [https://github.com/asifhasan973/cuet-bus-ticket](https://github.com/asifhasan973/cuet-bus-ticket)
- **Detailed System Architecture:** [docs/architecture.md](docs/architecture.md)

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

## 📷 UI Preview

- **Student Dashboard:**
  ![Student Dashboard](https://raw.githubusercontent.com/asifhasan973/cuet-bus-ticket/main/readme-assets/dashboard.png)
- **Interactive Seat Selector:**
  ![Seat Selector](https://raw.githubusercontent.com/asifhasan973/cuet-bus-ticket/main/readme-assets/seat-booking.png)
- **Supervisor Attendance Scanner:**
  ![Supervisor Scanner](https://raw.githubusercontent.com/asifhasan973/cuet-bus-ticket/main/readme-assets/supervisor.png)
- **Admin Bus Management:**
  ![Admin Dashboard](https://raw.githubusercontent.com/asifhasan973/cuet-bus-ticket/main/readme-assets/admin.png)

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

## 🎙️ Recruiter Q&A

### 1. How did you resolve seat booking race conditions on the backend?

> **Answer:** Initially, a backend might query if a seat is available and then issue a save command. Under concurrent load, both queries see the seat as empty before either has completed their write, leading to double bookings.
> To resolve this, I introduced an `isActive` boolean flag and a compound unique index on `{ bus, travelDate, shift, seatNumber }` filtered by `{ isActive: true }`. MongoDB handles this index validation atomically. If two requests try to claim the exact same seat, one will fail the index validation and throw a duplicate key error (code 11000). The backend catches this error, rolls back point deductions, and returns a graceful error to the second user.

### 2. Why did you use `User.findOneAndUpdate` instead of checking points in memory?

> **Answer:** Querying the user, checking if `points > 0` in memory, and then saving introduces a race condition. Under high-speed requests, a user with 1 point could book multiple seats because the point check is evaluated before the first booking is written.
> I resolved this by performing an atomic operation: `User.findOneAndUpdate({ _id: studentId, points: { $gt: 0 } }, { $inc: { points: -1 } })`. Since MongoDB runs updates atomically on a document, if the points are 0, the query filter fails, no deduction occurs, and the booking request is instantly blocked.

### 3. Why did you choose a partial filter unique index instead of a standard unique index?

> **Answer:** When a student cancels a booking, its status changes to `'cancelled'`. If we had a standard unique index on `{ bus, travelDate, shift, seatNumber }`, a cancelled booking would remain in the index and block other students from booking that seat.
> By utilizing a partial filter index (`{ isActive: true }`), cancelled bookings (which set `isActive: false`) are ignored by the index constraint, freeing the seat instantly for others to book while preserving the cancelled record in the database for admin analytics.
