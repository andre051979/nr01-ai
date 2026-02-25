'use client'

import { calcularClassificacao, type Nivel, type Classificacao } from '@/lib/calcular-riscos'

const NIVEIS: Nivel[] = ['alta', 'media', 'baixa']
const NIVEL_LABEL: Record<Nivel, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }

const COR_CELULA: Record<Classificacao, string> = {
  alto:  'bg-red-500 hover:bg-red-600 text-white',
  medio: 'bg-yellow-400 hover:bg-yellow-500 text-white',
  baixo: 'bg-green-500 hover:bg-green-600 text-white',
}

interface RiscoMinimo {
  probabilidade: string
  severidade: string
}

interface FiltroAtivo {
  probabilidade: Nivel
  severidade: Nivel
}

interface Props {
  riscos: RiscoMinimo[]
  filtro: FiltroAtivo | null
  onFiltro: (f: FiltroAtivo | null) => void
}

export function MatrizRisco({ riscos, filtro, onFiltro }: Props) {
  function contarRiscos(prob: Nivel, sev: Nivel) {
    return riscos.filter((r) => r.probabilidade === prob && r.severidade === sev).length
  }

  function handleCelulaClick(prob: Nivel, sev: Nivel) {
    if (filtro?.probabilidade === prob && filtro?.severidade === sev) {
      onFiltro(null)
    } else {
      onFiltro({ probabilidade: prob, severidade: sev })
    }
  }

  return (
    <div>
      <div className="inline-grid grid-cols-4 gap-1 text-sm">
        {/* Cabeçalho */}
        <div className="flex items-end justify-end pr-2 pb-1 text-xs text-gray-400 font-medium">
          Prob \ Sev
        </div>
        {(['baixa', 'media', 'alta'] as Nivel[]).map((sev) => (
          <div key={sev} className="text-center text-xs font-medium text-gray-500 pb-1">
            {NIVEL_LABEL[sev]}
          </div>
        ))}

        {/* Linhas: Alta prob → Baixa prob */}
        {NIVEIS.map((prob) => (
          <>
            <div
              key={`label-${prob}`}
              className="flex items-center justify-end pr-2 text-xs font-medium text-gray-500"
            >
              {NIVEL_LABEL[prob]}
            </div>
            {(['baixa', 'media', 'alta'] as Nivel[]).map((sev) => {
              const classif = calcularClassificacao(prob, sev)
              const count = contarRiscos(prob, sev)
              const isAtivo =
                filtro?.probabilidade === prob && filtro?.severidade === sev

              return (
                <button
                  key={`${prob}-${sev}`}
                  type="button"
                  onClick={() => handleCelulaClick(prob, sev)}
                  className={`
                    w-20 h-16 rounded-lg font-bold text-lg transition-all
                    ${COR_CELULA[classif]}
                    ${isAtivo ? 'ring-4 ring-offset-2 ring-gray-700 scale-105' : ''}
                    ${count === 0 ? 'opacity-60' : ''}
                  `}
                  title={`${NIVEL_LABEL[prob]} × ${NIVEL_LABEL[sev]} = ${classif}`}
                >
                  {count > 0 ? count : ''}
                </button>
              )
            })}
          </>
        ))}
      </div>

      {/* Legenda */}
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Alto
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-yellow-400 inline-block" /> Médio
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Baixo
        </span>
        {filtro && (
          <button
            type="button"
            onClick={() => onFiltro(null)}
            className="ml-auto text-blue-600 hover:text-blue-800"
          >
            Limpar filtro ×
          </button>
        )}
      </div>
    </div>
  )
}
