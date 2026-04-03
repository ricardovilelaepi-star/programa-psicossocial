'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function formatCnpj(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 14)
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          senha,
          nomeEmpresa,
          cnpj: cnpj.replace(/\D/g, '')
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.error || 'Erro ao cadastrar')
        return
      }

      router.push('/dashboard')
    } catch {
      setErro('Erro de conexao')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600' as const,
    color: '#444',
    fontSize: '14px'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '100%', maxWidth: '440px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '8px', color: '#333', fontSize: '24px' }}>
          Programa Psicossocial
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666', fontSize: '14px' }}>
          Crie sua conta para acessar o sistema
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Nome completo</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Seu nome completo" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Senha</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} placeholder="Minimo 6 caracteres" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Nome da Empresa</label>
            <input type="text" value={nomeEmpresa} onChange={(e) => setNomeEmpresa(e.target.value)} required placeholder="Razao social ou nome fantasia" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>CNPJ</label>
            <input type="text" value={cnpj} onChange={(e) => setCnpj(formatCnpj(e.target.value))} required placeholder="00.000.000/0000-00" style={inputStyle} />
          </div>

          {erro && (
            <div style={{ background: '#fee', color: '#c00', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', textAlign: 'center' }}>
              {erro}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: loading ? '#999' : '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
          Ja tem conta? <Link href="/login" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>Fazer login</Link>
        </p>
      </div>
    </div>
  )
}
