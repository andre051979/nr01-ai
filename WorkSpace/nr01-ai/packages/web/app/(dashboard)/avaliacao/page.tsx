'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MatrizRisco } from '@/components/avaliacao/MatrizRisco'
import { RiscoCard, type RiscoComSetor } from '@/components/avaliacao/RiscoCard'
import type { Nivel } from '@/lib/calcular-riscos'

interface FiltroAtivo {
  probabilidade: Nivel
  severidade: Nivel
}

export default function AvaliacaoPage() {
  const router = useRouter()
  const [riscos, setRiscos] = useState<RiscoComSetor[]>([])
  const [carregando, setCarregando] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [aprovando, setAprovando] = useState(false)
  const [gerou, setGerou] = useState(false)
  const [filtro, setFiltro] = useState<FiltroAtivo | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function carregarRiscos() {
    const res = await fetch('/api/avaliacao/riscos')
    if (res.ok) {
      const data = await res.json()
      setRiscos(data)
    }
    setCarregando(false)
  }

  useEffect(() => { carregarRiscos() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGerar() {
    setGerando(true)
    setErro(null)
    const res = await fetch('/api/avaliacao/gerar', { method: 'POST' })
    const data = await res.json()
    if (!res.ok) {
      setErro(data.error ?? 'Erro ao gerar avaliação')
    } else {
      setRiscos(data)
      setGerou(true)
    }
    setGerando(false)
  }

  function handleUpdate(id: string, updated: Partial<RiscoComSetor>) {
    setRiscos((prev) => prev.map((r) => r.id === id ? { ...r, ...updated } : r))
  }

  async function handleAprovar() {
    setAprovando(true)
    setErro(null)
    const res = await fetch('/api/avaliacao/aprovar', { method: 'POST' })
    const data = await res.json()
    if (!res.ok) {
      setErro(data.error ?? 'Erro ao aprovar avaliação')
      setAprovando(false)
      return
    }
    router.push('/plano-acao')
  }

  const riscosFiltrados = filtro
    ? riscos.filter((r) => r.probabilidade === filtro.probabilidade && r.severidade === filtro.severidade)
    : riscos

  const comJustificativa = riscos.filter((r) => r.justificativa.trim().length >= 20).length
  const todosComJustificativa = riscos.length > 0 && comJustificativa === riscos.length
  const semRiscosMedioAlto = !carregando && riscos.length === 0 && gerou

  if (carregando) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-200 rounded w-96" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Avaliação de Riscos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Revise, ajuste e justifique os riscos identificados automaticamente.
          </p>
        </div>
        {riscos.length > 0 && (
          <button
            type="button"
            onClick={handleGerar}
            disabled={gerando}
            className="text-xs text-gray-400 hover:text-gray-600 underline mt-2"
          >
            {gerando ? 'Regenerando...' : 'Regenerar avaliação'}
          </button>
        )}
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
          {erro}
        </div>
      )}

      {/* Estado inicial: gerar */}
      {riscos.length === 0 && !semRiscosMedioAlto && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Gerar Avaliação Automática</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            O sistema analisará as respostas do questionário e identificará os riscos psicossociais por setor e categoria.
          </p>
          <button
            type="button"
            onClick={handleGerar}
            disabled={gerando}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2.5 px-8 rounded-lg text-sm transition-colors"
          >
            {gerando ? 'Gerando...' : 'Gerar Avaliação'}
          </button>
        </div>
      )}

      {/* AC10: sem riscos médios/altos */}
      {semRiscosMedioAlto && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center mb-6">
          <div className="text-5xl mb-3">✅</div>
          <h2 className="text-lg font-semibold text-green-800 mb-2">Ótimas notícias!</h2>
          <p className="text-sm text-green-700 mb-4">
            Nenhum risco médio ou alto foi identificado nas respostas do questionário.
            A empresa apresenta um ambiente de trabalho com baixos riscos psicossociais.
          </p>
          <button
            type="button"
            onClick={() => router.push('/plano-acao')}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-8 rounded-lg text-sm transition-colors"
          >
            Prosseguir para Plano de Ação →
          </button>
        </div>
      )}

      {/* Matriz + Lista de riscos */}
      {riscos.length > 0 && (
        <>
          {/* Matriz */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Matriz de Risco (Probabilidade × Severidade)
            </h2>
            <MatrizRisco riscos={riscos} filtro={filtro} onFiltro={setFiltro} />
          </div>

          {/* Contador de justificativas */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Justificativas preenchidas</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {comJustificativa} de {riscos.length} riscos completos
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(comJustificativa / riscos.length) * 100}%` }}
                />
              </div>
              {todosComJustificativa && (
                <span className="text-green-600 text-sm font-medium">✓ Completo</span>
              )}
            </div>
          </div>

          {/* Lista de riscos */}
          <div className="space-y-4 mb-6">
            {filtro && (
              <p className="text-sm text-gray-500">
                Exibindo {riscosFiltrados.length} risco(s) com Probabilidade {filtro.probabilidade} × Severidade {filtro.severidade}
              </p>
            )}
            {riscosFiltrados.map((risco) => (
              <RiscoCard key={risco.id} risco={risco} onUpdate={handleUpdate} />
            ))}
          </div>

          {/* Botão aprovar */}
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400">
              Preencha a justificativa de cada risco antes de aprovar.
            </p>
            <button
              type="button"
              disabled={!todosComJustificativa || aprovando}
              onClick={handleAprovar}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors"
            >
              {aprovando ? 'Aprovando...' : 'Aprovar Avaliação →'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
