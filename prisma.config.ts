import path from 'node:path'
import { defineConfig } from 'prisma/config'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  generator: {
    name: 'client',
    provider: 'prisma-client',
    output: path.join(__dirname, 'src', 'generated', 'prisma'),
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
})
