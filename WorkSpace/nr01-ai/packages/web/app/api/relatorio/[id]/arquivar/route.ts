import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  const relatorio = await prisma.relatorio.findFirst({
    where: { id, empresaId: user.empresaId },
  })
  if (!relatorio) return NextResponse.json({ error: 'Relatório não encontrado' }, { status: 404 })
  if (relatorio.status === 'arquivado')
    return NextResponse.json({ error: 'Relatório já arquivado' }, { status: 409 })

  const atualizado = await prisma.relatorio.update({
    where: { id },
    data: { status: 'arquivado' },
  })

  return NextResponse.json(atualizado)
}
