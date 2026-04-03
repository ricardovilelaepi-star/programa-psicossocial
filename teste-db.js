const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:' + dbPath });
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    const empresa = await prisma.empresa.create({
      data: {
        razaoSocial: 'Teste LTDA',
        nomeFantasia: 'Teste',
        cnpj: '12345678000100'
      }
    });
    console.log('Empresa criada:', empresa);

    const usuario = await prisma.usuario.create({
      data: {
        nome: 'Ricardo Teste',
        email: 'teste@teste.com',
        senha: await bcrypt.hash('123456', 10),
        papel: 'ADMIN',
        empresaId: empresa.id
      }
    });
    console.log('Usuario criado:', usuario);

    console.log('\n--- VERIFICANDO ---');
    const empresas = await prisma.empresa.findMany();
    console.log('Empresas no banco:', empresas.length);
    const usuarios = await prisma.usuario.findMany();
    console.log('Usuarios no banco:', usuarios.length);

  } catch(e) {
    console.error('ERRO:', e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
