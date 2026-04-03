import { PrismaClient } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Criando empresa e usuario admin...')

  const senhaHash = await bcrypt.hash('123456', 10)

  const empresa = await prisma.empresa.create({
    data: {
      razaoSocial: 'Empresa Demo LTDA',
      nomeFantasia: 'Empresa Demo',
      cnpj: '00000000000100',
    }
  })

  const usuario = await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email: 'admin@demo.com',
      senha: senhaHash,
      papel: 'ADMIN',
      empresaId: empresa.id,
    }
  })

  console.log('')
  console.log('✅ Empresa criada:', empresa.nomeFantasia)
  console.log('✅ Usuario criado:', usuario.email)
  console.log('🔑 Senha: 123456')
  console.log('')
  console.log('Agora faca login no app com essas credenciais!')
}

main()
  .catch((e) => { console.error('Erro:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
