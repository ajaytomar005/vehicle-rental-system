# 🚗🏍️ Vehicle Rental System (Cars & Two-Wheelers)

A web application where users can rent **cars, bikes, and scooters** online — search a vehicle,
check if it is free on their dates, book it, pay, and pick it up. Built with **Spring Boot**.

---

## 📌 About the Project

Most rental services handle either cars OR bikes. This project brings **both cars and
two-wheelers together on one platform**. A user can rent a car for a weekend trip or a
scooter for a few hours in the city — all from the same app.

The system takes care of the full journey: searching a vehicle, avoiding double-booking,
verifying the user's driving license, taking payment, holding a security deposit, and
handling the return.

---

## ✨ What Makes This Project Unique

- **Two vehicle types in one system** — cars and two-wheelers, with different pricing rules.
- **Flexible rental duration** — rent by the hour, day, or week.
- **No double-booking** — the same vehicle can never be booked by two people for the same time.
- **License verification (KYC)** — users must upload a valid driving license before booking.
- **Security deposit handling** — money is held and refunded after a safe return.
- **Role-based access** — Customer, Vehicle Owner, and Admin each see different features.

---

## 👥 Who Uses the App (Roles)

| Role | What they can do |
|------|------------------|
| **Customer** | Search, book, pay, and review vehicles |
| **Owner** | Add vehicles, set price and availability, manage bookings |
| **Admin** | Approve vehicles, manage users, view reports |

---

## 🔄 Project Flow (How It Works — Step by Step)

```
1. User signs up / logs in
        ↓
2. User uploads driving license  → Admin verifies it (KYC)
        ↓
3. User searches for a vehicle (by city, date, type, price)
        ↓
4. App shows only AVAILABLE vehicles (no already-booked ones)
        ↓
5. User selects a vehicle → sees details, photos, price
        ↓
6. User picks dates → app checks availability again → calculates total price
        ↓
7. User pays online (rental amount + security deposit)
        ↓
8. Booking is CONFIRMED → confirmation sent by email/SMS
        ↓
9. User picks up the vehicle → booking becomes ACTIVE
        ↓
10. User returns the vehicle → booking becomes COMPLETED → deposit refunded
        ↓
11. User leaves a rating and review
```

---

## 🏗️ Architecture (Simple Explanation)

The app is built in **layers**. Each layer has one job, which keeps the code clean.

```
   [ User / Browser ]
          │
          ▼
   ┌───────────────┐
   │  Controller   │  → Receives requests, checks input
   └───────────────┘
          │
          ▼
   ┌───────────────┐
   │   Service     │  → All the business rules live here
   │               │     (booking logic, pricing, checks)
   └───────────────┘
          │
          ▼
   ┌───────────────┐
   │  Repository   │  → Talks to the database
   └───────────────┘
          │
          ▼
   ┌───────────────┐
   │   Database    │  → PostgreSQL (stores everything)
   └───────────────┘
```

**In simple words:**
- **Controller** = the receptionist (takes your request).
- **Service** = the manager (makes the decisions).
- **Repository** = the storekeeper (fetches/saves data).
- **Database** = the storeroom (where all data is kept).

---

## 🗄️ Database Tables

| Table | What it stores |
|-------|----------------|
| **users** | Name, email, phone, password, role, KYC status |
| **licenses** | Driving license number, document image, verified (yes/no) |
| **vehicles** | Type (car/bike/scooter), brand, model, year, seats, fuel, location, status |
| **vehicle_images** | Photos of each vehicle |
| **pricing** | Hourly, daily, and weekly rate + deposit for each vehicle |
| **availability** | Which dates a vehicle is free or blocked |
| **bookings** | Who booked which vehicle, start/end time, status, total amount |
| **payments** | Payment amount, type, status, gateway reference |
| **reviews** | Rating and comment left by the customer |

### How the tables connect
- One **user** can have many **bookings**.
- One **vehicle** has many **images**, one **pricing**, and many **bookings**.
- One **booking** has one **payment** and can have one **review**.

---

## 🛠️ Technology Used

| Part | Technology |
|------|-----------|
| Backend | Spring Boot (Java) |
| Database | PostgreSQL |
| Security | Spring Security + JWT |
| Database changes | Flyway (migrations) |
| API documentation | Swagger / OpenAPI |
| Payments | Razorpay / Stripe |
| Image storage | Cloudinary / AWS S3 |

---

## 📁 Folder Structure

```
src/main/java/com/rental
├── config/          → Security, Swagger, app settings
├── security/        → JWT login and token handling
├── user/            → User signup, login, profile
├── vehicle/         → Vehicles, images, pricing, availability
├── booking/         → Booking logic (the heart of the app)
├── payment/         → Payments and deposits
├── review/          → Ratings and reviews
├── admin/           → Admin controls
└── common/          → Shared code, error handling
```

---

## ⚠️ Problems Faced During Development

1. **Double-booking problem**
   Two users could book the same vehicle at the same second.
   **Solution:** Two layers. The service takes a `SELECT ... FOR UPDATE` row lock on the
   vehicle before re-checking availability, which serialises concurrent attempts. Behind
   that, PostgreSQL enforces an `EXCLUDE USING gist` constraint on
   `(vehicle_id, tstzrange(start_at, end_at))` for bookings that hold a slot, so
   overlapping rows are impossible even across multiple app instances.

2. **Money calculation errors**
   Using normal decimal numbers caused rounding mistakes in prices.
   **Solution:** Used `BigDecimal` everywhere for money instead of `double`.

3. **Handling different rental durations**
   Pricing was tricky for hourly vs daily vs weekly rentals.
   **Solution:** Built a pricing table with separate rates and a small calculation service.

4. **Payment safety**
   A booking should not be marked "paid" just because the frontend said so.
   **Solution:** Confirmed payments only through the payment gateway's webhook.

5. **License verification**
   Needed to make sure users are legally allowed to drive before booking.
   **Solution:** Added a KYC step where admin approves the license before the first booking.

---

## 🚀 Future Scope

- 📱 **Mobile app** (Android/iOS) using the same backend.
- 📍 **Live GPS tracking** of rented vehicles.
- 🤖 **Smart pricing** that changes with demand (like weekends and holidays).
- 💳 **Wallet system** for faster checkout and refunds.
- ⭐ **Loyalty points** and discount coupons for regular users.
- 🚙 **Doorstep delivery** — vehicle delivered to the user's location.
- 🌐 **Multi-language support** for more users.
- 📊 **Analytics dashboard** for owners to track earnings and popular vehicles.

---

## ▶️ How to Run the Project

The project has two parts: a Spring Boot API and a React frontend.

### 1. Create the database

```bash
createdb vehicle_rental
psql -d postgres -c "CREATE USER rental_user WITH PASSWORD 'rental_pass';"
psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE vehicle_rental TO rental_user;"
```

Flyway creates every table on first start, so there is no schema to import by hand.

### 2. Start the backend

```bash
cd backend
./mvnw spring-boot:run
```

Connection settings can be overridden with environment variables:
`DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ORIGINS`.

- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api` to the backend.

### Demo accounts

On an empty database the app seeds three accounts (password `Password123!`):

| Email | Role |
|-------|------|
| `admin@rental.local` | Admin |
| `owner@rental.local` | Owner |
| `customer@rental.local` | Customer |

Set `SEED_DEMO_DATA=false` to skip seeding.

---

## 🖥️ Frontend

| Part | Technology |
|------|-----------|
| Framework | React 19 + TypeScript (Vite) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Routing | React Router |
| State | Zustand |
| HTTP | Axios |

Pages: landing, browse/search, vehicle detail with live price quoting, booking
and payment, customer bookings, owner dashboard (list vehicles, handle pickup and
return), and an admin dashboard for approvals.

---

## 📝 License

This project is open for learning and personal use.
