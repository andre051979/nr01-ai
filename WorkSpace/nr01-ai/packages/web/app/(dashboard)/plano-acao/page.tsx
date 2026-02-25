'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RiscoPlanoCard, type RiscoComPlanos } from '@/components/plano-acao/RiscoPlanoCard'
import { FiltrosPlano } from '@/components/plano-acao/FiltrosPlano'
import type { PlanoFormData } from '@/components/plano-acao/PlanoAcaoForm'

export default function PlanoAcaoPage() {
  const router = useRouter()
  const [riscos, setRiscos] = useState<RiscoComPlanos[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const [filtroSetor, setFiltroSetor] = useState('')
  const [filtroClassificacao, setFiltroClassificacao] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')

  async function carregarRiscos() {
    const res = await fetch('/api/plano-acao')
    if (res.ok) setRiscos(await res.json())
    setCarregando(false)
  }

  useEffect(() => { carregarRiscos() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAddAcao(riscoId: string, data: PlanoFormData) {
    const res = await fetch('/api/plano-acao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riscoId, ...data }),
    })
    if (!res.ok) { setErro('Erro ao criar ação'); return }
    const novaAcao = await res.json()
    setRiscos((prev) =>
      prev.map((r) =>
        r.id === riscoId ? { ...r, planoAcao: [...r.planoAcao, novaAcao] } : r
      )
    )
  }

  async function handleUpdateAcao(id: string, data: PlanoFormData) {
    const res = await fetch(`/api/plano-acao/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) { setErro('Erro ao atualizar ação'); return }
    const atualizada = await res.json()
    setRiscos((prev) =>
      prev.map((r) => ({
        ...r,
        planoAcao: r.planoAcao.map((p) => p.id === id ? atualizada : p),
      }))
    )
  }

  async function handleDeleteAcao(id: string) {
    const res = await fetch(`/api/plano-acao/${id}`, { method: 'DELETE' })
    if (!res.ok) { setErro('Erro ao remover ação'); return }
    setRiscos((prev) =>
      prev.map((r) => ({
        ...r,
        planoAcao: r.planoAcao.filter((p) => p.id !== id),
      }))
    )
  }

  function handleFiltroChange(key: 'setor' | 'classificacao' | 'status', value: string) {
    if (key === 'setor') setFiltroSetor(value)
    if (key === 'classificacao') setFiltroClassificacao(value)
    if (key === 'status') setFiltroStatus(value)
  }

  // Filtro client-side
  const riscosFiltrados = riscos.filter((r) => {
    if (filtroSetor && r.setor.nome !== filtroSetor) return false
    if (filtroClassificacao && r.classificacao !== filtroClassificacao) return false
    if (filtroStatus) {
      const temStatus = r.planoAcao.some((p) => p.status === filtroStatus)
      if (!temStatus) return false
    }
    return true
  })

  const setoresUnicos = Array.from(new Set(riscos.map((r) => r.setor.nome))).sort()
  const comPlano = riscos.filter((r) => r.planoAcao.length > 0).length
  const todosComPlano = riscos.length > 0 && comPlano === riscos.length

  if (carregando) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plano de Ação</h1>
          <p className="text-sm text-gray-500 mt-1">
            Defina ações 5W2H para cada risco identificado na avaliação.
          </p>
        </div>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          {erro}
        </div>
      )}

      {riscos.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Nenhum risco médio/alto encontrado</h2>
          <p className="text-sm text-gray-500 mb-6">
            Não há riscos médios ou altos que exijam plano de ação.
          </p>
          <button
            type="button"
            onClick={() => router.push('/relatorio')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-8 rounded-lg text-sm transition-colors"
          >
            Gerar Relatório →
          </button>
        </div>
      ) : (
        <>
          {/* Progresso */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Riscos com plano definido</p>
              <p className="text-xs text-gray-500 mt-0.5">{comPlano} de {riscos.length} riscos</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(comPlano / riscos.length) * 100}%` }}
                />
              </div>
              {todosComPlano && (
                <span className="text-green-600 text-sm font-medium">✓ Completo</span>
              )}
            </div>
          </div>

          {/* Filtros */}
          <FiltrosPlano
            setores={setoresUnicos}
            filtroSetor={filtroSetor}
            filtroClassificacao={filtroClassificacao}
            filtroStatus={filtroStatus}
            onChange={handleFiltroChange}
          />

          {/* Lista de riscos */}
          <div className="space-y-4 mb-6">
            {riscosFiltrados.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">Nenhum risco corresponde ao filtro.</p>
            ) : (
              riscosFiltrados.map((risco) => (
                <RiscoPlanoCard
                  key={risco.id}
                  risco={risco}
                  onAddAcao={handleAddAcao}
                  onUpdateAcao={handleUpdateAcao}
                  onDeleteAcao={handleDeleteAcao}
                />
              ))
            )}
          </div>

          {/* Botão Gerar Relatório */}
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400">
              {!todosComPlano
                ? `${riscos.length - comPlano} risco(s) ainda sem ação definida.`
                : 'Todos os riscos têm pelo menos uma ação definida.'}
            </p>
            <button
              type="button"
              disabled={!todosComPlano}
              onClick={() => router.push('/relatorio')}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors"
            >
              Gerar Relatório →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
