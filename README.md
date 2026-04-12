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

## 💻 Installation & Setup Process

Follow these steps to get the project up and running on your local machine.

### Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally or a MongoDB Atlas URI)
- Git

### 1. Clone the repository
```bash
git clone <repository-url>
cd "CUET Bus Ticket"
```

### 2. Install Dependencies
We have a root-level script that automatically installs dependencies for both the `client` and `server` folders.
```bash
npm run install-all
```
*(Alternatively, you can manually run `npm install` inside the root, `client`, and `server` directories).*

### 3. Configure Environment Variables
You must configure the environment variables for the backend to run properly. 
Create a `.env` file in the `server` directory (you can copy `.env.example` if it exists):
```bash
cd server
touch .env
```
Add the following configurations to the `server/.env` file:
```env
# MongoDB Connection String (Replace with Atlas URI if remote)
MONGO_URI=mongodb://localhost:27017/cuet-bus

# Secret key for JWT Authentication
JWT_SECRET=your_super_secret_key_change_me

# Backend Port
PORT=5001
```

### 4. Seed the Database (Optional but Recommended)
To quickly test the application with dummy data and pre-configured accounts, run the seed script:
```bash
# From the root directory:
npm run seed
```
**Seed Accounts Created:**
| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@cuet.ac.bd | admin123 |
| **Supervisor** | rahman@cuet.ac.bd | super123 |
| **Student** | asif@student.cuet.ac.bd | student123 |

### 5. Run the Application
You can run both the client and server concurrently from the root directory using:
```bash
npm run dev
```

**Access URLs:**
- **Frontend (Client):** http://localhost:5173
- **Backend (Server API):** http://localhost:5001

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
