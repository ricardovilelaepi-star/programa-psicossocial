'use client'

import { useState, useEffect, use } from 'react'

interface Pergunta {
  id: string
  texto: string
  categoria: string
  subcategoria: string | null
  tipoResposta: string
  escalaMin: number
  escalaMax: number
  escalaMinLabel: string | null
  escalaMaxLabel: string | null
  obrigatoria: boolean
  ordem: number
}

interface DadosQuestionario {
  questionarioId: string
  titulo: string
  descricao: string | null
  setorNome: string
  perguntas: Pergunta[]
}

export default function ResponderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)

  const [dados, setDados] = useState<DadosQuestionario | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [respostas, setRespostas] = useState<Record<string, number | string>>({})
  const [etapaAtual, setEtapaAtual] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const [concluido, setConcluido] = useState(false)
  const [demografico, setDemografico] = useState({
    turno: '',
    faixaEtaria: '',
    tempoEmpresa: ''
  })

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch('/api/responder/' + token)
        if (!res.ok) {
          const data = await res.json()
          setErro(data.error || 'Link invalido ou questionario encerrado')
          return
        }
        const data = await res.json()
        setDados(data)
      } catch {
        setErro('Erro ao carregar questionario')
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [token])

  const perguntasPorPagina = 5
  const totalPaginas = dados
    ? Math.ceil(dados.perguntas.length / perguntasPorPagina) + 1
    : 1

  const perguntasDaPagina = dados
    ? dados.perguntas.slice(
        (etapaAtual - 1) * perguntasPorPagina,
        etapaAtual * perguntasPorPagina
      )
    : []

  const podeProsseguir = () => {
    if (etapaAtual === 0) return true
    return perguntasDaPagina.every(
      (p) => !p.obrigatoria || respostas[p.id] !== undefined
    )
  }

  const enviar = async () => {
    if (!dados) return
    setEnviando(true)

    try {
      const itens = dados.perguntas.map((p) => ({
        perguntaId: p.id,
        valorNumerico:
          p.tipoResposta === 'ESCALA' ? Number(respostas[p.id]) || null : null,
        valorTexto:
          p.tipoResposta === 'TEXTO' ? String(respostas[p.id] || '') : null
      }))

      const res = await fetch('/api/respostas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionarioId: dados.questionarioId,
          linkAnonimo: token,
          setor: dados.setorNome,
          turno: demografico.turno || null,
          faixaEtaria: demografico.faixaEtaria || null,
          tempoEmpresa: demografico.tempoEmpresa || null,
          itens
        })
      })

      if (!res.ok) {
        const data = await res.json()
        setErro(data.error || 'Erro ao enviar respostas')
        return
      }

      setConcluido(true)
    } catch {
      setErro('Erro de conexao')
    } finally {
      setEnviando(false)
    }
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: 16 }}>
            Carregando questionario...
          </p>
        </div>
      </div>
    )
  }

  if (erro) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#9888;</div>
            <h2 style={{ color: '#dc2626', marginBottom: 8 }}>Ops!</h2>
            <p style={{ color: '#64748b' }}>{erro}</p>
          </div>
        </div>
      </div>
    )
  }

  if (concluido) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>&#10004;</div>
            <h2 style={{ color: '#16a34a', marginBottom: 8, fontSize: 24 }}>
              Obrigado pela sua participacao!
            </h2>
            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.6 }}>
              Suas respostas foram registradas com sucesso de forma anonima.
              Elas contribuirao para a melhoria do ambiente de trabalho.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!dados) return null

  const progresso = etapaAtual === 0
    ? 0
    : Math.round((etapaAtual / (totalPaginas - 1)) * 100)

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            {dados.titulo}
          </h1>
          {dados.descricao && (
            <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>
              {dados.descricao}
            </p>
          )}
          <div style={{
            display: 'inline-block', marginTop: 8, background: '#eff6ff',
            color: '#2563eb', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600
          }}>
            {dados.setorNome}
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {etapaAtual === 0 ? 'Dados iniciais' : 'Pagina ' + etapaAtual + ' de ' + (totalPaginas - 1)}
            </span>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{progresso}%</span>
          </div>
          <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: progresso + '%', borderRadius: 4,
              background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {etapaAtual === 0 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 16 }}>
              Informacoes gerais (opcional)
            </h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>
              Estas informacoes sao opcionais e servem apenas para analise estatistica.
              Sua identidade permanece anonima.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Turno de trabalho</label>
              <select value={demografico.turno} onChange={(e) => setDemografico({ ...demografico, turno: e.target.value })} style={selectStyle}>
                <option value="">Prefiro nao informar</option>
                <option value="Manha">Manha</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
                <option value="Integral">Integral</option>
                <option value="Revezamento">Revezamento</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Faixa etaria</label>
              <select value={demografico.faixaEtaria} onChange={(e) => setDemografico({ ...demografico, faixaEtaria: e.target.value })} style={selectStyle}>
                <option value="">Prefiro nao informar</option>
                <option value="18-25">18 a 25 anos</option>
                <option value="26-35">26 a 35 anos</option>
                <option value="36-45">36 a 45 anos</option>
                <option value="46-55">46 a 55 anos</option>
                <option value="56+">56 anos ou mais</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Tempo na empresa</label>
              <select value={demografico.tempoEmpresa} onChange={(e) => setDemografico({ ...demografico, tempoEmpresa: e.target.value })} style={selectStyle}>
                <option value="">Prefiro nao informar</option>
                <option value="Menos de 1 ano">Menos de 1 ano</option>
                <option value="1-3 anos">1 a 3 anos</option>
                <option value="3-5 anos">3 a 5 anos</option>
                <option value="5-10 anos">5 a 10 anos</option>
                <option value="Mais de 10 anos">Mais de 10 anos</option>
              </select>
            </div>
          </div>
        )}

        {etapaAtual > 0 && (
          <div>
            {perguntasDaPagina.map((p, idx) => {
              const globalIdx = (etapaAtual - 1) * perguntasPorPagina + idx + 1
              return (
                <div key={p.id} style={{
                  marginBottom: 24, padding: 20, background: '#f8fafc',
                  borderRadius: 10, border: '1px solid #e2e8f0'
                }}>
                  <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: 4, fontSize: 15 }}>
                    <span style={{ color: '#3b82f6' }}>{globalIdx}.</span> {p.texto}
                    {p.obrigatoria && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
                  </p>
                  {p.categoria && (
                    <span style={{
                      fontSize: 11, color: '#94a3b8', background: '#f1f5f9',
                      padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginBottom: 12
                    }}>
                      {p.categoria}{p.subcategoria ? ' > ' + p.subcategoria : ''}
                    </span>
                  )}

                  {p.tipoResposta === 'ESCALA' && (
                    <div>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: 12, color: '#94a3b8', marginBottom: 8
                      }}>
                        <span>{p.escalaMinLabel || p.escalaMin}</span>
                        <span>{p.escalaMaxLabel || p.escalaMax}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        {Array.from(
                          { length: p.escalaMax - p.escalaMin + 1 },
                          (_, i) => p.escalaMin + i
                        ).map((val) => (
                          <button
                            key={val}
                            onClick={() => setRespostas({ ...respostas, [p.id]: val })}
                            style={{
                              width: 44, height: 44, borderRadius: 10,
                              border: respostas[p.id] === val
                                ? '2px solid #3b82f6'
                                : '1px solid #d1d5db',
                              background: respostas[p.id] === val ? '#3b82f6' : '#fff',
                              color: respostas[p.id] === val ? '#fff' : '#374151',
                              fontSize: 16, fontWeight: 600, cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {p.tipoResposta === 'TEXTO' && (
                    <textarea
                      value={String(respostas[p.id] || '')}
                      onChange={(e) => setRespostas({ ...respostas, [p.id]: e.target.value })}
                      placeholder="Digite sua resposta..."
                      rows={3}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: 8,
                        border: '1px solid #d1d5db', fontSize: 14, resize: 'vertical',
                        outline: 'none', boxSizing: 'border-box' as const
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button
            onClick={() => setEtapaAtual(Math.max(0, etapaAtual - 1))}
            disabled={etapaAtual === 0}
            style={{
              padding: '10px 24px', borderRadius: 8,
              border: '1px solid #d1d5db', background: '#fff',
              color: etapaAtual === 0 ? '#d1d5db' : '#374151',
              cursor: etapaAtual === 0 ? 'default' : 'pointer',
              fontSize: 14, fontWeight: 500
            }}
          >
            Voltar
          </button>

          {etapaAtual < totalPaginas - 1 ? (
            <button
              onClick={() => { if (podeProsseguir()) setEtapaAtual(etapaAtual + 1) }}
              disabled={!podeProsseguir()}
              style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                background: podeProsseguir()
                  ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                  : '#e2e8f0',
                color: podeProsseguir() ? '#fff' : '#94a3b8',
                cursor: podeProsseguir() ? 'pointer' : 'default',
                fontSize: 14, fontWeight: 600
              }}
            >
              Proximo
            </button>
          ) : (
            <button
              onClick={() => { if (podeProsseguir()) enviar() }}
              disabled={!podeProsseguir() || enviando}
              style={{
                padding: '10px 28px', borderRadius: 8, border: 'none',
                background: podeProsseguir() && !enviando
                  ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                  : '#e2e8f0',
                color: podeProsseguir() && !enviando ? '#fff' : '#94a3b8',
                cursor: podeProsseguir() && !enviando ? 'pointer' : 'default',
                fontSize: 14, fontWeight: 600
              }}
            >
              {enviando ? 'Enviando...' : 'Enviar Respostas'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '40px 16px'
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  padding: 32,
  width: '100%',
  maxWidth: 640,
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box' as const,
  background: '#fff'
}
