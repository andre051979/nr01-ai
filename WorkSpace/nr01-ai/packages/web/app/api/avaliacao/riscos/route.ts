import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const empresa = await prisma.empresa.findFirst({
    where: { usuarios: { some: { id: user.userId } } },
  })
  if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  const riscos = await prisma.risco.findMany({
    where: { setor: { empresaId: empresa.id } },
    include: { setor: { select: { nome: true } } },
    orderBy: [{ setor: { nome: 'asc' } }, { categoria: 'asc' }],
  })

  return NextResponse.json(riscos)
}
