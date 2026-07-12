# AssetFlow ERP — Full-Stack Enterprise Asset & Resource Management

AssetFlow is a production-ready Enterprise Asset & Resource Management ERP system. It features a professional glassmorphic dark theme dashboard in React (Vite) and a robust backend built with Node.js, Express, PostgreSQL, Prisma ORM, and Socket.io.

---

## 🛠️ Stack & Technologies

### Backend (`/server`)
- **Runtime**: Node.js v20+
- **Framework**: Express.js
- **Database**: PostgreSQL (Dockerized or Local)
- **ORM**: Prisma ORM v6
- **Authentication**: JWT & bcrypt
- **Real-Time Communications**: Socket.io
- **Security**: Helmet & CORS
- **Request Validation**: express-validator

### Frontend (`/client`)
- **Framework**: React v18 (Vite build system)
- **Styling**: TailwindCSS (Custom dark theme, outfit/inter typography)
- **Routing**: React Router DOM (v6 with protected routes and role gates)
- **State & Form Handling**: React Hook Form, React Context API
- **Feedback**: React Hot Toast (Real-time Socket popup alerts)
- **Icons**: Heroicons

---

## 🚀 Unified Setup & Running Both Layers

### 1. Prerequisite: Database (PostgreSQL)
Ensure you have a PostgreSQL instance running. If you are using Docker, you can start a database with:
```bash
docker run --name assetflow-db -e POSTGRES_USER=assetflow -e POSTGRES_PASSWORD=assetflow123 -e POSTGRES_DB=assetflow -p 5432:5432 -d postgres
```

### 2. Configure Environment Variables
You must configure variables in both layers:

#### Backend Environment (`server/.env`)
Create `server/.env` with:
```env
DATABASE_URL="postgresql://assetflow:assetflow123@localhost:5432/assetflow"
PORT=5000
JWT_SECRET=supersecret
```

#### Frontend Environment (`client/.env`)
Create `client/.env` with:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Install Workspace Dependencies
Install dependencies for both frontend and backend concurrently from the root directory:
```bash
# Install root utility tool (concurrently)
npm install

# Install client and server packages
npm run install:all
```

### 4. Run Migrations & Seed Database
Setup the database tables and initial lookup records (Departments, Categories, and default Admin user):
```bash
# Run database migrations
npm run prisma:migrate

# Seed lookup records & admin account
npm run prisma:seed
```

### 5. Launch Both Servers Concurrently
Run both servers with a single command from the root directory:
```bash
npm run dev
```
- **Frontend App**: runs at `http://localhost:3000`
- **Backend API**: runs at `http://localhost:5000`

---

## 🔑 Default Accounts (For Testing)
Use these seeded accounts to log in:

1. **System Administrator (Admin Role)**:
   - **Email**: `admin@assetflow.com`
   - **Password**: `Admin@123`

2. **Asset Manager (AssetManager Role)**:
   - **Email**: `manager@assetflow.com`
   - **Password**: `Manager@123`

3. **Department Head (DeptHead Role)**:
   - **Email**: `head@assetflow.com`
   - **Password**: `Head@123`

4. **General Employee (Employee Role)**:
   - **Email**: `employee@assetflow.com`
   - **Password**: `Employee@123`

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

---

### 2. Departments Module (`/api/departments`) — [Admin Only]
*Requires JWT Bearer Token in `Authorization` header.*

#### Get All Departments
- **Endpoint**: `GET /api/departments`

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

#### Update Department
- **Endpoint**: `PUT /api/departments/:id`

#### Toggle Department Status (Active/Inactive)
- **Endpoint**: `PATCH /api/departments/:id/status`
- **Request Body**:
  ```json
  {
    "status": "Inactive"
  }
  ```

#### Assign Department Head
- **Endpoint**: `PATCH /api/departments/:id/head`

#### Delete Department
- **Endpoint**: `DELETE /api/departments/:id`

---

### 3. Categories Module (`/api/categories`) — [Admin Only]
*Requires JWT Bearer Token in `Authorization` header.*

#### Get All Categories
- **Endpoint**: `GET /api/categories`

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

#### Update Category
- **Endpoint**: `PUT /api/categories/:id`

#### Delete Category
- **Endpoint**: `DELETE /api/categories/:id`

---

### 4. Employee Directory Module (`/api/employees`) — [Admin Only]
*Requires JWT Bearer Token in `Authorization` header.*

#### List Employees (with search, filter, pagination)
- **Endpoint**: `GET /api/employees?search=&departmentId=&role=&page=1&limit=10`

#### Promote Role (Employee -> DeptHead / AssetManager / Admin)
- **Endpoint**: `PATCH /api/employees/:id/role`
- **Request Body**:
  ```json
  {
    "role": "DeptHead"
  }
  ```

#### Assign Department
- **Endpoint**: `PATCH /api/employees/:id/department`
- **Request Body**:
  ```json
  {
    "departmentId": 1
  }
  ```

---

### 5. Activity Audit Logs (`/api/activity`) — [Admin Only]
*Requires JWT Bearer Token in `Authorization` header.*

#### Fetch Activity Logs (with pagination & filters)
- **Endpoint**: `GET /api/activity?page=1&limit=20&entityType=Department&search=`

---

### 6. Notifications Module (`/api/notifications`) — [Protected]
*Requires JWT Bearer Token. Returns items specific to the logged-in user.*

#### Get User Notifications
- **Endpoint**: `GET /api/notifications?type=All`

#### Mark Notification as Read
- **Endpoint**: `PATCH /api/notifications/:id/read`

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
