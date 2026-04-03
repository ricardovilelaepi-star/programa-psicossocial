import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha, nomeEmpresa, cnpj } = await request.json()

    if (!nome || !email || !senha || !nomeEmpresa || !cnpj) {
      return NextResponse.json({ error: 'Todos os campos sao obrigatorios' }, { status: 400 })
    }

    const usuarioExiste = await prisma.usuario.findUnique({ where: { email } })
    if (usuarioExiste) {
      return NextResponse.json({ error: 'Email ja cadastrado' }, { status: 400 })
    }

    const cnpjLimpo = cnpj.replace(/\D/g, '')
    const empresaExiste = await prisma.empresa.findUnique({ where: { cnpj: cnpjLimpo } })
    if (empresaExiste) {
      return NextResponse.json({ error: 'CNPJ ja cadastrado' }, { status: 400 })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    const resultado = await prisma.$transaction(async (tx) => {
      const empresa = await tx.empresa.create({
        data: {
          razaoSocial: nomeEmpresa,
          nomeFantasia: nomeEmpresa,
          cnpj: cnpjLimpo
        }
      })

      const usuario = await tx.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          papel: 'ADMIN',
          empresaId: empresa.id
        }
      })

      return { empresa, usuario }
    })

    return NextResponse.json({
      message: 'Conta criada com sucesso',
      usuario: {
        id: resultado.usuario.id,
        nome: resultado.usuario.nome,
        email: resultado.usuario.email,
        papel: resultado.usuario.papel
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Erro registro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}