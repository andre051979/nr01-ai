import { PrismaClient } from '../lib/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const perguntas = [
  // Organização do Trabalho
  {
    categoria: 'organizacao_trabalho',
    ordem: 1,
    texto: 'Com que frequência você sente que tem trabalho em excesso para realizar no prazo?',
  },
  {
    categoria: 'organizacao_trabalho',
    ordem: 2,
    texto: 'Com que frequência você tem autonomia para decidir como realizar suas tarefas?',
  },
  {
    categoria: 'organizacao_trabalho',
    ordem: 3,
    texto: 'Com que frequência as metas estabelecidas são realistas e alcançáveis?',
  },
  // Relações Interpessoais
  {
    categoria: 'relacoes_interpessoais',
    ordem: 4,
    texto: 'Com que frequência você recebe apoio de seus colegas quando necessita?',
  },
  {
    categoria: 'relacoes_interpessoais',
    ordem: 5,
    texto: 'Com que frequência há conflitos não resolvidos entre membros da equipe?',
  },
  {
    categoria: 'relacoes_interpessoais',
    ordem: 6,
    texto: 'Com que frequência você se sente respeitado(a) pela sua chefia imediata?',
  },
  // Condições de Trabalho
  {
    categoria: 'condicoes_trabalho',
    ordem: 7,
    texto:
      'Com que frequência seu ambiente de trabalho oferece condições adequadas (iluminação, temperatura, ruído)?',
  },
  {
    categoria: 'condicoes_trabalho',
    ordem: 8,
    texto: 'Com que frequência você dispõe dos recursos necessários para realizar seu trabalho?',
  },
  {
    categoria: 'condicoes_trabalho',
    ordem: 9,
    texto: 'Com que frequência você consegue equilibrar vida profissional e pessoal?',
  },
  // Violência e Assédio
  {
    categoria: 'violencia_assedio',
    ordem: 10,
    texto:
      'Com que frequência você presencia ou vivencia situações de grosseria ou desrespeito no trabalho?',
  },
  {
    categoria: 'violencia_assedio',
    ordem: 11,
    texto: 'Com que frequência você se sente pressionado(a) de forma excessiva por superiores?',
  },
  {
    categoria: 'violencia_assedio',
    ordem: 12,
    texto:
      'Com que frequência você observa tratamento diferenciado injusto entre colaboradores?',
  },
  // Reconhecimento e Recompensa
  {
    categoria: 'reconhecimento_recompensa',
    ordem: 13,
    texto: 'Com que frequência seu trabalho é reconhecido e valorizado pela empresa?',
  },
  {
    categoria: 'reconhecimento_recompensa',
    ordem: 14,
    texto: 'Com que frequência você recebe feedback construtivo sobre seu desempenho?',
  },
  {
    categoria: 'reconhecimento_recompensa',
    ordem: 15,
    texto:
      'Com que frequência você sente que sua remuneração é justa em relação ao trabalho realizado?',
  },
]

async function main() {
  console.log('🌱 Iniciando seed...')

  // Seed perguntas (idempotente — upsert por ordem)
  for (const pergunta of perguntas) {
    await prisma.pergunta.upsert({
      where: { ordem: pergunta.ordem },
      update: { texto: pergunta.texto, categoria: pergunta.categoria },
      create: pergunta,
    })
  }
  console.log(`✅ ${perguntas.length} perguntas inseridas`)

  // Seed usuário admin (idempotente)
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@nr01.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123'
  const senhaHash = await bcrypt.hash(adminPassword, 12)

  // Cria empresa placeholder para o admin seed
  const empresaSeed = await prisma.empresa.upsert({
    where: { cnpj: '00000000000000' },
    update: {},
    create: {
      nome: 'Empresa Padrão',
      cnpj: '00000000000000',
      numFunc: 1,
    },
  })

  await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      senhaHash,
      nome: 'Administrador',
      role: 'admin',
      empresaId: empresaSeed.id,
    },
  })
  console.log(`✅ Usuário admin criado: ${adminEmail}`)
  console.log('🎉 Seed concluído!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
