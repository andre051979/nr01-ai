'use client'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'nao_iniciado', label: 'Não iniciado' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluido',    label: 'Concluído' },
]

const CLASSIF_OPTIONS = [
  { value: '',      label: 'Todas as classificações' },
  { value: 'alto',  label: 'Alto' },
  { value: 'medio', label: 'Médio' },
]

interface Props {
  setores: string[]
  filtroSetor: string
  filtroClassificacao: string
  filtroStatus: string
  onChange: (key: 'setor' | 'classificacao' | 'status', value: string) => void
}

export function FiltrosPlano({ setores, filtroSetor, filtroClassificacao, filtroStatus, onChange }: Props) {
  const temFiltro = filtroSetor || filtroClassificacao || filtroStatus

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex flex-wrap items-center gap-3">
      <select
        value={filtroSetor}
        onChange={(e) => onChange('setor', e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos os setores</option>
        {setores.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={filtroClassificacao}
        onChange={(e) => onChange('classificacao', e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {CLASSIF_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <select
        value={filtroStatus}
        onChange={(e) => onChange('status', e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {temFiltro && (
        <button
          type="button"
          onClick={() => { onChange('setor', ''); onChange('classificacao', ''); onChange('status', '') }}
          className="text-sm text-blue-600 hover:text-blue-800 ml-auto"
        >
          Limpar filtros ×
        </button>
      )}
    </div>
  )
}
