'use client'

interface Setor {
  id: string
  nome: string
  totalRespostas: number
}

interface Props {
  setores: Setor[]
  setorAtualId: string
  onSelect: (setorId: string) => void
}

const TOTAL_PERGUNTAS = 15

export function SetorSelector({ setores, setorAtualId, onSelect }: Props) {
  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {setores.map((setor) => {
        const completo = setor.totalRespostas >= TOTAL_PERGUNTAS
        const ativo = setor.id === setorAtualId

        return (
          <button
            key={setor.id}
            type="button"
            onClick={() => onSelect(setor.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2
              ${ativo
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
              }
            `}
          >
            {setor.nome}
            {completo ? (
              <span className={`text-xs ${ativo ? 'text-blue-100' : 'text-green-600'}`}>✓</span>
            ) : (
              <span className={`text-xs ${ativo ? 'text-blue-100' : 'text-gray-400'}`}>
                {setor.totalRespostas}/{TOTAL_PERGUNTAS}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
