/**
 * Seed script — creates the initial admin user and roles.
 * Run: npx tsx src/scripts/seedAdmin.ts
 *
 * Env vars needed: DATABASE_URL (set in .env)
 */

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding roles and admin user...');

  // 1. Upsert roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Full system access' },
  });

  await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user', description: 'Standard user access' },
  });

  await prisma.role.upsert({
    where: { name: 'agent' },
    update: {},
    create: { name: 'agent', description: 'Agent user access' },
  });

  await prisma.role.upsert({
    where: { name: 'property_owner' },
    update: {},
    create: { name: 'property_owner', description: 'Property owner with admin-approved media upload access' },
  });

  console.log('✅ Roles created: admin, user, agent');

  // 2. Create admin user
  const adminEmail = 'admin@nihohange.com';
  const adminPassword = 'Admin@2026!';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        passwordHash,
        roleId: adminRole.id,
        isActive: true,
      },
    });
    console.log('✅ Admin user created!');
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   ⚠️  Change this password after first login!');
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
