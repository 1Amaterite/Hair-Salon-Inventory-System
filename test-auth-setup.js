const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupTestUsers() {
  try {
    console.log('🔧 Setting up test users with proper password hashes...');

    // Create proper password hashes
    const adminPassword = 'admin123';
    const staffPassword = 'staff123';

    const adminHash = await bcrypt.hash(adminPassword, 10);
    const staffHash = await bcrypt.hash(staffPassword, 10);

    console.log('Generated password hashes:');
    console.log('Admin hash:', adminHash);
    console.log('Staff hash:', staffHash);

    // Update existing users with proper hashes
    await prisma.user.updateMany({
      where: { username: 'admin' },
      data: { passwordHash: adminHash }
    });

    await prisma.user.updateMany({
      where: { username: 'staff' },
      data: { passwordHash: staffHash }
    });

    console.log('✅ Updated user passwords');
    console.log('📝 Test credentials:');
    console.log('Admin: username=admin, password=admin123');
    console.log('Staff: username=staff, password=staff123');

  } catch (error) {
    console.error('❌ Error setting up test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestUsers();
