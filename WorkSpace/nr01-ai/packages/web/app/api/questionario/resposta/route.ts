import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

const respostaSchema = z.object({
  setorId: z.string().uuid(),
  perguntaId: z.string().uuid(),
  valor: z.number().int().min(1).max(5),
})

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const parsed = respostaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { setorId, perguntaId, valor } = parsed.data

  // Validar que o setor pertence à empresa do usuário
  const setor = await prisma.setor.findFirst({
    where: {
      id: setorId,
      empresa: { usuarios: { some: { id: user.userId } } },
    },
  })
  if (!setor) return NextResponse.json({ error: 'Setor não encontrado' }, { status: 404 })

  const resposta = await prisma.respostaQuestionario.upsert({
    where: { setorId_perguntaId: { setorId, perguntaId } },
    update: { valor },
    create: { setorId, perguntaId, valor },
  })

  return NextResponse.json(resposta)
}
