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

    const questionario = await prisma.questionario.findFirst({
      where: { id, empresaId: auth.empresaId },
      include: {
        perguntas: { orderBy: { ordem: 'asc' } },
        setores: { include: { setor: true } },
        _count: { select: { respostas: true } }
      }
    })

    if (!questionario) {
      return NextResponse.json({ error: 'Questionario nao encontrado' }, { status: 404 })
    }

    return NextResponse.json(questionario)
  } catch (error) {
    console.error('Erro buscar questionario:', error)
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

    const questionario = await prisma.questionario.findFirst({
      where: { id, empresaId: auth.empresaId },
      include: { setores: true }
    })

    if (!questionario) {
      return NextResponse.json({ error: 'Questionario nao encontrado' }, { status: 404 })
    }

    if (body.status) {
      const statusValidos = ['RASCUNHO', 'ATIVO', 'ENCERRADO']
      if (!statusValidos.includes(body.status)) {
        return NextResponse.json({ error: 'Status invalido' }, { status: 400 })
      }

      if (body.status === 'ATIVO' && questionario.setores.length === 0) {
        return NextResponse.json(
          { error: 'Vincule pelo menos um setor antes de ativar' },
          { status: 400 }
        )
      }

      const updateData: Record<string, unknown> = { status: body.status }

      if (body.status === 'ATIVO' && !questionario.dataInicio) {
        updateData.dataInicio = new Date()
      }
      if (body.status === 'ENCERRADO') {
        updateData.dataFim = new Date()
      }

      const updated = await prisma.questionario.update({
        where: { id },
        data: updateData,
        include: {
          perguntas: true,
          setores: { include: { setor: true } },
          _count: { select: { respostas: true } }
        }
      })

      return NextResponse.json(updated)
    }

    if (body.setorIds && Array.isArray(body.setorIds)) {
      await prisma.questionarioSetor.deleteMany({
        where: { questionarioId: id }
      })

      if (body.setorIds.length > 0) {
        const setoresData = await prisma.setor.findMany({
          where: {
            id: { in: body.setorIds },
            empresaId: auth.empresaId
          }
        })

        await prisma.questionarioSetor.createMany({
          data: setoresData.map((s) => ({
            questionarioId: id,
            setorId: s.id,
            totalEsperado: s.totalColaboradores
          }))
        })
      }

      const updated = await prisma.questionario.findUnique({
        where: { id },
        include: {
          perguntas: true,
          setores: { include: { setor: true } },
          _count: { select: { respostas: true } }
        }
      })

      return NextResponse.json(updated)
    }

    const updated = await prisma.questionario.update({
      where: { id },
      data: {
        ...(body.titulo && { titulo: body.titulo }),
        ...(body.descricao !== undefined && { descricao: body.descricao }),
      },
      include: {
        perguntas: true,
        setores: { include: { setor: true } },
        _count: { select: { respostas: true } }
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erro atualizar questionario:', error)
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

    const questionario = await prisma.questionario.findFirst({
      where: { id, empresaId: auth.empresaId },
      include: { _count: { select: { respostas: true } } }
    })

    if (!questionario) {
      return NextResponse.json({ error: 'Questionario nao encontrado' }, { status: 404 })
    }

    if (questionario._count.respostas > 0) {
      return NextResponse.json(
        { error: 'Nao e possivel excluir questionario com respostas. Encerre a coleta.' },
        { status: 400 }
      )
    }

    await prisma.questionario.delete({ where: { id } })

    return NextResponse.json({ message: 'Questionario excluido' })
  } catch (error) {
    console.error('Erro excluir questionario:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}