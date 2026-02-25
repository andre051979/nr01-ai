'use client'

import { useFieldArray, Control, FieldErrors } from 'react-hook-form'
import { EmpresaFormData } from './EmpresaForm'

interface Props {
  control: Control<EmpresaFormData>
  errors: FieldErrors<EmpresaFormData>
}

export function SetorList({ control, errors }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: 'setores' })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Setores</h3>
        <button
          type="button"
          onClick={() => append({ nome: '', numFunc: undefined })}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          + Adicionar Setor
        </button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2 items-start">
          <div className="flex-1">
            <input
              {...control.register(`setores.${index}.nome`)}
              placeholder="Nome do setor"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.setores?.[index]?.nome && (
              <p className="text-xs text-red-600 mt-1">
                {errors.setores[index]?.nome?.message}
              </p>
            )}
          </div>

          <div className="w-32">
            <input
              type="number"
              {...control.register(`setores.${index}.numFunc`, { valueAsNumber: true })}
              placeholder="Nº func."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={() => remove(index)}
            disabled={fields.length === 1}
            className="mt-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Remover setor"
          >
            ✕
          </button>
        </div>
      ))}

      {errors.setores?.root && (
        <p className="text-xs text-red-600">{errors.setores.root.message}</p>
      )}
      {typeof errors.setores?.message === 'string' && (
        <p className="text-xs text-red-600">{errors.setores.message}</p>
      )}
    </div>
  )
}
