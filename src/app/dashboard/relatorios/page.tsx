"use client"

import { useEmpresa } from "@/contexts/EmpresaContext"

export default function RelatoriosPage() {
  const { empresaAtiva, loading } = useEmpresa()

  if (loading) {
    return <div className="text-gray-500">Carregando...</div>
  }

  if (!empresaAtiva) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🏢</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma empresa selecionada</h2>
        <p className="text-gray-500">Selecione ou cadastre uma empresa no menu lateral.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500 text-sm mt-1">
          Empresa: <strong>{empresaAtiva.nomeFantasia}</strong>
        </p>
      </div>

      {/* Cards de tipos de relatório */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="font-semibold text-gray-900 mb-1">Resultado por Setor</h3>
          <p className="text-sm text-gray-500 mb-4">Visualize os resultados dos questionários agrupados por setor da empresa.</p>
          <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">Em breve</span>
        </div>

        <div className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl mb-3">📈</div>
          <h3 className="font-semibold text-gray-900 mb-1">Mapa de Riscos</h3>
          <p className="text-sm text-gray-500 mb-4">Mapa consolidado dos fatores de risco psicossocial identificados.</p>
          <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">Em breve</span>
        </div>

        <div className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
          <div className="text-3xl mb-3">📋</div>
          <h3 className="font-semibold text-gray-900 mb-1">Relatório Executivo</h3>
          <p className="text-sm text-gray-500 mb-4">Síntese executiva com indicadores-chave para tomada de decisão.</p>
          <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">Em breve</span>
        </div>
      </div>

      {/* Estado vazio */}
      <div className="text-center py-12 bg-white rounded-xl border">
        <div className="text-5xl mb-4">📈</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum relatório disponível ainda</h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Os relatórios serão gerados automaticamente após a coleta de respostas dos questionários psicossociais.
        </p>
      </div>
    </div>
  )
}