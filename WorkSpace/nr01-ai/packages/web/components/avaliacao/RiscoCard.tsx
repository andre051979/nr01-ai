'use client'

import { useState } from 'react'
import { calcularClassificacao, type Nivel, type Classificacao } from '@/lib/calcular-riscos'

const CLASSIF_LABEL: Record<Classificacao, string> = { baixo: 'Baixo', medio: 'Médio', alto: 'Alto' }

const CLASSIF_BADGE: Record<Classificacao, string> = {
  alto:  'bg-red-100 text-red-800 border border-red-200',
  medio: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  baixo: 'bg-green-100 text-green-800 border border-green-200',
}

const PROB_BADGE: Record<Nivel, string> = {
  alta:  'bg-red-50 text-red-700',
  media: 'bg-yellow-50 text-yellow-700',
  baixa: 'bg-green-50 text-green-700',
}

export interface RiscoComSetor {
  id: string
  descricao: string
  categoria: string | null
  probabilidade: string
  severidade: string
  classificacao: string
  justificativa: string
  setor: { nome: string }
}

interface Props {
  risco: RiscoComSetor
  onUpdate: (id: string, updated: Partial<RiscoComSetor>) => void
}

export function RiscoCard({ risco, onUpdate }: Props) {
  const [prob, setProb] = useState<Nivel>(risco.probabilidade as Nivel)
  const [sev, setSev] = useState<Nivel>(risco.severidade as Nivel)
  const [justificativa, setJustificativa] = useState(risco.justificativa)
  const [salvandoNivel, setSalvandoNivel] = useState(false)
  const [salvandoJust, setSalvandoJust] = useState(false)

  const classificacao = calcularClassificacao(prob, sev)
  const justValida = justificativa.trim().length >= 20
  const justSuja = justificativa !== risco.justificativa

  async function salvar(updates: { probabilidade: Nivel; severidade: Nivel; justificativa: string }) {
    const res = await fetch(`/api/avaliacao/risco/${risco.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      const updated = await res.json()
      onUpdate(risco.id, updated)
    }
  }

  async function handleProbChange(newProb: Nivel) {
    setProb(newProb)
    setSalvandoNivel(true)
    await salvar({ probabilidade: newProb, severidade: sev, justificativa })
    setSalvandoNivel(false)
  }

  async function handleSevChange(newSev: Nivel) {
    setSev(newSev)
    setSalvandoNivel(true)
    await salvar({ probabilidade: prob, severidade: newSev, justificativa })
    setSalvandoNivel(false)
  }

  async function handleJustBlur() {
    if (!justSuja) return
    setSalvandoJust(true)
    await salvar({ probabilidade: prob, severidade: sev, justificativa })
    setSalvandoJust(false)
  }

  const bordaJust = justificativa.length > 0
    ? justValida ? 'border-green-300' : 'border-red-300'
    : 'border-gray-200'

  return (
    <div className={`bg-white border-2 rounded-xl p-5 transition-colors ${
      CLASSIF_BADGE[classificacao].includes('red') ? 'border-red-100' :
      CLASSIF_BADGE[classificacao].includes('yellow') ? 'border-yellow-100' : 'border-green-100'
    }`}>
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-sm font-semibold text-gray-800">{risco.descricao}</p>
          <p className="text-xs text-gray-400 mt-0.5">Setor: {risco.setor.nome}</p>
        </div>
        <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${CLASSIF_BADGE[classificacao]}`}>
          {CLASSIF_LABEL[classificacao]}
        </span>
      </div>

      {/* Probabilidade e Severidade */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Probabilidade</label>
          <select
            value={prob}
            onChange={(e) => handleProbChange(e.target.value as Nivel)}
            disabled={salvandoNivel}
            className={`w-full text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${PROB_BADGE[prob]}`}
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Severidade</label>
          <select
            value={sev}
            onChange={(e) => handleSevChange(e.target.value as Nivel)}
            disabled={salvandoNivel}
            className={`w-full text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${PROB_BADGE[sev]}`}
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>
      </div>
      {salvandoNivel && <p className="text-xs text-gray-400 mb-2">Salvando classificação...</p>}

      {/* Justificativa */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-500">
            Justificativa técnica <span className="text-red-500">*</span>
          </label>
          <span className={`text-xs ${justValida ? 'text-green-600' : 'text-gray-400'}`}>
            {justificativa.trim().length}/20 mín.
          </span>
        </div>
        <textarea
          value={justificativa}
          onChange={(e) => setJustificativa(e.target.value)}
          onBlur={handleJustBlur}
          rows={3}
          placeholder="Descreva a justificativa técnica para este risco..."
          className={`w-full text-sm border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors ${bordaJust}`}
        />
        {salvandoJust && <p className="text-xs text-gray-400 mt-1">Salvando...</p>}
        {!salvandoJust && justValida && !justSuja && (
          <p className="text-xs text-green-600 mt-1">✓ Salvo</p>
        )}
      </div>
    </div>
  )
}
