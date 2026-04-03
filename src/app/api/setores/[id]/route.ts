import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUserId } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUserId()
    if (!auth) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { nome, totalColaboradores, turnos } = body

    if (!nome) {
      return NextResponse.json({ error: "nome obrigatorio" }, { status: 400 })
    }

    const setor = await prisma.setor.findUnique({ where: { id } })
    if (!setor) return NextResponse.json({ error: "Setor nao encontrado" }, { status: 404 })

    const existing = await prisma.setor.findFirst({
      where: {
        nome,
        empresaId: setor.empresaId,
        NOT: { id }
      }
    })

    if (existing) {
      return NextResponse.json({ error: "Ja existe outro setor com este nome" }, { status: 409 })
    }

    const updated = await prisma.setor.update({
      where: { id },
      data: {
        nome,
        totalColaboradores: totalColaboradores ? parseInt(totalColaboradores) : 0,
        turnos: turnos || null,
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Erro atualizar setor:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUserId()
    if (!auth) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })

    const { id } = await params

    const setor = await prisma.setor.findUnique({
      where: { id },
      include: { _count: { select: { questionarioSetores: true } } }
    })

    if (!setor) return NextResponse.json({ error: "Setor nao encontrado" }, { status: 404 })

    if (setor._count.questionarioSetores > 0) {
      return NextResponse.json(
        { error: "Nao e possivel excluir setor vinculado a questionarios" },
        { status: 400 }
      )
    }

    await prisma.setor.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro excluir setor:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
