"use client"

import { useState, useEffect } from "react"
import { useEmpresa } from "@/contexts/EmpresaContext"

interface Setor {
  id: string
  nome: string
  totalColaboradores: number
  turnos?: string | null
}

export default function SetoresPage() {
  const { empresaAtiva, loading: loadingEmpresa } = useEmpresa()
  const [setores, setSetores] = useState<Setor[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Setor | null>(null)
  const [form, setForm] = useState({ nome: "", totalColaboradores: "", turnos: "" })
  const [erro, setErro] = useState("")
  const [salvando, setSalvando] = useState(false)

  const fetchSetores = async () => {
    if (!empresaAtiva) return
    setLoading(true)
    try {
      const res = await fetch(`/api/setores?empresaId=${empresaAtiva.id}`)
      if (res.ok) {
        const data = await res.json()
        setSetores(data)
      }
    } catch (error) {
      console.error("Erro:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSetores()
  }, [empresaAtiva])

  const abrirModal = (setor?: Setor) => {
    if (setor) {
      setEditando(setor)
      setForm({
        nome: setor.nome,
        totalColaboradores: setor.totalColaboradores.toString(),
        turnos: setor.turnos || "",
      })
    } else {
      setEditando(null)
      setForm({ nome: "", totalColaboradores: "", turnos: "" })
    }
    setErro("")
    setShowModal(true)
  }

  const salvar = async () => {
    if (!form.nome.trim()) {
      setErro("Nome do setor e obrigatorio")
      return
    }
    setSalvando(true)
    setErro("")

    try {
      const url = editando ? `/api/setores/${editando.id}` : "/api/setores"
      const method = editando ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          empresaId: empresaAtiva?.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.error || "Erro ao salvar")
        return
      }

      setShowModal(false)
      fetchSetores()
    } catch (error) {
      setErro("Erro de conexao")
    } finally {
      setSalvando(false)
    }
  }

  const excluir = async (setor: Setor) => {
    if (!confirm(`Deseja excluir o setor "${setor.nome}"?`)) return
    try {
      const res = await fetch(`/api/setores/${setor.id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Erro ao excluir")
        return
      }
      fetchSetores()
    } catch (error) {
      alert("Erro de conexao")
    }
  }

  const totalColab = setores.reduce((acc, s) => acc + s.totalColaboradores, 0)

  if (loadingEmpresa) {
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Setores</h1>
          <p className="text-gray-500 text-sm mt-1">
            Empresa: <strong>{empresaAtiva.nomeFantasia}</strong>
          </p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Novo Setor
        </button>
      </div>

      {/* Cards resumo */}
      {setores.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500">Total de Setores</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{setores.length}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500">Total de Colaboradores</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{totalColab}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500">Media por Setor</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {setores.length > 0 ? Math.round(totalColab / setores.length) : 0}
            </p>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="text-gray-500 text-center py-10">Carregando setores...</div>
      ) : setores.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <div className="text-5xl mb-4">🏗️</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum setor cadastrado</h3>
          <p className="text-gray-500 text-sm mb-4">Cadastre os setores desta empresa para iniciar a avaliacao psicossocial.</p>
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            + Cadastrar primeiro setor
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {setores.map((setor) => (
            <div key={setor.id} className="bg-white rounded-xl border p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">
                  {setor.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{setor.nome}</h3>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    <span>👥 {setor.totalColaboradores} colaboradores</span>
                    {setor.turnos && <span>🕐 {setor.turnos}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => abrirModal(setor)}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => excluir(setor)}
                  className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">
              {editando ? "Editar Setor" : "Novo Setor"}
            </h2>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
                {erro}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Setor *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Administrativo, Producao, Comercial..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total de Colaboradores</label>
                <input
                  type="number"
                  min="0"
                  value={form.totalColaboradores}
                  onChange={(e) => setForm({ ...form, totalColaboradores: e.target.value })}
                  placeholder="Quantidade de pessoas neste setor"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turnos</label>
                <input
                  type="text"
                  value={form.turnos}
                  onChange={(e) => setForm({ ...form, turnos: e.target.value })}
                  placeholder="Ex: Diurno, Noturno, Administrativo..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {salvando ? "Salvando..." : editando ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}