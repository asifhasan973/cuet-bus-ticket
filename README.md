# 🚌 CUETGo — University Bus Seat Booking & Management System

[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-purple?style=for-the-badge&logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)

**CUETGo** is a full-stack, production-ready web application designed for **Chittagong University of Engineering & Technology (CUET)**. It transitions the traditional token-based bus booking queue system into a modern, real-time web platform. By offering role-based access to Students, Supervisors, and Administrators, the system provides a seamless visual seat booking experience, interactive route timetables, digital boarding passes with QR codes, mobile camera QR scanning for supervisors, and automated point/token allocations.

---

## ✨ Key Enhancements (CV-Worthy & High-Polish)

### 🌓 Persistent Dark Theme
- Implemented a complete class-based dark mode styling system using Tailwind CSS v4's custom variants.
- Features a smooth theme toggle with animated rotation, persisting the user's choice across session reloads using `localStorage`.

### 🎫 Interactive Boarding Passes & QR Codes
- Generates beautiful boarding pass tickets for confirmed student bookings.
- Integrates `qrcode.react` to generate unique QR codes containing booking credentials for contactless verification.
- Includes clean printable layouts tailored for printing or saving tickets as PDFs.

### 📷 Mobile QR Scanner for Attendance
- Integrated the browser-based camera API via `html5-qrcode` to allow bus supervisors to scan students' tickets directly from their mobile devices.
- Successful scans automatically verify the student's booking, deduct/apply points, mark attendance present, and refresh the dashboard in real-time.

### 🌀 Premium Framer Motion Animations & Skeletons
- **Page Transitions**: Smooth enter/exit routing transitions using `AnimatePresence`.
- **Skeleton Loaders**: Reusable custom skeleton loaders to simulate content layouts, replacing generic spinners for a modern, premium UX.
- **Animated Counters**: Stats numbers count up dynamically on load when they scroll into view.
- **Micro-interactions**: Wobbling bus logo on hover, rotating cancel/hamburger icons, spring-based tooltips, and pop-in cascade delay effects on the seat selection grid.

---

## 🚀 Core Features

- **🎫 Visual Seat Booking**: Visual grid representation of bus seats (2 seats | aisle | 3 seats layout) with interactive status indicators.
- **👨‍🎓 Student Dashboard**: Track token balances, view future active bookings, cancel seats with refund windows, and view overall booking history.
- **👨‍🏫 Supervisor Panel**: Manage passenger manifests, mark attendance manually or using the built-in QR scanner, and view token allocations.
- **🛡️ Admin Console**: Oversee bus fleet management (add/edit/delete buses like *Turag*, *Halda*, etc.), configure shift times, and manage accounts.
- **🔐 Robust Auth & RBAC**: Secure JWT authentication and Firebase Google OAuth integrated with strict role-based access control.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Framer Motion, React Router v7, React Hot Toast, React Icons, QRcode.react |
| **Backend** | Node.js, Express.js, Mongoose, JSON Web Tokens (JWT) |
| **Database** | MongoDB Atlas (NoSQL) |
| **Hardware APIs** | HTML5 Camera API (for QR scanner) |

---

## 💻 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "CUET Bus Ticket"
   ```

2. **Install all dependencies & start the app**
   ```bash
   npm run install-all
   npm run dev
   ```

Both the frontend and backend will start concurrently.

**Access URLs:**
- **Frontend App:** http://localhost:5173
- **Backend API:** http://localhost:5001

### 💡 Seed Database & Test Accounts
To test the full capability of the system (Student, Supervisor, and Admin perspectives), seed the database with sample records:
```bash
npm run seed
```

**Credentials:**
- **Admin**: `admin@cuet.ac.bd` | `admin123`
- **Supervisor**: `rahman@cuet.ac.bd` | `super123`
- **Student**: `asif@student.cuet.ac.bd` | `student123`

---

## 📂 Project Structure

```text
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # UI elements (SeatGrid, Skeleton, Modal, Navbar, Sidebar)
│   │   ├── context/        # React Context providers (Auth Context, Theme Context)
│   │   ├── pages/          # Pages (Home, SeatBooking, AttendancePage, Profile)
│   │   └── utils/          # Axios configurations, date formatting helpers
│   ├── index.html          # Vite Entrypoint
│   └── vite.config.js      # Vite and Tailwind config
├── server/                 # Express backend application
│   ├── config/             # DB settings
│   ├── middleware/         # Auth verification and role checking
│   ├── models/             # Mongoose schemas (User, Bus, Booking)
│   ├── routes/             # RESTful API endpoints
│   ├── server.js           # Server application entry point
│   └── seed.js             # Seed database script
└── package.json            # Root configuration and concurrent scripts
```
