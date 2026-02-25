import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  const relatorio = await prisma.relatorio.findFirst({
    where: { id, empresaId: user.empresaId },
    include: { empresa: { select: { nome: true, cnpj: true } } },
  })
  if (!relatorio || !relatorio.urlPdf)
    return NextResponse.json({ error: 'Relatório não encontrado' }, { status: 404 })

  const storagePath = relatorio.urlPdf.replace(/^relatorios\//, '')
  const { data, error } = await supabaseAdmin.storage
    .from('relatorios')
    .download(storagePath)

  if (error || !data)
    return NextResponse.json({ error: 'Erro ao baixar PDF' }, { status: 500 })

  const nomeEmpresa = relatorio.empresa.nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const dataStr = relatorio.geradoEm
    ? relatorio.geradoEm.toISOString().slice(0, 10)
    : relatorio.criadoEm.toISOString().slice(0, 10)
  const filename = `relatorio-nr01-${nomeEmpresa}-${dataStr}.pdf`

  const arrayBuffer = await data.arrayBuffer()

  return new NextResponse(arrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
