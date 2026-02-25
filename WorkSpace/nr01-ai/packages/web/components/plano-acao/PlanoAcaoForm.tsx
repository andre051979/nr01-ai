'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Schema para react-hook-form (todos strings)
const rawSchema = z.object({
  whatAcao:       z.string().min(10, 'Mínimo 10 caracteres'),
  whyJustif:      z.string().min(10, 'Mínimo 10 caracteres'),
  whoResponsavel: z.string().min(3, 'Mínimo 3 caracteres'),
  whereLocal:     z.string().optional(),
  whenPrazo:      z.string().min(1, 'Prazo é obrigatório'),
  howExecucao:    z.string().min(10, 'Mínimo 10 caracteres'),
  howMuchCusto:   z.string().optional(),
  status:         z.enum(['nao_iniciado', 'em_andamento', 'concluido']),
})

type RawFormValues = z.infer<typeof rawSchema>

// Tipo exportado com howMuchCusto já convertido para number
export type PlanoFormData = {
  whatAcao: string
  whyJustif: string
  whoResponsavel: string
  whereLocal?: string
  whenPrazo: string
  howExecucao: string
  howMuchCusto?: number
  status: 'nao_iniciado' | 'em_andamento' | 'concluido'
}

const STATUS_OPTIONS = [
  { value: 'nao_iniciado', label: 'Não iniciado' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluido',    label: 'Concluído' },
]

interface Props {
  defaultValues?: Partial<PlanoFormData>
  onSubmit: (data: PlanoFormData) => Promise<void>
  onCancel: () => void
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-red-500 text-xs mt-1">{message}</p>
}

export function PlanoAcaoForm({ defaultValues, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RawFormValues>({
    resolver: zodResolver(rawSchema),
    defaultValues: {
      status: 'nao_iniciado',
      ...defaultValues,
      howMuchCusto: defaultValues?.howMuchCusto != null
        ? String(defaultValues.howMuchCusto)
        : '',
    },
  })

  async function submitHandler(raw: RawFormValues) {
    const data: PlanoFormData = {
      ...raw,
      howMuchCusto: raw.howMuchCusto ? Number(raw.howMuchCusto) : undefined,
    }
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4 bg-gray-50 rounded-xl p-5 border border-gray-200">
      {/* WHAT + WHY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            What — O que será feito? <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('whatAcao')}
            rows={3}
            placeholder="Descreva a ação a ser tomada..."
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <FieldError message={errors.whatAcao?.message} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            Why — Por que será feito? <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('whyJustif')}
            rows={3}
            placeholder="Justifique a necessidade desta ação..."
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <FieldError message={errors.whyJustif?.message} />
        </div>
      </div>

      {/* WHO + WHERE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            Who — Responsável <span className="text-red-500">*</span>
          </label>
          <input
            {...register('whoResponsavel')}
            type="text"
            placeholder="Nome do responsável"
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FieldError message={errors.whoResponsavel?.message} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            Where — Área/Local
          </label>
          <input
            {...register('whereLocal')}
            type="text"
            placeholder="Departamento ou local (opcional)"
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* WHEN + HOW MUCH */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            When — Prazo <span className="text-red-500">*</span>
          </label>
          <input
            {...register('whenPrazo')}
            type="date"
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FieldError message={errors.whenPrazo?.message} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            How Much — Custo estimado (R$)
          </label>
          <input
            {...register('howMuchCusto')}
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00 (opcional)"
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FieldError message={errors.howMuchCusto?.message} />
        </div>
      </div>

      {/* HOW */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
          How — Como será executado? <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('howExecucao')}
          rows={3}
          placeholder="Descreva como a ação será executada..."
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <FieldError message={errors.howExecucao?.message} />
      </div>

      {/* Status */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
          Status
        </label>
        <select
          {...register('status')}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar Ação'}
        </button>
      </div>
    </form>
  )
}
