'use client'

import { useCallback, useState } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
}

interface Props {
  disabled: boolean
  onUpload: (file: File, label: string) => Promise<void>
}

export function DropZone({ disabled, onUpload }: Props) {
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [label, setLabel] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    setError(null)
    if (rejected.length > 0) {
      const code = rejected[0].errors[0].code
      if (code === 'file-too-large') setError('Arquivo muito grande. Máximo: 10MB')
      else if (code === 'file-invalid-type') setError('Tipo não permitido. Use: PDF, DOCX, XLSX, PNG, JPG')
      else setError(rejected[0].errors[0].message)
      return
    }
    if (accepted.length > 0) {
      setPendingFile(accepted[0])
      setLabel('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    disabled,
  })

  async function handleConfirm() {
    if (!pendingFile || label.trim().length < 3) return
    setUploading(true)
    setError(null)
    try {
      await onUpload(pendingFile, label.trim())
      setPendingFile(null)
      setLabel('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  function handleCancel() {
    setPendingFile(null)
    setLabel('')
    setError(null)
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-white'}
        `}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-2">📎</div>
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Solte o arquivo aqui</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium">Arraste um arquivo ou clique para selecionar</p>
            <p className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX, PNG, JPG — máx. 10MB</p>
          </>
        )}
        {disabled && (
          <p className="text-xs text-orange-500 mt-2 font-medium">Limite de 5 evidências atingido</p>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      {pendingFile && (
        <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-medium">Arquivo selecionado:</span> {pendingFile.name}{' '}
            <span className="text-gray-400">({Math.ceil(pendingFile.size / 1024)} KB)</span>
          </p>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label descritivo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder='Ex: "PGR 2024", "Relatório de Absenteísmo Q1 2025"'
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={uploading || label.trim().length < 3}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {uploading ? 'Enviando...' : 'Confirmar Upload'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={uploading}
              className="text-gray-600 hover:text-gray-800 text-sm px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
