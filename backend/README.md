# LandEase Backend

Node.js + Express + MongoDB (Mongoose) backend for the LandEase land-leasing platform.
Multi-role: **Seekers (`user`)**, **Owners (`owner`)**, **Admins (`admin`)**.

Payments run in **demo mode** — the full create-intent → verify flow is captured so you can plug in a real gateway (Stripe / Razorpay) later with minimal changes.

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT auth (bcrypt password hashing)
- Plain JavaScript (no TypeScript)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your .env from the template
cp .env.example .env
#   then edit MONGO_URI and JWT_SECRET

# 3. (optional) Seed demo data
npm run seed

# 4. Run
npm run dev     # with nodemon
# or
npm start
```

Server runs at `http://localhost:5000`.

### Demo accounts (after `npm run seed`)
| Role   | Email                  | Password  |
|--------|------------------------|-----------|
| Admin  | admin@landease.com     | admin123  |
| Owner  | owner@landease.com     | owner123  |
| Seeker | seeker@landease.com    | seeker123 |

## Auth
Send the JWT in the header:
```
Authorization: Bearer <token>
```
Tokens are returned by `/api/auth/register` and `/api/auth/login`.

## API Overview

### Auth & Profile — `/api/auth`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/register` | public | Register (role: `user` or `owner`) |
| POST | `/login` | public | Login, returns JWT |
| POST | `/forgot-password` | public | Demo: returns reset token |
| POST | `/reset-password` | public | Reset with token + new password |
| GET | `/me` | auth | Current user profile |
| PUT | `/profile` | auth | Update profile |

### Lands — `/api/lands`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | public | Browse lands. Filters: `location, minPrice, maxPrice, minArea, maxArea, status, search, page, limit, sort` |
| GET | `/:id` | public | Land details |
| POST | `/` | owner | Create listing |
| PUT | `/:id` | owner | Edit own listing |
| DELETE | `/:id` | owner | Delete own listing |
| GET | `/owner/my-lands` | owner | Own listings |

### Lease Requests — `/api/requests`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/` | seeker | Submit lease request |
| GET | `/seeker` | seeker | My requests |
| GET | `/owner` | owner | Incoming requests |
| PUT | `/:id/status` | owner | Approve/reject (`{ "status": "approved" }`). Approval creates an ActiveLease. |

### Active Leases — `/api/leases`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/seeker` | seeker | My leases |
| GET | `/owner` | owner | Leases on my lands |
| GET | `/:id` | party/admin | Lease details |

### Payments (DEMO) — `/api/payments`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/create-intent` | seeker | `{ "leaseId" }` → creates pending transaction + demo order |
| POST | `/verify` | seeker | `{ "transactionId", "success": true }` → marks success, flags lease paid |
| GET | `/history` | seeker | My payment history |
| GET | `/earnings` | owner | Earnings + transactions |

### Notifications — `/api/notifications`
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | auth | List + unread count |
| PUT | `/:id/read` | auth | Mark one read |
| PUT | `/read-all` | auth | Mark all read |

### Admin — `/api/admin` (admin only)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/stats` | Dashboard stats |
| GET | `/users` | List users (filters: `role, search`) |
| PUT | `/users/:id/status` | Block/activate user |
| GET | `/lands` | All lands |
| GET | `/transactions` | All transactions |

## Typical Flow
1. Owner registers → creates a land listing.
2. Seeker registers → browses lands → `POST /api/requests`.
3. Owner approves via `PUT /api/requests/:id/status` → an **ActiveLease** is created and the land is marked `leased`.
4. Seeker pays: `POST /api/payments/create-intent` then `POST /api/payments/verify`.
5. Both parties get notifications; owner sees earnings.

## Connecting a Real Payment Gateway Later
The demo flow mirrors real gateways:
- **`create-intent`** is where you'd create a Stripe *PaymentIntent* or Razorpay *Order* and return its `client_secret` / `order_id`.
- **`verify`** is where you'd validate the gateway signature before marking the transaction `success`.

Search `paymentController.js` for the `REAL GATEWAY:` comments — those mark exactly where to add SDK calls. The `Transaction` model already has `gatewayOrderId`, `gatewayPaymentId`, and `isDemo` fields for the transition.

## Notes
- `area` / durations are stored both as display strings (`"2 acre"`) **and** normalized numbers (`areaInAcres`, `minLeaseDurationInMonths`) so you can filter and sort easily.
- Admin accounts are not created via public registration — use the seed script or promote a user directly in the DB.
