// src/app/dashboard/pgr/page.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'

// ============================================================
// TIPOS
// ============================================================
interface PGRListItem {
  id: string
  titulo: string
  versao: number
  status: string
  dataElaboracao: string
  totalRespondentes: number | null
  totalColaboradores: number | null
  taxaParticipacao: number | null
  questionarioId: string | null
  createdAt: string
}

interface Questionario {
  id: string
  titulo: string
  status: string
  _count: { respostas: number }
}

interface CausaProvavel {
  titulo: string
  descricao: string
  impactos: string
  indicadorRelacionado: string
  evidencia: string
}

interface MedidaRecomendada {
  tipo: string
  titulo: string
  descricao: string
  responsavel: string
  prazoSugerido: string
  referenciaLegal: string
  prioridade: number
}

interface InventarioItem {
  categoria: string
  subcategorias: string[]
  fatorNR1: string
  fatorISO45003: string
  mediaPontuacao: number
  totalRespostas: number
  totalRespondentes: number
  percentualCritico: number
  distribuicao: Record<number, number>
  probabilidade: { valor: number; descricao: string }
  severidade: { valor: number; descricao: string }
  nivelRisco: number
  classificacao: string
  cor: string
  prioridade: string
  causasProvaveis: CausaProvavel[]
  medidasRecomendadas: MedidaRecomendada[]
  perguntasAvaliadas: string[]
}

interface MatrizItem {
  categoria: string
  probabilidade: number
  probabilidadeDesc: string
  severidade: number
  severidadeDesc: string
  nivelRisco: number
  classificacao: string
}

interface Indicadores {
  mediaGeral: number
  totalRespondentes: number
  totalColaboradores: number
  taxaParticipacao: number | null
  totalFatoresAvaliados: number
  fatoresCriticos: number
  fatoresAltos: number
  fatoresModerados: number
  fatoresBaixos: number
  totalMedidasRecomendadas: number
  setorMaisCritico: string | null
  setorMaisSeguro: string | null
}

interface SetorAnalise {
  setor: string
  media: number
  respondentes: number
  categorias: Array<{ categoria: string; media: number }>
  pontosCriticos: string[]
  pontosFortes: string[]
}

interface PlanoAcaoItem {
  ordem: number
  categoria: string
  fatorNR1: string
  classificacaoRisco: string
  nivelRisco: number
  acao: string
  descricao: string
  tipo: string
  responsavel: string
  prazo: string
  referenciaLegal: string
  status: string
}

interface CronogramaItem {
  fase: string
  prazo: string
  descricao: string
  status: string
}

interface ConformidadeItem {
  descricao: string
  status: string
  evidencia: string
}

interface PGRCompleto {
  id: string
  titulo: string
  versao: number
  status: string
  dataElaboracao: string
  periodoAvaliacao: string
  totalRespondentes: number
  totalColaboradores: number
  taxaParticipacao: number | null
  objetivos: string
  escopo: string
  responsabilidades: string
  metodologia: string
  parecerTecnico: string
  inventario: InventarioItem[]
  matrizRisco: MatrizItem[]
  indicadores: Indicadores
  analiseSetores: SetorAnalise[]
  planoAcao: PlanoAcaoItem[]
  cronograma: CronogramaItem[]
  conformidade: Record<string, ConformidadeItem>
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function PGRPage() {
  const [pgrs, setPgrs] = useState<PGRListItem[]>([])
  const [questionarios, setQuestionarios] = useState<Questionario[]>([])
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')
  const [pgrSelecionado, setPgrSelecionado] = useState<PGRCompleto | null>(null)
  const [carregandoPGR, setCarregandoPGR] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState('resumo')

  const carregar = useCallback(async () => {
    try {
      const [resPgrs, resQuest] = await Promise.all([
        fetch('/api/pgr'),
        fetch('/api/questionarios')
      ])
      const dataPgrs = await resPgrs.json()
      const dataQuest = await resQuest.json()
      setPgrs(Array.isArray(dataPgrs) ? dataPgrs : [])
      setQuestionarios(Array.isArray(dataQuest) ? dataQuest.filter((q: Questionario) =>
        q._count.respostas > 0
      ) : [])
    } catch {
      console.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const gerarPGR = async (questionarioId: string) => {
    setGerando(true)
    setErro('')
    try {
      const res = await fetch('/api/pgr/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionarioId })
      })
      if (!res.ok) {
        const data = await res.json()
        setErro(data.error || 'Erro ao gerar PGR')
        return
      }
      await carregar()
    } catch {
      setErro('Erro de conexao')
    } finally {
      setGerando(false)
    }
  }

  const abrirPGR = async (id: string) => {
    setCarregandoPGR(true)
    try {
      const res = await fetch(`/api/pgr/${id}`)
      if (res.ok) {
        const data = await res.json()
        setPgrSelecionado(data)
        setAbaAtiva('resumo')
      }
    } catch {
      console.error('Erro ao abrir PGR')
    } finally {
      setCarregandoPGR(false)
    }
  }

  const excluirPGR = async (id: string, titulo: string) => {
    if (!confirm(`Excluir "${titulo}"? Esta acao nao pode ser desfeita.`)) return
    try {
      const res = await fetch(`/api/pgr/${id}`, { method: 'DELETE' })
      if (res.ok) {
        carregar()
        if (pgrSelecionado?.id === id) setPgrSelecionado(null)
      } else {
        alert('Erro ao excluir PGR')
      }
    } catch {
      alert('Erro de conexao')
    }
  }

  // ============================================================
  // HELPERS DE ESTILO
  // ============================================================
  const corRisco = (classificacao: string) => {
    const cores: Record<string, string> = {
      'Critico': '#dc2626', 'Alto': '#f97316', 'Moderado': '#f59e0b',
      'Baixo': '#84cc16', 'Muito Baixo': '#16a34a'
    }
    return cores[classificacao] || '#94a3b8'
  }

  const bgRisco = (classificacao: string) => {
    const bgs: Record<string, string> = {
      'Critico': '#fef2f2', 'Alto': '#fff7ed', 'Moderado': '#fffbeb',
      'Baixo': '#f7fee7', 'Muito Baixo': '#f0fdf4'
    }
    return bgs[classificacao] || '#f8fafc'
  }

  const statusBadge = (status: string) => {
    const estilos: Record<string, { bg: string; color: string }> = {
      'RASCUNHO': { bg: '#f1f5f9', color: '#64748b' },
      'REVISAO': { bg: '#fef3c7', color: '#d97706' },
      'APROVADO': { bg: '#dbeafe', color: '#2563eb' },
      'VIGENTE': { bg: '#dcfce7', color: '#16a34a' },
      'OBSOLETO': { bg: '#fef2f2', color: '#dc2626' },
      'PENDENTE': { bg: '#fef3c7', color: '#d97706' },
      'EM ATENDIMENTO': { bg: '#dbeafe', color: '#2563eb' },
      'VERIFICAR': { bg: '#fff7ed', color: '#f97316' },
    }
    const est = estilos[status] || { bg: '#f1f5f9', color: '#64748b' }
    return est
  }

  const cardStyle = {
    background: '#fff', borderRadius: '12px', padding: '24px',
    border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  }

  // ============================================================
  // RENDER: VISUALIZACAO COMPLETA DO PGR
  // ============================================================
  if (pgrSelecionado) {
    const pgr = pgrSelecionado
    const ind = pgr.indicadores

    const abas = [
      { key: 'resumo', label: 'Resumo Executivo' },
      { key: 'inventario', label: 'Inventario de Riscos' },
      { key: 'matriz', label: 'Matriz de Risco' },
      { key: 'setores', label: 'Analise por Setor' },
      { key: 'plano', label: 'Plano de Acao' },
      { key: 'cronograma', label: 'Cronograma' },
      { key: 'conformidade', label: 'Conformidade Legal' },
      { key: 'parecer', label: 'Parecer Tecnico' },
    ]

    return (
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <button onClick={() => setPgrSelecionado(null)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: 0, marginBottom: 8 }}>
              ← Voltar para lista
            </button>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>{pgr.titulo}</h1>
            <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>
              Versao {pgr.versao} • Periodo: {pgr.periodoAvaliacao} • Status: {pgr.status}
            </p>
          </div>
        </div>

        {/* Abas */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, overflowX: 'auto', borderBottom: '2px solid #e2e8f0', paddingBottom: 0 }}>
          {abas.map(aba => (
            <button
              key={aba.key}
              onClick={() => setAbaAtiva(aba.key)}
              style={{
                padding: '10px 18px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                borderRadius: '8px 8px 0 0', whiteSpace: 'nowrap',
                background: abaAtiva === aba.key ? '#fff' : 'transparent',
                color: abaAtiva === aba.key ? '#2563eb' : '#64748b',
                borderBottom: abaAtiva === aba.key ? '2px solid #2563eb' : '2px solid transparent',
                marginBottom: '-2px',
              }}
            >
              {aba.label}
            </button>
          ))}
        </div>

        {/* ========== ABA: RESUMO EXECUTIVO ========== */}
        {abaAtiva === 'resumo' && (
          <div>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Media Geral', valor: `${ind.mediaGeral}/5.00`, cor: ind.mediaGeral >= 3.5 ? '#16a34a' : ind.mediaGeral >= 2.5 ? '#f59e0b' : '#dc2626' },
                { label: 'Respondentes', valor: `${ind.totalRespondentes}`, cor: '#3b82f6' },
                { label: 'Participacao', valor: ind.taxaParticipacao ? `${ind.taxaParticipacao}%` : 'N/D', cor: '#8b5cf6' },
                { label: 'Fatores Criticos', valor: `${ind.fatoresCriticos}`, cor: '#dc2626' },
                { label: 'Fatores Altos', valor: `${ind.fatoresAltos}`, cor: '#f97316' },
                { label: 'Medidas', valor: `${ind.totalMedidasRecomendadas}`, cor: '#0891b2' },
              ].map((kpi, i) => (
                <div key={i} style={cardStyle}>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 700, margin: '6px 0 0', color: kpi.cor }}>{kpi.valor}</p>
                </div>
              ))}
            </div>

            {/* Visao geral por categoria */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1e293b' }}>Visao Geral por Categoria de Risco</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Categoria</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Media</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>% Critico</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Prob.</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Sev.</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Nivel</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Classificacao</th>
                  </tr>
                </thead>
                <tbody>
                  {pgr.inventario.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{item.categoria}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: 14 }}>{item.mediaPontuacao}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: 14 }}>{item.percentualCritico}%</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: 13 }}>{item.probabilidade.valor} ({item.probabilidade.descricao})</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: 13 }}>{item.severidade.valor} ({item.severidade.descricao})</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, fontSize: 16, color: corRisco(item.classificacao) }}>{item.nivelRisco}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: bgRisco(item.classificacao), color: corRisco(item.classificacao) }}>
                          {item.classificacao}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Info complementar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
              <div style={cardStyle}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Objetivos</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{pgr.objetivos}</p>
              </div>
              <div style={cardStyle}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Metodologia</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{pgr.metodologia}</p>
              </div>
            </div>
          </div>
        )}

        {/* ========== ABA: INVENTARIO DE RISCOS ========== */}
        {abaAtiva === 'inventario' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {pgr.inventario.map((item, i) => (
              <div key={i} style={{ ...cardStyle, borderLeft: `4px solid ${corRisco(item.classificacao)}` }}>
                {/* Cabecalho */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>{item.categoria}</h3>
                    <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                      Fator NR-1: {item.fatorNR1} • ISO 45003: {item.fatorISO45003}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, background: bgRisco(item.classificacao), color: corRisco(item.classificacao) }}>
                      {item.classificacao} ({item.nivelRisco})
                    </span>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '6px 0 0' }}>{item.prioridade}</p>
                  </div>
                </div>

                {/* Metricas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 16, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                  <div><p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>MEDIA</p><p style={{ fontSize: 20, fontWeight: 700, margin: '2px 0 0', color: '#1e293b' }}>{item.mediaPontuacao}</p></div>
                  <div><p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>% CRITICO</p><p style={{ fontSize: 20, fontWeight: 700, margin: '2px 0 0', color: item.percentualCritico > 30 ? '#dc2626' : '#1e293b' }}>{item.percentualCritico}%</p></div>
                  <div><p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>PROBABILIDADE</p><p style={{ fontSize: 20, fontWeight: 700, margin: '2px 0 0' }}>{item.probabilidade.valor}</p><p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{item.probabilidade.descricao}</p></div>
                  <div><p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>SEVERIDADE</p><p style={{ fontSize: 20, fontWeight: 700, margin: '2px 0 0' }}>{item.severidade.valor}</p><p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{item.severidade.descricao}</p></div>
                </div>

                {/* Distribuicao visual */}
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Distribuicao das respostas (ajustadas)</p>
                  <div style={{ display: 'flex', gap: 4, height: 24 }}>
                    {[1, 2, 3, 4, 5].map(n => {
                      const total = Object.values(item.distribuicao).reduce((s, v) => s + v, 0)
                      const pct = total > 0 ? (item.distribuicao[n] / total) * 100 : 0
                      const cores = ['#dc2626', '#f97316', '#f59e0b', '#84cc16', '#16a34a']
                      return (
                        <div key={n} style={{ flex: Math.max(pct, 2), background: cores[n - 1], borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: pct > 3 ? 'auto' : 0, transition: 'flex 0.3s' }}>
                          {pct > 8 && <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>{Math.round(pct)}%</span>}
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>1 (Critico)</span>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>5 (Otimo)</span>
                  </div>
                </div>

                {/* Causas provaveis */}
                {item.causasProvaveis.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Causas Provaveis</p>
                    {item.causasProvaveis.map((c, ci) => (
                      <div key={ci} style={{ padding: '10px 14px', background: '#fffbeb', borderRadius: 8, marginBottom: 6, borderLeft: '3px solid #f59e0b' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#92400e', margin: 0 }}>{c.titulo}</p>
                        <p style={{ fontSize: 12, color: '#78716c', margin: '4px 0 0' }}>{c.descricao}</p>
                        {c.impactos && <p style={{ fontSize: 11, color: '#a3a3a3', margin: '4px 0 0' }}>Impactos: {c.impactos}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Medidas recomendadas */}
                {item.medidasRecomendadas.length > 0 && (
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Medidas de Controle Recomendadas</p>
                    {item.medidasRecomendadas.map((m, mi) => (
                      <div key={mi} style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, marginBottom: 6, borderLeft: '3px solid #16a34a' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#166534', margin: 0 }}>{m.titulo}</p>
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 12, background: '#dcfce7', color: '#16a34a', fontWeight: 600 }}>{m.tipo}</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0' }}>{m.descricao}</p>
                        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#94a3b8' }}>
                          <span>Responsavel: {m.responsavel}</span>
                          <span>Prazo: {m.prazoSugerido}</span>
                          <span>Ref: {m.referenciaLegal}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ========== ABA: MATRIZ DE RISCO ========== */}
        {abaAtiva === 'matriz' && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#1e293b' }}>Matriz de Risco — Probabilidade x Severidade</h3>

            {/* Matriz visual 5x5 */}
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px repeat(5, 1fr)', gap: 2, minWidth: 600 }}>
                {/* Header severidade */}
                <div></div>
                {['Desprezivel (1)', 'Menor (2)', 'Moderada (3)', 'Significativa (4)', 'Catastrofica (5)'].map((s, i) => (
                  <div key={i} style={{ padding: 8, textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#64748b', background: '#f8fafc' }}>{s}</div>
                ))}

                {/* Linhas de probabilidade (5 até 1) */}
                {[5, 4, 3, 2, 1].map(p => (
                  <>
                    <div key={`label-${p}`} style={{ padding: 8, fontSize: 11, fontWeight: 700, color: '#64748b', background: '#f8fafc', display: 'flex', alignItems: 'center' }}>
                      {p === 5 ? 'M. Alta' : p === 4 ? 'Alta' : p === 3 ? 'Media' : p === 2 ? 'Baixa' : 'M. Baixa'} ({p})
                    </div>
                    {[1, 2, 3, 4, 5].map(s => {
                      const nr = p * s
                      const classif = nr >= 20 ? 'Critico' : nr >= 12 ? 'Alto' : nr >= 6 ? 'Moderado' : nr >= 3 ? 'Baixo' : 'Muito Baixo'
                      const itensAqui = pgr.matrizRisco.filter(m => m.probabilidade === p && m.severidade === s)
                      return (
                        <div key={`${p}-${s}`} style={{
                          padding: 8, background: bgRisco(classif), borderRadius: 4, minHeight: 48,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          border: itensAqui.length > 0 ? `2px solid ${corRisco(classif)}` : '1px solid #e2e8f0'
                        }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: corRisco(classif) }}>{nr}</span>
                          {itensAqui.map((item, idx) => (
                            <span key={idx} style={{ fontSize: 9, color: corRisco(classif), textAlign: 'center', marginTop: 2, lineHeight: 1.2 }}>
                              {item.categoria}
                            </span>
                          ))}
                        </div>
                      )
                    })}
                  </>
                ))}
              </div>
            </div>

            {/* Legenda */}
            <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Critico (20-25)', cor: '#dc2626', bg: '#fef2f2' },
                { label: 'Alto (12-19)', cor: '#f97316', bg: '#fff7ed' },
                { label: 'Moderado (6-11)', cor: '#f59e0b', bg: '#fffbeb' },
                { label: 'Baixo (3-5)', cor: '#84cc16', bg: '#f7fee7' },
                { label: 'Muito Baixo (1-2)', cor: '#16a34a', bg: '#f0fdf4' },
              ].map((leg, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: leg.bg, border: `2px solid ${leg.cor}` }}></div>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{leg.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== ABA: ANALISE POR SETOR ========== */}
        {abaAtiva === 'setores' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pgr.analiseSetores.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: 48 }}>
                <p style={{ color: '#94a3b8' }}>Sem dados de setor disponíveis. Os respondentes nao informaram o setor.</p>
              </div>
            ) : pgr.analiseSetores.map((setor, i) => (
              <div key={i} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>{setor.setor}</h3>
                    <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>{setor.respondentes} respondentes</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: setor.media >= 3.5 ? '#16a34a' : setor.media >= 2.5 ? '#f59e0b' : '#dc2626' }}>
                      {setor.media}
                    </p>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>media geral</p>
                  </div>
                </div>

                {/* Barras por categoria */}
                {setor.categorias.map((cat, ci) => (
                  <div key={ci} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, color: '#475569' }}>{cat.categoria}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: cat.media >= 3.5 ? '#16a34a' : cat.media >= 2.5 ? '#f59e0b' : '#dc2626' }}>{cat.media}</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(cat.media / 5) * 100}%`, background: cat.media >= 3.5 ? '#16a34a' : cat.media >= 2.5 ? '#f59e0b' : '#dc2626', borderRadius: 4, transition: 'width 0.3s' }}></div>
                    </div>
                  </div>
                ))}

                {/* Destaques */}
                <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                  {setor.pontosCriticos.length > 0 && (
                    <div style={{ flex: 1, padding: 10, background: '#fef2f2', borderRadius: 8 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', margin: 0 }}>PONTOS CRITICOS</p>
                      {setor.pontosCriticos.map((p, pi) => (
                        <p key={pi} style={{ fontSize: 12, color: '#991b1b', margin: '2px 0 0' }}>• {p}</p>
                      ))}
                    </div>
                  )}
                  {setor.pontosFortes.length > 0 && (
                    <div style={{ flex: 1, padding: 10, background: '#f0fdf4', borderRadius: 8 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', margin: 0 }}>PONTOS FORTES</p>
                      {setor.pontosFortes.map((p, pi) => (
                        <p key={pi} style={{ fontSize: 12, color: '#166534', margin: '2px 0 0' }}>• {p}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== ABA: PLANO DE ACAO ========== */}
        {abaAtiva === 'plano' && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1e293b' }}>
              Plano de Acao — {pgr.planoAcao.length} medidas recomendadas
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    {['#', 'Categoria', 'Risco', 'Acao', 'Tipo', 'Responsavel', 'Prazo', 'Ref. Legal'].map((h, hi) => (
                      <th key={hi} style={{ padding: '10px 8px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pgr.planoAcao.map((acao, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', fontSize: 12, color: '#94a3b8' }}>{acao.ordem}</td>
                      <td style={{ padding: '10px 8px', fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{acao.categoria}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: bgRisco(acao.classificacaoRisco), color: corRisco(acao.classificacaoRisco) }}>
                          {acao.classificacaoRisco}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: 12, color: '#475569', maxWidth: 250 }}>{acao.acao}</td>
                      <td style={{ padding: '10px 8px', fontSize: 11 }}>
                        <span style={{ padding: '2px 8px', borderRadius: 12, background: '#f1f5f9', color: '#64748b', fontWeight: 500 }}>{acao.tipo}</span>
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: 12, color: '#64748b' }}>{acao.responsavel}</td>
                      <td style={{ padding: '10px 8px', fontSize: 12, color: '#64748b' }}>{acao.prazo}</td>
                      <td style={{ padding: '10px 8px', fontSize: 11, color: '#94a3b8' }}>{acao.referenciaLegal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== ABA: CRONOGRAMA ========== */}
        {abaAtiva === 'cronograma' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pgr.cronograma.map((fase, i) => (
              <div key={i} style={{ ...cardStyle, borderLeft: `4px solid ${i === 0 ? '#dc2626' : i === 1 ? '#f97316' : i === 2 ? '#f59e0b' : '#16a34a'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>{fase.fase}</h3>
                    <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>{fase.descricao}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>{fase.prazo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== ABA: CONFORMIDADE LEGAL ========== */}
        {abaAtiva === 'conformidade' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(pgr.conformidade).map(([key, item], i) => {
              const badge = statusBadge(item.status)
              return (
                <div key={i} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>{item.descricao}</h3>
                      <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 0' }}>{item.evidencia}</p>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: badge.bg, color: badge.color, whiteSpace: 'nowrap' }}>
                      {item.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ========== ABA: PARECER TECNICO ========== */}
        {abaAtiva === 'parecer' && (
          <div style={cardStyle}>
            <pre style={{ fontFamily: 'inherit', fontSize: 14, color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>
              {pgr.parecerTecnico}
            </pre>
          </div>
        )}
      </div>
    )
  }

  // ============================================================
  // RENDER: LISTA DE PGRs
  // ============================================================
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>PGR Psicossocial</h1>
        <p style={{ color: '#64748b', marginTop: 4, fontSize: 15 }}>
          Programa de Gerenciamento de Riscos — Fatores Psicossociais (NR-1 / ISO 45003)
        </p>
      </div>

      {erro && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 20 }}>
          {erro}
        </div>
      )}

      {/* Gerar novo PGR */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1e293b' }}>Gerar Novo PGR</h2>
        {questionarios.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 14 }}>
            Nenhum questionario com respostas disponivel. Colete respostas primeiro.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {questionarios.map(q => (
              <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f8fafc', borderRadius: 8 }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: '#1e293b' }}>{q.titulo}</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                    {q._count.respostas} respostas • Status: {q.status}
                  </p>
                </div>
                <button
                  onClick={() => gerarPGR(q.id)}
                  disabled={gerando}
                  style={{
                    background: gerando ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px',
                    fontSize: 13, fontWeight: 600, cursor: gerando ? 'default' : 'pointer',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                  }}
                >
                  {gerando ? 'Gerando PGR...' : 'Gerar PGR'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de PGRs */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1e293b' }}>PGRs Gerados</h2>
        {loading ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: 32 }}>Carregando...</p>
        ) : pgrs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p style={{ color: '#64748b' }}>Nenhum PGR gerado ainda</p>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Selecione um questionario acima para gerar seu primeiro PGR</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                {['Titulo', 'Versao', 'Status', 'Respondentes', 'Participacao', 'Data', 'Acoes'].map((h, i) => (
                  <th key={i} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pgrs.map(pgr => {
                const badge = statusBadge(pgr.status)
                return (
                  <tr key={pgr.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 12px', fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{pgr.titulo}</td>
                    <td style={{ padding: '14px 12px', fontSize: 14, color: '#475569' }}>v{pgr.versao}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: badge.bg, color: badge.color }}>{pgr.status}</span>
                    </td>
                    <td style={{ padding: '14px 12px', fontSize: 14, color: '#475569' }}>{pgr.totalRespondentes || '-'}</td>
                    <td style={{ padding: '14px 12px', fontSize: 14, color: '#475569' }}>{pgr.taxaParticipacao ? `${pgr.taxaParticipacao.toFixed(1)}%` : '-'}</td>
                    <td style={{ padding: '14px 12px', fontSize: 13, color: '#94a3b8' }}>{new Date(pgr.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <button onClick={() => abrirPGR(pgr.id)} disabled={carregandoPGR} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: '#3b82f6', fontWeight: 500, marginRight: 6 }}>
                        {carregandoPGR ? '...' : 'Visualizar'}
                      </button>
                      <button onClick={() => excluirPGR(pgr.id, pgr.titulo)} style={{ background: 'none', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: '#ef4444', fontWeight: 500 }}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
