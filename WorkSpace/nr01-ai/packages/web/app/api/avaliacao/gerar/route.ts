import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import {
  calcularRiscosSetor,
  CATEGORIA_DESCRICAO,
} from '@/lib/calcular-riscos'

export async function POST() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const empresa = await prisma.empresa.findFirst({
    where: { usuarios: { some: { id: user.userId } } },
    include: { setores: true },
  })
  if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  if (empresa.setores.length === 0)
    return NextResponse.json({ error: 'Cadastre setores antes de gerar avaliação' }, { status: 422 })

  // Remove riscos anteriores para regenerar
  await prisma.risco.deleteMany({
    where: { setor: { empresaId: empresa.id } },
  })

  const novosRiscos = []

  for (const setor of empresa.setores) {
    const respostas = await prisma.respostaQuestionario.findMany({
      where: { setorId: setor.id },
      include: { pergunta: { select: { ordem: true } } },
    })

    if (respostas.length === 0) continue

    const respostasComOrdem = respostas.map((r) => ({
      valor: r.valor,
      ordem: r.pergunta.ordem,
    }))

    const resultados = calcularRiscosSetor(respostasComOrdem)

    for (const resultado of resultados) {
      if (resultado.classificacao === 'medio' || resultado.classificacao === 'alto') {
        const risco = await prisma.risco.create({
          data: {
            setorId: setor.id,
            descricao: CATEGORIA_DESCRICAO[resultado.categoria] ?? resultado.categoria,
            categoria: resultado.categoria,
            probabilidade: resultado.probabilidade,
            severidade: resultado.severidade,
            classificacao: resultado.classificacao,
            justificativa: '',
          },
        })
        novosRiscos.push(risco)
      }
    }
  }

  return NextResponse.json(novosRiscos, { status: 201 })
}
