// src/app/api/pgr/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    const { id } = await params

    const pgr = await prisma.pGR.findFirst({
      where: { id, empresaId: auth.empresaId }
    })

    if (!pgr) {
      return NextResponse.json({ error: 'PGR nao encontrado' }, { status: 404 })
    }

    // Parse dos JSONs para enviar estruturado
    const response = {
      ...pgr,
      inventario: pgr.inventarioJSON ? JSON.parse(pgr.inventarioJSON) : [],
      matrizRisco: pgr.matrizRiscoJSON ? JSON.parse(pgr.matrizRiscoJSON) : [],
      indicadores: pgr.indicadoresJSON ? JSON.parse(pgr.indicadoresJSON) : {},
      analiseSetores: pgr.analiseSetoresJSON ? JSON.parse(pgr.analiseSetoresJSON) : [],
      medidas: pgr.medidasJSON ? JSON.parse(pgr.medidasJSON) : [],
      planoAcao: pgr.planoAcaoJSON ? JSON.parse(pgr.planoAcaoJSON) : [],
      cronograma: pgr.cronogramaJSON ? JSON.parse(pgr.cronogramaJSON) : [],
      conformidade: pgr.conformidadeJSON ? JSON.parse(pgr.conformidadeJSON) : {},
      apr: pgr.aprJSON ? JSON.parse(pgr.aprJSON) : null,
      relatorioAvaliacao: pgr.relatorioAvalJSON ? JSON.parse(pgr.relatorioAvalJSON) : null,
      monitoramento: pgr.monitoramentoJSON ? JSON.parse(pgr.monitoramentoJSON) : null,
      comunicacao: pgr.comunicacaoJSON ? JSON.parse(pgr.comunicacaoJSON) : null,
      relatorioISO45003: pgr.relatorioISO45003JSON ? JSON.parse(pgr.relatorioISO45003JSON) : null,
      indicadoresSaude: pgr.indicadoresSaudeJSON ? JSON.parse(pgr.indicadoresSaudeJSON) : null,
      politicaSST: pgr.politicaSST || null,
      declaracaoConformidade: pgr.declaracaoConformidade || null,
      parecerTecnico: pgr.parecerTecnico || null,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro buscar PGR:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    const { id } = await params
    const body = await request.json()

    const pgr = await prisma.pGR.findFirst({
      where: { id, empresaId: auth.empresaId }
    })

    if (!pgr) {
      return NextResponse.json({ error: 'PGR nao encontrado' }, { status: 404 })
    }

    // Atualizar status
    if (body.status) {
      const statusValidos = ['RASCUNHO', 'REVISAO', 'APROVADO', 'VIGENTE', 'OBSOLETO']
      if (!statusValidos.includes(body.status)) {
        return NextResponse.json({ error: 'Status invalido' }, { status: 400 })
      }

      const updateData: Record<string, unknown> = { status: body.status }

      if (body.status === 'APROVADO' || body.status === 'VIGENTE') {
        updateData.dataRevisao = new Date()
      }

      const updated = await prisma.pGR.update({
        where: { id },
        data: updateData,
      })

      return NextResponse.json(updated)
    }

    // Atualizar plano de acao (status individual de cada acao)
    if (body.planoAcaoJSON) {
      const updated = await prisma.pGR.update({
        where: { id },
        data: { planoAcaoJSON: body.planoAcaoJSON }
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json(pgr)
  } catch (error) {
    console.error('Erro atualizar PGR:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    const { id } = await params

    const pgr = await prisma.pGR.findFirst({
      where: { id, empresaId: auth.empresaId }
    })

    if (!pgr) {
      return NextResponse.json({ error: 'PGR nao encontrado' }, { status: 404 })
    }

    if (pgr.questionarioId) {
      await prisma.avaliacaoRisco.deleteMany({
        where: { questionarioId: pgr.questionarioId, empresaId: auth.empresaId }
      })
    }

    await prisma.pGR.delete({ where: { id } })

    return NextResponse.json({ message: 'PGR excluido com sucesso' })
  } catch (error) {
    console.error('Erro excluir PGR:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
