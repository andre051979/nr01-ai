import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const perguntas = await prisma.pergunta.findMany({
    where: { ativo: true },
    orderBy: { ordem: 'asc' },
  })

  return NextResponse.json(perguntas)
}
