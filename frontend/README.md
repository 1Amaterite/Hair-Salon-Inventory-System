# Inventory System Frontend

A simple React frontend for the Hair Salon Inventory System.

## Tech Stack

- React (Vite)
- TypeScript
- Tailwind CSS
- Axios
- React Router

## Getting Started

### Prerequisites

1. Backend server must be running on `http://localhost:3000`
2. Install dependencies: `npm install`

### Running the Frontend

```bash
npm run dev
```

The frontend will be available at `http://localhost:5176`

## Features

### Login Page
- Username and password authentication
- JWT token storage in localStorage
- Redirects to transactions page after successful login

### Transactions Page
- Create new inventory transactions
- Dropdown to select products
- Transaction types: INBOUND, OUTBOUND, USAGE
- Quantity input with stock validation
- Success/error messages
- Show current stock for selected product

### Products Page
- Display all active products
- Shows computed stock from backend API
- Product details: name, SKU, category, stock level
- Low stock indicators
- Navigation to transactions page

## API Integration

The frontend connects to the following backend endpoints:

- `POST /api/auth/login` - Authentication
- `GET /api/products` - Fetch products with current stock
- `POST /api/transactions` - Create transactions

## Test Credentials

Use the seeded users from the backend:

**Admin User:**
- Username: `admin`
- Password: `admin123`

**Staff User:**
- Username: `staff`  
- Password: `staff123`

## Project Structure

```
src/
├── api/
│   ├── axios.ts          # Axios instance with auth
│   ├── auth.ts           # Auth API functions
│   ├── products.ts       # Products API functions
│   └── transactions.ts   # Transactions API functions
├── pages/
│   ├── Login.tsx         # Login page
│   ├── Transactions.tsx  # Transaction creation
│   └── Products.tsx      # Products list
├── App.tsx               # Main app with routing
├── main.tsx              # Entry point
└── index.css             # Tailwind CSS
```

## Notes

- Frontend uses proxy to avoid CORS issues
- JWT tokens automatically included in API requests
- Automatic redirect to login on 401 errors
- Minimal, clean UI with Tailwind CSS
- No complex state management (uses React state)
