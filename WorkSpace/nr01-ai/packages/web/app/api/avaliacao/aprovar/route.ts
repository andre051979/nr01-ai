import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const empresa = await prisma.empresa.findFirst({
    where: { usuarios: { some: { id: user.userId } } },
  })
  if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  const riscos = await prisma.risco.findMany({
    where: { setor: { empresaId: empresa.id } },
  })

  const incompletos = riscos.filter((r) => r.justificativa.trim().length < 20)
  if (incompletos.length > 0) {
    return NextResponse.json(
      { error: `${incompletos.length} risco(s) sem justificativa completa (mínimo 20 caracteres)` },
      { status: 422 }
    )
  }

  return NextResponse.json({ ok: true, total: riscos.length })
}
