'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PlanoAcaoForm, type PlanoFormData } from './PlanoAcaoForm'

const CLASSIF_BADGE: Record<string, string> = {
  alto:  'bg-red-100 text-red-800 border border-red-200',
  medio: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
}

const STATUS_BADGE: Record<string, string> = {
  nao_iniciado: 'bg-gray-100 text-gray-600',
  em_andamento: 'bg-blue-100 text-blue-700',
  concluido:    'bg-green-100 text-green-700',
}

const STATUS_LABEL: Record<string, string> = {
  nao_iniciado: 'Não iniciado',
  em_andamento: 'Em andamento',
  concluido:    'Concluído',
}

interface PlanoAcao {
  id: string
  whatAcao: string
  whyJustif: string
  whoResponsavel: string
  whereLocal: string | null
  whenPrazo: string
  howExecucao: string
  howMuchCusto: string | null
  status: string
}

export interface RiscoComPlanos {
  id: string
  descricao: string
  categoria: string | null
  probabilidade: string
  severidade: string
  classificacao: string
  setor: { nome: string }
  planoAcao: PlanoAcao[]
}

interface Props {
  risco: RiscoComPlanos
  onAddAcao: (riscoId: string, data: PlanoFormData) => Promise<void>
  onUpdateAcao: (id: string, data: PlanoFormData) => Promise<void>
  onDeleteAcao: (id: string) => Promise<void>
}

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function RiscoPlanoCard({ risco, onAddAcao, onUpdateAcao, onDeleteAcao }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null)
  const [removendo, setRemovendo] = useState<string | null>(null)

  const semAcoes = risco.planoAcao.length === 0

  async function handleAdd(data: PlanoFormData) {
    await onAddAcao(risco.id, data)
    setShowForm(false)
  }

  async function handleUpdate(id: string, data: PlanoFormData) {
    await onUpdateAcao(id, data)
    setEditandoId(null)
  }

  async function handleDelete(id: string) {
    setRemovendo(id)
    await onDeleteAcao(id)
    setConfirmandoId(null)
    setRemovendo(null)
  }

  function toFormDefaults(plano: PlanoAcao): Partial<PlanoFormData> {
    return {
      whatAcao: plano.whatAcao,
      whyJustif: plano.whyJustif,
      whoResponsavel: plano.whoResponsavel,
      whereLocal: plano.whereLocal ?? '',
      whenPrazo: plano.whenPrazo.slice(0, 10),
      howExecucao: plano.howExecucao,
      howMuchCusto: plano.howMuchCusto ? Number(plano.howMuchCusto) : undefined,
      status: plano.status as PlanoFormData['status'],
    }
  }

  return (
    <div className={`bg-white rounded-2xl border-2 p-5 ${semAcoes ? 'border-orange-200' : 'border-gray-100'}`}>
      {/* Header do risco */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CLASSIF_BADGE[risco.classificacao] ?? ''}`}>
              {risco.classificacao === 'alto' ? 'Alto' : 'Médio'}
            </span>
            <span className="text-xs text-gray-400">{risco.setor.nome}</span>
          </div>
          <p className="text-sm font-semibold text-gray-800">{risco.descricao}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Probabilidade: {risco.probabilidade} · Severidade: {risco.severidade}
          </p>
        </div>
        {semAcoes && (
          <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-lg flex-shrink-0">
            ⚠ Sem ações
          </span>
        )}
      </div>

      {/* Lista de ações */}
      {risco.planoAcao.map((plano) => (
        <div key={plano.id} className="mb-3">
          {editandoId === plano.id ? (
            <PlanoAcaoForm
              defaultValues={toFormDefaults(plano)}
              onSubmit={(data) => handleUpdate(plano.id, data)}
              onCancel={() => setEditandoId(null)}
            />
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-medium text-gray-800 flex-1">{plano.whatAcao}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[plano.status] ?? ''}`}>
                    {STATUS_LABEL[plano.status] ?? plano.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditandoId(plano.id)}
                    className="text-gray-400 hover:text-blue-600 text-xs transition-colors"
                  >
                    ✏️
                  </button>
                  {confirmandoId === plano.id ? (
                    <>
                      <span className="text-xs text-red-600">Remover?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(plano.id)}
                        disabled={removendo === plano.id}
                        className="text-xs text-red-600 font-medium hover:text-red-800 disabled:opacity-50"
                      >
                        {removendo === plano.id ? '...' : 'Sim'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmandoId(null)}
                        className="text-xs text-gray-500"
                      >
                        Não
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmandoId(plano.id)}
                      className="text-gray-400 hover:text-red-600 text-xs transition-colors"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                <span>👤 {plano.whoResponsavel}</span>
                <span>📅 {formatDate(plano.whenPrazo)}</span>
                {plano.whereLocal && <span>📍 {plano.whereLocal}</span>}
                {plano.howMuchCusto && (
                  <span>💰 R$ {Number(plano.howMuchCusto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Formulário de nova ação */}
      {showForm && (
        <div className="mt-3">
          <PlanoAcaoForm
            onSubmit={handleAdd}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Botão adicionar */}
      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
        >
          + Adicionar Ação
        </button>
      )}
    </div>
  )
}
