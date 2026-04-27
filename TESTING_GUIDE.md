# Testing Guide - Hair Salon Inventory System

## Quick Start

### 1. Seed the Database
```bash
node prisma/seed.js
```

### 2. Start the Server
```bash
npm run dev
```

### 3. Test Health Check
```bash
curl http://localhost:3000/api/health
```

## API Testing with curl

### Base URL
```
http://localhost:3000/api/transactions
```

### 1. Get Transaction History
```bash
curl -X GET http://localhost:3000/api/transactions
```

### 2. Get Transaction Summary
```bash
curl -X GET http://localhost:3000/api/transactions/summary
```

### 3. Get Low Stock Products
```bash
curl -X GET http://localhost:3000/api/transactions/low-stock
```

### 4. Get Stock for Specific Product
```bash
# First get product list (you'll need to implement this endpoint)
curl -X GET http://localhost:3000/api/transactions/product/[PRODUCT_ID]/stock
```

### 5. Create INBOUND Transaction (Add Stock)
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product_id_here",
    "type": "INBOUND",
    "quantity": 10,
    "remarks": "New stock purchase"
  }'
```

### 6. Create USAGE Transaction (Product Used)
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product_id_here",
    "type": "USAGE",
    "quantity": -2,
    "remarks": "Used for customer treatment"
  }'
```

### 7. Create OUTBOUND Transaction (Sale)
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product_id_here",
    "type": "OUTBOUND",
    "quantity": -1,
    "remarks": "Customer purchase"
  }'
```

### 8. Create ADJUSTMENT Transaction (Admin Only)
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product_id_here",
    "type": "ADJUSTMENT",
    "quantity": 5,
    "remarks": "Stock count adjustment"
  }'
```

### 9. Validate Transaction Before Creation
```bash
curl -X POST http://localhost:3000/api/transactions/validate \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product_id_here",
    "type": "OUTBOUND",
    "quantity": -1,
    "remarks": "Test validation"
  }'
```

### 10. Get Transaction History with Filters
```bash
# Filter by type
curl -X GET "http://localhost:3000/api/transactions?type=INBOUND"

# Filter by date range
curl -X GET "http://localhost:3000/api/transactions?startDate=2026-04-01&endDate=2026-04-30"

# Pagination
curl -X GET "http://localhost:3000/api/transactions?limit=10&offset=0"
```

## Testing Scenarios

### Scenario 1: Stock Flow Test
1. Check initial stock levels
2. Create INBOUND transaction (+10 units)
3. Verify stock increased
4. Create USAGE transaction (-3 units)
5. Verify stock decreased
6. Create OUTBOUND transaction (-2 units)
7. Verify final stock

### Scenario 2: Negative Stock Prevention
1. Check current stock
2. Try to create OUTBOUND with quantity > current stock
3. Should return error about negative stock
4. Create ADJUSTMENT transaction (should work for admin)

### Scenario 3: Low Stock Alert
1. Create transactions to reduce stock below reorder threshold
2. Check low stock endpoint
3. Should show product in low stock list

### Scenario 4: Role-Based Access
1. Test ADJUSTMENT transaction with ADMIN user (should work)
2. Test ADJUSTMENT transaction with STAFF user (should fail)

## Expected Responses

### Success Response
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "id": "transaction_id",
    "productId": "product_id",
    "type": "INBOUND",
    "quantity": 10,
    "remarks": "New stock purchase",
    "createdAt": "2026-04-27T10:00:00.000Z",
    "product": {
      "id": "product_id",
      "sku": "SHM-001",
      "name": "Premium Shampoo"
    },
    "user": {
      "id": "user_id",
      "name": "Admin User",
      "username": "admin"
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Transaction would cause negative stock. Current stock: 5, Attempted quantity: -10",
  "errors": []
}
```

## Important Notes

1. **Product IDs**: Replace `product_id_here` with actual product IDs from your database
2. **Authentication**: Current setup uses mock authentication (admin user by default)
3. **Stock Calculation**: Stock is calculated dynamically from transactions
4. **Transaction Types**: 
   - INBOUND: Positive quantity
   - OUTBOUND/USAGE: Negative quantity
   - ADJUSTMENT: Can be positive or negative (admin only)

## Troubleshooting

### Server Won't Start
- Check if port 3000 is available
- Verify DATABASE_URL in .env file
- Check PostgreSQL service status

### Database Errors
- Run `npx prisma migrate dev --name init` if tables don't exist
- Run `node prisma/seed.js` to populate test data

### Transaction Errors
- Verify product exists and is active
- Check quantity signs (positive/negative based on type)
- Ensure user has proper role for ADJUSTMENT transactions
