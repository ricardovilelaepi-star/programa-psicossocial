'use client'

import { useState, useEffect, useCallback } from 'react'
import { useEmpresa } from '@/contexts/EmpresaContext'

interface SetorVinculado {
  id: string
  linkAnonimo: string
  totalEsperado: number
  setor: { id: string; nome: string }
}

interface Questionario {
  id: string
  titulo: string
  descricao: string | null
  tipo: string
  status: string
  dataInicio: string | null
  dataFim: string | null
  _count: { perguntas: number; respostas: number }
  setores: SetorVinculado[]
}

interface Setor {
  id: string
  nome: string
  totalColaboradores: number
}

export default function QuestionariosPage() {
  const { empresaAtiva } = useEmpresa()
  const [questionarios, setQuestionarios] = useState<Questionario[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [loading, setLoading] = useState(true)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [showVincular, setShowVincular] = useState<string | null>(null)
  const [setoresSelecionados, setSetoresSelecionados] = useState<string[]>([])
  const [salvando, setSalvando] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    if (!empresaAtiva) return
    try {
      const [qRes, sRes] = await Promise.all([
        fetch('/api/questionarios'),
        fetch(`/api/setores?empresaId=${empresaAtiva.id}`),
      ])
      const qData = await qRes.json()
      const sData = await sRes.json()
      setQuestionarios(Array.isArray(qData) ? qData : [])
      setSetores(Array.isArray(sData) ? sData : [])
    } catch {
      console.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [empresaAtiva])

  useEffect(() => {
    carregar()
  }, [carregar])

  const mudarStatus = async (id: string, novoStatus: string) => {
    const q = questionarios.find(q => q.id === id)

    if (novoStatus === 'ATIVO' && q && q.setores.length === 0) {
      alert('Vincule pelo menos um setor antes de ativar o questionario.')
      return
    }

    const confirmMsg = novoStatus === 'ATIVO'
      ? 'Ativar este questionario? Os links anonimos ficarao disponiveis para coleta.'
      : novoStatus === 'ENCERRADO'
        ? 'Encerrar a coleta? Nao sera mais possivel receber novas respostas.'
        : null

    if (confirmMsg && !confirm(confirmMsg)) return

    try {
      await fetch(`/api/questionarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      })
      carregar()
    } catch {
      alert('Erro ao atualizar status')
    }
  }

  const abrirVincular = (q: Questionario) => {
    setShowVincular(q.id)
    setSetoresSelecionados(q.setores.map(s => s.setor.id))
  }

  const salvarVinculos = async () => {
    if (!showVincular) return
    setSalvando(true)

    try {
      await fetch(`/api/questionarios/${showVincular}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setorIds: setoresSelecionados }),
      })
      setShowVincular(null)
      carregar()
    } catch {
      alert('Erro ao vincular setores')
    } finally {
      setSalvando(false)
    }
  }

  const copiarLink = (token: string) => {
    const url = `${window.location.origin}/responder/${token}`
    navigator.clipboard.writeText(url)
    setCopiado(token)
    setTimeout(() => setCopiado(null), 2000)
  }

  const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
    RASCUNHO: { label: 'Rascunho', bg: '#f1f5f9', color: '#64748b' },
    ATIVO: { label: 'Ativo', bg: '#dcfce7', color: '#16a34a' },
    ENCERRADO: { label: 'Encerrado', bg: '#fef3c7', color: '#d97706' },
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Questionarios
        </h1>
        <p style={{ color: '#64748b', marginTop: 4, fontSize: 15 }}>
          Gerencie os questionarios, vincule setores e gere links anonimos para coleta
        </p>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Carregando...</div>
      ) : questionarios.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 12, padding: 48, textAlign: 'center',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p style={{ color: '#64748b', fontSize: 16 }}>Nenhum questionario encontrado</p>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Execute o seed para criar o questionario padrao ISO 45003</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {questionarios.map((q) => {
            const sc = statusConfig[q.status] || statusConfig.RASCUNHO
            const isExpanded = expandido === q.id

            return (
              <div key={q.id} style={{
                background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
              }}>
                {/* Cabecalho do card */}
                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>{q.titulo}</h3>
                      <span style={{
                        background: sc.bg, color: sc.color, padding: '3px 12px',
                        borderRadius: 20, fontSize: 12, fontWeight: 600,
                      }}>
                        {sc.label}
                      </span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>{q.descricao}</p>
                    <div style={{ display: 'flex', gap: 24, marginTop: 10 }}>
                      <span style={{ fontSize: 13, color: '#94a3b8' }}>
                        {q._count.perguntas} perguntas
                      </span>
                      <span style={{ fontSize: 13, color: '#94a3b8' }}>
                        {q._count.respostas} respostas
                      </span>
                      <span style={{ fontSize: 13, color: '#94a3b8' }}>
                        {q.setores.length} setor(es)
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {q.status === 'RASCUNHO' && (
                      <>
                        <button
                          onClick={() => abrirVincular(q)}
                          style={{
                            padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
                            background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                            color: '#3b82f6',
                          }}
                        >
                          Vincular Setores
                        </button>
                        <button
                          onClick={() => mudarStatus(q.id, 'ATIVO')}
                          style={{
                            padding: '8px 16px', borderRadius: 8, border: 'none',
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                            boxShadow: '0 2px 8px rgba(22,163,106,0.3)',
                          }}
                        >
                          Ativar Coleta
                        </button>
                      </>
                    )}
                    {q.status === 'ATIVO' && (
                      <button
                        onClick={() => mudarStatus(q.id, 'ENCERRADO')}
                        style={{
                          padding: '8px 16px', borderRadius: 8, border: 'none',
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        }}
                      >
                        Encerrar Coleta
                      </button>
                    )}
                    <button
                      onClick={() => setExpandido(isExpanded ? null : q.id)}
                      style={{
                        padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
                        background: '#fff', cursor: 'pointer', fontSize: 16, color: '#64748b',
                      }}
                    >
                      {isExpanded ? '\u25B2' : '\u25BC'}
                    </button>
                  </div>
                </div>

                {/* Links anonimos expandidos */}
                {isExpanded && q.setores.length > 0 && (
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 24px', background: '#f8fafc' }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                      Links Anonimos por Setor
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {q.setores.map((sv) => (
                        <div key={sv.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: '#fff', padding: '10px 16px', borderRadius: 8,
                          border: '1px solid #e2e8f0',
                        }}>
                          <div>
                            <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>
                              {sv.setor.nome}
                            </span>
                            <span style={{ color: '#94a3b8', fontSize: 13, marginLeft: 12 }}>
                              ({sv.totalEsperado} colaboradores esperados)
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <code style={{
                              fontSize: 12, color: '#64748b', background: '#f1f5f9',
                              padding: '4px 10px', borderRadius: 6, maxWidth: 300,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              /responder/{sv.linkAnonimo}
                            </code>
                            <button
                              onClick={() => copiarLink(sv.linkAnonimo)}
                              style={{
                                padding: '6px 14px', borderRadius: 6, border: '1px solid #e2e8f0',
                                background: copiado === sv.linkAnonimo ? '#dcfce7' : '#fff',
                                color: copiado === sv.linkAnonimo ? '#16a34a' : '#3b82f6',
                                cursor: 'pointer', fontSize: 12, fontWeight: 600,
                              }}
                            >
                              {copiado === sv.linkAnonimo ? 'Copiado!' : 'Copiar'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isExpanded && q.setores.length === 0 && (
                  <div style={{
                    borderTop: '1px solid #f1f5f9', padding: '20px 24px',
                    background: '#fffbeb', textAlign: 'center',
                  }}>
                    <p style={{ color: '#92400e', fontSize: 14, margin: 0 }}>
                      Nenhum setor vinculado. Vincule setores para gerar os links de coleta.
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Vincular Setores */}
      {showVincular && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 480,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
              Vincular Setores
            </h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
              Selecione os setores que participarao da coleta. Um link anonimo sera gerado para cada.
            </p>

            {setores.length === 0 ? (
              <div style={{
                background: '#fffbeb', padding: 20, borderRadius: 8,
                color: '#92400e', fontSize: 14, textAlign: 'center', marginBottom: 24,
              }}>
                Nenhum setor cadastrado. Cadastre setores primeiro.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, maxHeight: 300, overflowY: 'auto' }}>
                {setores.map((s) => (
                  <label key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${setoresSelecionados.includes(s.id) ? '#3b82f6' : '#e2e8f0'}`,
                    background: setoresSelecionados.includes(s.id) ? '#eff6ff' : '#fff',
                  }}>
                    <input
                      type="checkbox"
                      checked={setoresSelecionados.includes(s.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSetoresSelecionados([...setoresSelecionados, s.id])
                        } else {
                          setSetoresSelecionados(setoresSelecionados.filter(id => id !== s.id))
                        }
                      }}
                      style={{ width: 18, height: 18 }}
                    />
                    <div>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{s.nome}</span>
                      <span style={{ color: '#94a3b8', fontSize: 13, marginLeft: 8 }}>
                        ({s.totalColaboradores} colaboradores)
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowVincular(null)}
                style={{
                  padding: '10px 24px', borderRadius: 8, border: '1px solid #d1d5db',
                  background: '#fff', cursor: 'pointer', fontSize: 14, color: '#64748b',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={salvarVinculos}
                disabled={salvando}
                style={{
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                }}
              >
                {salvando ? 'Salvando...' : 'Salvar Vinculos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}