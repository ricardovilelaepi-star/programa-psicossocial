import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUserId()
    if (!auth) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    const { id } = await params

    const empresa = await prisma.empresa.findUnique({
      where: { id },
      include: {
        _count: {
          select: { setores: true, questionarios: true, usuarios: true }
        }
      }
    })

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa nao encontrada' }, { status: 404 })
    }

    return NextResponse.json(empresa)
  } catch (error) {
    console.error('Erro buscar empresa:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUserId()
    if (!auth) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const {
      razaoSocial, nomeFantasia, cnpj, porte, segmento,
      endereco, cidade, estado, telefone, email,
      responsavelNome, responsavelCargo, responsavelRegistro
    } = body

    if (!razaoSocial || !nomeFantasia || !cnpj) {
      return NextResponse.json(
        { error: 'Campos obrigatorios: razaoSocial, nomeFantasia, cnpj' },
        { status: 400 }
      )
    }

    const cnpjLimpo = cnpj.replace(/\D/g, '')

    const existing = await prisma.empresa.findFirst({
      where: {
        cnpj: cnpjLimpo,
        NOT: { id }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Ja existe outra empresa com este CNPJ' }, { status: 409 })
    }

    const empresa = await prisma.empresa.update({
      where: { id },
      data: {
        razaoSocial,
        nomeFantasia,
        cnpj: cnpjLimpo,
        porte: porte || null,
        segmento: segmento || null,
        endereco: endereco || null,
        cidade: cidade || null,
        estado: estado || null,
        telefone: telefone ? telefone.replace(/\D/g, '') : null,
        email: email || null,
        responsavelNome: responsavelNome || null,
        responsavelCargo: responsavelCargo || null,
        responsavelRegistro: responsavelRegistro || null,
      }
    })

    return NextResponse.json(empresa)
  } catch (error: unknown) {
    console.error('Erro atualizar empresa:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUserId()
    if (!auth) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    const { id } = await params

    const empresa = await prisma.empresa.findUnique({
      where: { id },
      include: {
        _count: {
          select: { setores: true, questionarios: true }
        }
      }
    })

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa nao encontrada' }, { status: 404 })
    }

    if (empresa._count.setores > 0 || empresa._count.questionarios > 0) {
      return NextResponse.json(
        { error: 'Nao e possivel excluir empresa com setores ou questionarios vinculados. Remova-os primeiro.' },
        { status: 400 }
      )
    }

    await prisma.empresa.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro excluir empresa:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
