import * as dotenv from 'dotenv';
import path from 'path';
// Load .env before importing prisma
dotenv.config({ path: path.join(__dirname, '.env') });

import prisma from './src/config/database';

async function checkUsers() {
  try {
    console.log('Consultando base de datos...');
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'cguzman' } },
          { email: { contains: 'mrodriguez' } },
          { email: { contains: 'jhuergo' } },
          { firstName: { contains: 'Guzman' } }, // Por si acaso están invertidos
          { lastName: { contains: 'Guzman' } },
          { lastName: { contains: 'Rodriguez' } },
          { lastName: { contains: 'Huergo' } }
        ]
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });
    
    if (users.length === 0) {
      console.log('No se encontraron usuarios que coincidan con cguzman, mrodriguez o jhuergo.');
      const count = await prisma.user.count();
      console.log(`Total de usuarios en la base de datos: ${count}`);
      if (count > 0) {
        const someUsers = await prisma.user.findMany({ 
          take: 5,
          select: { email: true } 
        });
        console.log('Ejemplos de correos registrados:', someUsers.map(u => u.email));
      }
    } else {
      console.log('Usuarios encontrados:');
      console.log(JSON.stringify(users, null, 2));
    }
  } catch (error) {
    console.error('Error detallado:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
