'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { SetorList } from './SetorList'
import { validarCNPJ, formatarCNPJ } from '@/lib/cnpj'

const setorSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(2, 'Nome muito curto').max(100),
  numFunc: z.number().int().positive().optional().nullable(),
})

const empresaSchema = z.object({
  nome: z.string().min(2, 'Nome muito curto').max(255),
  cnpj: z
    .string()
    .min(1, 'CNPJ obrigatório')
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length === 14, 'CNPJ deve ter 14 dígitos')
    .refine(validarCNPJ, 'CNPJ inválido'),
  numFunc: z
    .number()
    .int()
    .positive('Deve ser positivo'),
  setores: z.array(setorSchema).min(1, 'Adicione pelo menos 1 setor'),
})

export type EmpresaFormData = z.infer<typeof empresaSchema>

export function EmpresaForm() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [cnpjDisplay, setCnpjDisplay] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: { setores: [{ nome: '', numFunc: undefined }] },
  })

  // AC8: carregar dados existentes
  useEffect(() => {
    async function carregar() {
      const res = await fetch('/api/empresa')
      if (!res.ok) return
      const data = await res.json()
      if (!data) return

      setIsEditing(true)
      setValue('nome', data.nome)
      setValue('cnpj', data.cnpj)
      setCnpjDisplay(formatarCNPJ(data.cnpj))
      setValue('numFunc', data.numFunc)
      setValue(
        'setores',
        data.setores.map((s: { id: string; nome: string; numFunc: number | null }) => ({
          id: s.id,
          nome: s.nome,
          numFunc: s.numFunc ?? undefined,
        }))
      )
    }
    carregar()
  }, [setValue])

  async function onSubmit(data: EmpresaFormData) {
    setSucesso(false)
    const method = isEditing ? 'PUT' : 'POST'
    const res = await fetch('/api/empresa', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json()
      if (body?.error?.fieldErrors?.cnpj) {
        setError('cnpj', { message: body.error.fieldErrors.cnpj[0] })
      }
      return
    }

    setSucesso(true)
    setIsEditing(true)
    router.push('/diagnostico/questionario')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isEditing && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700">
          Editando dados existentes da empresa
        </div>
      )}

      {sucesso && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
          Dados salvos com sucesso!
        </div>
      )}

      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome da Empresa <span className="text-red-500">*</span>
        </label>
        <input
          {...register('nome')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Razão social"
        />
        {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome.message}</p>}
      </div>

      {/* CNPJ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CNPJ <span className="text-red-500">*</span>
        </label>
        <input
          value={cnpjDisplay}
          onChange={(e) => {
            const formatted = formatarCNPJ(e.target.value)
            setCnpjDisplay(formatted)
            setValue('cnpj', formatted, { shouldValidate: true })
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="XX.XXX.XXX/XXXX-XX"
          maxLength={18}
        />
        {errors.cnpj && <p className="text-xs text-red-600 mt-1">{errors.cnpj.message}</p>}
      </div>

      {/* Número de funcionários */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Número de Funcionários <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          {...register('numFunc', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Total de colaboradores"
          min={1}
        />
        {errors.numFunc && <p className="text-xs text-red-600 mt-1">{errors.numFunc.message}</p>}
      </div>

      {/* Setores */}
      <SetorList control={control} errors={errors} />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Salvando...
          </>
        ) : (
          'Salvar e Continuar →'
        )}
      </button>
    </form>
  )
}
