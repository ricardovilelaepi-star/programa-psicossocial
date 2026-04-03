import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    const totalSetores = await prisma.setor.count({
      where: { empresaId: auth.empresaId }
    })
    const totalRespostas = await prisma.resposta.count({
      where: { questionario: { empresaId: auth.empresaId } }
    })
    const questionariosAtivos = await prisma.questionario.count({
      where: { empresaId: auth.empresaId, status: 'ATIVO' }
    })
    const avaliacoesPendentes = await prisma.avaliacaoRisco.count({
      where: { empresaId: auth.empresaId, statusAcao: 'PENDENTE' }
    })

    return NextResponse.json({
      totalSetores,
      totalRespostas,
      questionariosAtivos,
      avaliacoesPendentes,
    })
  } catch (error) {
    console.error('Erro ao buscar stats:', error)
    return NextResponse.json({
      totalSetores: 0,
      totalRespostas: 0,
      questionariosAtivos: 0,
      avaliacoesPendentes: 0,
    })
  }
}