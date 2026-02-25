'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { RelatorioHistorico, type RelatorioItem } from '@/components/relatorio/RelatorioHistorico'

const metaSchema = z.object({
  responsavel: z.string().min(3, 'Mínimo 3 caracteres'),
  versao: z.string().min(1, 'Versão obrigatória'),
})
type MetaFormData = z.infer<typeof metaSchema>

export default function RelatorioPage() {
  const [relatorios, setRelatorios] = useState<RelatorioItem[]>([])
  const [carregando, setCarregando] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [arquivandoId, setArquivandoId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MetaFormData>({
    resolver: zodResolver(metaSchema),
    defaultValues: { versao: '1.0' },
  })

  async function carregarRelatorios() {
    const res = await fetch('/api/relatorio')
    if (res.ok) setRelatorios(await res.json())
    setCarregando(false)
  }

  useEffect(() => { carregarRelatorios() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGerar(data: MetaFormData) {
    setGerando(true)
    setErro(null)
    setPreviewUrl(null)

    const res = await fetch('/api/relatorio/gerar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json()
      setErro(body.error ?? 'Erro ao gerar relatório')
      setGerando(false)
      return
    }

    const { relatorio, urlAssinada, nomeArquivo } = await res.json()
    if (urlAssinada) setPreviewUrl(urlAssinada)

    setRelatorios((prev) => [
      { ...relatorio, urlAssinada, nomeArquivo },
      ...prev,
    ])
    setGerando(false)
  }

  async function handleArquivar(id: string) {
    setArquivandoId(id)
    const res = await fetch(`/api/relatorio/${id}/arquivar`, { method: 'PUT' })
    if (res.ok) {
      const atualizado = await res.json()
      setRelatorios((prev) => prev.map((r) => (r.id === id ? { ...r, ...atualizado } : r)))
      if (previewUrl) setPreviewUrl(null)
    } else {
      setErro('Erro ao arquivar relatório')
    }
    setArquivandoId(null)
  }

  function handleDownload(id: string) {
    window.location.href = `/api/relatorio/${id}/download`
  }

  if (carregando) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-40 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  const relatorioAtivo = relatorios.find((r) => r.status === 'gerado')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Relatório Final</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gere o documento formal de diagnóstico de riscos psicossociais conforme NR-01.
        </p>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          {erro}
          <button type="button" onClick={() => setErro(null)} className="ml-2 underline text-xs">fechar</button>
        </div>
      )}

      {/* Formulário de metadados */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Metadados do Relatório</h2>
        <form onSubmit={handleSubmit(handleGerar)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Responsável Técnico <span className="text-red-500">*</span>
              </label>
              <input
                {...register('responsavel')}
                type="text"
                placeholder="Nome do responsável pela avaliação"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.responsavel && (
                <p className="text-red-500 text-xs mt-1">{errors.responsavel.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Versão do Documento
              </label>
              <input
                {...register('versao')}
                type="text"
                placeholder="1.0"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.versao && (
                <p className="text-red-500 text-xs mt-1">{errors.versao.message}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={gerando}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              {gerando ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Gerando PDF...
                </>
              ) : (
                'Gerar Relatório'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Preview do PDF */}
      {previewUrl && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Preview do PDF</h2>
            <div className="flex gap-2">
              {relatorioAtivo && (
                <>
                  <button
                    type="button"
                    onClick={() => handleDownload(relatorioAtivo.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded-lg text-sm transition-colors"
                  >
                    Exportar PDF ↓
                  </button>
                  <button
                    type="button"
                    disabled={arquivandoId === relatorioAtivo.id}
                    onClick={() => handleArquivar(relatorioAtivo.id)}
                    className="border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 font-medium py-1.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    Arquivar
                  </button>
                </>
              )}
            </div>
          </div>
          <iframe
            src={previewUrl}
            className="w-full rounded-lg border border-gray-200"
            style={{ height: '70vh' }}
            title="Preview do Relatório PDF"
          />
        </div>
      )}

      {/* Histórico de relatórios */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Histórico de Relatórios</h2>
        <RelatorioHistorico
          relatorios={relatorios}
          onArquivar={handleArquivar}
          onDownload={handleDownload}
        />
      </div>
    </div>
  )
}
