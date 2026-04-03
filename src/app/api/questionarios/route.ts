import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    const questionarios = await prisma.questionario.findMany({
      where: { empresaId: auth.empresaId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { perguntas: true, respostas: true } },
        setores: {
          include: { setor: { select: { id: true, nome: true } } }
        }
      }
    })

    return NextResponse.json(questionarios)
  } catch (error) {
    console.error('Erro listar questionarios:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    const body = await request.json()
    const { titulo, descricao, tipo, perguntas, setorIds } = body

    if (!titulo || !perguntas || !Array.isArray(perguntas) || perguntas.length === 0) {
      return NextResponse.json(
        { error: 'Campos obrigatorios: titulo, perguntas (array)' },
        { status: 400 }
      )
    }

    const questionario = await prisma.questionario.create({
      data: {
        titulo,
        descricao: descricao || null,
        tipo: tipo || 'PSICOSSOCIAL',
        empresaId: auth.empresaId,
        perguntas: {
          create: perguntas.map((p: any, index: number) => ({
            texto: p.texto,
            categoria: p.categoria,
            subcategoria: p.subcategoria || null,
            fatorNR1: p.fatorNR1 || null,
            fatorISO45003: p.fatorISO45003 || null,
            tipoResposta: p.tipoResposta || 'ESCALA',
            escalaMin: p.escalaMin || 1,
            escalaMax: p.escalaMax || 5,
            escalaMinLabel: p.escalaMinLabel || null,
            escalaMaxLabel: p.escalaMaxLabel || null,
            obrigatoria: p.obrigatoria !== undefined ? p.obrigatoria : true,
            ordem: p.ordem ?? index + 1,
            peso: p.peso || 1.0,
            invertida: p.invertida || false
          }))
        },
        ...(setorIds && Array.isArray(setorIds) && setorIds.length > 0 && {
          setores: {
            create: setorIds.map((setorId: string) => ({
              setorId,
              totalEsperado: 0
            }))
          }
        })
      },
      include: {
        perguntas: true,
        setores: { include: { setor: true } }
      }
    })

    return NextResponse.json(questionario, { status: 201 })
  } catch (error) {
    console.error('Erro criar questionario:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}