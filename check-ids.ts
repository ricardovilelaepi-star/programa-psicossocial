import { PrismaClient } from './src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
async function check() {
  const q = await prisma.questionario.findFirst({ select: { id: true, titulo: true, empresaId: true } });
  const u = await prisma.usuario.findFirst({ select: { id: true, email: true, empresaId: true } });
  console.log('Questionario empresaId:', q?.empresaId);
  console.log('User empresaId:', u?.empresaId);
  console.log('Match:', q?.empresaId === u?.empresaId);
  await prisma['$' + 'disconnect']();
}
check();
