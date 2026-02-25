'use client'

import { useState } from 'react'

export interface Evidencia {
  id: string
  label: string
  tipo: string | null
  tamanhoKb: number | null
  criadoEm: string
  nomeArquivo: string
  signedUrl: string
}

const TIPO_ICONE: Record<string, string> = {
  'application/pdf': '📄',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'image/png': '🖼️',
  'image/jpeg': '🖼️',
}

interface Props {
  evidencias: Evidencia[]
  onRemover: (id: string) => Promise<void>
}

export function EvidenciaList({ evidencias, onRemover }: Props) {
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [removendo, setRemovendo] = useState<string | null>(null)

  async function handleRemover(id: string) {
    setRemovendo(id)
    try {
      await onRemover(id)
    } finally {
      setConfirmando(null)
      setRemovendo(null)
    }
  }

  if (evidencias.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        Nenhuma evidência enviada ainda. Evidências são opcionais para o MVP.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {evidencias.map((ev) => (
        <div
          key={ev.id}
          className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4"
        >
          <span className="text-2xl flex-shrink-0">
            {TIPO_ICONE[ev.tipo ?? ''] ?? '📁'}
          </span>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{ev.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {ev.nomeArquivo}
              {ev.tamanhoKb ? ` · ${ev.tamanhoKb} KB` : ''}
              {' · '}
              {new Date(ev.criadoEm).toLocaleDateString('pt-BR')}
            </p>
          </div>

          <a
            href={ev.signedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex-shrink-0"
          >
            Ver
          </a>

          {confirmando === ev.id ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-red-600">Confirmar exclusão?</span>
              <button
                type="button"
                onClick={() => handleRemover(ev.id)}
                disabled={removendo === ev.id}
                className="text-xs text-red-600 font-medium hover:text-red-800 disabled:opacity-50"
              >
                {removendo === ev.id ? 'Removendo...' : 'Sim'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmando(null)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Não
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmando(ev.id)}
              className="text-gray-400 hover:text-red-600 transition-colors text-lg flex-shrink-0"
              title="Remover evidência"
            >
              🗑️
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
