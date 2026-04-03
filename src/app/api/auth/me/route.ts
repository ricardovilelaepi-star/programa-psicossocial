import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        empresa: {
          select: { id: true, nomeFantasia: true, razaoSocial: true }
        }
      }
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error('Erro /me:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}