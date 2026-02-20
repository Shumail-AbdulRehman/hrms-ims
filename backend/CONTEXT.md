# HRMS & IMS Backend — Project Context

> Use this file to onboard any developer or AI model to this project.
> Last updated: 2026-02-20

---

## Tech Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js v20 (ES Modules) |
| Framework | Express v5 |
| Database | MongoDB Atlas (Mongoose v9) |
| Validation | Zod v4 |
| Auth | JWT (access + refresh tokens), bcrypt |
| Dev | Nodemon |

---

## Directory Structure

```
/Hrms-Ims/backend/
├── src/
│   ├── index.js
│   ├── config/
│   │   └── roles.js
│   ├── db/
│   │   └── index.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── authorize.middleware.js
│   ├── models/
│   │   ├── counter.model.js
│   │   ├── personnel.model.js
│   │   ├── unit.model.js
│   │   ├── itemMaster.model.js
│   │   ├── vendor.model.js
│   │   ├── stockIn.model.js
│   │   ├── stockOut.model.js
│   │   ├── stockRequest.model.js
│   │   └── stockReturn.model.js
│   ├── services/
│   │   ├── personnel.service.js
│   │   ├── unit.service.js
│   │   ├── vendor.service.js
│   │   ├── inventory-operator.service.js
│   │   └── stock-request.service.js
│   ├── controllers/
│   │   ├── personnel.controller.js
│   │   ├── unit.controller.js
│   │   ├── vendor.controller.js
│   │   ├── inventory-operator.controller.js
│   │   └── stock-request.controller.js
│   ├── routes/
│   │   ├── personnel.route.js
│   │   ├── unit.route.js
│   │   ├── vendor.route.js
│   │   ├── inventory-operator.route.js
│   │   └── stock-request.route.js
│   └── utils/
│       ├── ApiError.js
│       ├── ApiResponse.js
│       └── asyncHandler.js
├── .env
├── CONTEXT.md (this file)
├── HRMS-IMS-Inventory-Operator.postman_collection.json
└── package.json
```

---

## Architecture Pattern

```
Request → Route → [verifyJwt] → [authorize(module, action)] → Controller (Zod) → Service → Model
```

- Routes: HTTP method + path, middleware chain
- Controllers: Zod validation, call service, return ApiResponse
- Services: business logic, DB queries, ApiError on failure
- Models: Mongoose schemas, pre-save hooks for auto-generated IDs

---

## Authentication & Authorization

### Bootstrapping
There is NO public signUp endpoint. The first super_admin must be seeded directly in MongoDB with a bcrypt-hashed password. That super_admin then logs in and creates all other users via the protected `POST /personnel/create` endpoint.

### Auth Flow
1. User signs in → gets accessToken (1d) + refreshToken (10d) as JWT
2. Token sent via Authorization: Bearer header or cookie
3. verifyJwt middleware → decodes token → fetches full user from DB → sets req.user
4. authorize(module, action) → checks roles[req.user.role][module].includes(action)
5. Wildcard "*" in roles grants access to all actions in that module

### RBAC Roles

| Role | units | hrms | ims |
|---|---|---|---|
| super_admin | manage | * | * |
| admin | — | manage_users, approve_discipline, approve_leave, view_unit_data | approve_procurement, view_inventory, transfer_stock |
| hr_officer | — | create_employee, mark_attendance, approve_leave, create_training, create_discipline, view_unit_data | — |
| supervisor | — | view_team_data, apply_leave, create_discipline | — |
| employee | — | view_own_profile, apply_leave, view_training, view_attendance, acknowledge_discipline | request_stock_out |
| hrms_audit_officer | — | read_only, view_audit_logs | — |
| store_manager | — | — | register_item, create_procurement_request, manage_vendors, view_inventory |
| inventory_operator | — | — | process_stock_in, approve_stock_out, process_stock_return, view_inventory |
| ims_audit_officer | — | — | read_only, view_audit_logs |

### Unit-Based Data Isolation
- Every user belongs to a unit (ObjectId ref)
- All queries filter by req.user.unit automatically
- Items, stock records, requests, vendors — all have a unit field
- Super Admin's unit CRUD is global (no unit filter)
- Admin sees only their own unit's personnel
- Vendors are auto-assigned to the Store Manager's unit on creation

---

## API Endpoints

### Personnel — /api/v1/personnel

| Method | Path | Auth | Permission | Description |
|---|---|---|---|---|
| POST | /signIn | Public | — | Login (email + password), returns accessToken + refreshToken |
| POST | /create | Protected | hrms.manage_users | Create personnel with role assignment (Admin → own unit, Super Admin → any unit) |
| GET | / | Protected | hrms.manage_users | List personnel (Admin → own unit, Super Admin → all) |
| GET | /:id | Protected | hrms.manage_users | Get single personnel |
| PUT | /:id | Protected | hrms.manage_users | Update personnel (Admin can't change unit) |

**Create body:**
```json
{
  "firstName": "Ahmed",
  "lastName": "Khan",
  "email": "ahmed@example.com",
  "password": "changeme123",
  "role": "employee",
  "unit": "ObjectId",
  "designation": "Clerk",
  "department": "Operations"
}
```
- password defaults to "changeme123" if not provided
- Admin: unit field is ignored, auto-set to admin's own unit
- Super Admin: unit field is required

### Units — /api/v1/units (Super Admin only, permission: units.manage)

| Method | Path | Description |
|---|---|---|
| POST | / | Create unit (name, code, location) |
| GET | / | List active units (?showInactive=true for all) |
| GET | /:id | Get single unit |
| PUT | /:id | Update unit info |
| PATCH | /:id/deactivate | Soft delete (isActive → false) |
| PATCH | /:id/activate | Reactivate |

### Vendors — /api/v1/vendors (Store Manager, permission: ims.manage_vendors)

| Method | Path | Description |
|---|---|---|
| POST | / | Create vendor — auto-assigned to Store Manager's unit |
| GET | / | List active vendors in unit (?showInactive=true for all) |
| GET | /:id | Get single vendor (must be in same unit) |
| PUT | /:id | Update vendor info (must be in same unit) |
| PATCH | /:id/deactivate | Soft delete |
| PATCH | /:id/activate | Reactivate |

**Create body:**
```json
{
  "name": "ABC Supplies",
  "contact": "Mr. Khan",
  "phone": "0300-1234567",
  "email": "abc@supplies.com",
  "address": "123 Main St"
}
```
- Only `name` is required
- Unit is NOT in the body — it's auto-assigned from the logged-in Store Manager's unit
- Duplicate vendor names are prevented within the same unit
- All responses include populated unit info (name + code)

### Inventory Operator — /api/v1/inventory

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | /stock-in | process_stock_in | Receive items (increments currentStock) |
| GET | /stock-requests | approve_stock_out | View stock out requests (?status=pending) |
| PATCH | /stock-requests/:id/approve | approve_stock_out | Approve → creates StockOut, decrements stock |
| PATCH | /stock-requests/:id/reject | approve_stock_out | Reject (requires rejectionReason in body) |
| POST | /stock-returns | process_stock_return | Process return (excess → stock up, damaged → no change) |
| GET | /inventory | view_inventory | List all items in unit |
| GET | /inventory/:id | view_inventory | Single item detail |
| GET | /stock-history | view_inventory | History (?type=in|out|return&startDate=&endDate=) |

### Employee Stock Requests — /api/v1/stock-requests (permission: ims.request_stock_out)

| Method | Path | Description |
|---|---|---|
| POST | / | Create stock out request (item, quantity, purpose) |
| GET | /my | View own requests |

---

## Models

### Counter
- Atomic sequential ID generator using findOneAndUpdate + $inc
- Separate counter per prefix: ITM, RCV, REQ, RET
- Prevents duplicate IDs under concurrent requests

### Personnel (User)
- Auto-generated employeeId (UUID-based: EMP-XXXXXXXX)
- Fields: firstName, lastName, email, password, role, unit, designation, department, supervisor, status, employeeType, joiningDate
- Password hashed with bcrypt, JWT methods for access/refresh tokens
- No public registration — created only by Admin/Super Admin

### Unit
- Fields: name, code (unique, uppercase), location, isActive
- Managed exclusively by Super Admin

### Vendor
- Fields: name (required), contact, phone, email, address, unit, isActive
- Unit is auto-assigned from the creating Store Manager's unit
- Duplicate names prevented within same unit
- All responses populate unit with name + code

### ItemMaster
- Auto-generated itemId (ITM-00001)
- Fields: name, category (enum), uom, currentStock, minStockLevel, unit, isActive
- currentStock modified by stock in/out/return operations

### StockIn
- Auto-generated receiptId (RCV-00001)
- Fields: item, quantity, vendor (optional), receivedBy, remarks, unit

### StockOut
- Created automatically when a StockRequest is approved
- Fields: item, quantity, purpose, issuedTo, issuedBy, remarks, unit

### StockRequest
- Auto-generated requestId (REQ-00001)
- Fields: item, quantity, purpose, requestedBy, status, reviewedBy, rejectionReason, unit, remarks
- Employee creates → Inventory Operator approves/rejects

### StockReturn
- Auto-generated returnId (RET-00001)
- Fields: item, quantity, returnedBy, receivedBy, returnReason (damaged/excess), unit, remarks
- "excess" → currentStock incremented back
- "damaged" → recorded only, no stock change

---

## Business Flows

### System Bootstrap Flow
```
1. Seed super_admin directly in MongoDB (hashed password)
2. Super Admin logs in → creates Units
3. Super Admin creates Admin for each unit
4. Admin logs in → creates HR, Store Manager, Operators, Employees in their unit
5. Store Manager creates Vendors (auto-assigned to their unit)
6. Inventory Operator receives stock, processes requests/returns
```

### Personnel Creation Flow
```
Super Admin → POST /personnel/create { ..., unit: "unitId", role: "admin" }
           → Personnel created in specified unit with assigned role

Admin → POST /personnel/create { ..., role: "employee" }
      → Unit auto-set to admin's own unit (unit field in body ignored)
      → Cannot create personnel in other units
```

### Vendor Management Flow (Store Manager)
```
Store Manager → POST /vendors { name, contact, phone }
             → Vendor created, unit auto-assigned from Store Manager's unit
             → Response includes { unit: { name: "Lahore Office", code: "LHR-01" } }
             → Duplicate name in same unit prevented

Store Manager → GET /vendors
             → Returns only active vendors in their unit
             → ?showInactive=true to include deactivated
```

### Stock In Flow (Inventory Operator)
```
Operator → POST /inventory/stock-in { item, quantity, vendor?, remarks? }
         → StockIn record created (RCV-00001)
         → ItemMaster.currentStock += quantity
```

### Stock Request Flow (Employee → Operator)
```
Employee → POST /stock-requests { item, quantity, purpose }
         → StockRequest created (REQ-00001, status: pending)

Operator → PATCH /inventory/stock-requests/:id/approve
         → Checks stock availability
         → StockOut auto-created, currentStock decremented

Operator → PATCH /inventory/stock-requests/:id/reject
         → rejectionReason recorded, no stock change
```

### Stock Return Flow
```
Operator → POST /inventory/stock-returns { item, quantity, returnedBy, returnReason }
         → If "excess" → currentStock += quantity
         → If "damaged" → no stock change (loss recorded)
```

---

## What's NOT Built Yet

| Feature | Role | Status |
|---|---|---|
| Item registration (CRUD) | Store Manager | Not started |
| Procurement requests | Store Manager → Admin | Not started |
| Attendance | HR Officer | Not started |
| Leave management | HR/Employee/Supervisor | Not started |
| Training | HR Officer | Not started |
| Discipline | HR/Supervisor → Admin | Not started |
| Transfers | Admin | Not started |
| Audit logs | Audit Officers | Not started |

---

## Environment Variables (.env)

```
MONGODB_URL=mongodb+srv://...
ACCESS_TOKEN_SECRET=<secret>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<secret>
REFRESH_TOKEN_EXPIRY=10d
PORT=8000
```

---

## How to Run

```bash
cd /Hrms-Ims/backend
npm install
npm run dev
```

Server runs on http://localhost:8000

## Frontend

```bash
cd /Hrms-Ims/frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173 (Vite proxy forwards /api to backend)

## Testing

Postman collection: HRMS-IMS-Inventory-Operator.postman_collection.json
