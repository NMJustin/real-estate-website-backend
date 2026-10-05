import { AppDataSource } from './lib/typeorm.js';
import { Role } from './entities/Role.js';
import { PropertyCategory } from './entities/PropertyCategory.js';
import { ArticleCategory } from './entities/ArticleCategory.js';
import { Service } from './entities/Service.js';
import { SiteSetting } from './entities/SiteSetting.js';
import bcrypt from 'bcryptjs';
import { User } from './entities/User.js';
import { randomUUID } from 'node:crypto';

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connected');

  const roleRepo = AppDataSource.getRepository(Role);
  const userRepo = AppDataSource.getRepository(User);
  const propertyCategoryRepo = AppDataSource.getRepository(PropertyCategory);
  const articleCategoryRepo = AppDataSource.getRepository(ArticleCategory);
  const serviceRepo = AppDataSource.getRepository(Service);
  const siteSettingRepo = AppDataSource.getRepository(SiteSetting);

  // Seed roles
  console.log('Seeding roles...');
  const roles = [
    { name: 'admin', description: 'Administrator with full access' },
    { name: 'agent', description: 'Real estate agent' },
    { name: 'user', description: 'Regular user' },
  ];

  for (const roleData of roles) {
    const existing = await roleRepo.findOne({ where: { name: roleData.name } });
    if (!existing) {
      const role = roleRepo.create(roleData);
      await roleRepo.save(role);
      console.log(`  Created role: ${roleData.name}`);
    }
  }

  // Get roles for user creation
  const adminRole = await roleRepo.findOne({ where: { name: 'ADMIN' } });
  const userRole = await roleRepo.findOne({ where: { name: 'USER' } });

  if (!adminRole || !userRole) {
    throw new Error('Roles not found after seeding');
  }

  // Seed admin user
  console.log('Seeding admin user...');
  const adminEmail = 'admin@realestate.com';
  const existingAdmin = await userRepo.findOne({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = userRepo.create({
      id: randomUUID(),
      email: adminEmail,
      name: 'Admin User',
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
      canUploadPropertyMedia: true,
    });
    await userRepo.save(admin);
    console.log(`  Created admin user: ${adminEmail} (password: admin123)`);
  }

  // Seed test user
  console.log('Seeding test user...');
  const testEmail = 'user@test.com';
  const existingTestUser = await userRepo.findOne({ where: { email: testEmail } });
  if (!existingTestUser) {
    const passwordHash = await bcrypt.hash('user123', 10);
    const testUser = userRepo.create({
      id: randomUUID(),
      email: testEmail,
      name: 'Test User',
      passwordHash,
      roleId: userRole.id,
      isActive: true,
    });
    await userRepo.save(testUser);
    console.log(`  Created test user: ${testEmail} (password: user123)`);
  }

  // Seed property categories
  console.log('Seeding property categories...');
  const propertyCategories = [
    { name: 'Apartment', slug: 'apartment', description: 'Modern apartments and flats' },
    { name: 'House', slug: 'house', description: 'Detached and semi-detached houses' },
    { name: 'Villa', slug: 'villa', description: 'Luxury villas' },
    { name: 'Land', slug: 'land', description: 'Residential and commercial land' },
    { name: 'Commercial', slug: 'commercial', description: 'Office and retail spaces' },
  ];

  for (const catData of propertyCategories) {
    const existing = await propertyCategoryRepo.findOne({ where: { slug: catData.slug } });
    if (!existing) {
      const category = propertyCategoryRepo.create({
        id: randomUUID(),
        ...catData,
        isActive: true,
      });
      await propertyCategoryRepo.save(category);
      console.log(`  Created property category: ${catData.name}`);
    }
  }

  // Seed article categories
  console.log('Seeding article categories...');
  const articleCategories = [
    { name: 'Market News', slug: 'market-news', description: 'Real estate market updates' },
    { name: 'Buying Tips', slug: 'buying-tips', description: 'Tips for property buyers' },
    { name: 'Selling Tips', slug: 'selling-tips', description: 'Tips for property sellers' },
    { name: 'Investment', slug: 'investment', description: 'Property investment advice' },
  ];

  for (const catData of articleCategories) {
    const existing = await articleCategoryRepo.findOne({ where: { slug: catData.slug } });
    if (!existing) {
      const category = articleCategoryRepo.create({
        id: randomUUID(),
        ...catData,
      });
      await articleCategoryRepo.save(category);
      console.log(`  Created article category: ${catData.name}`);
    }
  }

  // Seed services
  console.log('Seeding services...');
  const services = [
    {
      name: 'Property Valuation',
      slug: 'property-valuation',
      shortDescription: 'Professional property valuation services',
      description: 'Get accurate market valuations for your property from our expert team.',
      isActive: true,
      displayOrder: 1,
    },
    {
      name: 'Property Management',
      slug: 'property-management',
      shortDescription: 'Comprehensive property management',
      description: 'We handle everything from tenant screening to maintenance.',
      isActive: true,
      displayOrder: 2,
    },
    {
      name: 'Legal Assistance',
      slug: 'legal-assistance',
      shortDescription: 'Legal support for property transactions',
      description: 'Expert legal guidance for buying, selling, and renting properties.',
      isActive: true,
      displayOrder: 3,
    },
  ];

  for (const serviceData of services) {
    const existing = await serviceRepo.findOne({ where: { slug: serviceData.slug } });
    if (!existing) {
      const service = serviceRepo.create({
        id: randomUUID(),
        ...serviceData,
      });
      await serviceRepo.save(service);
      console.log(`  Created service: ${serviceData.name}`);
    }
  }

  // Seed site settings
  console.log('Seeding site settings...');
  const existingSettings = await siteSettingRepo.findOne({ where: { id: 'default' } });
  if (!existingSettings) {
    const settings = siteSettingRepo.create({
      id: 'default',
      siteName: 'Real Estate Web',
      heroTitle: 'Find Your Dream Property',
      heroSubtitle: 'Discover the perfect property that fits your lifestyle',
      heroCtaText: 'Browse Properties',
      heroCtaLink: '/properties',
      aboutTitle: 'About Us',
      aboutDescription: 'We are a leading real estate agency dedicated to helping you find your perfect property.',
      aboutCtaText: 'Learn More',
      aboutCtaLink: '/about',
      servicesTitle: 'Our Services',
      servicesDescription: 'Comprehensive real estate services for all your needs',
      featuredSectionTitle: 'Featured Properties',
      showAboutSection: true,
      showServicesSection: true,
      showFeaturedSection: true,
      defaultCurrency: 'USD',
    });
    await siteSettingRepo.save(settings);
    console.log('  Created site settings');
  }

  console.log('Seeding completed successfully!');
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
