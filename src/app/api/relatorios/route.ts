// src/app/api/relatorios/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

function classificarRisco(media: number): { nivel: string; cor: string; emoji: string } {
  if (media <= 2.0) return { nivel: 'Crítico', cor: '#dc2626', emoji: '🔴' }
  if (media <= 3.0) return { nivel: 'Alto', cor: '#f97316', emoji: '🟠' }
  if (media <= 3.75) return { nivel: 'Moderado', cor: '#f59e0b', emoji: '🟡' }
  return { nivel: 'Baixo', cor: '#16a34a', emoji: '🟢' }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const questionarioId = searchParams.get('questionarioId')

    if (!questionarioId) {
      return NextResponse.json({ error: 'questionarioId obrigatorio' }, { status: 400 })
    }

    const respostas = await prisma.resposta.findMany({
      where: {
        questionarioId,
        completada: true,
        questionario: { empresaId: auth.empresaId }
      },
      include: {
        itens: {
          include: {
            pergunta: {
              select: {
                id: true,
                texto: true, categoria: true, subcategoria: true,
                fatorNR1: true, fatorISO45003: true, ordem: true,
                peso: true, invertida: true, escalaMax: true, escalaMin: true
              }
            }
          }
        }
      }
    })

    const totalRespostas = respostas.length

    // Helper: ajustar valor para perguntas invertidas
    const ajustarValor = (valor: number, invertida: boolean, escalaMax: number | null): number => {
      if (invertida && escalaMax) {
        return (escalaMax + 1) - valor
      }
      return valor
    }

    // ===== MEDIA POR CATEGORIA =====
    const categoriaMap: Record<string, { soma: number; count: number }> = {}
    respostas.forEach(r => {
      r.itens.forEach(item => {
        if (item.valorNumerico === null) return
        const cat = item.pergunta.categoria
        const val = ajustarValor(item.valorNumerico, item.pergunta.invertida, item.pergunta.escalaMax)
        if (!categoriaMap[cat]) categoriaMap[cat] = { soma: 0, count: 0 }
        categoriaMap[cat].soma += val
        categoriaMap[cat].count += 1
      })
    })

    const mediaPorCategoria = Object.entries(categoriaMap).map(([categoria, dados]) => ({
      categoria,
      media: Math.round((dados.soma / dados.count) * 100) / 100,
      totalRespostas: dados.count,
      risco: classificarRisco(Math.round((dados.soma / dados.count) * 100) / 100)
    })).sort((a, b) => a.media - b.media)

    // ===== MEDIA POR SETOR =====
    const setorMap: Record<string, { soma: number; count: number }> = {}
    respostas.forEach(r => {
      const setor = r.setor || 'Nao informado'
      r.itens.forEach(item => {
        if (item.valorNumerico === null) return
        const val = ajustarValor(item.valorNumerico, item.pergunta.invertida, item.pergunta.escalaMax)
        if (!setorMap[setor]) setorMap[setor] = { soma: 0, count: 0 }
        setorMap[setor].soma += val
        setorMap[setor].count += 1
      })
    })

    const mediaPorSetor = Object.entries(setorMap).map(([setor, dados]) => ({
      setor,
      media: Math.round((dados.soma / dados.count) * 100) / 100,
      totalRespostas: dados.count,
      risco: classificarRisco(Math.round((dados.soma / dados.count) * 100) / 100)
    })).sort((a, b) => a.media - b.media)

    // ===== MEDIA POR FATOR NR-1 =====
    const nr1Map: Record<string, { soma: number; count: number; faixas: Record<number, number> }> = {}
    respostas.forEach(r => {
      r.itens.forEach(item => {
        if (item.valorNumerico === null || !item.pergunta.fatorNR1) return
        const fator = item.pergunta.fatorNR1
        const val = ajustarValor(item.valorNumerico, item.pergunta.invertida, item.pergunta.escalaMax)
        if (!nr1Map[fator]) nr1Map[fator] = { soma: 0, count: 0, faixas: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
        nr1Map[fator].soma += val
        nr1Map[fator].count += 1
        const faixa = Math.min(5, Math.max(1, Math.round(val)))
        nr1Map[fator].faixas[faixa] += 1
      })
    })

    const mediaPorFatorNR1 = Object.entries(nr1Map).map(([fator, dados]) => ({
      fator,
      media: Math.round((dados.soma / dados.count) * 100) / 100,
      totalRespostas: dados.count,
      risco: classificarRisco(Math.round((dados.soma / dados.count) * 100) / 100),
      distribuicao: {
        faixa1: dados.faixas[1],
        faixa2: dados.faixas[2],
        faixa3: dados.faixas[3],
        faixa4: dados.faixas[4],
        faixa5: dados.faixas[5],
      }
    })).sort((a, b) => a.media - b.media)

    // ===== MEDIA POR TURNO =====
    const turnoMap: Record<string, { soma: number; count: number }> = {}
    respostas.forEach(r => {
      const turno = r.turno || 'Nao informado'
      r.itens.forEach(item => {
        if (item.valorNumerico === null) return
        const val = ajustarValor(item.valorNumerico, item.pergunta.invertida, item.pergunta.escalaMax)
        if (!turnoMap[turno]) turnoMap[turno] = { soma: 0, count: 0 }
        turnoMap[turno].soma += val
        turnoMap[turno].count += 1
      })
    })

    const mediaPorTurno = Object.entries(turnoMap).map(([turno, dados]) => ({
      turno,
      media: Math.round((dados.soma / dados.count) * 100) / 100,
      totalRespostas: dados.count,
      risco: classificarRisco(Math.round((dados.soma / dados.count) * 100) / 100)
    })).sort((a, b) => a.media - b.media)

    // ===== RANKING DE PERGUNTAS (top piores e melhores) =====
    const perguntaMap: Record<string, { texto: string; soma: number; count: number; categoria: string; fatorNR1: string | null }> = {}
    respostas.forEach(r => {
      r.itens.forEach(item => {
        if (item.valorNumerico === null) return
        const pid = item.pergunta.id
        const val = ajustarValor(item.valorNumerico, item.pergunta.invertida, item.pergunta.escalaMax)
        if (!perguntaMap[pid]) {
          perguntaMap[pid] = {
            texto: item.pergunta.texto,
            soma: 0, count: 0,
            categoria: item.pergunta.categoria,
            fatorNR1: item.pergunta.fatorNR1
          }
        }
        perguntaMap[pid].soma += val
        perguntaMap[pid].count += 1
      })
    })

    const todasPerguntas = Object.entries(perguntaMap).map(([id, dados]) => ({
      id,
      texto: dados.texto,
      media: Math.round((dados.soma / dados.count) * 100) / 100,
      totalRespostas: dados.count,
      categoria: dados.categoria,
      fatorNR1: dados.fatorNR1,
      risco: classificarRisco(Math.round((dados.soma / dados.count) * 100) / 100)
    })).sort((a, b) => a.media - b.media)

    const topPiores = todasPerguntas.slice(0, 5)
    const topMelhores = [...todasPerguntas].sort((a, b) => b.media - a.media).slice(0, 5)

    // ===== DISTRIBUICAO GERAL POR FAIXA =====
    const distribuicaoGeral = { faixa1: 0, faixa2: 0, faixa3: 0, faixa4: 0, faixa5: 0 }
    let somaGeral = 0
    let countGeral = 0
    respostas.forEach(r => {
      r.itens.forEach(item => {
        if (item.valorNumerico === null) return
        const val = ajustarValor(item.valorNumerico, item.pergunta.invertida, item.pergunta.escalaMax)
        somaGeral += val
        countGeral += 1
        const faixa = Math.min(5, Math.max(1, Math.round(val)))
        const key = `faixa${faixa}` as keyof typeof distribuicaoGeral
        distribuicaoGeral[key] += 1
      })
    })

    const mediaGeral = countGeral > 0 ? Math.round((somaGeral / countGeral) * 100) / 100 : 0

    return NextResponse.json({
      totalRespostas,
      mediaGeral,
      riscoGeral: classificarRisco(mediaGeral),
      distribuicaoGeral,
      totalItensAvaliados: countGeral,
      mediaPorCategoria,
      mediaPorSetor,
      mediaPorTurno,
      mediaPorFatorNR1,
      topPiores,
      topMelhores,
    })
  } catch (error) {
    console.error('Erro gerar relatorio:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
