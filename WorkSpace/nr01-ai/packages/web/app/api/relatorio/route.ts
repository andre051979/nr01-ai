import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(_request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const relatorios = await prisma.relatorio.findMany({
    where: { empresaId: user.empresaId },
    orderBy: { criadoEm: 'desc' },
  })

  // Gera URL assinada (24h) para cada relatório com PDF
  const relatoriosComUrl = await Promise.all(
    relatorios.map(async (r) => {
      let urlAssinada: string | null = null
      if (r.urlPdf) {
        const path = r.urlPdf.replace(/^relatorios\//, '')
        const { data } = await supabaseAdmin.storage
          .from('relatorios')
          .createSignedUrl(path, 60 * 60 * 24)
        urlAssinada = data?.signedUrl ?? null
      }
      return { ...r, urlAssinada }
    })
  )

  return NextResponse.json(relatoriosComUrl)
}
