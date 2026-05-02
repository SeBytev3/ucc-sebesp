import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const hash = await bcrypt.hash('Admin@123456', 12);
    const user = await prisma.user.update({
      where: { email: 'admin@marketplace.com' },
      data: { passwordHash: hash }
    });
    console.log(`✅ Password reset successful for ${user.email}`);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
