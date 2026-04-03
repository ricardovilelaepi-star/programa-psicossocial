// src/app/api/pgr/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    const pgrs = await prisma.pGR.findMany({
      where: { empresaId: auth.empresaId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        titulo: true,
        versao: true,
        status: true,
        dataElaboracao: true,
        dataRevisao: true,
        questionarioId: true,
        periodoAvaliacao: true,
        totalRespondentes: true,
        totalColaboradores: true,
        taxaParticipacao: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(pgrs)
  } catch (error) {
    console.error('Erro listar PGRs:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
