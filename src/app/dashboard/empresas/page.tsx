'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Empresa {
  id: string
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  porte: string | null
  segmento: string | null
  cidade: string | null
  estado: string | null
  email: string | null
  telefone: string | null
  responsavelNome: string | null
  responsavelCargo: string | null
  responsavelRegistro: string | null
  createdAt: string
  _count: {
    setores: number
    questionarios: number
    usuarios: number
  }
}

const estados = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
]

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const router = useRouter()

  const emptyForm = {
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    porte: '',
    segmento: '',
    endereco: '',
    cidade: '',
    estado: '',
    telefone: '',
    email: '',
    responsavelNome: '',
    responsavelCargo: '',
    responsavelRegistro: '',
  }

  const [form, setForm] = useState(emptyForm)

  async function loadEmpresas() {
    try {
      const res = await fetch('/api/empresas')
      if (res.ok) {
        const data = await res.json()
        setEmpresas(data)
      }
    } catch (err) {
      console.error('Erro ao carregar empresas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadEmpresas() }, [])

  function formatCnpj(value: string) {
    const nums = value.replace(/\D/g, '').slice(0, 14)
    if (nums.length <= 2) return nums
    if (nums.length <= 5) return nums.slice(0,2) + '.' + nums.slice(2)
    if (nums.length <= 8) return nums.slice(0,2) + '.' + nums.slice(2,5) + '.' + nums.slice(5)
    if (nums.length <= 12) return nums.slice(0,2) + '.' + nums.slice(2,5) + '.' + nums.slice(5,8) + '/' + nums.slice(8)
    return nums.slice(0,2) + '.' + nums.slice(2,5) + '.' + nums.slice(5,8) + '/' + nums.slice(8,12) + '-' + nums.slice(12)
  }

  function formatPhone(value: string) {
    const nums = value.replace(/\D/g, '').slice(0, 11)
    if (nums.length <= 2) return '(' + nums
    if (nums.length <= 7) return '(' + nums.slice(0,2) + ') ' + nums.slice(2)
    if (nums.length <= 10) return '(' + nums.slice(0,2) + ') ' + nums.slice(2,6) + '-' + nums.slice(6)
    return '(' + nums.slice(0,2) + ') ' + nums.slice(2,7) + '-' + nums.slice(7)
  }

  function handleChange(field: string, value: string) {
    if (field === 'cnpj') value = formatCnpj(value)
    if (field === 'telefone') value = formatPhone(value)
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const url = editingId ? '/api/empresas/' + editingId : '/api/empresas'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setSuccess(editingId ? 'Empresa atualizada com sucesso!' : 'Empresa cadastrada com sucesso!')
        setForm(emptyForm)
        setShowForm(false)
        setEditingId(null)
        await loadEmpresas()
        router.refresh()
        setTimeout(() => setSuccess(''), 4000)
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao salvar empresa')
      }
    } catch (err) {
      setError('Erro de conexao com o servidor')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(emp: Empresa) {
    setForm({
      razaoSocial: emp.razaoSocial,
      nomeFantasia: emp.nomeFantasia,
      cnpj: formatCnpj(emp.cnpj),
      porte: emp.porte || '',
      segmento: emp.segmento || '',
      endereco: '',
      cidade: emp.cidade || '',
      estado: emp.estado || '',
      telefone: emp.telefone ? formatPhone(emp.telefone) : '',
      email: emp.email || '',
      responsavelNome: emp.responsavelNome || '',
      responsavelCargo: emp.responsavelCargo || '',
      responsavelRegistro: emp.responsavelRegistro || '',
    })
    setEditingId(emp.id)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch('/api/empresas/' + id, { method: 'DELETE' })
      if (res.ok) {
        setSuccess('Empresa removida com sucesso!')
        setDeleteConfirm(null)
        await loadEmpresas()
        router.refresh()
        setTimeout(() => setSuccess(''), 4000)
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao remover empresa')
      }
    } catch (err) {
      setError('Erro de conexao')
    }
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setError('')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s',
    background: '#fff',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 4,
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>Empresas</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Gerencie as empresas cadastradas no sistema</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); setError('') }}
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            + Nova Empresa
          </button>
        )}
      </div>

      {success && (
        <div style={{
          padding: '14px 20px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 10,
          color: '#166534',
          fontSize: 14,
          marginBottom: 20,
          fontWeight: 500,
        }}>
          ✅ {success}
        </div>
      )}

      {error && (
        <div style={{
          padding: '14px 20px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 10,
          color: '#991b1b',
          fontSize: 14,
          marginBottom: 20,
          fontWeight: 500,
        }}>
          ❌ {error}
        </div>
      )}

      {showForm && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          padding: 28,
          marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, margin: '0 0 20px' }}>
            {editingId ? '✏️ Editar Empresa' : '🏢 Nova Empresa'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Razão Social *</label>
                <input
                  style={inputStyle}
                  value={form.razaoSocial}
                  onChange={e => handleChange('razaoSocial', e.target.value)}
                  placeholder="Razão social completa"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Nome Fantasia *</label>
                <input
                  style={inputStyle}
                  value={form.nomeFantasia}
                  onChange={e => handleChange('nomeFantasia', e.target.value)}
                  placeholder="Nome fantasia"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>CNPJ *</label>
                <input
                  style={inputStyle}
                  value={form.cnpj}
                  onChange={e => handleChange('cnpj', e.target.value)}
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Porte</label>
                <select
                  style={inputStyle}
                  value={form.porte}
                  onChange={e => handleChange('porte', e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="MEI">MEI</option>
                  <option value="ME">ME - Microempresa</option>
                  <option value="EPP">EPP - Pequeno Porte</option>
                  <option value="MEDIO">Médio Porte</option>
                  <option value="GRANDE">Grande Porte</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Segmento</label>
                <input
                  style={inputStyle}
                  value={form.segmento}
                  onChange={e => handleChange('segmento', e.target.value)}
                  placeholder="Ex: Tecnologia, Saúde..."
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Endereço</label>
                <input
                  style={inputStyle}
                  value={form.endereco}
                  onChange={e => handleChange('endereco', e.target.value)}
                  placeholder="Rua, número, bairro"
                />
              </div>
              <div>
                <label style={labelStyle}>Cidade</label>
                <input
                  style={inputStyle}
                  value={form.cidade}
                  onChange={e => handleChange('cidade', e.target.value)}
                  placeholder="Cidade"
                />
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <select
                  style={inputStyle}
                  value={form.estado}
                  onChange={e => handleChange('estado', e.target.value)}
                >
                  <option value="">UF</option>
                  {estados.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Telefone</label>
                <input
                  style={inputStyle}
                  value={form.telefone}
                  onChange={e => handleChange('telefone', e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label style={labelStyle}>E-mail</label>
                <input
                  style={inputStyle}
                  type="email"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="contato@empresa.com"
                />
              </div>
            </div>

            <div style={{
              padding: '16px 0 0',
              borderTop: '1px solid #e5e7eb',
              marginTop: 8,
              marginBottom: 16,
            }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12, marginTop: 0 }}>
                Responsável pelo PGR
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Nome</label>
                  <input
                    style={inputStyle}
                    value={form.responsavelNome}
                    onChange={e => handleChange('responsavelNome', e.target.value)}
                    placeholder="Nome do responsável"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Cargo</label>
                  <input
                    style={inputStyle}
                    value={form.responsavelCargo}
                    onChange={e => handleChange('responsavelCargo', e.target.value)}
                    placeholder="Cargo / função"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Registro Profissional</label>
                  <input
                    style={inputStyle}
                    value={form.responsavelRegistro}
                    onChange={e => handleChange('responsavelRegistro', e.target.value)}
                    placeholder="CRP, CREA, CRM..."
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
              <button
                type="button"
                onClick={cancelForm}
                style={{
                  padding: '10px 24px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '10px 28px',
                  background: saving ? '#93c5fd' : '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Salvando...' : editingId ? 'Atualizar' : 'Cadastrar Empresa'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Carregando empresas...</div>
      ) : empresas.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 60,
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
        }}>
          <p style={{ fontSize: 48, margin: '0 0 16px' }}>🏢</p>
          <p style={{ fontSize: 18, fontWeight: 600, color: '#374151', margin: '0 0 8px' }}>
            Nenhuma empresa cadastrada
          </p>
          <p style={{ color: '#64748b', margin: '0 0 20px' }}>
            Cadastre a primeira empresa para iniciar o programa de riscos psicossociais.
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '12px 28px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Cadastrar Primeira Empresa
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {empresas.map((emp) => (
            <div key={emp.id} style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              padding: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 20,
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {emp.nomeFantasia.charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{emp.nomeFantasia}</span>
                  {emp.porte && (
                    <span style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      background: '#f1f5f9',
                      borderRadius: 4,
                      color: '#64748b',
                      fontWeight: 500,
                    }}>
                      {emp.porte}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 8px' }}>
                  {emp.razaoSocial} — CNPJ: {formatCnpj(emp.cnpj)}
                </p>
                <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
                  <span style={{ color: '#3b82f6', fontWeight: 500 }}>
                    {emp._count.setores} setor{emp._count.setores !== 1 ? 'es' : ''}
                  </span>
                  <span style={{ color: '#10b981', fontWeight: 500 }}>
                    {emp._count.questionarios} questionário{emp._count.questionarios !== 1 ? 's' : ''}
                  </span>
                  <span style={{ color: '#8b5cf6', fontWeight: 500 }}>
                    {emp._count.usuarios} usuário{emp._count.usuarios !== 1 ? 's' : ''}
                  </span>
                  {emp.cidade && emp.estado && (
                    <span style={{ color: '#94a3b8' }}>📍 {emp.cidade}/{emp.estado}</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => startEdit(emp)}
                  style={{
                    padding: '8px 16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: 'pointer',
                    color: '#475569',
                  }}
                >
                  ✏️ Editar
                </button>
                {deleteConfirm === emp.id ? (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      style={{
                        padding: '8px 12px',
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      style={{
                        padding: '8px 12px',
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 13,
                        cursor: 'pointer',
                        color: '#475569',
                      }}
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(emp.id)}
                    style={{
                      padding: '8px 16px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 8,
                      fontSize: 13,
                      cursor: 'pointer',
                      color: '#dc2626',
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
