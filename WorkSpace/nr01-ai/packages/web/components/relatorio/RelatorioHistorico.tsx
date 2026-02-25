'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface RelatorioItem {
  id: string
  versao: string
  responsavel: string
  status: string
  geradoEm: string | null
  criadoEm: string
  urlAssinada: string | null
}

interface Props {
  relatorios: RelatorioItem[]
  onArquivar: (id: string) => Promise<void>
  onDownload: (id: string) => void
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'gerado') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded-full border border-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Gerado
      </span>
    )
  }
  if (status === 'arquivado') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        Arquivado
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-50 text-gray-600 rounded-full border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Rascunho
    </span>
  )
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  try { return format(new Date(dateStr), 'dd/MM/yyyy HH:mm', { locale: ptBR }) } catch { return dateStr }
}

export function RelatorioHistorico({ relatorios, onArquivar, onDownload }: Props) {
  if (relatorios.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-8">Nenhum relatório gerado ainda.</p>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Versão</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Responsável</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Gerado em</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-600">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {relatorios.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800">v{r.versao}</td>
              <td className="px-4 py-3 text-gray-600">{r.responsavel}</td>
              <td className="px-4 py-3 text-gray-500">{formatDate(r.geradoEm ?? r.criadoEm)}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  {r.urlAssinada && (
                    <button
                      type="button"
                      onClick={() => onDownload(r.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Baixar PDF
                    </button>
                  )}
                  {r.status === 'gerado' && (
                    <button
                      type="button"
                      onClick={() => onArquivar(r.id)}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Arquivar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
