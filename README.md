# CUET Bus Ticket – University Bus Seat Booking & Management System

> **A full-stack web application for CUET (Chittagong University of Engineering & Technology) providing a comprehensive bus seat booking and management system.**

## 📖 Short Description
The CUET Bus Ticket system is a dedicated digital solution for streamlining bus transportation for students and staff. It transitions the traditional token-based queue system into a modern, real-time web platform. By offering role-based access to Students, Supervisors, and Administrators, the system allows for interactive seat booking, live bus tracking, real-time attendance marking, and powerful route management.

## 🚀 Key Features
- **🎫 Interactive Seat Booking:** Visual representation of bus seats for intuitive selection.
- **👨‍🎓 Student Dashboard:** Manage bookings, view schedules, and track digital token balances.
- **👨‍🏫 Supervisor Controls:** Bus attendance marking with automatic token deduction.
- **🛡️ Admin Panel:** Comprehensive system management for buses, users, and schedules.
- **🗺️ Real-time Routes:** Detailed route information with timing and stops.
- **📱 Fully Responsive:** Seamless experience across desktop and mobile devices.
- **🔐 Secure Access:** JWT-based authentication layered with strict role-based access control.

## 🛠️ Technology Used

### Frontend
- **React.js**: Library for building the user interface.
- **Vite**: Next-generation frontend tooling for faster builds.
- **Tailwind CSS v4**: Utility-first CSS framework for rapid and responsive styling.
- **React Router DOM**: Client-side routing.
- **Lucide React**: Modern iconography.

### Backend
- **Node.js**: JavaScript runtime environment.
- **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB**: NoSQL document database.
- **Mongoose**: Elegant MongoDB object modeling for Node.js.
- **JSON Web Tokens (JWT)**: Secure user authentication.

---

## 💻 Installation & Setup

Because all environment variables and database keys are pre-configured in the repository, you can set up the project in just a few clicks!

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

That's it! Both the frontend and backend will now start concurrently.

**Access URLs:**
- **Frontend App:** http://localhost:5173
- **Backend API:** http://localhost:5001

### Optional: Seed Database
To test with dummy data, you can populate the database by opening a new terminal in the root directory and running:
```bash
npm run seed
```
**Test Accounts:**
- **Admin:** admin@cuet.ac.bd | admin123
- **Supervisor:** rahman@cuet.ac.bd | super123
- **Supervisor:** kabir@cuet.ac.bd | super123
- **Student:** asif@student.cuet.ac.bd | student123
- **Student:** student2@student.cuet.ac.bd | student123

---

## 📂 Project Structure

```text
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components (layout, seat grid, etc.)
│   │   ├── context/        # React Context providers (Auth Context)
│   │   ├── pages/          # Full page views
│   │   └── utils/          # Helper methods and API interceptors
│   ├── index.html          # Vite entry point
│   └── vite.config.js      # Vite configuration
├── server/                 # Express backend application
│   ├── config/             # Database connection logic
│   ├── middleware/         # Auth verification and role checking
│   ├── models/             # Mongoose database schemas (User, Bus, Booking)
│   ├── routes/             # RESTful API endpoints
│   ├── server.js           # Server application entry point
│   └── seed.js             # Database population script
└── package.json            # Root configuration and concurrent scripts
```

## ⚠️ Other Important Information
- **Port Conflict:** If port `5001` or `5173` is already in use on your machine, the applications may fail to start. Update the port in your `.env` or Vite settings accordingly.
- **Database Connection:** The backend requires an active MongoDB connection to function. If you see connection timeout errors, verify that your MongoDB service is running.
- **Authentication Flow:** API requests to protected routes require a Bearer token in the `Authorization` header. The frontend automatically handles this by intercepting requests through the provided Axios/fetch utility.
