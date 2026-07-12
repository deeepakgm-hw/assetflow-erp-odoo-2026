# AssetFlow ERP Frontend

This is the React + Vite frontend for the **AssetFlow Enterprise Asset & Resource Management ERP** application.

## Technologies Used

*   **React** (v18)
*   **Vite** (v5)
*   **TailwindCSS** (v3)
*   **React Router DOM** (v6)
*   **Axios**
*   **React Hook Form**
*   **React Hot Toast**
*   **Socket.io Client** (v4)
*   **Heroicons**

---

## Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm (v9 or higher)

### Installation

1.  Navigate to the `client/` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Configuration

Create a `.env` file in the root of the `client/` directory (or use the pre-configured one):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Running the App

To start the Vite development server on `http://localhost:3000`:

```bash
npm run dev
```

To build the application for production:

```bash
npm run build
```

---

## Directory Structure

```
client/
├── public/
├── src/
│   ├── assets/
│   ├── components/        # Reusable UI controls (Button, Card, DataTable, etc.)
│   ├── context/           # AuthContext
│   ├── hooks/             # useAuth, useSocket hooks
│   ├── layouts/           # DashboardLayout
│   ├── pages/             # Authentication & dashboard workspace panels
│   ├── routes/            # Route protections (ProtectedRoute, AdminRoute)
│   ├── services/          # API Axios configuration and service endpoints
│   ├── App.jsx            # Application routing setup
│   ├── index.css          # Main Tailwind styles
│   └── main.jsx           # Mount entry point
├── .env                   # Local variables setup
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## Key Features

1.  **Authentication**: Modern dark-themed glassmorphism interface supporting user sign-in and employee signup.
2.  **Organization Setup**: Comprehensive controls for Managing Departments (circular dependency constraints and head mapping checks are built-in), Category CRUD with dynamically-editable JSON metadata fields, and paginated/filterable Employee directory.
3.  **Real-Time Notifications**: Automated Socket.io channel listener providing toast popup notifications and immediate unread notifications badge indicators.
4.  **Audit Trails**: Complete chronological list of system actions with quick search filters.
