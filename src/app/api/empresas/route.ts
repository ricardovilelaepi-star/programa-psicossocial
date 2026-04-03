import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '@/lib/auth'

// GET - Listar todas as empresas
export async function GET() {
  try {
    const auth = await getAuthUserId()
    if (!auth) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    const empresas = await prisma.empresa.findMany({
      orderBy: { nomeFantasia: 'asc' },
      select: {
        id: true,
        razaoSocial: true,
        nomeFantasia: true,
        cnpj: true,
        porte: true,
        segmento: true,
        cidade: true,
        estado: true,
        createdAt: true,
        _count: {
          select: {
            setores: true,
            questionarios: true,
            usuarios: true,
          }
        }
      }
    })

    return NextResponse.json(empresas)
  } catch (error) {
    console.error('Erro listar empresas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar nova empresa
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUserId()
    if (!auth) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

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

    const empresa = await prisma.empresa.create({
      data: {
        razaoSocial,
        nomeFantasia,
        cnpj: cnpjLimpo,
        porte: porte || null,
        segmento: segmento || null,
        endereco: endereco || null,
        cidade: cidade || null,
        estado: estado || null,
        telefone: telefone || null,
        email: email || null,
        responsavelNome: responsavelNome || null,
        responsavelCargo: responsavelCargo || null,
        responsavelRegistro: responsavelRegistro || null,
      }
    })

    return NextResponse.json(empresa, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ja existe uma empresa com este CNPJ' },
        { status: 409 }
      )
    }
    console.error('Erro criar empresa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
