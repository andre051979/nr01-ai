export type Nivel = 'baixa' | 'media' | 'alta'
export type Classificacao = 'baixo' | 'medio' | 'alto'

// Perguntas onde resposta alta = BOM (inverter escala para calcular risco)
const ORDENS_POSITIVAS = new Set([2, 4, 6, 7, 8, 13, 14])

// Mapeamento setor × categoria (ordens das perguntas do seed)
export const CATEGORIAS_CONFIG = [
  { categoria: 'organizacao_trabalho',      ordens: [1, 2, 3] },
  { categoria: 'relacoes_interpessoais',    ordens: [4, 5, 6] },
  { categoria: 'condicoes_trabalho',        ordens: [7, 8, 9] },
  { categoria: 'violencia_assedio',         ordens: [10, 11, 12] },
  { categoria: 'reconhecimento_recompensa', ordens: [13, 14, 15] },
]

export const CATEGORIA_DESCRICAO: Record<string, string> = {
  organizacao_trabalho:      'Risco Psicossocial — Organização do Trabalho',
  relacoes_interpessoais:    'Risco Psicossocial — Relações Interpessoais',
  condicoes_trabalho:        'Risco Psicossocial — Condições de Trabalho',
  violencia_assedio:         'Risco Psicossocial — Violência e Assédio',
  reconhecimento_recompensa: 'Risco Psicossocial — Reconhecimento e Recompensa',
}

const CLASSIFICACAO_MATRIX: Record<Nivel, Record<Nivel, Classificacao>> = {
  alta:  { alta: 'alto',  media: 'alto',  baixa: 'medio' },
  media: { alta: 'alto',  media: 'medio', baixa: 'baixo' },
  baixa: { alta: 'medio', media: 'baixo', baixa: 'baixo' },
}

export function calcularClassificacao(probabilidade: Nivel, severidade: Nivel): Classificacao {
  return CLASSIFICACAO_MATRIX[probabilidade][severidade]
}

function scoreRisco(valor: number, ordem: number): number {
  return ORDENS_POSITIVAS.has(ordem) ? 6 - valor : valor
}

function scoreParaNivel(score: number): Nivel {
  if (score >= 4) return 'alta'
  if (score >= 2.5) return 'media'
  return 'baixa'
}

export interface RespostaComOrdem {
  valor: number
  ordem: number
}

export interface ResultadoCategoria {
  categoria: string
  mediaScore: number
  probabilidade: Nivel
  severidade: Nivel
  classificacao: Classificacao
}

export function calcularRiscosSetor(
  respostas: RespostaComOrdem[],
): ResultadoCategoria[] {
  return CATEGORIAS_CONFIG.map(({ categoria, ordens }) => {
    const respostasCategoria = respostas.filter((r) => ordens.includes(r.ordem as never))

    if (respostasCategoria.length === 0) return null

    const scores = respostasCategoria.map((r) => scoreRisco(r.valor, r.ordem))
    const mediaScore = scores.reduce((a, b) => a + b, 0) / scores.length

    const probabilidade = scoreParaNivel(mediaScore)
    const severidade = probabilidade // conservador: severidade = probabilidade no MVP
    const classificacao = calcularClassificacao(probabilidade, severidade)

    return { categoria, mediaScore, probabilidade, severidade, classificacao }
  }).filter((r) => r !== null) as ResultadoCategoria[]
}
