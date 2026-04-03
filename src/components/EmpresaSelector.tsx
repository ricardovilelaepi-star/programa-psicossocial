'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Empresa {
  id: string
  nomeFantasia: string
  cnpj: string
  _count?: {
    setores: number
    questionarios: number
    usuarios: number
  }
}

export default function EmpresaSelector() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [empresaAtiva, setEmpresaAtiva] = useState<Empresa | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [empRes, meRes] = await Promise.all([
          fetch('/api/empresas'),
          fetch('/api/auth/me'),
        ])

        if (empRes.ok) {
          const lista = await empRes.json()
          setEmpresas(lista)

          if (meRes.ok) {
            const me = await meRes.json()
            if (me.empresa) {
              const ativa = lista.find((e: Empresa) => e.id === me.empresa.id)
              setEmpresaAtiva(ativa || null)
            }
          }
        }
      } catch (err) {
        console.error('Erro ao carregar empresas:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function selecionarEmpresa(empresa: Empresa) {
    if (empresa.id === empresaAtiva?.id) {
      setOpen(false)
      return
    }

    setSwitching(true)
    try {
      const res = await fetch('/api/empresas/selecionar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId: empresa.id }),
      })

      if (res.ok) {
        setEmpresaAtiva(empresa)
        setOpen(false)
        router.refresh()
      }
    } catch (err) {
      console.error('Erro ao selecionar empresa:', err)
    } finally {
      setSwitching(false)
    }
  }

  function formatCnpj(cnpj: string) {
    const c = cnpj.replace(/\D/g, '')
    if (c.length !== 14) return cnpj
    return c.slice(0,2) + '.' + c.slice(2,5) + '.' + c.slice(5,8) + '/' + c.slice(8,12) + '-' + c.slice(12)
  }

  if (loading) {
    return (
      <div style={{
        padding: '12px 16px',
        margin: '0 12px 8px',
        borderRadius: 8,
        background: 'rgba(255,255,255,0.05)',
        fontSize: 13,
        color: '#64748b',
      }}>
        Carregando empresas...
      </div>
    )
  }

  if (empresas.length === 0) {
    return (
      <div style={{
        padding: '12px 16px',
        margin: '0 12px 8px',
        borderRadius: 8,
        background: 'rgba(239,68,68,0.1)',
        fontSize: 13,
        color: '#f87171',
        border: '1px solid rgba(239,68,68,0.2)',
      }}>
        Nenhuma empresa cadastrada
      </div>
    )
  }

  return (
    <div ref={ref} style={{ padding: '0 12px', marginBottom: 8, position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        disabled={switching}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.1)',
          background: open ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
          color: '#fff',
          cursor: switching ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          textAlign: 'left' as const,
          transition: 'all 0.15s',
          opacity: switching ? 0.6 : 1,
        }}
      >
        <span style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: empresaAtiva ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
          flexShrink: 0,
        }}>
          {empresaAtiva ? empresaAtiva.nomeFantasia.charAt(0).toUpperCase() : '?'}
        </span>
        <span style={{ flex: 1, overflow: 'hidden' }}>
          <span style={{
            display: 'block',
            fontWeight: 600,
            fontSize: 13,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {switching ? 'Trocando...' : empresaAtiva ? empresaAtiva.nomeFantasia : 'Selecionar empresa'}
          </span>
          {empresaAtiva && !switching && (
            <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>
              {formatCnpj(empresaAtiva.cnpj)}
            </span>
          )}
        </span>
        <span style={{
          fontSize: 10,
          color: '#64748b',
          transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          &#9660;
        </span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 12,
          right: 12,
          marginTop: 4,
          background: '#1e293b',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 999,
          maxHeight: 280,
          overflowY: 'auto' as const,
          padding: '4px',
        }}>
          <div style={{
            padding: '8px 12px 6px',
            fontSize: 11,
            color: '#64748b',
            fontWeight: 600,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
          }}>
            {empresas.length} empresa{empresas.length !== 1 ? 's' : ''}
          </div>

          {empresas.map((emp) => {
            const isActive = emp.id === empresaAtiva?.id
            return (
              <button
                key={emp.id}
                onClick={() => selecionarEmpresa(emp)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  textAlign: 'left' as const,
                  fontSize: 13,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = isActive ? 'rgba(59,130,246,0.15)' : 'transparent'
                }}
              >
                <span style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: isActive ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {emp.nomeFantasia.charAt(0).toUpperCase()}
                </span>
                <span style={{ flex: 1, overflow: 'hidden' }}>
                  <span style={{
                    display: 'block',
                    fontWeight: isActive ? 600 : 400,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {emp.nomeFantasia}
                  </span>
                  <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>
                    {formatCnpj(emp.cnpj)}
                  </span>
                </span>
                {isActive && (
                  <span style={{ color: '#3b82f6', fontSize: 14 }}>&#10003;</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
