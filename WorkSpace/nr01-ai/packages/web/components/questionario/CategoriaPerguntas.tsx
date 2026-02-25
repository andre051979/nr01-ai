'use client'

import { LikertScale } from './LikertScale'

export interface Pergunta {
  id: string
  categoria: string
  texto: string
  ordem: number
}

const CATEGORIAS: Record<string, { label: string; icone: string }> = {
  organizacao_trabalho:      { label: 'Organização do Trabalho',      icone: '🗂️' },
  relacoes_interpessoais:    { label: 'Relações Interpessoais',       icone: '🤝' },
  condicoes_trabalho:        { label: 'Condições de Trabalho',        icone: '🏢' },
  violencia_assedio:         { label: 'Violência e Assédio',          icone: '🛡️' },
  reconhecimento_recompensa: { label: 'Reconhecimento e Recompensa',  icone: '⭐' },
}

interface Props {
  categoria: string
  perguntas: Pergunta[]
  respostas: Record<string, number>
  onResposta: (perguntaId: string, valor: number) => void
  salvando: string | null
}

export function CategoriaPerguntas({ categoria, perguntas, respostas, onResposta, salvando }: Props) {
  const cat = CATEGORIAS[categoria] ?? { label: categoria, icone: '📋' }

  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>{cat.icone}</span>
        {cat.label}
      </h3>

      <div className="space-y-6">
        {perguntas.map((pergunta) => (
          <div key={pergunta.id} className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-700 mb-3 font-medium">
              <span className="text-gray-400 mr-2">{pergunta.ordem}.</span>
              {pergunta.texto}
            </p>
            <LikertScale
              perguntaId={pergunta.id}
              valor={respostas[pergunta.id]}
              onChange={onResposta}
              salvando={salvando === pergunta.id}
            />
            {salvando === pergunta.id && (
              <p className="text-xs text-gray-400 mt-1">Salvando...</p>
            )}
            {respostas[pergunta.id] && salvando !== pergunta.id && (
              <p className="text-xs text-green-600 mt-1">✓ Salvo</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
