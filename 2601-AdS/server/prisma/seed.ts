import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import prisma from '../src/config/database';

dotenv.config();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 12);

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@servicesmarketplace.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@servicesmarketplace.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      languagePref: 'es',
    },
  });

  console.log(`✅ Admin user created: ${admin.email}`);

  // Create default service categories
  const categories = [
    {
      nameEs: 'Plomero',
      nameEn: 'Plumber',
      descriptionEs: 'Servicios de plomería: reparación de fugas, instalación de tuberías, destape de drenajes, mantenimiento de sistemas de agua.',
      descriptionEn: 'Plumbing services: leak repair, pipe installation, drain unclogging, water system maintenance.',
    },
    {
      nameEs: 'Electricista',
      nameEn: 'Electrician',
      descriptionEs: 'Servicios eléctricos: instalación de cableado, reparación de cortocircuitos, instalación de luminarias, paneles eléctricos.',
      descriptionEn: 'Electrical services: wiring installation, short circuit repair, light fixture installation, electrical panels.',
    },
    {
      nameEs: 'Cerrajero',
      nameEn: 'Locksmith',
      descriptionEs: 'Servicios de cerrajería: apertura de puertas, duplicado de llaves, instalación de cerraduras, sistemas de seguridad.',
      descriptionEn: 'Locksmith services: door opening, key duplication, lock installation, security systems.',
    },
  ];

  for (const category of categories) {
    const created = await prisma.serviceCategory.upsert({
      where: { id: 'placeholder-id' }, // We'll use a trick or delete first
      update: {},
      create: category,
    });
    // Actually, since there's no unique constraint on nameEs in the schema yet, 
    // I'll manually check for existence first to be safe without schema changes.
    const existing = await prisma.serviceCategory.findFirst({
      where: { nameEs: category.nameEs }
    });

    if (!existing) {
      const created = await prisma.serviceCategory.create({
        data: category,
      });
      console.log(`✅ Category created: ${category.nameEs} / ${category.nameEn} (ID: ${created.id})`);
    } else {
      console.log(`ℹ️ Category already exists: ${category.nameEs}`);
    }
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
