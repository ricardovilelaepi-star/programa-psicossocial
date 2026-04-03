import { PrismaClient } from "./src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import dotenv from "dotenv"
dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const r = await p.pergunta.findMany({
    select: { texto: true, invertida: true, ordem: true },
    orderBy: { ordem: "asc" }
  })
  r.forEach(x => {
    console.log(x.ordem + ". [" + (x.invertida ? "INVERTIDA" : "normal") + "] " + x.texto)
  })
  await p.$disconnect()
}

main()