'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DiagnosticoStepper } from '@/components/diagnostico/DiagnosticoStepper'
import { SetorSelector } from '@/components/questionario/SetorSelector'
import { CategoriaPerguntas, Pergunta } from '@/components/questionario/CategoriaPerguntas'

const TOTAL_PERGUNTAS = 15
const ORDEM_CATEGORIAS = [
  'organizacao_trabalho',
  'relacoes_interpessoais',
  'condicoes_trabalho',
  'violencia_assedio',
  'reconhecimento_recompensa',
]

interface Setor {
  id: string
  nome: string
  totalRespostas: number
}

export default function QuestionarioPage() {
  const router = useRouter()
  const [setores, setSetores] = useState<Setor[]>([])
  const [setorAtualId, setSetorAtualId] = useState<string | null>(null)
  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [respostas, setRespostas] = useState<Record<string, number>>({})
  const [salvando, setSalvando] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  // Carregar empresa + perguntas
  useEffect(() => {
    async function init() {
      const [empRes, pergRes] = await Promise.all([
        fetch('/api/empresa'),
        fetch('/api/questionario/perguntas'),
      ])

      if (!empRes.ok) { router.push('/diagnostico'); return }
      const empresa = await empRes.json()
      if (!empresa) { router.push('/diagnostico'); return }

      const pergs: Pergunta[] = await pergRes.json()
      setPerguntas(pergs)

      const setoresComProgresso: Setor[] = empresa.setores.map((s: { id: string; nome: string }) => ({
        id: s.id,
        nome: s.nome,
        totalRespostas: 0,
      }))
      setSetores(setoresComProgresso)

      if (setoresComProgresso.length > 0) {
        setSetorAtualId(setoresComProgresso[0].id)
      }
      setCarregando(false)
    }
    init()
  }, [router])

  // Carregar respostas do setor atual
  const carregarRespostas = useCallback(async (setorId: string) => {
    const res = await fetch(`/api/questionario/respostas?setorId=${setorId}`)
    if (!res.ok) return
    const data: Array<{ perguntaId: string; valor: number }> = await res.json()
    const mapa: Record<string, number> = {}
    data.forEach((r) => { mapa[r.perguntaId] = r.valor })
    setRespostas(mapa)

    // Atualizar contador do setor
    setSetores((prev) =>
      prev.map((s) => s.id === setorId ? { ...s, totalRespostas: data.length } : s)
    )
  }, [])

  useEffect(() => {
    if (setorAtualId) carregarRespostas(setorAtualId)
  }, [setorAtualId, carregarRespostas])

  // AC5: auto-save ao selecionar resposta
  async function handleResposta(perguntaId: string, valor: number) {
    if (!setorAtualId) return

    // Optimistic UI
    setRespostas((prev) => ({ ...prev, [perguntaId]: valor }))
    setSalvando(perguntaId)

    const novaTotal = Object.keys({ ...respostas, [perguntaId]: valor }).length
    setSetores((prev) =>
      prev.map((s) => s.id === setorAtualId ? { ...s, totalRespostas: novaTotal } : s)
    )

    await fetch('/api/questionario/resposta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setorId: setorAtualId, perguntaId, valor }),
    })
    setSalvando(null)
  }

  function handleSelecionarSetor(setorId: string) {
    setRespostas({})
    setSetorAtualId(setorId)
  }

  const setorAtualIdx = setores.findIndex((s) => s.id === setorAtualId)
  const setorAtual = setores[setorAtualIdx]
  const totalRespondido = Object.keys(respostas).length
  const setorCompleto = totalRespondido >= TOTAL_PERGUNTAS
  const ultimoSetor = setorAtualIdx === setores.length - 1
  const todosCompletos = setores.every((s) => s.totalRespostas >= TOTAL_PERGUNTAS)

  function avancar() {
    if (ultimoSetor) {
      router.push('/diagnostico/evidencias')
    } else {
      setRespostas({})
      setSetorAtualId(setores[setorAtualIdx + 1].id)
    }
  }

  const perguntasPorCategoria = ORDEM_CATEGORIAS.map((cat) => ({
    categoria: cat,
    perguntas: perguntas.filter((p) => p.categoria === cat),
  })).filter((g) => g.perguntas.length > 0)

  if (carregando) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-200 rounded w-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Diagnóstico NR-01</h1>
      <p className="text-sm text-gray-500 mb-8">Responda para cada setor da empresa.</p>

      <DiagnosticoStepper currentStep={1} empresaSalva={true} />

      {/* Seletor de setores */}
      <SetorSelector
        setores={setores}
        setorAtualId={setorAtualId ?? ''}
        onSelect={handleSelecionarSetor}
      />

      {/* Progresso do setor atual */}
      {setorAtual && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">{setorAtual.nome}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {totalRespondido} de {TOTAL_PERGUNTAS} perguntas respondidas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${(totalRespondido / TOTAL_PERGUNTAS) * 100}%` }}
              />
            </div>
            {setorCompleto && (
              <span className="text-green-600 text-sm font-medium">✓ Completo</span>
            )}
          </div>
        </div>
      )}

      {/* Perguntas por categoria */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {perguntasPorCategoria.map(({ categoria, perguntas: ps }) => (
          <CategoriaPerguntas
            key={categoria}
            categoria={categoria}
            perguntas={ps}
            respostas={respostas}
            onResposta={handleResposta}
            salvando={salvando}
          />
        ))}
      </div>

      {/* Botão de navegação */}
      <div className="mt-6 flex justify-between items-center">
        <p className="text-xs text-gray-400">
          Setores completos: {setores.filter((s) => s.totalRespostas >= TOTAL_PERGUNTAS).length}/{setores.length}
        </p>
        <button
          type="button"
          disabled={!setorCompleto}
          onClick={avancar}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors"
        >
          {ultimoSetor
            ? todosCompletos ? 'Concluir Questionário →' : 'Concluir Questionário →'
            : 'Próximo Setor →'}
        </button>
      </div>
    </div>
  )
}
