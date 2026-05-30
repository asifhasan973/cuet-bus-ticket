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

## 💼 Why I Should Be Hired

If you are looking for a **Software Engineer** who writes production-ready code, maintains high standards of data integrity, and can design robust architectures under pressure, here is why I should be hired:

- **Concurrency & Race Condition Expert:** I proactively identify concurrency risks. Instead of checking seat availability in-memory, I designed database-level compound unique indexes with partial filtering to prevent double bookings.
- **Atomic State Management:** I write thread-safe queries (such as `$inc` combined with `$gt` in a single MongoDB operation) to prevent latency exploits and protect token/point balances.
- **Real-time Synchronization Developer:** Deployed onto a persistent service backend supporting WebSockets (Socket.io) to ensure instant, reactive screen state updates instead of relying on heavy REST polling.
- **End-to-End Product Ownership:** I design database transactions, code secure Express endpoints, construct sleek, responsive, and animated user interfaces (Tailwind, Framer Motion), and set up strict environment isolations.
- **Robust Security Standards:** Committed to git safety guidelines, database credential rotation, OAuth token validation (Firebase Admin), and GitHub push protection.

---

## 📷 UI Previews & Portals

Here are the interactive portals and features of **CUETGo**:

<details>
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

<details>
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

<details>
<summary><b>👮 Supervisor Portal</b></summary>
<br>

- **Supervisor Dashboard (Assigned Buses & Schedules):**
  ![Supervisor Dashboard](docs/Preview%20Images/supevisor%20dashboard.png)
- **Digital Boarding Attendance Management & QR Scanner:**
![Supervisor Attendance Management](docs/Preview%20Images/supervisor%20attendance%20management.png)
</details>

<details>
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

- **Environment Isolation:** Real production environment variables and credentials are never committed to this Git repository. Local development configuration uses `.env` files which are strictly ignored in `.gitignore`.
- **Configuration Templates:** Tracked `.env.example` files are only dummy templates containing non-sensitive placeholder configurations.
- **Production Secrets:** Production database connections, JWT secrets, and admin access keys must be configured inside the deployment settings of the hosting provider (e.g., Render Environment Variables, Vercel Project Settings).
- **Incident Response:** If any credential is accidentally committed or exposed in a public branch, it must be rotated immediately in its respective platform dashboard (MongoDB Atlas database access, Firebase keys, or Render settings) and the Git history must be purged.
- **GitHub Code Security:** We recommend enabling GitHub's **Secret scanning** and **Push protection** (under Repository settings → Code security and analysis) to detect and block secret leaks prior to code check-in.
- **Firebase Safety:** Client-side Firebase configurations (API keys, App IDs) are public metadata needed by the browser. Access is secured by setting strict domain whitelisting (Authorized Domains) in the Firebase console and locking down database security rules.
