import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUserId()
    if (!auth) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    const { empresaId } = await request.json()

    if (!empresaId) {
      return NextResponse.json({ error: 'empresaId e obrigatorio' }, { status: 400 })
    }

    // Verifica se a empresa existe
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { id: true, nomeFantasia: true }
    })

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa nao encontrada' }, { status: 404 })
    }

    // Seta cookie da empresa ativa
    const response = NextResponse.json({
      success: true,
      empresa: { id: empresa.id, nomeFantasia: empresa.nomeFantasia }
    })

    response.cookies.set('empresaAtiva', empresaId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    })

    return response
  } catch (error) {
    console.error('Erro selecionar empresa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
