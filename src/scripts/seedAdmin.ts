/**
 * Seed script — creates the initial admin user and roles.
 * Run: npx tsx src/scripts/seedAdmin.ts
 *
 * Env vars needed: DATABASE_URL (set in .env)
 */

import bcrypt from 'bcryptjs';
import AppDataSource from '../lib/typeorm.js';
import { Role } from '../entities/Role.js';
import { User } from '../entities/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🌱 Seeding roles and admin user...');

  await AppDataSource.initialize();
  console.log('Database connected');

  const roleRepo = AppDataSource.getRepository(Role);
  const userRepo = AppDataSource.getRepository(User);

  // 1. Upsert roles
  const roleNames = [
    { name: 'admin', description: 'Full system access' },
    { name: 'user', description: 'Standard user access' },
    { name: 'agent', description: 'Agent user access' },
    { name: 'property_owner', description: 'Property owner with admin-approved media upload access' },
    { name: 'property_manager', description: 'Property manager with listing and inquiry management access' },
    { name: 'content_editor', description: 'Content editor with article and page management access' },
  ];

  let adminRole: Role | null = null;

  for (const roleData of roleNames) {
    let role = await roleRepo.findOne({ where: { name: roleData.name } });
    if (!role) {
      role = roleRepo.create(roleData);
      await roleRepo.save(role);
      console.log(`✅ Role created: ${roleData.name}`);
    } else {
      console.log(`ℹ️  Role already exists: ${roleData.name}`);
    }

    if (roleData.name === 'admin') {
      adminRole = role;
    }
  }

  console.log('✅ Roles ensured: admin, user, agent, property_owner, property_manager, content_editor');

  // 2. Create admin user
  const adminEmail = 'admin@ingata.com';
  const adminPassword = 'Admin@2026!';

  const existing = await userRepo.findOne({ where: { email: adminEmail } });
  if (!adminRole) {
    throw new Error('Admin role not found');
  }

  if (existing) {
    existing.passwordHash = await bcrypt.hash(adminPassword, 12);
    existing.roleId = adminRole.id;
    existing.isActive = true;
    await userRepo.save(existing);
    console.log(`✅ Admin user credentials reset: ${adminEmail}`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const adminUser = userRepo.create({
      id: crypto.randomUUID(),
      name: 'Super Admin',
      email: adminEmail,
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
    });
    await userRepo.save(adminUser);
    console.log('✅ Admin user created!');
    console.log(`   Email:    ${adminEmail}`);
    console.log('   ⚠️  Change this password after first login!');
  }

  await AppDataSource.destroy();
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  });
