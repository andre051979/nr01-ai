import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  const evidencia = await prisma.evidencia.findFirst({
    where: {
      id,
      empresa: { usuarios: { some: { id: user.userId } } },
    },
  })
  if (!evidencia) return NextResponse.json({ error: 'Evidência não encontrada' }, { status: 404 })

  await supabaseAdmin.storage.from('evidencias').remove([evidencia.urlArquivo])
  await prisma.evidencia.delete({ where: { id: evidencia.id } })

  return NextResponse.json({ ok: true })
}
