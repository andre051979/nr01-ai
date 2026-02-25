import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

const criarSchema = z.object({
  riscoId: z.string().uuid(),
  whatAcao: z.string().min(10, 'Mínimo 10 caracteres'),
  whyJustif: z.string().min(10, 'Mínimo 10 caracteres'),
  whoResponsavel: z.string().min(3, 'Mínimo 3 caracteres'),
  whereLocal: z.string().optional(),
  whenPrazo: z.string().min(1, 'Prazo é obrigatório'),
  howExecucao: z.string().min(10, 'Mínimo 10 caracteres'),
  howMuchCusto: z.number().positive().optional().nullable(),
  status: z.enum(['nao_iniciado', 'em_andamento', 'concluido']).default('nao_iniciado'),
})

export async function GET(_request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const empresa = await prisma.empresa.findFirst({
    where: { usuarios: { some: { id: user.userId } } },
  })
  if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  const riscos = await prisma.risco.findMany({
    where: {
      setor: { empresaId: empresa.id },
      classificacao: { in: ['medio', 'alto'] },
    },
    include: {
      setor: { select: { nome: true } },
      planoAcao: { orderBy: { criadoEm: 'asc' } },
    },
    orderBy: [{ setor: { nome: 'asc' } }, { classificacao: 'asc' }],
  })

  return NextResponse.json(riscos)
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const parsed = criarSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { riscoId, whenPrazo, howMuchCusto, ...rest } = parsed.data

  // Validar ownership do risco
  const risco = await prisma.risco.findFirst({
    where: {
      id: riscoId,
      setor: { empresa: { usuarios: { some: { id: user.userId } } } },
    },
  })
  if (!risco) return NextResponse.json({ error: 'Risco não encontrado' }, { status: 404 })

  const plano = await prisma.planoAcao.create({
    data: {
      riscoId,
      whenPrazo: new Date(whenPrazo),
      howMuchCusto: howMuchCusto ?? null,
      ...rest,
    },
  })

  return NextResponse.json(plano, { status: 201 })
}
