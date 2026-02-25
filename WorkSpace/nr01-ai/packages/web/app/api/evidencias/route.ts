import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
]
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 5
const BUCKET = 'evidencias'

export async function GET(_request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const empresa = await prisma.empresa.findFirst({
    where: { usuarios: { some: { id: user.userId } } },
  })
  if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  const evidencias = await prisma.evidencia.findMany({
    where: { empresaId: empresa.id },
    orderBy: { criadoEm: 'desc' },
  })

  const result = await Promise.all(
    evidencias.map(async (ev) => {
      const { data } = await supabaseAdmin.storage
        .from(BUCKET)
        .createSignedUrl(ev.urlArquivo, 3600)

      const nomeArquivo =
        ev.urlArquivo.split('/').pop()?.replace(/^\d+-/, '') ?? ev.urlArquivo

      return { ...ev, nomeArquivo, signedUrl: data?.signedUrl ?? '' }
    })
  )

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const empresa = await prisma.empresa.findFirst({
    where: { usuarios: { some: { id: user.userId } } },
    include: { _count: { select: { evidencias: true } } },
  })
  if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
  if (empresa._count.evidencias >= MAX_FILES) {
    return NextResponse.json({ error: 'Limite de 5 evidências atingido' }, { status: 422 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const label = formData.get('label') as string | null

  if (!file) return NextResponse.json({ error: 'Arquivo obrigatório' }, { status: 422 })
  if (!label || label.trim().length < 3)
    return NextResponse.json({ error: 'Label obrigatório (mínimo 3 caracteres)' }, { status: 422 })
  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ error: 'Tipo de arquivo não permitido' }, { status: 422 })
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: 'Arquivo muito grande (máx. 10MB)' }, { status: 422 })

  // Garante que o bucket existe (ignora erro se já existir)
  await supabaseAdmin.storage.createBucket(BUCKET, { public: false })

  const fileBuffer = Buffer.from(await file.arrayBuffer())
  const storagePath = `${empresa.id}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, { contentType: file.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: `Erro no upload: ${uploadError.message}` }, { status: 500 })
  }

  const evidencia = await prisma.evidencia.create({
    data: {
      empresaId: empresa.id,
      label: label.trim(),
      tipo: file.type,
      urlArquivo: storagePath,
      tamanhoKb: Math.ceil(file.size / 1024),
    },
  })

  return NextResponse.json(evidencia, { status: 201 })
}
