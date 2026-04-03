"use client"

import { usePathname, useRouter } from "next/navigation"
import { EmpresaProvider, useEmpresa } from "@/contexts/EmpresaContext"
import { useState } from "react"

const menuItems = [
  { label: "Painel", href: "/dashboard", icon: "📊" },
  { label: "Empresas", href: "/dashboard/empresas", icon: "🏢" },
  { label: "Setores", href: "/dashboard/setores", icon: "🏗️" },
  { label: "Questionários", href: "/dashboard/questionarios", icon: "📋" },
  { label: "Relatórios", href: "/dashboard/relatorios", icon: "📈" },
  { label: "PGR", href: "/dashboard/pgr", icon: "📄" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <EmpresaProvider>
      <DashboardInner>{children}</DashboardInner>
    </EmpresaProvider>
  )
}

function DashboardInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { empresas, empresaAtiva, setEmpresaAtiva, loading } = useEmpresa()
  const [seletorAberto, setSeletorAberto] = useState(false)

  const formatCNPJ = (cnpj: string) => {
    const c = cnpj.replace(/\D/g, "")
    if (c.length !== 14) return cnpj
    return `${c.slice(0,2)}.${c.slice(2,5)}.${c.slice(5,8)}/${c.slice(8,12)}-${c.slice(12)}`
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e2a3a] text-white flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm">🧠</div>
            <div>
              <h1 className="font-bold text-sm">PsicoGestão</h1>
              <p className="text-[10px] text-gray-400">Riscos Psicossociais - NR-1</p>
            </div>
          </div>
        </div>

        {/* Seletor de Empresa */}
        <div className="p-3 border-b border-white/10">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Empresa Ativa</p>
          {loading ? (
            <div className="text-xs text-gray-400">Carregando...</div>
          ) : empresas.length === 0 ? (
            <div className="text-xs text-gray-400">
              <p>Nenhuma empresa</p>
              <button onClick={() => router.push("/dashboard/empresas")} className="text-blue-400 underline mt-1">
                Cadastrar
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setSeletorAberto(!seletorAberto)}
                className="w-full flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {empresaAtiva?.nomeFantasia?.charAt(0) || "?"}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-medium truncate">{empresaAtiva?.nomeFantasia || "Selecione"}</p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {empresaAtiva ? formatCNPJ(empresaAtiva.cnpj) : ""}
                  </p>
                </div>
                <span className="text-gray-400 text-xs">{seletorAberto ? "▲" : "▼"}</span>
              </button>

              {seletorAberto && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#2a3a4a] rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto border border-white/10">
                  {empresas.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setEmpresaAtiva(emp)
                        setSeletorAberto(false)
                      }}
                      className={`w-full flex items-center gap-2 p-2.5 hover:bg-white/10 transition-colors ${
                        empresaAtiva?.id === emp.id ? "bg-blue-600/20 border-l-2 border-blue-500" : ""
                      }`}
                    >
                      <div className="w-7 h-7 bg-blue-600/60 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {emp.nomeFantasia.charAt(0)}
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-xs font-medium truncate">{emp.nomeFantasia}</p>
                        <p className="text-[10px] text-gray-400">{formatCNPJ(emp.cnpj)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white font-medium"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => {
              fetch("/api/auth/logout", { method: "POST" }).then(() => {
                window.location.href = "/login"
              })
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <span>🚪</span>
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}