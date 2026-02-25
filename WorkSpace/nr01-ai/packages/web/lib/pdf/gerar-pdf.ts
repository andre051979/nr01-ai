import React from 'react'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { RelatorioDocument, type RelatorioDados } from './template'

export type { RelatorioDados }

export async function gerarPDF(dados: RelatorioDados): Promise<Buffer> {
  const element = React.createElement(RelatorioDocument, { dados }) as React.ReactElement<DocumentProps>
  const pdfBytes = await renderToBuffer(element)
  return Buffer.from(pdfBytes)
}
