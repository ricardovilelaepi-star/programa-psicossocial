import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const questionarioSetor = await prisma.questionarioSetor.findUnique({
      where: { linkAnonimo: token },
      include: {
        setor: { select: { nome: true } },
        questionario: {
          select: {
            id: true,
            titulo: true,
            descricao: true,
            status: true,
            perguntas: {
              orderBy: { ordem: 'asc' },
              select: {
                id: true,
                texto: true,
                categoria: true,
                subcategoria: true,
                tipoResposta: true,
                escalaMin: true,
                escalaMax: true,
                escalaMinLabel: true,
                escalaMaxLabel: true,
                obrigatoria: true,
                ordem: true
              }
            }
          }
        }
      }
    })

    if (!questionarioSetor) {
      return NextResponse.json(
        { error: 'Link invalido ou questionario nao encontrado' },
        { status: 404 }
      )
    }

    if (questionarioSetor.questionario.status !== 'ATIVO') {
      return NextResponse.json(
        { error: 'Este questionario nao esta mais aceitando respostas' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      questionarioId: questionarioSetor.questionario.id,
      titulo: questionarioSetor.questionario.titulo,
      descricao: questionarioSetor.questionario.descricao,
      setorNome: questionarioSetor.setor.nome,
      perguntas: questionarioSetor.questionario.perguntas
    })
  } catch (error) {
    console.error('Erro carregar questionario publico:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}