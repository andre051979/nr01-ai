import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { validarCNPJ } from '@/lib/cnpj'

const setorSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(2, 'Nome muito curto').max(100),
  numFunc: z.number().int().positive().optional().nullable(),
})

const empresaSchema = z.object({
  nome: z.string().min(2).max(255),
  cnpj: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length === 14, 'CNPJ deve ter 14 dígitos')
    .refine(validarCNPJ, 'CNPJ inválido'),
  numFunc: z.number().int().positive('Deve ser positivo'),
  setores: z.array(setorSchema).min(1, 'Adicione pelo menos 1 setor'),
})

export async function GET(_request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const empresa = await prisma.empresa.findFirst({
    where: { usuarios: { some: { id: user.userId } } },
    include: { setores: { orderBy: { criadoEm: 'asc' } } },
  })

  if (!empresa) return NextResponse.json(null)
  return NextResponse.json(empresa)
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const parsed = empresaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { nome, cnpj, numFunc, setores } = parsed.data

  const result = await prisma.$transaction(async (tx) => {
    const empresa = await tx.empresa.create({
      data: { nome, cnpj, numFunc },
    })

    await tx.setor.createMany({
      data: setores.map((s) => ({
        nome: s.nome,
        numFunc: s.numFunc ?? null,
        empresaId: empresa.id,
      })),
    })

    await tx.usuario.update({
      where: { id: user.userId },
      data: { empresaId: empresa.id },
    })

    return tx.empresa.findUnique({
      where: { id: empresa.id },
      include: { setores: true },
    })
  })

  return NextResponse.json(result, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const parsed = empresaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { nome, cnpj, numFunc, setores } = parsed.data

  const empresa = await prisma.empresa.findFirst({
    where: { usuarios: { some: { id: user.userId } } },
  })
  if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  const result = await prisma.$transaction(async (tx) => {
    await tx.empresa.update({
      where: { id: empresa.id },
      data: { nome, cnpj, numFunc },
    })

    // Remove setores antigos e recria
    await tx.setor.deleteMany({ where: { empresaId: empresa.id } })
    await tx.setor.createMany({
      data: setores.map((s) => ({
        nome: s.nome,
        numFunc: s.numFunc ?? null,
        empresaId: empresa.id,
      })),
    })

    return tx.empresa.findUnique({
      where: { id: empresa.id },
      include: { setores: true },
    })
  })

  return NextResponse.json(result)
}
