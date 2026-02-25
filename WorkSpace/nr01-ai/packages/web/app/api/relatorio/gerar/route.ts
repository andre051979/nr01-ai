import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { gerarPDF } from '@/lib/pdf/gerar-pdf'
import type { RelatorioDados, RiscoPDF, PlanoAcaoPDF } from '@/lib/pdf/template'
import { format } from 'date-fns'

const schema = z.object({
  responsavel: z.string().min(3, 'Mínimo 3 caracteres'),
  versao: z.string().min(1).default('1.0'),
})

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { responsavel, versao } = parsed.data

  // Busca dados da empresa
  const empresa = await prisma.empresa.findFirst({
    where: { id: user.empresaId },
  })
  if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  // Busca riscos com planos de ação
  const riscosBD = await prisma.risco.findMany({
    where: { setor: { empresaId: empresa.id } },
    include: {
      setor: { select: { nome: true } },
      planoAcao: { orderBy: { criadoEm: 'asc' } },
    },
    orderBy: [{ classificacao: 'asc' }, { setor: { nome: 'asc' } }],
  })

  // Busca evidências
  const evidenciasBD = await prisma.evidencia.findMany({
    where: { empresaId: empresa.id },
    orderBy: { criadoEm: 'asc' },
  })

  // Monta RelatorioDados
  const riscosBaixo = riscosBD.filter((r) => r.classificacao === 'baixo').length
  const riscosMedio = riscosBD.filter((r) => r.classificacao === 'medio').length
  const riscosAlto  = riscosBD.filter((r) => r.classificacao === 'alto').length

  const todasAcoes = riscosBD.flatMap((r) => r.planoAcao)
  const acoesNaoIniciadas = todasAcoes.filter((a) => a.status === 'nao_iniciado').length
  const acoesEmAndamento  = todasAcoes.filter((a) => a.status === 'em_andamento').length
  const acoesConcluidas   = todasAcoes.filter((a) => a.status === 'concluido').length

  const dataGeracao = new Date().toISOString()

  const riscosPDF: RiscoPDF[] = riscosBD.map((r) => ({
    setor:         r.setor.nome,
    descricao:     r.descricao,
    probabilidade: r.probabilidade,
    severidade:    r.severidade,
    classificacao: r.classificacao,
    justificativa: r.justificativa,
    planos: r.planoAcao.map((p): PlanoAcaoPDF => ({
      whatAcao:       p.whatAcao,
      whyJustif:      p.whyJustif,
      whoResponsavel: p.whoResponsavel,
      whereLocal:     p.whereLocal ?? null,
      whenPrazo:      p.whenPrazo.toISOString(),
      howExecucao:    p.howExecucao,
      howMuchCusto:   p.howMuchCusto ? p.howMuchCusto.toString() : null,
      status:         p.status,
    })),
  }))

  const dados: RelatorioDados = {
    empresa: { nome: empresa.nome, cnpj: empresa.cnpj, numFunc: empresa.numFunc },
    responsavel,
    versao,
    dataGeracao,
    resumo: {
      totalRiscos: riscosBD.length,
      riscosBaixo,
      riscosMedio,
      riscosAlto,
      acoesNaoIniciadas,
      acoesEmAndamento,
      acoesConcluidas,
    },
    riscos: riscosPDF,
    evidencias: evidenciasBD.map((ev) => ({
      label:    ev.label,
      tipo:     ev.tipo,
      criadoEm: ev.criadoEm.toISOString(),
    })),
  }

  // Gera PDF
  const pdfBuffer = await gerarPDF(dados)

  // Upload para Supabase Storage
  const nomeArquivo = `${empresa.cnpj}-${format(new Date(), 'yyyy-MM-dd-HHmm')}-v${versao}.pdf`
  const storagePath = `${empresa.id}/${nomeArquivo}`

  // Cria bucket se não existir
  const { data: buckets } = await supabaseAdmin.storage.listBuckets()
  if (!buckets?.find((b) => b.name === 'relatorios')) {
    await supabaseAdmin.storage.createBucket('relatorios', { public: false })
  }

  const { error: uploadError } = await supabaseAdmin.storage
    .from('relatorios')
    .upload(storagePath, pdfBuffer, { contentType: 'application/pdf', upsert: false })

  if (uploadError)
    return NextResponse.json({ error: 'Erro ao salvar PDF' }, { status: 500 })

  // Cria registro no banco
  const relatorio = await prisma.relatorio.create({
    data: {
      empresaId:   empresa.id,
      responsavel,
      versao,
      urlPdf:      `relatorios/${storagePath}`,
      status:      'gerado',
      geradoEm:    new Date(dataGeracao),
    },
  })

  // URL assinada (24h)
  const { data: signedData } = await supabaseAdmin.storage
    .from('relatorios')
    .createSignedUrl(storagePath, 60 * 60 * 24)

  return NextResponse.json(
    { relatorio, urlAssinada: signedData?.signedUrl ?? null, nomeArquivo },
    { status: 201 }
  )
}
