import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

const updateSchema = z.object({
  whatAcao: z.string().min(10).optional(),
  whyJustif: z.string().min(10).optional(),
  whoResponsavel: z.string().min(3).optional(),
  whereLocal: z.string().optional().nullable(),
  whenPrazo: z.string().optional(),
  howExecucao: z.string().min(10).optional(),
  howMuchCusto: z.number().positive().optional().nullable(),
  status: z.enum(['nao_iniciado', 'em_andamento', 'concluido']).optional(),
})

async function verificarOwnership(id: string, userId: string) {
  return prisma.planoAcao.findFirst({
    where: {
      id,
      risco: { setor: { empresa: { usuarios: { some: { id: userId } } } } },
    },
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const existente = await verificarOwnership(id, user.userId)
  if (!existente) return NextResponse.json({ error: 'Ação não encontrada' }, { status: 404 })

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { whenPrazo, ...rest } = parsed.data

  const plano = await prisma.planoAcao.update({
    where: { id },
    data: {
      ...rest,
      ...(whenPrazo ? { whenPrazo: new Date(whenPrazo) } : {}),
      atualizadoEm: new Date(),
    },
  })

  return NextResponse.json(plano)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const existente = await verificarOwnership(id, user.userId)
  if (!existente) return NextResponse.json({ error: 'Ação não encontrada' }, { status: 404 })

  await prisma.planoAcao.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
