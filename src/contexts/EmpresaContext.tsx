"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface Empresa {
  id: string
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  porte?: string | null
  segmento?: string | null
}

interface EmpresaContextType {
  empresas: Empresa[]
  empresaAtiva: Empresa | null
  setEmpresaAtiva: (empresa: Empresa) => void
  reloadEmpresas: () => Promise<void>
  loading: boolean
}

const EmpresaContext = createContext<EmpresaContextType>({
  empresas: [],
  empresaAtiva: null,
  setEmpresaAtiva: () => {},
  reloadEmpresas: async () => {},
  loading: true,
})

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [empresaAtiva, setEmpresaAtivaState] = useState<Empresa | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchEmpresas = async () => {
    try {
      const res = await fetch("/api/empresas")
      if (res.ok) {
        const data = await res.json()
        setEmpresas(data)
        
        const salvaId = localStorage.getItem("empresaAtivaId")
        if (salvaId) {
          const encontrada = data.find((e: Empresa) => e.id === salvaId)
          if (encontrada) {
            setEmpresaAtivaState(encontrada)
          } else if (data.length > 0) {
            setEmpresaAtivaState(data[0])
            localStorage.setItem("empresaAtivaId", data[0].id)
          }
        } else if (data.length > 0) {
          setEmpresaAtivaState(data[0])
          localStorage.setItem("empresaAtivaId", data[0].id)
        }
      }
    } catch (error) {
      console.error("Erro ao carregar empresas:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpresas()
  }, [])

  const setEmpresaAtiva = (empresa: Empresa) => {
    setEmpresaAtivaState(empresa)
    localStorage.setItem("empresaAtivaId", empresa.id)
  }

  return (
    <EmpresaContext.Provider
      value={{
        empresas,
        empresaAtiva,
        setEmpresaAtiva,
        reloadEmpresas: fetchEmpresas,
        loading,
      }}
    >
      {children}
    </EmpresaContext.Provider>
  )
}

export const useEmpresa = () => useContext(EmpresaContext)