import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const setorId = request.nextUrl.searchParams.get('setorId')
  if (!setorId) return NextResponse.json({ error: 'setorId obrigatório' }, { status: 400 })

  // Validar que o setor pertence à empresa do usuário
  const setor = await prisma.setor.findFirst({
    where: {
      id: setorId,
      empresa: { usuarios: { some: { id: user.userId } } },
    },
  })
  if (!setor) return NextResponse.json({ error: 'Setor não encontrado' }, { status: 404 })

  const respostas = await prisma.respostaQuestionario.findMany({
    where: { setorId },
  })

  return NextResponse.json(respostas)
}
