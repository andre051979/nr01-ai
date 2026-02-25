import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { calcularClassificacao } from '@/lib/calcular-riscos'

const updateSchema = z.object({
  probabilidade: z.enum(['baixa', 'media', 'alta']),
  severidade: z.enum(['baixa', 'media', 'alta']),
  justificativa: z.string(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { probabilidade, severidade, justificativa } = parsed.data

  // Verificar ownership
  const existente = await prisma.risco.findFirst({
    where: {
      id,
      setor: { empresa: { usuarios: { some: { id: user.userId } } } },
    },
  })
  if (!existente) return NextResponse.json({ error: 'Risco não encontrado' }, { status: 404 })

  const classificacao = calcularClassificacao(probabilidade, severidade)

  const risco = await prisma.risco.update({
    where: { id },
    data: { probabilidade, severidade, classificacao, justificativa },
    include: { setor: { select: { nome: true } } },
  })

  return NextResponse.json(risco)
}
