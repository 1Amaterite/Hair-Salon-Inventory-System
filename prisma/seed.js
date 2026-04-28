const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const staffPasswordHash = await bcrypt.hash('staff123', 10);

  // Create sample users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true
    }
  });

  const staffUser = await prisma.user.create({
    data: {
      name: 'Staff User',
      username: 'staff',
      passwordHash: staffPasswordHash,
      role: 'STAFF',
      isActive: true
    }
  });

  console.log('✅ Created users:', { admin: adminUser.username, staff: staffUser.username });

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: 'SHM-001',
        name: 'Premium Shampoo',
        category: 'Hair Care',
        size: '500ml',
        variant: 'Normal Hair',
        wholesaleCost: 15.50,
        retailPrice: 25.00,
        reorderThreshold: 10,
        leadTimeDays: 3,
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        sku: 'COND-002',
        name: 'Hair Conditioner',
        category: 'Hair Care',
        size: '500ml',
        variant: 'Moisturizing',
        wholesaleCost: 16.75,
        retailPrice: 28.00,
        reorderThreshold: 8,
        leadTimeDays: 3,
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        sku: 'DYE-003',
        name: 'Hair Color',
        category: 'Coloring',
        size: '100ml',
        variant: 'Natural Brown',
        wholesaleCost: 12.00,
        retailPrice: 35.00,
        reorderThreshold: 5,
        leadTimeDays: 5,
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        sku: 'GEL-004',
        name: 'Styling Gel',
        category: 'Styling',
        size: '200ml',
        variant: 'Extra Hold',
        wholesaleCost: 8.25,
        retailPrice: 15.00,
        reorderThreshold: 15,
        leadTimeDays: 2,
        isActive: true
      }
    })
  ]);

  console.log('✅ Created products:', products.map(p => ({ sku: p.sku, name: p.name })));

  // Create sample transactions
  const transactions = await Promise.all([
    // Initial stock inbound
    prisma.transaction.create({
      data: {
        productId: products[0].id,
        userId: adminUser.id,
        type: 'INBOUND',
        quantity: 50,
        remarks: 'Initial stock purchase'
      }
    }),
    prisma.transaction.create({
      data: {
        productId: products[1].id,
        userId: adminUser.id,
        type: 'INBOUND',
        quantity: 40,
        remarks: 'Initial stock purchase'
      }
    }),
    prisma.transaction.create({
      data: {
        productId: products[2].id,
        userId: adminUser.id,
        type: 'INBOUND',
        quantity: 25,
        remarks: 'Initial stock purchase'
      }
    }),
    prisma.transaction.create({
      data: {
        productId: products[3].id,
        userId: adminUser.id,
        type: 'INBOUND',
        quantity: 60,
        remarks: 'Initial stock purchase'
      }
    }),
    // Some usage transactions
    prisma.transaction.create({
      data: {
        productId: products[0].id,
        userId: staffUser.id,
        type: 'USAGE',
        quantity: -2,
        remarks: 'Used for customer hair wash'
      }
    }),
    prisma.transaction.create({
      data: {
        productId: products[1].id,
        userId: staffUser.id,
        type: 'USAGE',
        quantity: -2,
        remarks: 'Used for customer treatment'
      }
    }),
    // A sale transaction
    prisma.transaction.create({
      data: {
        productId: products[3].id,
        userId: staffUser.id,
        type: 'OUTBOUND',
        quantity: -1,
        remarks: 'Customer purchase - styling gel'
      }
    })
  ]);

  console.log('✅ Created sample transactions:', transactions.length);

  // Calculate and display current stock
  const stockCalculations = await Promise.all(
    products.map(async (product) => {
      const stockResult = await prisma.transaction.aggregate({
        where: { productId: product.id },
        _sum: { quantity: true }
      });
      
      return {
        sku: product.sku,
        name: product.name,
        currentStock: stockResult._sum.quantity || 0,
        reorderThreshold: product.reorderThreshold
      };
    })
  );

  console.log('\n📊 Current Stock Levels:');
  stockCalculations.forEach(item => {
    const status = item.currentStock <= item.reorderThreshold ? '⚠️  LOW STOCK' : '✅ OK';
    console.log(`${item.sku} - ${item.name}: ${item.currentStock} units ${status}`);
  });

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: username=admin, role=ADMIN');
  console.log('Staff: username=staff, role=STAFF');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
