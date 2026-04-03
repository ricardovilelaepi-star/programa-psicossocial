// src/app/dashboard/resultados/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'

interface RiscoInfo {
  nivel: string
  cor: string
  emoji: string
}

interface Distribuicao {
  faixa1: number
  faixa2: number
  faixa3: number
  faixa4: number
  faixa5: number
}

interface CategoriaItem {
  categoria: string
  media: number
  totalRespostas: number
  risco: RiscoInfo
}

interface SetorItem {
  setor: string
  media: number
  totalRespostas: number
  risco: RiscoInfo
}

interface TurnoItem {
  turno: string
  media: number
  totalRespostas: number
  risco: RiscoInfo
}

interface FatorNR1Item {
  fator: string
  media: number
  totalRespostas: number
  risco: RiscoInfo
  distribuicao: Distribuicao
}

interface PerguntaItem {
  id: string
  texto: string
  media: number
  totalRespostas: number
  categoria: string
  fatorNR1: string | null
  risco: RiscoInfo
}

interface Questionario {
  id: string
  titulo: string
  status: string
  _count: { perguntas: number; respostas: number }
}

interface Relatorio {
  totalRespostas: number
  mediaGeral: number
  riscoGeral: RiscoInfo
  distribuicaoGeral: Distribuicao
  totalItensAvaliados: number
  mediaPorCategoria: CategoriaItem[]
  mediaPorSetor: SetorItem[]
  mediaPorTurno: TurnoItem[]
  mediaPorFatorNR1: FatorNR1Item[]
  topPiores: PerguntaItem[]
  topMelhores: PerguntaItem[]
}

export default function ResultadosPage() {
  const [questionarios, setQuestionarios] = useState<Questionario[]>([])
  const [selecionado, setSelecionado] = useState<string>('')
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingRel, setLoadingRel] = useState(false)

  const carregar = useCallback(async () => {
    try {
      const res = await fetch('/api/questionarios')
      const data = await res.json()
      const lista = Array.isArray(data) ? data : []
      setQuestionarios(lista)
      const comRespostas = lista.find((q: Questionario) => q._count.respostas > 0)
      if (comRespostas) setSelecionado(comRespostas.id)
    } catch {
      console.error('Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  useEffect(() => {
    if (!selecionado) return
    setLoadingRel(true)
    fetch('/api/relatorios?questionarioId=' + selecionado)
      .then(res => res.json())
      .then(data => setRelatorio(data))
      .catch(() => setRelatorio(null))
      .finally(() => setLoadingRel(false))
  }, [selecionado])

  const barraPct = (media: number): number => Math.round((media / 5) * 100)

  const faixaPct = (valor: number, total: number): number => total > 0 ? Math.round((valor / total) * 100) : 0

  // ===== STYLES =====
  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 12, padding: 24,
    border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
  }
  const section: React.CSSProperties = {
    background: '#fff', borderRadius: 12, padding: 28,
    border: '1px solid #e2e8f0', marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
  }
  const sectionTitle: React.CSSProperties = {
    fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 20px',
    display: 'flex', alignItems: 'center', gap: 8
  }
  const thS: React.CSSProperties = {
    padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
    color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px'
  }
  const tdS: React.CSSProperties = { padding: '12px 16px', fontSize: 14, color: '#1e293b' }
  const badge = (cor: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: cor + '15', color: cor, whiteSpace: 'nowrap'
  })
  const faixaLabel: React.CSSProperties = { fontSize: 11, color: '#94a3b8', minWidth: 14, textAlign: 'right' }
  const faixaBarBg: React.CSSProperties = { flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', margin: '0 8px' }

  const faixaCores: Record<string, string> = {
    faixa1: '#dc2626', faixa2: '#f97316', faixa3: '#f59e0b', faixa4: '#84cc16', faixa5: '#16a34a'
  }

  const renderDistribuicao = (dist: Distribuicao, total: number) => {
    const faixas = [
      { key: 'faixa1', label: '1', valor: dist.faixa1 },
      { key: 'faixa2', label: '2', valor: dist.faixa2 },
      { key: 'faixa3', label: '3', valor: dist.faixa3 },
      { key: 'faixa4', label: '4', valor: dist.faixa4 },
      { key: 'faixa5', label: '5', valor: dist.faixa5 },
    ]
    return (
      <div>
        {faixas.map(f => (
          <div key={f.key} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <span style={faixaLabel}>{f.label}</span>
            <div style={faixaBarBg}>
              <div style={{
                height: '100%', borderRadius: 4,
                width: faixaPct(f.valor, total) + '%',
                background: faixaCores[f.key],
                transition: 'width 0.4s ease'
              }} />
            </div>
            <span style={{ fontSize: 11, color: '#64748b', minWidth: 36 }}>
              {faixaPct(f.valor, total)}%
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* HEADER */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
          }}>📈</div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Resultados da Avaliação
            </h1>
            <p style={{ color: '#64748b', marginTop: 2, fontSize: 14 }}>
              Dashboard executivo — Análise de riscos psicossociais
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{
          padding: 64, textAlign: 'center', background: '#fff',
          borderRadius: 12, border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p style={{ color: '#94a3b8', fontSize: 15 }}>Carregando questionários...</p>
        </div>
      ) : questionarios.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 12, padding: 64,
          textAlign: 'center', border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <p style={{ color: '#374151', fontWeight: 600, fontSize: 16 }}>Nenhum questionário encontrado</p>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
            Crie um questionário e colete respostas para ver os resultados aqui.
          </p>
        </div>
      ) : (
        <>
          {/* SELETOR DE QUESTIONARIO */}
          <div style={{
            ...section, marginBottom: 28, display: 'flex',
            alignItems: 'center', gap: 16, flexWrap: 'wrap', padding: '16px 24px'
          }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
              Questionário:
            </label>
            <select
              value={selecionado}
              onChange={(e) => setSelecionado(e.target.value)}
              style={{
                padding: '10px 16px', borderRadius: 8, border: '1px solid #d1d5db',
                fontSize: 14, outline: 'none', minWidth: 340, background: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="">Selecione...</option>
              {questionarios.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.titulo} ({q._count.respostas} respostas) — {q.status}
                </option>
              ))}
            </select>
          </div>

          {loadingRel && (
            <div style={{
              padding: 64, textAlign: 'center', background: '#fff',
              borderRadius: 12, border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
              <p style={{ color: '#94a3b8', fontSize: 15 }}>Processando dados...</p>
            </div>
          )}

          {relatorio && !loadingRel && relatorio.totalRespostas > 0 && (
            <div>
              {/* ===== KPI CARDS ===== */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16, marginBottom: 28
              }}>
                {/* Risco Geral */}
                <div style={{
                  ...card, borderLeft: `4px solid ${relatorio.riscoGeral.cor}`,
                  position: 'relative', overflow: 'hidden'
                }}>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, fontWeight: 500 }}>
                    Nível de Risco Geral
                  </p>
                  <p style={{
                    fontSize: 28, fontWeight: 800, margin: '6px 0 2px',
                    color: relatorio.riscoGeral.cor
                  }}>
                    {relatorio.riscoGeral.emoji} {relatorio.riscoGeral.nivel}
                  </p>
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                    Média {relatorio.mediaGeral.toFixed(2)} / 5.00
                  </p>
                </div>

                {/* Total Respostas */}
                <div style={{ ...card, borderLeft: '4px solid #3b82f6' }}>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, fontWeight: 500 }}>
                    Respostas Completas
                  </p>
                  <p style={{
                    fontSize: 34, fontWeight: 800, margin: '6px 0 2px', color: '#3b82f6'
                  }}>
                    {relatorio.totalRespostas}
                  </p>
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                    {relatorio.totalItensAvaliados} itens avaliados
                  </p>
                </div>

                {/* Media Geral */}
                <div style={{ ...card, borderLeft: `4px solid ${relatorio.riscoGeral.cor}` }}>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, fontWeight: 500 }}>
                    Média Geral
                  </p>
                  <p style={{
                    fontSize: 34, fontWeight: 800, margin: '6px 0 2px',
                    color: relatorio.riscoGeral.cor
                  }}>
                    {relatorio.mediaGeral.toFixed(2)}
                  </p>
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                    Escala de 1 a 5
                  </p>
                </div>

                {/* Fatores NR-1 */}
                <div style={{ ...card, borderLeft: '4px solid #8b5cf6' }}>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, fontWeight: 500 }}>
                    Fatores NR-1 Avaliados
                  </p>
                  <p style={{
                    fontSize: 34, fontWeight: 800, margin: '6px 0 2px', color: '#8b5cf6'
                  }}>
                    {relatorio.mediaPorFatorNR1.length}
                  </p>
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                    {relatorio.mediaPorCategoria.length} categorias
                  </p>
                </div>
              </div>

              {/* ===== DISTRIBUICAO GERAL ===== */}
              <div style={section}>
                <h3 style={sectionTitle}>
                  <span>📊</span> Distribuição Geral das Respostas
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    {renderDistribuicao(relatorio.distribuicaoGeral, relatorio.totalItensAvaliados)}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start' }}>
                    {[
                      { label: 'Crítico (1)', cor: '#dc2626', val: relatorio.distribuicaoGeral.faixa1 },
                      { label: 'Ruim (2)', cor: '#f97316', val: relatorio.distribuicaoGeral.faixa2 },
                      { label: 'Regular (3)', cor: '#f59e0b', val: relatorio.distribuicaoGeral.faixa3 },
                      { label: 'Bom (4)', cor: '#84cc16', val: relatorio.distribuicaoGeral.faixa4 },
                      { label: 'Ótimo (5)', cor: '#16a34a', val: relatorio.distribuicaoGeral.faixa5 },
                    ].map(item => (
                      <div key={item.label} style={{
                        padding: '6px 12px', borderRadius: 8, background: item.cor + '10',
                        border: `1px solid ${item.cor}25`, fontSize: 12, color: item.cor
                      }}>
                        <strong>{item.val}</strong> {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ===== FATORES NR-1 ===== */}
              {relatorio.mediaPorFatorNR1.length > 0 && (
                <div style={section}>
                  <h3 style={sectionTitle}>
                    <span>🛡️</span> Fatores de Risco Psicossocial — NR-1
                  </h3>
                  <div style={{ display: 'grid', gap: 16 }}>
                    {relatorio.mediaPorFatorNR1.map((f) => (
                      <div key={f.fator} style={{
                        padding: 16, borderRadius: 10,
                        border: `1px solid ${f.risco.cor}20`,
                        background: f.risco.cor + '05'
                      }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8
                        }}>
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                              {f.fator}
                            </span>
                            <span style={{ ...badge(f.risco.cor), marginLeft: 10 }}>
                              {f.risco.emoji} {f.risco.nivel}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{
                              fontSize: 20, fontWeight: 800, color: f.risco.cor
                            }}>
                              {f.media.toFixed(2)}
                            </span>
                            <span style={{ fontSize: 12, color: '#94a3b8' }}> / 5</span>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>
                              {f.totalRespostas} respostas
                            </div>
                          </div>
                        </div>
                        <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                          <div style={{
                            height: '100%', borderRadius: 4,
                            width: barraPct(f.media) + '%',
                            background: `linear-gradient(90deg, ${f.risco.cor}, ${f.risco.cor}cc)`,
                            transition: 'width 0.4s ease'
                          }} />
                        </div>
                        {renderDistribuicao(f.distribuicao, f.totalRespostas)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== TOP PONTOS CRITICOS ===== */}
              {relatorio.topPiores.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                  <div style={section}>
                    <h3 style={sectionTitle}>
                      <span>🔴</span> Top 5 Pontos Críticos
                    </h3>
                    {relatorio.topPiores.map((p, i) => (
                      <div key={p.id} style={{
                        padding: '12px 14px', borderRadius: 8, marginBottom: 8,
                        background: i === 0 ? '#fef2f2' : '#fafafa',
                        border: i === 0 ? '1px solid #fecaca' : '1px solid #f1f5f9'
                      }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'flex-start', gap: 12
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>
                              #{i + 1} • {p.categoria}{p.fatorNR1 ? ` • ${p.fatorNR1}` : ''}
                            </div>
                            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>
                              {p.texto}
                            </div>
                          </div>
                          <span style={{
                            ...badge(p.risco.cor), flexShrink: 0
                          }}>
                            {p.media.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={section}>
                    <h3 style={sectionTitle}>
                      <span>🟢</span> Top 5 Pontos Fortes
                    </h3>
                    {relatorio.topMelhores.map((p, i) => (
                      <div key={p.id} style={{
                        padding: '12px 14px', borderRadius: 8, marginBottom: 8,
                        background: i === 0 ? '#f0fdf4' : '#fafafa',
                        border: i === 0 ? '1px solid #bbf7d0' : '1px solid #f1f5f9'
                      }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'flex-start', gap: 12
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>
                              #{i + 1} • {p.categoria}{p.fatorNR1 ? ` • ${p.fatorNR1}` : ''}
                            </div>
                            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>
                              {p.texto}
                            </div>
                          </div>
                          <span style={{
                            ...badge(p.risco.cor), flexShrink: 0
                          }}>
                            {p.media.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== CATEGORIAS ===== */}
              {relatorio.mediaPorCategoria.length > 0 && (
                <div style={section}>
                  <h3 style={sectionTitle}>
                    <span>📂</span> Média por Categoria
                  </h3>
                  {relatorio.mediaPorCategoria.map((c) => (
                    <div key={c.categoria} style={{ marginBottom: 16 }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: 6
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
                            {c.categoria}
                          </span>
                          <span style={badge(c.risco.cor)}>
                            {c.risco.emoji} {c.risco.nivel}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>
                            {c.totalRespostas} resp.
                          </span>
                          <span style={{
                            fontSize: 16, fontWeight: 700, color: c.risco.cor
                          }}>
                            {c.media.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%', borderRadius: 5,
                          width: barraPct(c.media) + '%',
                          background: `linear-gradient(90deg, ${c.risco.cor}, ${c.risco.cor}cc)`,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ===== SETOR ===== */}
              {relatorio.mediaPorSetor.length > 0 && (
                <div style={section}>
                  <h3 style={sectionTitle}>
                    <span>🏢</span> Análise por Setor
                  </h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                        <th style={thS}>Setor</th>
                        <th style={{ ...thS, textAlign: 'center' }}>Média</th>
                        <th style={{ ...thS, textAlign: 'center' }}>Risco</th>
                        <th style={{ ...thS, textAlign: 'center' }}>Respostas</th>
                        <th style={{ ...thS, width: '30%' }}>Distribuição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatorio.mediaPorSetor.map((s) => (
                        <tr key={s.setor} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ ...tdS, fontWeight: 600 }}>{s.setor}</td>
                          <td style={{
                            ...tdS, textAlign: 'center',
                            fontWeight: 700, color: s.risco.cor
                          }}>
                            {s.media.toFixed(2)}
                          </td>
                          <td style={{ ...tdS, textAlign: 'center' }}>
                            <span style={badge(s.risco.cor)}>
                              {s.risco.emoji} {s.risco.nivel}
                            </span>
                          </td>
                          <td style={{ ...tdS, textAlign: 'center', color: '#94a3b8' }}>
                            {s.totalRespostas}
                          </td>
                          <td style={tdS}>
                            <div style={{
                              height: 8, background: '#f1f5f9',
                              borderRadius: 4, overflow: 'hidden'
                            }}>
                              <div style={{
                                height: '100%', borderRadius: 4,
                                width: barraPct(s.media) + '%',
                                background: s.risco.cor,
                                transition: 'width 0.3s ease'
                              }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ===== TURNO ===== */}
              {relatorio.mediaPorTurno.length > 0 && (
                <div style={section}>
                  <h3 style={sectionTitle}>
                    <span>🕐</span> Análise por Turno
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 16
                  }}>
                    {relatorio.mediaPorTurno.map((t) => (
                      <div key={t.turno} style={{
                        padding: 20, borderRadius: 10,
                        background: t.risco.cor + '08',
                        border: `1px solid ${t.risco.cor}20`,
                        textAlign: 'center'
                      }}>
                        <p style={{
                          fontSize: 13, fontWeight: 600, color: '#374151',
                          margin: '0 0 8px'
                        }}>
                          {t.turno}
                        </p>
                        <p style={{
                          fontSize: 28, fontWeight: 800, color: t.risco.cor,
                          margin: '0 0 4px'
                        }}>
                          {t.media.toFixed(2)}
                        </p>
                        <span style={badge(t.risco.cor)}>
                          {t.risco.emoji} {t.risco.nivel}
                        </span>
                        <p style={{
                          fontSize: 11, color: '#94a3b8', margin: '8px 0 0'
                        }}>
                          {t.totalRespostas} respostas
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== LEGENDA ===== */}
              <div style={{
                ...section, background: '#f8fafc',
                display: 'flex', gap: 24, flexWrap: 'wrap',
                alignItems: 'center', padding: '16px 24px'
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
                  Escala de Risco:
                </span>
                {[
                  { emoji: '🟢', label: 'Baixo (3.76–5.00)', cor: '#16a34a' },
                  { emoji: '🟡', label: 'Moderado (3.01–3.75)', cor: '#f59e0b' },
                  { emoji: '🟠', label: 'Alto (2.01–3.00)', cor: '#f97316' },
                  { emoji: '🔴', label: 'Crítico (1.00–2.00)', cor: '#dc2626' },
                ].map(item => (
                  <span key={item.label} style={{ fontSize: 12, color: item.cor, fontWeight: 500 }}>
                    {item.emoji} {item.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ===== SEM RESPOSTAS ===== */}
          {relatorio && !loadingRel && relatorio.totalRespostas === 0 && (
            <div style={{
              background: '#fffbeb', padding: 48, borderRadius: 12,
              textAlign: 'center', border: '1px solid #fde68a'
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
              <p style={{ color: '#92400e', fontWeight: 700, fontSize: 16, margin: '0 0 6px' }}>
                Nenhuma resposta coletada ainda
              </p>
              <p style={{ color: '#b45309', fontSize: 13, margin: 0 }}>
                Ative o questionário e distribua os links anônimos para iniciar a coleta de dados.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
