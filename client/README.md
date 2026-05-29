# 🎨 CUETGo Client — Frontend Visual Ticket Portal

The frontend application for **CUETGo**, a modern university bus seat booking and ticket management system. Built with React, Vite, and Tailwind CSS.

---

## 🚀 Key Features

- **🎫 Shohoz-style Date Carousel:** Smooth horizontal scrolling date selector supporting booking limits up to 14 days in advance.
- **🚌 Interactive Bus Grid Selector:** Dual-aisle, 50-seat bus visual selector rendering seat statuses (Available, Selected, Booked, and user-booked state) dynamically.
- **📷 Digital QR Boarding Passes:** Confirmed tickets generate high-resolution QR codes containing cryptographic payload IDs for boarding.
- **🌓 Responsive Glassmorphism UI:** Persisted system-wide dark mode utilizing Tailwind CSS custom variants.
- **⚡ Real-Time Seat States:** Live updates pushed using Socket.io to keep seat selection maps synchronized across users.
- **🔑 Quick Recruiter Authentication:** Access student, supervisor, and admin panels with a single click using pre-configured mock buttons.

---

## 🛠️ Tech Stack

- **Core:** React 19, Javascript ES6+
- **Bundler:** Vite 8
- **Styling:** Tailwind CSS v4 (Glassmorphic layouts, dark mode)
- **WebSockets:** Socket.io-client
- **Libraries:** React Router DOM (Navigation), React Hot Toast (Alerts), Recharts (Admin analytics charts), React Icons

---

## 📂 Folder Structure

```text
client/
├── public/                 # Static assets
└── src/
    ├── assets/             # Brand logos and images
    ├── components/         # Reusable frontend components
    │   ├── layout/         # Sidebar, Navbar, and Dashboard layouts
    │   └── ui/             # Modals, Seat grids, Skeleton loaders, and error boundaries
    ├── context/            # AuthContext (sessions) and ThemeContext (dark/light)
    ├── hooks/              # useSeatBooking and useBusManagement (Clean custom hooks)
    ├── pages/              # View pages (dashboards, login, profile, routing management)
    ├── utils/              # Axios API configurations, date formatting, shifts, and seat helpers
    ├── App.jsx             # Main Router structure
    └── main.jsx            # Entry point
```

---

## ⚙️ Environment Variables

Create `.env` in the `client/` folder:

```env
# Server API endpoint (local fallback: http://localhost:5001)
VITE_API_URL=http://localhost:5001/api

# Firebase Configuration keys for OAuth (optional)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

## 💻 Local Setup & Development

### 1. Installation

Navigate to the client directory and install dependencies:

```bash
cd client
npm install
```

### 2. Run Development Server

Spin up the local Vite hot-reloading development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build

Compile and minify assets for production deployment:

```bash
npm run build
```

Output files will be generated in the `dist/` directory.

---

## 🌐 Deployment

The frontend is configured for deployment to **Vercel** via the `vercel.json` routing configuration:

- Vite config maps output assets to standard production folders.
- Single Page Application (SPA) routing routes wildcard URL states back to `index.html` to avoid 404s.

```,Description:

```
