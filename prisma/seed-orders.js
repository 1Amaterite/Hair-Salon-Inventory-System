const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedOrders() {
  try {
    console.log('Creating sample delivery destinations...');

    // Create sample delivery destinations
    const destinations = await Promise.all([
      prisma.deliveryDestination.create({
        data: {
          name: 'The Grand Retreat Spa',
          fullAddress: '123 Wellness Boulevard, Suite 100, Beverly Hills, CA 90210',
          contactPerson: 'Sarah Mitchell',
          contactNumber: '+1 (555) 123-4567',
          locationType: 'PERMANENT',
          status: 'ACTIVE',
        },
      }),
      prisma.deliveryDestination.create({
        data: {
          name: 'Lumina Hair Studio',
          fullAddress: '456 Fashion Avenue, Downtown, Los Angeles, CA 90013',
          contactPerson: 'Michael Chen',
          contactNumber: '+1 (555) 987-6543',
          locationType: 'PERMANENT',
          status: 'ACTIVE',
        },
      }),
      prisma.deliveryDestination.create({
        data: {
          name: 'Aesthetics Clinic North',
          fullAddress: '789 Beauty Lane, Suite 200, Santa Monica, CA 90401',
          contactPerson: 'Jennifer Williams',
          contactNumber: '+1 (555) 456-7890',
          locationType: 'PERMANENT',
          status: 'ACTIVE',
        },
      }),
      prisma.deliveryDestination.create({
        data: {
          name: 'Pop-up Salon - Convention Center',
          fullAddress: '321 Event Plaza, Convention Center Hall B, San Diego, CA 92101',
          contactPerson: 'David Rodriguez',
          contactNumber: '+1 (555) 321-6549',
          locationType: 'TEMPORARY',
          status: 'ACTIVE',
        },
      }),
    ]);

    console.log('Created destinations:', destinations.length);

    // Get existing transactions to create orders from
    const transactions = await prisma.transaction.findMany({
      take: 5,
      include: {
        user: true,
      },
    });

    console.log('Found transactions:', transactions.length);

    // Create sample orders
    const orders = await Promise.all([
      prisma.order.create({
        data: {
          transactionId: transactions[0].id,
          destinationId: destinations[0].id,
          status: 'PENDING',
          expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          notes: 'Urgent delivery - VIP client',
        },
        include: {
          transaction: {
            include: {
              user: true,
            },
          },
          destination: true,
        },
      }),
      prisma.order.create({
        data: {
          transactionId: transactions[1].id,
          destinationId: destinations[1].id,
          status: 'IN_TRANSIT',
          expectedDeliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
          notes: 'Standard delivery route',
        },
        include: {
          transaction: {
            include: {
              user: true,
            },
          },
          destination: true,
        },
      }),
      prisma.order.create({
        data: {
          transactionId: transactions[2].id,
          destinationId: destinations[2].id,
          status: 'PENDING',
          expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          notes: 'Bulk order - multiple items',
        },
        include: {
          transaction: {
            include: {
              user: true,
            },
          },
          destination: true,
        },
      }),
    ]);

    console.log('Created orders:', orders.length);

    // Display created orders
    orders.forEach((order, index) => {
      console.log(`\nOrder ${index + 1}:`);
      console.log(`  Order Number: ${order.orderNumber}`);
      console.log(`  Destination: ${order.destination.name}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Expected Delivery: ${order.expectedDeliveryDate?.toLocaleDateString()}`);
      console.log(`  Notes: ${order.notes}`);
    });

    console.log('\n✅ Sample data created successfully!');
  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedOrders();
