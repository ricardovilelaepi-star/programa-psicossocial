const { PrismaClient } = require('./src/generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const p = new PrismaClient({ adapter });

p.pergunta.findMany({
  select: { texto: true, invertida: true, ordem: true },
  orderBy: { ordem: 'asc' }
}).then(r => {
  r.forEach(x => {
    console.log(x.ordem + '. [' + (x.invertida ? 'INVERTIDA' : 'normal') + '] ' + x.texto);
  });
}).finally(() => p['\u0024disconnect']());
