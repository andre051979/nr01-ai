'use client'

const OPCOES = [
  { valor: 1, label: 'Nunca', cor: 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200' },
  { valor: 2, label: 'Raramente', cor: 'bg-lime-100 border-lime-400 text-lime-800 hover:bg-lime-200' },
  { valor: 3, label: 'Às vezes', cor: 'bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200' },
  { valor: 4, label: 'Frequentemente', cor: 'bg-orange-100 border-orange-400 text-orange-800 hover:bg-orange-200' },
  { valor: 5, label: 'Sempre', cor: 'bg-red-100 border-red-400 text-red-800 hover:bg-red-200' },
]

interface Props {
  perguntaId: string
  valor: number | undefined
  onChange: (perguntaId: string, valor: number) => void
  salvando?: boolean
}

export function LikertScale({ perguntaId, valor, onChange, salvando }: Props) {
  return (
    <div role="radiogroup" aria-label="Escala de frequência" className="flex gap-2 flex-wrap">
      {OPCOES.map((opcao) => {
        const selecionado = valor === opcao.valor
        return (
          <button
            key={opcao.valor}
            type="button"
            role="radio"
            aria-checked={selecionado}
            disabled={salvando}
            onClick={() => onChange(perguntaId, opcao.valor)}
            className={`
              px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
              ${selecionado
                ? `${opcao.cor} border-2 ring-2 ring-offset-1 ring-current scale-105`
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
              }
              disabled:opacity-60 disabled:cursor-not-allowed
            `}
          >
            <span className="font-bold">{opcao.valor}</span> — {opcao.label}
          </button>
        )
      })}
    </div>
  )
}
