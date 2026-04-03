import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUserId } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUserId()
    if (!auth) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get("empresaId")

    if (!empresaId) {
      return NextResponse.json({ error: "empresaId obrigatorio" }, { status: 400 })
    }

    const setores = await prisma.setor.findMany({
      where: { empresaId },
      orderBy: { nome: "asc" }
    })

    return NextResponse.json(setores)
  } catch (error) {
    console.error("Erro buscar setores:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUserId()
    if (!auth) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })

    const body = await request.json()
    const { nome, empresaId, totalColaboradores, turnos } = body

    if (!nome || !empresaId) {
      return NextResponse.json({ error: "nome e empresaId obrigatorios" }, { status: 400 })
    }

    const existing = await prisma.setor.findUnique({
      where: { nome_empresaId: { nome, empresaId } }
    })

    if (existing) {
      return NextResponse.json({ error: "Ja existe um setor com este nome nesta empresa" }, { status: 409 })
    }

    const setor = await prisma.setor.create({
      data: {
        nome,
        empresaId,
        totalColaboradores: totalColaboradores ? parseInt(totalColaboradores) : 0,
        turnos: turnos || null,
      }
    })

    return NextResponse.json(setor, { status: 201 })
  } catch (error) {
    console.error("Erro criar setor:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}