# AssetFlow ERP Backend

AssetFlow is an Enterprise Asset & Resource Management ERP backend built with Node.js, Express, PostgreSQL, Prisma ORM, and Socket.io. It supports tracking asset lifecycles, real-time alerts, role-based controls, activity audit trails, and department hierarchy structures.

---

## 🛠️ Stack & Technologies
- **Runtime**: Node.js v20+
- **Framework**: Express.js
- **Database**: PostgreSQL (Dockerized or Local)
- **ORM**: Prisma ORM v6
- **Authentication**: JWT & bcrypt
- **Real-Time Communications**: Socket.io
- **Security**: Helmet & CORS
- **Request Validation**: express-validator

---

## 🚀 Setup & Installation

### 1. Install System Dependencies
Ensure you have Node.js and npm installed. From the `server` directory, run:
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Create or verify the `.env` file in the `server` directory:
```env
DATABASE_URL="postgresql://assetflow:assetflow123@localhost:5432/assetflow"
PORT=5000
JWT_SECRET=supersecret
```

### 3. Database Migrations & Seeding
Start your PostgreSQL database (via Docker or local system). Then run migrations and seed initial data:
```bash
# Run migrations to create schema
npx prisma migrate dev

# Seed database with Departments, Categories, and Admin User
npx prisma db seed
```

### 4. Running the Server
Start the development server with live reload:
```bash
npm run dev
```
The API server will run at `http://localhost:5000` and initialize Socket.io.

---

## 🔌 API Documentation & Test Suite

### 1. Authentication Module (`/api/auth`)

#### Sign Up (Public)
- **Endpoint**: `POST /api/auth/signup`
- **Enforces Role**: `Employee`
- **Request Body**:
  ```json
  {
    "name": "Jane Employee",
    "email": "jane.employee@assetflow.com",
    "password": "Password123"
  }
  ```
- **Curl Test**:
  ```bash
  curl -X POST http://localhost:5000/api/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"name": "Jane Employee", "email": "jane.employee@assetflow.com", "password": "Password123"}'
  ```

#### Log In (Public)
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "admin@assetflow.com",
    "password": "Admin@123"
  }
  ```
- **Curl Test**:
  ```bash
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@assetflow.com", "password": "Admin@123"}'
  ```

#### Forgot Password Stub (Public)
- **Endpoint**: `POST /api/auth/forgot-password`
- **Curl Test**:
  ```bash
  curl -X POST http://localhost:5000/api/auth/forgot-password
  ```

---

### 2. Departments Module (`/api/departments`) — [Admin Only]
*Requires JWT Bearer Token in `Authorization` header.*

#### Get All Departments
- **Endpoint**: `GET /api/departments`
- **Curl Test**:
  ```bash
  curl -X GET http://localhost:5000/api/departments \
    -H "Authorization: Bearer <JWT_TOKEN>"
  ```

#### Create Department
- **Endpoint**: `POST /api/departments`
- **Request Body**:
  ```json
  {
    "name": "QA Testing",
    "parentDepartmentId": null,
    "headId": null
  }
  ```
- **Curl Test**:
  ```bash
  curl -X POST http://localhost:5000/api/departments \
    -H "Authorization: Bearer <JWT_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"name": "QA Testing"}'
  ```

#### Update Department
- **Endpoint**: `PUT /api/departments/:id`
- **Request Body**:
  ```json
  {
    "name": "Quality Assurance",
    "parentDepartmentId": 1,
    "headId": 1
  }
  ```
- **Curl Test**:
  ```bash
  curl -X PUT http://localhost:5000/api/departments/4 \
    -H "Authorization: Bearer <JWT_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"name": "Quality Assurance", "parentDepartmentId": 1}'
  ```

#### Toggle Department Status (Active/Inactive)
- **Endpoint**: `PATCH /api/departments/:id/status`
- **Request Body**:
  ```json
  {
    "status": "Inactive"
  }
  ```
- **Curl Test**:
  ```bash
  curl -X PATCH http://localhost:5000/api/departments/4/status \
    -H "Authorization: Bearer <JWT_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"status": "Inactive"}'
  ```

#### Assign Department Head
- **Endpoint**: `PATCH /api/departments/:id/head`
- **Request Body**:
  ```json
  {
    "headId": 2
  }
  ```
- **Curl Test**:
  ```bash
  curl -X PATCH http://localhost:5000/api/departments/4/head \
    -H "Authorization: Bearer <JWT_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"headId": 2}'
  ```

#### Delete Department
- **Endpoint**: `DELETE /api/departments/:id`
- **Curl Test**:
  ```bash
  curl -X DELETE http://localhost:5000/api/departments/4 \
    -H "Authorization: Bearer <JWT_TOKEN>"
  ```

---

### 3. Categories Module (`/api/categories`) — [Admin Only]
*Requires JWT Bearer Token in `Authorization` header.*

#### Get All Categories
- **Endpoint**: `GET /api/categories`
- **Curl Test**:
  ```bash
  curl -X GET http://localhost:5000/api/categories \
    -H "Authorization: Bearer <JWT_TOKEN>"
  ```

#### Create Category
- **Endpoint**: `POST /api/categories`
- **Request Body**:
  ```json
  {
    "name": "Tablet",
    "customFields": {
      "OS": "iOS",
      "Storage": "256GB"
    }
  }
  ```
- **Curl Test**:
  ```bash
  curl -X POST http://localhost:5000/api/categories \
    -H "Authorization: Bearer <JWT_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"name": "Tablet", "customFields": {"OS": "iOS", "Storage": "256GB"}}'
  ```

#### Update Category
- **Endpoint**: `PUT /api/categories/:id`
- **Request Body**:
  ```json
  {
    "name": "Pro Tablets",
    "customFields": {
      "OS": "iOS/Android",
      "Storage": "512GB"
    }
  }
  ```
- **Curl Test**:
  ```bash
  curl -X PUT http://localhost:5000/api/categories/4 \
    -H "Authorization: Bearer <JWT_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"name": "Pro Tablets", "customFields": {"OS": "iOS/Android"}}'
  ```

#### Delete Category
- **Endpoint**: `DELETE /api/categories/:id`
- **Curl Test**:
  ```bash
  curl -X DELETE http://localhost:5000/api/categories/4 \
    -H "Authorization: Bearer <JWT_TOKEN>"
  ```

---

### 4. Employee Directory Module (`/api/employees`) — [Admin Only]
*Requires JWT Bearer Token in `Authorization` header.*

#### List Employees (with search, filter, pagination)
- **Endpoint**: `GET /api/employees?search=&departmentId=&role=&page=1&limit=10`
- **Curl Test**:
  ```bash
  curl -X GET "http://localhost:5000/api/employees?page=1&limit=5&search=Jane" \
    -H "Authorization: Bearer <JWT_TOKEN>"
  ```

#### Promote Role (Employee -> DeptHead / AssetManager / Admin)
- **Endpoint**: `PATCH /api/employees/:id/role`
- **Request Body**:
  ```json
  {
    "role": "DeptHead"
  }
  ```
- **Curl Test**:
  ```bash
  curl -X PATCH http://localhost:5000/api/employees/2/role \
    -H "Authorization: Bearer <JWT_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"role": "DeptHead"}'
  ```

#### Assign Department
- **Endpoint**: `PATCH /api/employees/:id/department`
- **Request Body**:
  ```json
  {
    "departmentId": 1
  }
  ```
- **Curl Test**:
  ```bash
  curl -X PATCH http://localhost:5000/api/employees/2/department \
    -H "Authorization: Bearer <JWT_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"departmentId": 1}'
  ```

---

### 5. Activity Audit Logs (`/api/activity`) — [Admin Only]
*Requires JWT Bearer Token in `Authorization` header.*

#### Fetch Activity Logs (with pagination & filters)
- **Endpoint**: `GET /api/activity?page=1&limit=20&entityType=Department&search=`
- **Curl Test**:
  ```bash
  curl -X GET "http://localhost:5000/api/activity?page=1&limit=10" \
    -H "Authorization: Bearer <JWT_TOKEN>"
  ```

---

### 6. Notifications Module (`/api/notifications`) — [Protected]
*Requires JWT Bearer Token. Returns items specific to the logged-in user.*

#### Get User Notifications
- **Endpoint**: `GET /api/notifications?type=All`
- **Supported types**: `All`, `Alerts`, `Approvals`, `Bookings`
- **Curl Test**:
  ```bash
  curl -X GET "http://localhost:5000/api/notifications?type=All" \
    -H "Authorization: Bearer <JWT_TOKEN>"
  ```

#### Mark Notification as Read
- **Endpoint**: `PATCH /api/notifications/:id/read`
- **Curl Test**:
  ```bash
  curl -X PATCH http://localhost:5000/api/notifications/1/read \
    -H "Authorization: Bearer <JWT_TOKEN>"
  ```

---

## 🛜 Real-Time Events (Socket.io)
Connected clients should register themselves on connection to receive notifications:
1. Connect to Socket.io: `const socket = io("http://localhost:5000");`
2. Join user room: `socket.emit("join", userId);` (where `userId` is the authenticated user's ID).
3. Listen for event:
   ```javascript
   socket.on("notification", (data) => {
     console.log("New notification received:", data);
   });
   ```
