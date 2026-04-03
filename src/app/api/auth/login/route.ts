import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json()

    if (!email || !senha) {
      return NextResponse.json({ error: 'Email e senha obrigatorios' }, { status: 400 })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { empresa: { select: { id: true, nomeFantasia: true } } }
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 })
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha)
    if (!senhaValida) {
      return NextResponse.json({ error: 'Credenciais invalidas' }, { status: 401 })
    }

    const token = generateToken({
      userId: usuario.id,
      empresaId: usuario.empresaId ?? undefined,
      papel: usuario.papel
    })

    const response = NextResponse.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        empresa: usuario.empresa
      }
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8
    })

    return response
  } catch (error) {
    console.error('Erro login:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
