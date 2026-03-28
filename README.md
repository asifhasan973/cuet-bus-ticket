# CUET Bus – University Bus Seat Booking & Management System

A full-stack web application for CUET university bus seat booking with role-based access (Student, Supervisor, Admin).

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS v4
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT-based authentication

## Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Install all dependencies
```bash
npm run install-all
```

### 2. Configure environment
Edit `server/.env`:
```
MONGO_URI=mongodb://localhost:27017/cuet-bus
JWT_SECRET=your_secret_key
PORT=5000
```

### 3. Seed the database (optional)
```bash
npm run seed
```
This creates sample accounts:
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cuet.ac.bd | admin123 |
| Supervisor | rahman@cuet.ac.bd | super123 |
| Student | asif@student.cuet.ac.bd | student123 |

### 4. Run the application
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── layout/     # Navbar, Sidebar, DashboardLayout
│   │   │   └── ui/         # SeatGrid, StatsCard, Modal, LoadingSpinner
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # All 11 pages
│   │   └── utils/          # API helper
│   └── index.html
├── server/                 # Express backend
│   ├── config/             # Database connection
│   ├── middleware/          # Auth & role checking
│   ├── models/             # User, Bus, Booking
│   ├── routes/             # API endpoints
│   ├── seed.js             # Database seeder
│   └── server.js           # Entry point
└── package.json            # Root scripts
```

## Features

- 🎫 Interactive seat booking with visual bus layout
- 👨‍🎓 Student dashboard with token balance tracking
- 👨‍🏫 Supervisor attendance marking with auto token deduction
- 🛡️ Admin panel for system management
- 🗺️ Route & schedule information
- 📱 Fully responsive design
- 🔐 JWT authentication with role-based access
