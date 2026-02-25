'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DiagnosticoStepper } from '@/components/diagnostico/DiagnosticoStepper'
import { DropZone } from '@/components/evidencias/DropZone'
import { EvidenciaList, Evidencia } from '@/components/evidencias/EvidenciaList'

const MAX_FILES = 5

export default function EvidenciasPage() {
  const router = useRouter()
  const [evidencias, setEvidencias] = useState<Evidencia[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  async function carregarEvidencias() {
    const res = await fetch('/api/evidencias')
    if (!res.ok) { router.push('/diagnostico'); return }
    const data = await res.json()
    setEvidencias(data)
    setCarregando(false)
  }

  useEffect(() => { carregarEvidencias() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUpload(file: File, label: string) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('label', label)

    const res = await fetch('/api/evidencias', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) throw new Error(data.error ?? 'Erro ao fazer upload')
    setErro(null)
    await carregarEvidencias()
  }

  async function handleRemover(id: string) {
    const res = await fetch(`/api/evidencias/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setErro(data.error ?? 'Erro ao remover evidência')
      return
    }
    setEvidencias((prev) => prev.filter((ev) => ev.id !== id))
  }

  const atingiuLimite = evidencias.length >= MAX_FILES

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
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Evidências Documentais</h1>
      <p className="text-sm text-gray-500 mb-8">
        Anexe documentos que embasam o diagnóstico (PGR, relatórios, indicadores). Opcional para o MVP.
      </p>

      <DiagnosticoStepper currentStep={2} empresaSalva={true} />

      {/* Contador */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Evidências enviadas</p>
          <p className="text-xs text-gray-500 mt-0.5">{evidencias.length} de {MAX_FILES} arquivos</p>
        </div>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${(evidencias.length / MAX_FILES) * 100}%` }}
          />
        </div>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Adicionar Evidência</h2>
        <DropZone disabled={atingiuLimite} onUpload={handleUpload} />
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Evidências Enviadas</h2>
        {erro && (
          <p className="text-red-600 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">{erro}</p>
        )}
        <EvidenciaList evidencias={evidencias} onRemover={handleRemover} />
      </div>

      {/* Botão concluir */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => router.push('/avaliacao')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors"
        >
          Concluir Diagnóstico →
        </button>
      </div>
    </div>
  )
}
