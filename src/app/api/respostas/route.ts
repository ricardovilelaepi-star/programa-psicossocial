import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET - listar respostas (requer autenticacao)
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const questionarioId = searchParams.get('questionarioId')

    if (!questionarioId) {
      return NextResponse.json({ error: 'questionarioId obrigatorio' }, { status: 400 })
    }

    // Verificar que o questionario pertence a empresa do usuario
    const questionario = await prisma.questionario.findFirst({
      where: { id: questionarioId, empresaId: auth.empresaId }
    })
    if (!questionario) {
      return NextResponse.json({ error: 'Questionario nao encontrado' }, { status: 404 })
    }

    const respostas = await prisma.resposta.findMany({
      where: { questionarioId, completada: true },
      orderBy: { dataResposta: 'desc' },
      select: {
        id: true,
        setor: true,
        turno: true,
        faixaEtaria: true,
        tempoEmpresa: true,
        completada: true,
        dataResposta: true,
        itens: {
          include: {
            pergunta: {
              select: {
                texto: true, categoria: true, subcategoria: true,
                fatorNR1: true, ordem: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(respostas)
  } catch (error) {
    console.error('Erro listar respostas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - registrar resposta (publico via link anonimo)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { questionarioId, linkAnonimo, setor, turno, faixaEtaria, tempoEmpresa, itens } = body

    if (!questionarioId || !itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        { error: 'Campos obrigatorios: questionarioId, itens (array)' },
        { status: 400 }
      )
    }

    // Verificar se o questionario esta ativo
    const questionario = await prisma.questionario.findUnique({
      where: { id: questionarioId }
    })

    if (!questionario || questionario.status !== 'ATIVO') {
      return NextResponse.json(
        { error: 'Questionario nao encontrado ou nao esta ativo' },
        { status: 404 }
      )
    }

    // Se veio linkAnonimo, validar
    if (linkAnonimo) {
      const qs = await prisma.questionarioSetor.findUnique({
        where: { linkAnonimo }
      })
      if (!qs || qs.questionarioId !== questionarioId) {
        return NextResponse.json({ error: 'Link invalido' }, { status: 400 })
      }
    }

    const resposta = await prisma.resposta.create({
      data: {
        questionarioId,
        setor: setor || null,
        turno: turno || null,
        faixaEtaria: faixaEtaria || null,
        tempoEmpresa: tempoEmpresa || null,
        completada: true,
        itens: {
          create: itens.map((item: { perguntaId: string; valorNumerico?: number; valorTexto?: string }) => ({
            perguntaId: item.perguntaId,
            valorNumerico: item.valorNumerico ?? null,
            valorTexto: item.valorTexto || null
          }))
        }
      },
      include: { itens: true }
    })

    return NextResponse.json({ id: resposta.id, message: 'Resposta registrada com sucesso' }, { status: 201 })
  } catch (error) {
    console.error('Erro salvar resposta:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}