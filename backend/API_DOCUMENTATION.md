# LandEase API Documentation

Complete REST API reference for frontend integration.

- **Base URL (dev):** `http://localhost:5000`
- **Content-Type:** `application/json` for all request bodies
- **Auth:** JWT Bearer token (see [Authentication](#authentication))

---

## Table of Contents
1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Roles & Access](#roles--access)
4. [Standard Response & Error Format](#standard-response--error-format)
5. [Data Models](#data-models)
6. [Endpoints](#endpoints)
   - [Auth & Profile](#1-auth--profile-apiauth)
   - [Lands](#2-lands-apilands)
   - [Lease Requests](#3-lease-requests-apirequests)
   - [Active Leases](#4-active-leases-apileases)
   - [Payments (Demo)](#5-payments-demo-apipayments)
   - [Notifications](#6-notifications-apinotifications)
   - [Owner Module](#7-owner-module-apiowner)
     - [Dashboard](#71-dashboard-1) · [My Lands](#72-my-lands--listing--controls) · [Lease Requests](#73-lease-requests--listing--controls) · [Active Leases](#74-active-leases--listing--controls) · [Payments](#75-payments--earnings)
   - [User (Seeker) Module](#8-user-seeker-module-apiuser)
     - [Dashboard](#81-dashboard-2) · [Browse Lands](#82-browse-lands) · [Lease Requests](#83-lease-requests--listing--controls-1) · [Active Leases](#84-active-leases--listing--detail) · [Payments](#85-payments-spending)
   - [Admin Module](#9-admin-module-apiadmin)
     - [Dashboard](#91-dashboard) · [Users](#92-users--listing--controls) · [Lands](#93-lands--listing--controls) · [Leases](#94-leases--listing--controls) · [Transactions](#95-transactions--listing--controls) · [Reports](#96-reports--analytics) · [Settings](#97-settings)
7. [End-to-End Flow Example](#end-to-end-flow-example)
8. [Frontend Integration Notes](#frontend-integration-notes)

---

## Getting Started

1. Register or log in to obtain a JWT token.
2. Store the token (e.g. `localStorage` / secure cookie).
3. Attach it to every protected request in the `Authorization` header.

**Health check (no auth):**
```
GET /api/health
→ 200 { "status": "ok", "time": "2026-07-11T09:00:00.000Z" }
```

---

## Authentication

All protected endpoints require this header:

```
Authorization: Bearer <your_jwt_token>
```

The token is returned by `/api/auth/register` and `/api/auth/login`. It encodes the user `id` and `role`, and expires after `JWT_EXPIRES_IN` (default **7 days**). When a token is missing, invalid, or expired, the API returns `401`.

**Example fetch wrapper:**
```js
const API = "http://localhost:5000";

async function apiFetch(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}
```

---

## Roles & Access

| Role | Value | Can do |
|------|-------|--------|
| Seeker | `user` | Browse lands, submit lease requests, pay, view own leases/payments |
| Owner | `owner` | Create/edit/delete own lands, approve/reject requests, view earnings |
| Admin | `admin` | Platform stats, manage users, view all lands/transactions |

- Public registration only allows `user` or `owner`. Any other role value is coerced to `user`.
- Admin accounts are created via the seed script or promoted directly in the database.
- A `403` is returned when a valid user lacks the required role.
- A deactivated account (`isActive: false`) receives `403` on protected routes.

---

## Standard Response & Error Format

Most successful responses return the resource object or an array directly. List endpoints that support pagination wrap results (see [GET /api/lands](#get-apilands)).

**Error responses** always follow this shape:
```json
{
  "message": "Human-readable error description",
  "stack": "... (only present when NODE_ENV is not production)"
}
```

**Common status codes:**

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad request / validation error / duplicate |
| 401 | Missing or invalid token |
| 403 | Authenticated but not allowed (wrong role / not owner / deactivated) |
| 404 | Resource or route not found |
| 500 | Server error |

---

## Data Models

### User
```json
{
  "_id": "665f...",
  "fullName": "Anu Seeker",
  "email": "seeker@landease.com",
  "phone": "9000000002",
  "role": "user",
  "profileImage": "",
  "isActive": true,
  "createdAt": "2026-07-11T09:00:00.000Z",
  "updatedAt": "2026-07-11T09:00:00.000Z"
}
```
> `password` is never returned. Auth responses additionally include a `token` field.

### Land
```json
{
  "_id": "665f...",
  "ownerId": "665f...",
  "title": "Fertile Paddy Field",
  "description": "Well-irrigated paddy field near the river.",
  "location": "Thrissur, Kerala",
  "area": "2 acre",
  "areaInAcres": 2,
  "minLeaseDuration": "12 mo min",
  "minLeaseDurationInMonths": 12,
  "price": 15000,
  "images": ["https://.../img1.jpg"],
  "status": "available",
  "createdAt": "...",
  "updatedAt": "..."
}
```
> `status`: `available` | `leased` | `unavailable`. On list/detail endpoints, `ownerId` is populated to `{ _id, fullName, email, phone }`.

### LeaseRequest
```json
{
  "_id": "665f...",
  "landId": "665f...",
  "seekerId": "665f...",
  "ownerId": "665f...",
  "requestedDuration": "12 Months",
  "requestedDurationInMonths": 12,
  "message": "Interested in leasing this land.",
  "status": "pending",
  "createdAt": "...",
  "updatedAt": "..."
}
```
> `status`: `pending` | `approved` | `rejected`.

### ActiveLease
```json
{
  "_id": "665f...",
  "requestId": "665f...",
  "landId": "665f...",
  "seekerId": "665f...",
  "ownerId": "665f...",
  "startDate": "2026-07-11T00:00:00.000Z",
  "endDate": "2027-07-11T00:00:00.000Z",
  "rentAmount": 15000,
  "isPaid": false,
  "status": "active",
  "createdAt": "...",
  "updatedAt": "..."
}
```
> `status`: `active` | `completed` | `terminated`.

### Transaction
```json
{
  "_id": "665f...",
  "leaseId": "665f...",
  "payerId": "665f...",
  "receiverId": "665f...",
  "amount": 15000,
  "paymentMethod": "demo",
  "transactionReference": "demo_order_ab12cd34",
  "gatewayOrderId": "demo_order_ab12cd34",
  "gatewayPaymentId": "demo_pay_xy98zw76",
  "isDemo": true,
  "status": "pending",
  "createdAt": "...",
  "updatedAt": "..."
}
```
> `status`: `pending` | `success` | `failed`.

### Notification
```json
{
  "_id": "665f...",
  "userId": "665f...",
  "title": "New Lease Request",
  "message": "Anu Seeker requested to lease \"Fertile Paddy Field\".",
  "type": "lease_request",
  "isRead": false,
  "createdAt": "...",
  "updatedAt": "..."
}
```
> `type`: `lease_request` | `payment` | `system`.

---

## Endpoints

Legend: 🔓 public · 🔒 auth required · 👤 seeker (`user`) · 🏠 owner · 🛡️ admin

---

### 1. Auth & Profile (`/api/auth`)

#### POST /api/auth/register 🔓
Register a new seeker or owner.

**Body:**
```json
{
  "fullName": "Anu Seeker",
  "email": "seeker@landease.com",
  "phone": "9000000002",
  "password": "pass123",
  "role": "user"
}
```
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| fullName | string | ✅ | |
| email | string | ✅ | Unique, stored lowercase |
| phone | string | ✅ | |
| password | string | ✅ | Hashed server-side |
| role | string | ❌ | `user` (default) or `owner`. Other values → `user` |

**201 Response:**
```json
{
  "_id": "665f...",
  "fullName": "Anu Seeker",
  "email": "seeker@landease.com",
  "phone": "9000000002",
  "role": "user",
  "profileImage": "",
  "token": "eyJhbGciOi..."
}
```
**Errors:** `400` missing fields · `400` email already registered.

---

#### POST /api/auth/login 🔓
**Body:**
```json
{ "email": "seeker@landease.com", "password": "pass123" }
```
**200 Response:** same shape as register (includes `token`).
**Errors:** `400` missing fields · `401` invalid credentials · `403` deactivated account.

---

#### GET /api/auth/me 🔒
Returns the current authenticated user object (no token field).
**200 Response:** [User](#user) object.

---

#### PUT /api/auth/profile 🔒
Update own profile. All fields optional; only provided fields change.

**Body:**
```json
{
  "fullName": "Anu S.",
  "phone": "9000009999",
  "profileImage": "https://.../avatar.jpg",
  "password": "newpass123"
}
```
**200 Response:** updated [User](#user) (no token, no password).

---

#### POST /api/auth/forgot-password 🔓
Initiates password reset. **Demo behaviour:** returns the reset token directly in the response instead of emailing it.

**Body:** `{ "email": "seeker@landease.com" }`

**200 Response:**
```json
{
  "message": "Password reset token generated (demo).",
  "resetToken": "a1b2c3...",
  "note": "Send this token to POST /api/auth/reset-password with the new password."
}
```
> To prevent email enumeration, unknown emails still return `200` with a generic message and no token.

---

#### POST /api/auth/reset-password 🔓
**Body:**
```json
{ "resetToken": "a1b2c3...", "password": "newpass123" }
```
**200 Response:** `{ "message": "Password reset successful" }`
**Errors:** `400` missing fields · `400` invalid or expired token (tokens last 1 hour).

---

### 2. Lands (`/api/lands`)

#### GET /api/lands 🔓
Browse lands with filtering, search, sorting, and pagination.

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| location | string | — | Case-insensitive partial match |
| minPrice | number | — | Minimum price |
| maxPrice | number | — | Maximum price |
| minArea | number | — | Minimum area in acres |
| maxArea | number | — | Maximum area in acres |
| status | string | `available` | `available` \| `leased` \| `unavailable` |
| search | string | — | Matches title, description, or location |
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| sort | string | `-createdAt` | Any field; prefix `-` for descending |

**Example:** `GET /api/lands?location=Kerala&minPrice=10000&maxArea=5&page=1&limit=10&sort=price`

**200 Response:**
```json
{
  "data": [ /* array of Land objects, ownerId populated */ ],
  "page": 1,
  "limit": 10,
  "total": 23,
  "totalPages": 3
}
```
> By default only `available` lands are returned. Pass `status` explicitly to see others.

---

#### GET /api/lands/:id 🔓
**200 Response:** single [Land](#land) with `ownerId` populated to `{ _id, fullName, email, phone, profileImage }`.
**Errors:** `404` not found · `400` invalid ID format.

---

#### POST /api/lands 🔒🏠
Create a listing. Owner is taken from the token.

**Body:**
```json
{
  "title": "Fertile Paddy Field",
  "description": "Well-irrigated paddy field near the river.",
  "location": "Thrissur, Kerala",
  "area": "2 acre",
  "minLeaseDuration": "12 mo min",
  "price": 15000,
  "images": ["https://.../img1.jpg"],
  "status": "available"
}
```
| Field | Required | Notes |
|-------|----------|-------|
| title, location, area, minLeaseDuration, price | ✅ | |
| description, images, status | ❌ | `images` defaults to `[]`, `status` to `available` |

> `areaInAcres` and `minLeaseDurationInMonths` are auto-derived from the strings (e.g. `"2 acre"` → `2`).

**201 Response:** the created [Land](#land).
**Errors:** `400` missing required fields · `401`/`403` not an owner.

---

#### PUT /api/lands/:id 🔒🏠
Edit own listing. Only provided fields change. Updating `area`/`minLeaseDuration` re-derives the numeric fields.
**200 Response:** updated [Land](#land).
**Errors:** `404` not found · `403` not your listing.

---

#### DELETE /api/lands/:id 🔒🏠
Delete own listing.
**200 Response:** `{ "message": "Land removed" }`
**Errors:** `404` not found · `403` not your listing.

---

#### GET /api/lands/owner/my-lands 🔒🏠
All lands owned by the current user (newest first).
**200 Response:** array of [Land](#land).

---

### 3. Lease Requests (`/api/requests`)

#### POST /api/requests 🔒👤
Seeker submits a request for a land.

**Body:**
```json
{
  "landId": "665f...",
  "requestedDuration": "12 Months",
  "message": "Interested in leasing this land."
}
```
| Field | Required |
|-------|----------|
| landId | ✅ |
| requestedDuration | ✅ |
| message | ❌ |

**201 Response:** the created [LeaseRequest](#leaserequest). A notification is sent to the owner.
**Errors:** `400` missing fields · `404` land not found · `400` land not available · `400` cannot request your own land · `400` you already have a pending request for this land.

---

#### GET /api/requests/seeker 🔒👤
All requests made by the current seeker. `landId` populated with `{ title, location, price, images, status }`; `ownerId` populated with `{ fullName, email, phone }`.
**200 Response:** array of [LeaseRequest](#leaserequest).

---

#### GET /api/requests/owner 🔒🏠
All incoming requests for the owner's lands. `seekerId` populated with `{ fullName, email, phone }`.
**200 Response:** array of [LeaseRequest](#leaserequest).

---

#### PUT /api/requests/:id/status 🔒🏠
Approve or reject a pending request.

**Body:**
```json
{
  "status": "approved",
  "startDate": "2026-08-01",
  "endDate": "2027-08-01"
}
```
| Field | Required | Notes |
|-------|----------|-------|
| status | ✅ | `approved` or `rejected` |
| startDate | ❌ | Defaults to now (approval only) |
| endDate | ❌ | Defaults to start + requested months (approval only) |

**On approval:** an [ActiveLease](#activelease) is created, the land is marked `leased`, other pending requests on the same land are auto-rejected, and the seeker is notified.

**200 Response:**
```json
{
  "request": { /* updated LeaseRequest */ },
  "activeLease": { /* ActiveLease, or null when rejected */ }
}
```
**Errors:** `400` invalid status value · `404` not found · `403` not your request · `400` request already approved/rejected.

---

### 4. Active Leases (`/api/leases`)

#### GET /api/leases/seeker 🔒👤
Active/past leases for the current seeker. `landId` and `ownerId` populated.
**200 Response:** array of [ActiveLease](#activelease).

#### GET /api/leases/owner 🔒🏠
Leases on the owner's lands. `landId` and `seekerId` populated.
**200 Response:** array of [ActiveLease](#activelease).

#### GET /api/leases/:id 🔒
Single lease. Accessible only to the involved seeker, involved owner, or an admin. `landId`, `ownerId`, `seekerId` populated.
**200 Response:** [ActiveLease](#activelease).
**Errors:** `404` not found · `403` not a party to this lease.

---

### 5. Payments (Demo) (`/api/payments`)

> **Demo mode.** No real money moves. The two-step create-intent → verify flow mirrors real gateways (Stripe PaymentIntent / Razorpay Order) so a real gateway can be dropped in later without changing the frontend contract much.

#### POST /api/payments/create-intent 🔒👤
Step 1 — create a pending transaction and a demo order for a lease.

**Body:** `{ "leaseId": "665f..." }`

**201 Response:**
```json
{
  "message": "Demo payment intent created. Call /verify to complete.",
  "transactionId": "665f...",
  "order": {
    "id": "demo_order_ab12cd34",
    "amount": 15000,
    "currency": "INR",
    "mode": "demo"
  }
}
```
**Errors:** `400` missing leaseId · `404` lease not found · `403` not your lease · `400` lease already paid.

---

#### POST /api/payments/verify 🔒👤
Step 2 — confirm the payment.

**Body:**
```json
{
  "transactionId": "665f...",
  "success": true,
  "paymentMethod": "upi"
}
```
| Field | Required | Notes |
|-------|----------|-------|
| transactionId | ✅ | From create-intent |
| success | ❌ | Defaults to `true`. Set `false` to simulate a failed payment |
| paymentMethod | ❌ | e.g. `card`, `upi`, `bank_transfer` |

**On success:** transaction marked `success`, the lease's `isPaid` set to `true`, and both parties notified.

**200 Response:**
```json
{
  "message": "Payment successful (demo)",
  "transaction": { /* updated Transaction, status: "success" */ }
}
```
**Errors:** `400` missing transactionId · `404` transaction not found · `403` not your transaction · `400` transaction already success/failed.

---

#### GET /api/payments/history 🔒👤
Payment history for the current seeker. `receiverId` and nested `leaseId.landId` populated.
**200 Response:** array of [Transaction](#transaction).

---

#### GET /api/payments/earnings 🔒🏠
Earnings summary for the owner.
**200 Response:**
```json
{
  "totalEarnings": 15000,
  "successfulPayments": 1,
  "transactions": [ /* array of Transaction, payerId + leaseId.landId populated */ ]
}
```

---

### 6. Notifications (`/api/notifications`)

#### GET /api/notifications 🔒
All notifications for the current user (newest first) plus an unread count.
**200 Response:**
```json
{
  "data": [ /* array of Notification */ ],
  "unreadCount": 3
}
```

#### PUT /api/notifications/:id/read 🔒
Mark one notification as read.
**200 Response:** updated [Notification](#notification).
**Errors:** `404` not found · `403` not yours.

#### PUT /api/notifications/read-all 🔒
Mark all as read.
**200 Response:** `{ "message": "All notifications marked as read" }`

---

### 7. Owner Module (`/api/owner`) 🏠
All owner routes require an authenticated **owner** token. Non-owners get `403`, missing/invalid tokens get `401`. Every endpoint is automatically scoped to the logged-in owner — an owner can only ever see or act on their own lands, requests, leases, and payments.

List endpoints return a **paginated wrapper**: `{ "data": [...], "page", "limit", "total", "totalPages" }`. Common query params: `page` (default 1), `limit` (default 20, max 100), `sort` (e.g. `-createdAt`).

> This module consolidates everything an owner dashboard needs under one namespace. The older generic routes (`/api/lands/owner/my-lands`, `/api/requests/owner`, `/api/leases/owner`, `/api/payments/earnings`) still work, but new frontend work should use `/api/owner/*`.

---

#### 7.1 Dashboard

##### GET /api/owner/dashboard/stats
Overview counters for the owner.
```json
{
  "lands": { "total": 8, "available": 5, "leased": 2, "unavailable": 1 },
  "requests": { "pending": 3 },
  "leases": { "active": 2, "completed": 1 },
  "earnings": { "total": 90000, "successfulPayments": 6, "pending": 15000 }
}
```

##### GET /api/owner/dashboard
Stats plus recent activity for the landing screen.
```json
{
  "stats": { "totalLands": 8, "leasedLands": 2, "pendingRequests": 3, "activeLeases": 2, "earnings": 90000 },
  "recent": {
    "requests": [ /* last 5 requests, land + seeker populated */ ],
    "leases": [ /* last 5 leases, land + seeker populated */ ],
    "transactions": [ /* last 5 received transactions, payer populated */ ]
  }
}
```

---

#### 7.2 My Lands — listing & controls

##### GET /api/owner/lands
List the owner's own lands (paginated).
| Query | Description |
|-------|-------------|
| status | `available` \| `leased` \| `unavailable` |
| location | partial match |
| search | title/description/location |
| minPrice, maxPrice | price range |
| page, limit, sort | pagination |

**200:** paginated wrapper of [Land](#land).

##### GET /api/owner/lands/:id
Own land with lease/request context.
```json
{ "land": { /* Land */ }, "activeLease": { /* or null, seeker populated */ }, "pendingRequests": 2 }
```
**Errors:** `404` not found · `403` not your land.

##### POST /api/owner/lands
Create a listing (owner taken from token).
**Body:** `{ "title", "description", "location", "area", "minLeaseDuration", "price", "images", "status" }`
Required: `title, location, area, minLeaseDuration, price`. `areaInAcres` and `minLeaseDurationInMonths` are auto-derived.
**201:** the created [Land](#land). **Errors:** `400` missing required fields.

##### PUT /api/owner/lands/:id
Edit own listing. Any subset of `title, description, location, price, images, area, minLeaseDuration`.
**200:** updated [Land](#land). **Errors:** `404` · `403` not your land.

##### PUT /api/owner/lands/:id/status
Toggle availability. **Body:** `{ "status": "unavailable" }` (`available` or `unavailable` only).
`leased` is managed automatically by the lease flow and cannot be set here.
**200:** `{ "_id", "status" }` · **Errors:** `400` invalid status · `400` cannot change while leased · `403` not your land.

##### DELETE /api/owner/lands/:id
Delete own listing. **Errors:** `400` cannot delete a land with an active lease · `403` not your land.

---

#### 7.3 Lease Requests — listing & controls

##### GET /api/owner/requests
Incoming requests for the owner's lands (paginated).
| Query | Description |
|-------|-------------|
| status | `pending` \| `approved` \| `rejected` |
| landId | filter to one land |
| page, limit, sort | pagination |

**200:** paginated wrapper of [LeaseRequest](#leaserequest) (land + seeker populated).

##### GET /api/owner/requests/:id
Single request (land + seeker populated). **Errors:** `404` · `403` not your request.

##### PUT /api/owner/requests/:id/status
Approve or reject a pending request.
**Body:**
```json
{ "status": "approved", "startDate": "2026-08-01", "endDate": "2027-08-01" }
```
`status` required (`approved`/`rejected`); `startDate`/`endDate` optional (default: now → now + requested months).
**On approval:** an [ActiveLease](#activelease) is created, the land is marked `leased`, other pending requests on that land are auto-rejected, and the seeker is notified.
**200:** `{ "request": { ... }, "activeLease": { ... } | null }`
**Errors:** `400` invalid status · `404` · `403` not your request · `400` request already approved/rejected.

---

#### 7.4 Active Leases — listing & controls

##### GET /api/owner/leases
Leases on the owner's lands (paginated).
| Query | Description |
|-------|-------------|
| status | `active` \| `completed` \| `terminated` |
| isPaid | `true` \| `false` |
| landId | filter to one land |
| page, limit, sort | pagination |

**200:** paginated wrapper of [ActiveLease](#activelease) (land + seeker populated).

##### GET /api/owner/leases/:id
Single lease (land + seeker populated). **Errors:** `404` · `403` not your lease.

##### PUT /api/owner/leases/:id/status
Complete or terminate an active lease. **Body:** `{ "status": "completed" }` (`completed` or `terminated`).
Both **free the land back to `available`** and notify the seeker. An owner cannot re-open a lease to `active`.
**200:** `{ "_id", "status" }` · **Errors:** `400` invalid status · `400` lease already completed/terminated · `403` not your lease.

---

#### 7.5 Payments / Earnings

##### GET /api/owner/payments/summary
Earnings overview.
```json
{
  "totalEarnings": 90000,
  "successfulPayments": 6,
  "pendingAmount": 15000,
  "pendingPayments": 1,
  "failedPayments": 0
}
```

##### GET /api/owner/payments
Received-transaction history (paginated). Response includes `totalSuccessAmount` for the current filter.
| Query | Description |
|-------|-------------|
| status | `pending` \| `success` \| `failed` |
| method | payment method |
| from, to | ISO date range on `createdAt` |
| page, limit, sort | pagination |

**200:** paginated wrapper of [Transaction](#transaction) (payer + nested lease→land populated) + `totalSuccessAmount`.

##### GET /api/owner/payments/:id
Single received transaction (payer + lease→land populated). **Errors:** `404` · `403` not your transaction.

##### GET /api/owner/payments/lease/:leaseId
Payment status + transactions for one of the owner's leases.
```json
{ "leaseId": "...", "isPaid": true, "rentAmount": 15000, "transactions": [ /* payer populated */ ] }
```
**Errors:** `404` · `403` not your lease.

##### GET /api/owner/payments/export
CSV download of the owner's received transactions. **Query:** `from`, `to`, `status`.
Returns `text/csv` with `Content-Disposition: attachment; filename="my-earnings.csv"`. Fetch as a blob and trigger a download.

---

### 8. User (Seeker) Module (`/api/user`) 👤
All user routes require an authenticated **seeker** token (role `user`). Non-seekers get `403`, missing/invalid tokens get `401`. Every endpoint is automatically scoped to the logged-in seeker — they only ever see or act on their own requests, leases, and payments.

List endpoints return a **paginated wrapper**: `{ "data": [...], "page", "limit", "total", "totalPages" }`. Common query params: `page` (default 1), `limit` (default 20, max 100), `sort` (e.g. `-createdAt`).

> This module consolidates everything a seeker dashboard needs under one namespace, mirroring the owner module. The older generic routes (`GET /api/lands`, `/api/requests/seeker`, `/api/leases/seeker`, `/api/payments/*`) still work, but new frontend work should use `/api/user/*`.

---

#### 8.1 Dashboard

##### GET /api/user/dashboard/stats
Overview counters for the seeker.
```json
{
  "requests": { "pending": 2, "approved": 3, "rejected": 1 },
  "leases": { "active": 2, "completed": 1, "unpaid": 1 },
  "spending": { "total": 30000, "payments": 2 }
}
```

##### GET /api/user/dashboard
Stats plus recent activity for the landing screen.
```json
{
  "stats": { "pendingRequests": 2, "activeLeases": 2, "unpaidLeases": 1, "totalSpent": 30000 },
  "recent": {
    "requests": [ /* last 5 requests, land + owner populated */ ],
    "leases": [ /* last 5 leases, land + owner populated */ ],
    "transactions": [ /* last 5 payments, receiver populated */ ]
  }
}
```

---

#### 8.2 Browse Lands

##### GET /api/user/lands
Browse lands available to lease (paginated). Defaults to `available` lands only.
| Query | Description |
|-------|-------------|
| location | partial match |
| minPrice, maxPrice | price range |
| minArea, maxArea | area range (acres) |
| search | title/description/location |
| status | override default (`available`/`leased`/`unavailable`) |
| page, limit, sort | pagination |

**200:** paginated wrapper of [Land](#land) (ownerId populated). Each item also has a `hasPendingRequest` boolean — `true` if the seeker already has a pending request on that land (useful to disable the "Request" button).

##### GET /api/user/lands/:id
Land detail plus the seeker's own request state on it.
```json
{
  "land": { /* Land, owner populated */ },
  "myRequest": { "status": "pending", "requestedDuration": "12 Months", "createdAt": "..." }
}
```
`myRequest` is `null` if the seeker hasn't requested this land.

---

#### 8.3 Lease Requests — listing & controls

##### GET /api/user/requests
The seeker's own requests (paginated).
| Query | Description |
|-------|-------------|
| status | `pending` \| `approved` \| `rejected` |
| landId | filter to one land |
| page, limit, sort | pagination |

**200:** paginated wrapper of [LeaseRequest](#leaserequest) (land + owner populated).

##### GET /api/user/requests/:id
Single request (land + owner populated). **Errors:** `404` · `403` not your request.

##### POST /api/user/requests
Submit a lease request.
**Body:** `{ "landId", "requestedDuration", "message" }` (message optional).
**201:** the created [LeaseRequest](#leaserequest). The owner is notified.
**Errors:** `400` missing fields · `404` land not found · `400` land not available · `400` cannot request your own land · `400` you already have a pending request for this land.

##### DELETE /api/user/requests/:id
Cancel/withdraw a **pending** request.
**200:** `{ "message": "Request cancelled", "_id": "..." }`
**Errors:** `404` · `403` not your request · `400` only pending requests can be cancelled.

---

#### 8.4 Active Leases — listing & detail

##### GET /api/user/leases
The seeker's leases (paginated).
| Query | Description |
|-------|-------------|
| status | `active` \| `completed` \| `terminated` |
| isPaid | `true` \| `false` |
| landId | filter to one land |
| page, limit, sort | pagination |

**200:** paginated wrapper of [ActiveLease](#activelease) (land + owner populated).

##### GET /api/user/leases/:id
Single lease (land + owner populated). **Errors:** `404` · `403` not your lease.

---

#### 8.5 Payments (Spending)

> Demo flow — same two-step create-intent → verify as the top-level payments module, scoped to the seeker.

##### GET /api/user/payments/summary
Spending overview.
```json
{
  "totalSpent": 30000,
  "successfulPayments": 2,
  "pendingAmount": 15000,
  "pendingPayments": 1,
  "failedPayments": 0
}
```

##### GET /api/user/payments
Payment history (paginated).
| Query | Description |
|-------|-------------|
| status | `pending` \| `success` \| `failed` |
| method | payment method |
| from, to | ISO date range on `createdAt` |
| page, limit, sort | pagination |

**200:** paginated wrapper of [Transaction](#transaction) (receiver + nested lease→land populated).

##### GET /api/user/payments/:id
Single transaction (receiver + lease→land populated). **Errors:** `404` · `403` not your transaction.

##### POST /api/user/payments/create-intent
Step 1 — create a pending transaction + demo order for a lease.
**Body:** `{ "leaseId": "..." }`
**201:**
```json
{
  "message": "Demo payment intent created. Call /verify to complete.",
  "transactionId": "...",
  "order": { "id": "demo_order_...", "amount": 15000, "currency": "INR", "mode": "demo" }
}
```
**Errors:** `400` missing leaseId · `404` lease not found · `403` not your lease · `400` lease already paid.

##### POST /api/user/payments/verify
Step 2 — confirm the payment.
**Body:** `{ "transactionId": "...", "success": true, "paymentMethod": "upi" }` (`success` defaults `true`; set `false` to simulate failure).
On success: transaction marked `success`, the lease's `isPaid` set `true`, both parties notified.
**200:** `{ "message": "Payment successful (demo)", "transaction": { ... } }`
**Errors:** `400` missing transactionId · `404` · `403` not your transaction · `400` transaction already success/failed.

---

### 9. Admin Module (`/api/admin`) 🛡️
All admin routes require an authenticated **admin** token. Non-admins get `403`, missing/invalid tokens get `401`.

List endpoints in this module return a **paginated wrapper**:
```json
{ "data": [ ... ], "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
```
Common pagination query params on all list endpoints: `page` (default 1), `limit` (default 20, max 100), `sort` (e.g. `-createdAt`, `price`).

---

#### 9.1 Dashboard

##### GET /api/admin/stats
Core dashboard counters.
```json
{
  "users": { "total": 42, "owners": 10, "seekers": 31 },
  "lands": { "total": 55, "available": 40, "leased": 15 },
  "activeLeases": 15,
  "revenue": 225000
}
```
> `revenue` = sum of all `success` transactions.

##### GET /api/admin/dashboard
Stats plus recent activity for the admin landing screen.
```json
{
  "stats": { "totalUsers": 42, "totalLands": 55, "activeLeases": 15, "revenue": 225000 },
  "recent": {
    "users": [ /* last 5 users: fullName, email, role, createdAt */ ],
    "lands": [ /* last 5 lands, ownerId populated */ ],
    "transactions": [ /* last 5 transactions, payer + receiver populated */ ]
  }
}
```

---

#### 9.2 Users — listing & controls

##### GET /api/admin/users
List/search users (paginated).
| Query | Description |
|-------|-------------|
| role | `user` \| `owner` \| `admin` |
| status | `active` \| `blocked` |
| search | matches name, email, or phone |
| page, limit, sort | pagination |

**200:** paginated wrapper of [User](#user) objects.

##### GET /api/admin/users/:id
Single user with a small activity snapshot.
```json
{ "user": { /* User */ }, "stats": { "landsCount": 3 } }
```

##### POST /api/admin/users
Create a user (admin can set **any** role, including `admin`).
**Body:** `{ "fullName", "email", "phone", "password", "role" }` (role optional, defaults `user`).
**201:** `{ _id, fullName, email, phone, role, isActive }`
**Errors:** `400` missing fields / email already registered.

##### PUT /api/admin/users/:id
Update user details. Any subset of `{ fullName, phone, email, profileImage, password }`.
**200:** updated user summary. **Errors:** `404` not found · `400` email already in use.

##### PUT /api/admin/users/:id/status
Block/activate. **Body:** `{ "isActive": false }` (omit to toggle).
**200:** `{ "_id", "isActive" }` · **Errors:** `404` · `400` cannot change an admin's status.

##### PUT /api/admin/users/:id/role
Change role. **Body:** `{ "role": "owner" }` (`user`/`owner`/`admin`).
**200:** `{ "_id", "role" }` · **Errors:** `400` invalid role · `400` cannot demote the last admin.

##### DELETE /api/admin/users/:id
Delete a user. **Errors:** `400` cannot delete your own account · `400` cannot delete the last admin.

---

#### 9.3 Lands — listing & controls

##### GET /api/admin/lands
All lands (paginated), any status.
| Query | Description |
|-------|-------------|
| status | `available` \| `leased` \| `unavailable` |
| location | partial match |
| ownerId | filter by owner |
| search | title/description/location |
| minPrice, maxPrice | price range |
| page, limit, sort | pagination |

**200:** paginated wrapper of [Land](#land) (ownerId populated).

##### GET /api/admin/lands/:id
Land detail with lease context.
```json
{ "land": { /* Land */ }, "activeLease": { /* or null */ }, "requestCount": 4 }
```

##### PUT /api/admin/lands/:id
Edit any land. Same fields as owner edit (`title, description, location, price, images, area, minLeaseDuration`). Numeric fields auto-derived.
**200:** updated [Land](#land).

##### PUT /api/admin/lands/:id/status
Force a status (moderation). **Body:** `{ "status": "unavailable" }`.
**200:** `{ "_id", "status" }`.

##### DELETE /api/admin/lands/:id
Delete a land. **Errors:** `400` cannot delete a land with an active lease.

---

#### 9.4 Leases — listing & controls

##### GET /api/admin/leases
All leases (paginated).
| Query | Description |
|-------|-------------|
| status | `active` \| `completed` \| `terminated` |
| isPaid | `true` \| `false` |
| ownerId, seekerId | filter by party |
| page, limit, sort | pagination |

**200:** paginated wrapper of [ActiveLease](#activelease) (land, owner, seeker populated).

##### GET /api/admin/leases/:id
Single lease, fully populated.

##### PUT /api/admin/leases/:id/status
Terminate/complete a lease. **Body:** `{ "status": "terminated" }` (`active`/`completed`/`terminated`).
Completing or terminating a lease **frees the land** back to `available`.
**200:** `{ "_id", "status" }`.

---

#### 9.5 Transactions — listing & controls

##### GET /api/admin/transactions
All transactions (paginated). Response includes an extra `totalSuccessAmount` for the current filter.
| Query | Description |
|-------|-------------|
| status | `pending` \| `success` \| `failed` |
| payerId, receiverId | filter by party |
| method | payment method |
| from, to | ISO date range on `createdAt` |
| page, limit, sort | pagination |

**200:**
```json
{ "data": [ /* Transactions */ ], "page": 1, "limit": 20, "total": 12, "totalPages": 1, "totalSuccessAmount": 180000 }
```

##### GET /api/admin/transactions/:id
Single transaction with payer, receiver, and nested lease→land populated.

##### PUT /api/admin/transactions/:id/status
Manual reconciliation. **Body:** `{ "status": "success" }` (`pending`/`success`/`failed`).
Marking `success` also sets the linked lease's `isPaid` to `true`.
**200:** `{ "_id", "status" }`.

---

#### 9.6 Reports & Analytics

##### GET /api/admin/reports/summary
Platform-wide KPIs.
```json
{
  "users": { "total": 42, "owners": 10, "seekers": 31, "blocked": 1 },
  "lands": { "total": 55, "available": 40, "leased": 15 },
  "leases": { "active": 15, "completed": 3 },
  "payments": { "revenue": 225000, "successfulPayments": 15, "pending": 2, "failed": 1 }
}
```

##### GET /api/admin/reports/revenue
Revenue time series from successful transactions.
**Query:** `from`, `to` (ISO dates; default last 12 months), `groupBy` = `month` (default) or `day`.
```json
{
  "from": "...", "to": "...", "groupBy": "month", "grandTotal": 225000,
  "series": [ { "period": "2026-06", "total": 45000, "transactions": 3 } ]
}
```

##### GET /api/admin/reports/users
New registrations over time, split by role.
**Query:** `from`, `to`, `groupBy` (`month`/`day`).
```json
{ "series": [ { "period": "2026-06", "user": 8, "owner": 2, "admin": 0, "total": 10 } ] }
```

##### GET /api/admin/reports/lands
Land breakdown by status and top locations.
```json
{
  "byStatus": [ { "status": "available", "count": 40 } ],
  "byLocation": [ { "location": "Thrissur, Kerala", "count": 12, "avgPrice": 18000 } ]
}
```

##### GET /api/admin/reports/top-owners
Owners ranked by earnings. **Query:** `limit` (default 10, max 50).
```json
{ "data": [ { "ownerId": "...", "fullName": "Ravi Owner", "email": "...", "earnings": 90000, "payments": 6 } ] }
```

##### GET /api/admin/reports/export/transactions
CSV download of transactions. **Query:** `from`, `to`, `status`.
Returns `text/csv` with `Content-Disposition: attachment; filename="transactions.csv"`. Fetch as a blob on the frontend and trigger a download.

---

#### 9.7 Settings

Settings are a single global document grouped into: `general`, `ui`, `platform`, `payment`, `notifications`.

##### GET /api/admin/settings 🛡️
Full settings object (all groups).

##### PUT /api/admin/settings 🛡️
Update one or more groups. Send any subset; provided keys are **merged** (unspecified keys keep their values).
**Body example:**
```json
{
  "ui": { "theme": "dark", "primaryColor": "#111111" },
  "general": { "siteName": "MyLand", "maintenanceMode": true }
}
```
**200:** the full updated settings document.

##### PUT /api/admin/settings/:group 🛡️
Update a single group (`general`|`ui`|`platform`|`payment`|`notifications`).
**Body:** flat key/values for that group, e.g. `PUT /api/admin/settings/notifications` with `{ "emailEnabled": true }`.
**200:** `{ "<group>": { ...updated group... } }` · **Errors:** `400` invalid group name.

##### POST /api/admin/settings/reset 🛡️
Reset all settings back to defaults.
**200:** `{ "message": "Settings reset to defaults", "settings": { ... } }`.

##### GET /api/settings/public 🔓
**Public, no auth.** Read-only branding/UI config for the frontend to render the app (theme, colors, logo, site name, currency, maintenance mode, enabled registration/payment methods). Admin-only fields (e.g. `payment.gateway`, `commissionPercent`) are **not** exposed. Fetch this on app load — before login — to theme the UI and check `general.maintenanceMode`.

**Settings fields reference:**

| Group | Fields |
|-------|--------|
| general | `siteName`, `supportEmail`, `supportPhone`, `currency`, `currencySymbol`, `maintenanceMode`, `maintenanceMessage` |
| ui | `theme` (`light`/`dark`/`system`), `primaryColor`, `accentColor`, `logoUrl`, `faviconUrl`, `itemsPerPage`, `dateFormat`, `showFeaturedLands`, `bannerText` |
| platform | `allowRegistration`, `allowOwnerRegistration`, `autoApproveLands`, `commissionPercent`, `minLeaseDurationMonths`, `maxImagesPerLand` |
| payment | `mode` (`demo`/`live`), `gateway`, `enabledMethods` |
| notifications | `emailEnabled`, `smsEnabled`, `inAppEnabled` |

---


## End-to-End Flow Example

A complete seeker→owner lease-and-pay cycle:

```js
// 1. Owner registers and logs in
const owner = await apiFetch("/api/auth/register", {
  method: "POST",
  body: { fullName: "Ravi Owner", email: "ravi@x.com", phone: "1", password: "pass123", role: "owner" },
});

// 2. Owner creates a land listing
const land = await apiFetch("/api/lands", {
  method: "POST",
  token: owner.token,
  body: { title: "Paddy Field", location: "Thrissur, Kerala", area: "2 acre", minLeaseDuration: "12 mo min", price: 15000 },
});

// 3. Seeker registers
const seeker = await apiFetch("/api/auth/register", {
  method: "POST",
  body: { fullName: "Anu Seeker", email: "anu@x.com", phone: "2", password: "pass123", role: "user" },
});

// 4. Seeker browses and requests a lease
const listing = await apiFetch("/api/lands?location=Thrissur");
const request = await apiFetch("/api/requests", {
  method: "POST",
  token: seeker.token,
  body: { landId: land._id, requestedDuration: "12 Months", message: "Interested!" },
});

// 5. Owner approves → ActiveLease is created
const approval = await apiFetch(`/api/requests/${request._id}/status`, {
  method: "PUT",
  token: owner.token,
  body: { status: "approved" },
});
const leaseId = approval.activeLease._id;

// 6. Seeker pays (demo)
const intent = await apiFetch("/api/payments/create-intent", {
  method: "POST",
  token: seeker.token,
  body: { leaseId },
});
await apiFetch("/api/payments/verify", {
  method: "POST",
  token: seeker.token,
  body: { transactionId: intent.transactionId, success: true, paymentMethod: "upi" },
});

// 7. Owner checks earnings
const earnings = await apiFetch("/api/payments/earnings", { token: owner.token });
// earnings.totalEarnings === 15000
```

---

## Frontend Integration Notes

**Token handling.** Store the JWT after login/register and attach it to every protected request. On any `401`, clear the stored token and redirect to login (token expired or invalid). On `403` for a deactivated account, show an "account disabled" message.

**Role-based UI.** The user object includes `role`. Use it to render the correct dashboard (seeker / owner / admin) and to hide actions the user can't perform. The backend still enforces roles, so client-side checks are for UX only.

**Displaying area & duration.** Show the human strings (`area`, `minLeaseDuration`, `requestedDuration`) in the UI. Use the numeric fields (`areaInAcres`, `minLeaseDurationInMonths`, `requestedDurationInMonths`) for slider filters, sorting, and comparisons.

**Land browsing.** `GET /api/lands` returns a paginated wrapper (`data`, `page`, `total`, `totalPages`) — build pagination controls from these. Remember it defaults to `available` only; pass `status` explicitly for owner/admin views that need all listings.

**Lease request states.** After a seeker submits a request it's `pending`. Poll or refetch `/api/requests/seeker` to reflect owner approval/rejection. When approved, an ActiveLease exists and the seeker should be prompted to pay.

**Payment UX.** Treat it as two calls: `create-intent` (get `transactionId`), then `verify`. In demo mode you can call them back-to-back on a "Pay Now" click. When you later add a real gateway, only the middle step (the gateway's checkout UI) gets inserted — the two endpoints stay. To test a failed payment, send `success: false` to `verify`.

**Notifications.** Fetch `/api/notifications` on load and after key actions (new request, approval, payment) to update the unread badge from `unreadCount`. There's no websocket/push yet — poll on an interval or refetch after actions.

**Dates.** All timestamps are ISO 8601 UTC strings. Format them client-side to the user's locale.

**Errors.** Every error has a `message` field — surface it directly to users or map known messages to friendlier copy. Duplicate email, "already have a pending request", and "lease already paid" are the most common `400`s worth handling with specific UI.
