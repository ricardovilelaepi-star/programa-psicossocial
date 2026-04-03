'use client'

import { useState, useEffect } from 'react'

interface Stats {
  totalSetores: number
  totalRespostas: number
  questionariosAtivos: number
  avaliacoesPendentes: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => {
        setStats({ totalSetores: 0, totalRespostas: 0, questionariosAtivos: 0, avaliacoesPendentes: 0 })
        setLoading(false)
      })
  }, [])

  const cards = [
    { title: 'Setores', value: stats?.totalSetores ?? 0, desc: 'Setores cadastrados', color: '#3b82f6' },
    { title: 'Respostas', value: stats?.totalRespostas ?? 0, desc: 'Respostas coletadas', color: '#10b981' },
    { title: 'Quest. Ativos', value: stats?.questionariosAtivos ?? 0, desc: 'Coletas em andamento', color: '#f59e0b' },
    { title: 'Pendentes', value: stats?.avaliacoesPendentes ?? 0, desc: 'Riscos a tratar', color: '#ef4444' },
  ]

  const steps = [
    { n: 1, title: 'Cadastrar Setores', desc: 'Cadastre os setores da empresa e o número de colaboradores.' },
    { n: 2, title: 'Vincular ao Questionário', desc: 'Associe os setores ao questionário ISO 45003 para gerar links.' },
    { n: 3, title: 'Ativar Coleta', desc: 'Ative o questionário e distribua os links anônimos.' },
    { n: 4, title: 'Coletar Respostas', desc: 'Acompanhe as respostas em tempo real.' },
    { n: 5, title: 'Gerar Relatório PGR', desc: 'Gere o relatório de riscos psicossociais.' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>Painel</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Visão geral do programa de gestão de riscos psicossociais</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        {cards.map((c, i) => (
          <div key={i} style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            opacity: loading ? 0.6 : 1,
            transition: 'opacity 0.3s',
          }}>
            <div>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>{c.title}</p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 4px 0', color: c.color }}>
                {loading ? '...' : c.value}
              </p>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{c.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Fluxo de Trabalho</h2>
        {steps.map((s) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', marginBottom: '12px', background: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e0e7ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>{s.n}</div>
            <div>
              <p style={{ fontWeight: '600', margin: 0 }}>{s.title}</p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
