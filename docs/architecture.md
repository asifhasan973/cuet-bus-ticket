# CUETGo — System Architecture & Design Specifications

This document holds the visual runtime layouts, database diagrams, and API sequence charts for the **CUETGo** booking platform.

---

## 1. System Architecture Diagram

```mermaid
graph TD
    subgraph Client [Vercel SPA Frontend]
        C[Vite React Portal] -->|HTTP / JSON| Ax[Axios Client]
        C -->|WebSockets| SC[Socket.io client]
    end

    subgraph API [Express Backend API Node]
        R[Express Routers] -->|Controller Routing| Ctrl[Controllers Layer]
        Ctrl -->|Business Workflows| Svc[Services Layer]
        Svc -->|DB Session Wrapper| Tx[Transaction helper]
    end

    subgraph External [External Services]
        Fb[Firebase SDK Admin]
    end

    subgraph Data [MongoDB Atlas Replica Set]
        Db[(MongoDB Database)]
        Db -->|Index Checking| Idx[Compound Unique Indexes]
    end

    Ax -->|JWT Auth Routes| R
    SC <-->|Live Updates| R
    Ctrl -->|Token Verifying| Fb
    Tx -->|ACID session writes| Db
```

---

## 2. Database Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "student | supervisor | admin"
        string studentId
        string employeeId
        string department
        int points
        boolean isApproved
    }
    BUS {
        ObjectId _id PK
        string busName
        string busType "regular | flyover"
        object route "name, stops[]"
        int totalSeats
        string status "active | inactive | maintenance"
        array supervisors FK
    }
    BOOKING {
        ObjectId _id PK
        ObjectId student FK
        ObjectId bus FK
        int seatNumber
        int shift "1 | 2 | 3 | 4"
        string travelDate
        string status "confirmed | cancelled | completed"
        string attendance "pending | present | absent"
        boolean isActive
    }

    USER ||--o{ BOOKING : "places"
    BUS ||--o{ BOOKING : "allocated"
    USER ||--o{ BUS : "supervises"
```

---

## 3. Authentication Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor Recruiter as Recruiter/User
    participant Page as Login UI
    participant Auth as AuthController
    participant Svc as AuthService
    participant DB as MongoDB
    participant FB as Firebase

    Recruiter->>Page: Click "Try as Demo Student"
    Page->>Auth: POST /api/auth/login (email, password)
    Auth->>Svc: loginUser(email, password)
    Svc->>DB: User.findOne({ email }).select('+password')
    DB-->>Svc: returns user record
    Svc->>Svc: verify matchPassword(password)
    Svc-->>Auth: returns user data & signs JWT
    Auth-->>Page: 200 OK (Token + user object)
    Page->>Recruiter: Load dashboard session
```

---

## 4. Transactional Seat Booking Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Ctrl as BookingController
    participant Svc as BookingService
    participant Helper as TransactionHelper
    participant DB as MongoDB

    Student->>Ctrl: POST /api/bookings (busId, seat, date, shift)
    Ctrl->>Svc: createBooking(params)
    Svc->>Helper: runInTransaction(workFn)
    Helper->>DB: start Mongoose Session
    Svc->>DB: User.findById(studentId)
    DB-->>Svc: returns points balance
    Note over Svc,DB: Check points > 0 (else throw 400)
    Svc->>DB: Booking.findOne(seat combination)
    DB-->>Svc: check isBooked (else throw 400)
    Svc->>DB: Deduct points (points - 1)
    Svc->>DB: Booking.create() (status: 'confirmed')
    DB-->>Helper: commits transaction
    Helper-->>Svc: returns booking
    Svc-->>Ctrl: booking detail
    Ctrl-->>Student: 201 Created (booking ticket)
```

---

## 5. Admin Panel Bus Management State Flow

```mermaid
stateDiagram-v2
    [*] --> Dashboard: Access Admin Portal
    Dashboard --> BusManager: Select "Bus Management"
    BusManager --> CreateBusForm: Click "Add New Bus"
    CreateBusForm --> SaveBus: Input details & stops
    SaveBus --> BusListTable: Write to MongoDB
    BusListTable --> EditBus: Click "Edit"
    EditBus --> SaveBus: Update route stops/supervisors
    BusListTable --> DeleteBus: Click "Delete"
    DeleteBus --> [*]: Database drop & points release
```
