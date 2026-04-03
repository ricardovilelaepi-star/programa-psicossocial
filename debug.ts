import { PrismaClient } from "./src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import dotenv from "dotenv"
dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  // Checar perguntas invertidas e escalaMax
  const perguntas = await p.pergunta.findMany({
    select: { ordem: true, texto: true, invertida: true, escalaMax: true, escalaMin: true },
    orderBy: { ordem: "asc" }
  })
  perguntas.forEach(q => {
    console.log(`#${q.ordem} | invertida=${q.invertida} | escalaMin=${q.escalaMin} | escalaMax=${q.escalaMax} | ${q.texto.substring(0, 60)}`)
  })

  // Checar uma resposta de teste - itens com valor numerico
  const resposta = await p.resposta.findFirst({
    where: { completada: true },
    include: {
      itens: {
        include: { pergunta: { select: { ordem: true, invertida: true, escalaMax: true } } },
        orderBy: { pergunta: { ordem: "asc" } }
      }
    }
  })
  if (resposta) {
    console.log("\n--- RESPOSTA DE TESTE ---")
    resposta.itens.forEach(i => {
      const inv = i.pergunta.invertida
      const raw = i.valorNumerico
      const max = i.pergunta.escalaMax
      const ajustado = inv && max ? (max + 1) - raw! : raw
      console.log(`#${i.pergunta.ordem} | raw=${raw} | inv=${inv} | max=${max} | ajustado=${ajustado}`)
    })
  }

  await p.$disconnect()
}
main()