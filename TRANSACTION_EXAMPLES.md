# Transaction System - Examples and Usage

## 📋 Transaction Types

### **INBOUND** - Stock Coming In
- **Quantity**: Positive numbers (+1, +10, etc.)
- **Use Cases**: New purchases, returns from suppliers
- **Example**: Receiving 50 units of shampoo

### **OUTBOUND** - Stock Going Out  
- **Quantity**: Negative numbers (-1, -5, etc.)
- **Use Cases**: Sales to customers, transfers
- **Example**: Selling 2 bottles of conditioner

### **USAGE** - Products Used in Salon
- **Quantity**: Negative numbers (-1, -3, etc.)
- **Use Cases**: Products used during services
- **Example**: Using 1 unit of hair color for treatment

### **ADJUSTMENT** - Manual Stock Corrections
- **Quantity**: Can be positive or negative
- **Use Cases**: Stock counts, damage, corrections
- **Restriction**: ADMIN users only

---

## 🚀 API Endpoints

### **Create Transaction**
```bash
POST /api/transactions
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "productId": "product_id_here",
  "type": "INBOUND|OUTBOUND|USAGE|ADJUSTMENT",
  "quantity": 10,
  "remarks": "Optional notes"
}
```

### **Get Transaction History**
```bash
GET /api/transactions?productId=xxx&type=INBOUND&limit=50
Authorization: Bearer <JWT_TOKEN>
```

### **Get Current Stock**
```bash
GET /api/transactions/product/:productId/stock
Authorization: Bearer <JWT_TOKEN>
```

### **Get Low Stock Products**
```bash
GET /api/transactions/low-stock
Authorization: Bearer <JWT_TOKEN>
```

---

## 💡 Real-World Examples

### **Example 1: Receiving New Stock**
```bash
# Admin receives 25 units of shampoo
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "cmohbevdh0004d73uccwbocvy",
    "type": "INBOUND",
    "quantity": 25,
    "remarks": "Monthly stock replenishment"
  }'
```

### **Example 2: Customer Purchase**
```bash
# Staff records a sale
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "cmohbevdh0004d73uccwbocvy",
    "type": "OUTBOUND",
    "quantity": -2,
    "remarks": "Customer purchase - walk-in"
  }'
```

### **Example 3: Salon Usage**
```bash
# Staff uses products for service
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "cmohbevdh0004d73uccwbocvy",
    "type": "USAGE",
    "quantity": -1,
    "remarks": "Hair coloring treatment"
  }'
```

### **Example 4: Stock Adjustment (Admin Only)**
```bash
# Admin corrects inventory count
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "cmohbevdh0004d73uccwbocvy",
    "type": "ADJUSTMENT",
    "quantity": 5,
    "remarks": "Physical count adjustment - found missing items"
  }'
```

---

## 📊 Stock Calculation Examples

### **Current Stock Calculation**
```javascript
// Stock is calculated dynamically from transactions
const currentStock = await prisma.transaction.aggregate({
  where: { productId: "product_id" },
  _sum: { quantity: true }
});

// Example calculation:
// INBOUND: +50, +25, +10 = +85
// OUTBOUND: -2, -1, -3 = -6  
// USAGE: -5, -2 = -7
// ADJUSTMENT: +5 = +5
// TOTAL: 85 - 6 - 7 + 5 = 77 units
```

### **Low Stock Alert**
```javascript
// Products below reorder threshold
const lowStock = await getLowStockProducts();
// Returns products where currentStock <= reorderThreshold
```

---

## 🛡️ Security & Validation

### **Input Validation**
- Product ID must exist and be active
- Quantity cannot be zero
- Transaction type must be valid
- Remarks limited to 500 characters

### **Business Rules**
- **Negative Stock Prevention**: System blocks transactions that would cause negative stock
- **Role-Based Access**: Only ADMIN can create ADJUSTMENT transactions
- **Database Transactions**: All operations use ACID transactions

### **Error Examples**
```json
// Negative stock prevention
{
  "success": false,
  "message": "Transaction would cause negative stock. Current stock: 5, Attempted quantity: -10"
}

// Admin-only restriction
{
  "success": false,
  "message": "Only ADMIN users can create ADJUSTMENT transactions"
}

// Invalid product
{
  "success": false,
  "message": "Product not found"
}
```

---

## 📈 Stock Summary Queries

### **Get Transaction Summary**
```bash
GET /api/transactions/summary?startDate=2026-04-01&endDate=2026-04-30
Authorization: Bearer <JWT_TOKEN>
```

### **Response Example**
```json
{
  "success": true,
  "data": [
    {
      "type": "INBOUND",
      "totalQuantity": 150,
      "transactionCount": 5
    },
    {
      "type": "OUTBOUND", 
      "totalQuantity": -25,
      "transactionCount": 12
    },
    {
      "type": "USAGE",
      "totalQuantity": -18,
      "transactionCount": 8
    }
  ]
}
```

---

## 🔧 Database Schema (Reference)

```sql
-- Transactions Table (no current_stock column!)
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- INBOUND, OUTBOUND, USAGE, ADJUSTMENT
  quantity INTEGER NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stock is calculated: SUM(quantity) WHERE product_id = ?
-- Never stored as a column - always computed!
```

---

## ✅ Key Features Implemented

1. **✅ Transaction Endpoint**: POST /api/transactions
2. **✅ Service Layer**: Complete business logic with validation
3. **✅ Stock Calculation**: Dynamic computation from transactions
4. **✅ Stock Summary**: Aggregated reporting and analytics
5. **✅ Negative Stock Prevention**: Real-time validation
6. **✅ Role-Based Access**: ADMIN-only ADJUSTMENT transactions
7. **✅ Database Transactions**: ACID compliance
8. **✅ Input Validation**: Comprehensive Joi schemas
9. **✅ Audit Logging**: All changes tracked with user context

The system is production-ready and fully tested!
