import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface PlanoAcaoPDF {
  whatAcao: string
  whyJustif: string
  whoResponsavel: string
  whereLocal: string | null
  whenPrazo: string
  howExecucao: string
  howMuchCusto: string | null
  status: string
}

export interface RiscoPDF {
  setor: string
  descricao: string
  probabilidade: string
  severidade: string
  classificacao: string
  justificativa: string
  planos: PlanoAcaoPDF[]
}

export interface RelatorioDados {
  empresa: { nome: string; cnpj: string; numFunc: number }
  responsavel: string
  versao: string
  dataGeracao: string
  resumo: {
    totalRiscos: number
    riscosBaixo: number
    riscosMedio: number
    riscosAlto: number
    acoesNaoIniciadas: number
    acoesEmAndamento: number
    acoesConcluidas: number
  }
  riscos: RiscoPDF[]
  evidencias: Array<{ label: string; tipo: string | null; criadoEm: string }>
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCNPJ(cnpj: string) {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

function formatDate(dateStr: string) {
  try { return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR }) } catch { return dateStr }
}

function nivelLabel(n: string) {
  return n === 'alta' ? 'Alta' : n === 'media' ? 'Média' : 'Baixa'
}
function classifLabel(c: string) {
  return c === 'alto' ? 'ALTO' : c === 'medio' ? 'MÉDIO' : 'BAIXO'
}
function statusLabel(s: string) {
  return s === 'concluido' ? 'Concluído' : s === 'em_andamento' ? 'Em andamento' : 'Não iniciado'
}
function tipoLabel(t: string | null) {
  if (!t) return 'Documento'
  if (t.includes('pdf')) return 'PDF'
  if (t.includes('word')) return 'DOCX'
  if (t.includes('sheet')) return 'XLSX'
  if (t.includes('png')) return 'PNG'
  if (t.includes('jpeg')) return 'JPG'
  return 'Arquivo'
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const C = {
  primary:    '#1e40af',
  alto:       '#dc2626',
  altoLight:  '#fee2e2',
  medio:      '#d97706',
  medioLight: '#fef3c7',
  baixo:      '#16a34a',
  baixoLight: '#dcfce7',
  gray100:    '#f3f4f6',
  gray200:    '#e5e7eb',
  gray400:    '#9ca3af',
  gray600:    '#4b5563',
  gray800:    '#1f2937',
  white:      '#ffffff',
}

const s = StyleSheet.create({
  page:         { padding: 40, fontSize: 9, color: C.gray800, fontFamily: 'Helvetica' },
  cover:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  coverTitle:   { fontSize: 22, fontFamily: 'Helvetica-Bold', color: C.primary, marginBottom: 8, textAlign: 'center' },
  coverSub:     { fontSize: 12, color: C.gray600, marginBottom: 40, textAlign: 'center' },
  coverBox:     { borderWidth: 1, borderColor: C.gray200, borderRadius: 4, padding: 20, minWidth: 300, backgroundColor: C.gray100 },
  coverRow:     { flexDirection: 'row', marginBottom: 6 },
  coverLabel:   { fontFamily: 'Helvetica-Bold', width: 100 },
  coverValue:   { flex: 1, color: C.gray600 },
  sectionTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.primary, borderBottomWidth: 2, borderBottomColor: C.primary, paddingBottom: 4, marginBottom: 12 },
  h3:           { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 6, color: C.gray800 },
  p:            { lineHeight: 1.5, color: C.gray600, marginBottom: 8 },
  row:          { flexDirection: 'row' },
  tableHeader:  { flexDirection: 'row', backgroundColor: C.primary, padding: 6 },
  tableHeaderTx:{ color: C.white, fontFamily: 'Helvetica-Bold', flex: 1 },
  tableRow:     { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.gray200, padding: 5 },
  tableCell:    { flex: 1, color: C.gray600 },
  badge:        { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 8, fontFamily: 'Helvetica-Bold' },
  mb4:          { marginBottom: 4 },
  mb8:          { marginBottom: 8 },
  mb16:         { marginBottom: 16 },
  footer:       { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', color: C.gray400, fontSize: 8, borderTopWidth: 1, borderTopColor: C.gray200, paddingTop: 6 },
  card:         { borderWidth: 1, borderColor: C.gray200, borderRadius: 4, padding: 10, marginBottom: 10, backgroundColor: C.gray100 },
  campo:        { marginBottom: 6 },
  campoLabel:   { fontFamily: 'Helvetica-Bold', color: C.gray600, fontSize: 8 },
  campoValue:   { color: C.gray800, marginTop: 2 },
  grid2:        { flexDirection: 'row', gap: 8 },
  col:          { flex: 1 },
  matrizCell:   { width: 70, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 4, margin: 2 },
  matrizTh:     { width: 70, height: 50, justifyContent: 'center', alignItems: 'center' },
  matrizLabel:  { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.white, textAlign: 'center' },
  matrizCount:  { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.white },
  riscoCard:    { borderWidth: 1, borderRadius: 4, padding: 8, marginBottom: 8 },
  statRow:      { flexDirection: 'row', marginBottom: 8 },
  statBox:      { flex: 1, borderWidth: 1, borderColor: C.gray200, borderRadius: 4, padding: 8, marginRight: 4, alignItems: 'center' },
  statNum:      { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  statLabel:    { fontSize: 7, color: C.gray600, textAlign: 'center' },
})

// ─── Célula da Matriz ─────────────────────────────────────────────────────────

function classifColor(c: string) {
  return c === 'alto' ? C.alto : c === 'medio' ? C.medio : C.baixo
}

function MatrizCell({ prob, sev, riscos }: { prob: string; sev: string; riscos: RiscoPDF[] }) {
  const classif = (() => {
    const m: Record<string, Record<string, string>> = {
      alta:  { alta: 'alto', media: 'alto', baixa: 'medio' },
      media: { alta: 'alto', media: 'medio', baixa: 'baixo' },
      baixa: { alta: 'medio', media: 'baixo', baixa: 'baixo' },
    }
    return m[prob]?.[sev] ?? 'baixo'
  })()
  const count = riscos.filter((r) => r.probabilidade === prob && r.severidade === sev).length
  return (
    <View style={[s.matrizCell, { backgroundColor: classifColor(classif) }]}>
      {count > 0 && <Text style={s.matrizCount}>{count}</Text>}
      <Text style={s.matrizLabel}>{classifLabel(classif)}</Text>
    </View>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ dataGeracao, versao }: { dataGeracao: string; versao: string }) {
  return (
    <View style={s.footer} fixed>
      <Text>Sistema NR-01 · v{versao} · {formatDate(dataGeracao)}</Text>
      <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
    </View>
  )
}

// ─── Documento ────────────────────────────────────────────────────────────────

export function RelatorioDocument({ dados }: { dados: RelatorioDados }) {
  const { empresa, responsavel, versao, dataGeracao, resumo, riscos, evidencias } = dados
  const NIVEIS = ['alta', 'media', 'baixa'] as const

  return (
    <Document title={`Relatório NR-01 — ${empresa.nome}`} author={responsavel}>
      {/* ─── Capa ─────────────────────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <View style={s.cover}>
          <Text style={s.coverTitle}>Diagnóstico de Riscos Psicossociais</Text>
          <Text style={s.coverSub}>Norma Regulamentadora NR-01</Text>
          <View style={s.coverBox}>
            {[
              ['Empresa',       empresa.nome],
              ['CNPJ',          formatCNPJ(empresa.cnpj)],
              ['Funcionários',  String(empresa.numFunc)],
              ['Responsável',   responsavel],
              ['Versão',        versao],
              ['Data de Geração', formatDate(dataGeracao)],
            ].map(([label, value]) => (
              <View key={label} style={s.coverRow}>
                <Text style={s.coverLabel}>{label}:</Text>
                <Text style={s.coverValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
        <Footer dataGeracao={dataGeracao} versao={versao} />
      </Page>

      {/* ─── 1. Resumo Executivo ──────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>1. Resumo Executivo</Text>
        <Text style={[s.h3, s.mb8]}>Riscos Identificados</Text>
        <View style={s.statRow}>
          {[
            [String(resumo.totalRiscos), 'Total de Riscos', C.primary],
            [String(resumo.riscosAlto),  'Alto',   C.alto],
            [String(resumo.riscosMedio), 'Médio',  C.medio],
            [String(resumo.riscosBaixo), 'Baixo',  C.baixo],
          ].map(([num, label, color]) => (
            <View key={label} style={s.statBox}>
              <Text style={[s.statNum, { color }]}>{num}</Text>
              <Text style={s.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
        <Text style={[s.h3, s.mb8]}>Status das Ações</Text>
        <View style={s.statRow}>
          {[
            [String(resumo.acoesNaoIniciadas), 'Não iniciadas', C.gray400],
            [String(resumo.acoesEmAndamento),  'Em andamento',  C.primary],
            [String(resumo.acoesConcluidas),   'Concluídas',    C.baixo],
          ].map(([num, label, color]) => (
            <View key={label} style={s.statBox}>
              <Text style={[s.statNum, { color }]}>{num}</Text>
              <Text style={s.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
        <Footer dataGeracao={dataGeracao} versao={versao} />
      </Page>

      {/* ─── 2. Metodologia ──────────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>2. Metodologia</Text>
        {[
          ['Questionário', 'O diagnóstico foi realizado através de um questionário com 15 perguntas distribuídas em 5 categorias: Organização do Trabalho, Relações Interpessoais, Condições de Trabalho, Violência e Assédio, e Reconhecimento e Recompensa. Cada pergunta foi respondida em escala Likert de 1 a 5 (1=Nunca, 5=Sempre).'],
          ['Cálculo de Risco', 'Para cada setor e categoria foi calculado um score médio de risco. Perguntas com escala positiva (resposta alta = bom resultado) tiveram seus valores invertidos. O score foi mapeado em três níveis de probabilidade: Alta (≥4,0), Média (≥2,5) e Baixa (<2,5). A severidade foi considerada conservativamente igual à probabilidade.'],
          ['Classificação Final', 'A classificação de cada risco segue a matriz de probabilidade × severidade: Alto (Alta×Alta, Alta×Média, Média×Alta), Médio (Alta×Baixa, Média×Média, Baixa×Alta) e Baixo (Média×Baixa, Baixa×Média, Baixa×Baixa). Apenas riscos Médios e Altos são incluídos no Plano de Ação.'],
          ['Base Legal', 'Este diagnóstico foi realizado em conformidade com a Norma Regulamentadora NR-01 (Portaria MTE nº 1.419/2024), que estabelece obrigações para a identificação, avaliação e controle de riscos psicossociais no ambiente de trabalho, com aplicação a todos os empregadores.'],
        ].map(([title, text]) => (
          <View key={title} style={s.mb16}>
            <Text style={s.h3}>{title}</Text>
            <Text style={s.p}>{text}</Text>
          </View>
        ))}
        <Footer dataGeracao={dataGeracao} versao={versao} />
      </Page>

      {/* ─── 3. Matriz de Risco ───────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>3. Matriz de Risco</Text>
        <Text style={[s.h3, s.mb8]}>Probabilidade × Severidade</Text>

        {/* Matriz visual */}
        <View style={[s.row, s.mb16]}>
          <View>
            {/* Coluna de labels de Probabilidade */}
            <View style={s.matrizTh} />
            {NIVEIS.map((prob) => (
              <View key={prob} style={[s.matrizTh, { justifyContent: 'center' }]}>
                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.gray600 }}>{nivelLabel(prob)}</Text>
              </View>
            ))}
          </View>
          <View>
            {/* Header de Severidade */}
            <View style={[s.row, { marginBottom: 0 }]}>
              {NIVEIS.map((sev) => (
                <View key={sev} style={s.matrizTh}>
                  <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.gray600, textAlign: 'center' }}>{nivelLabel(sev)}</Text>
                </View>
              ))}
            </View>
            {/* Células */}
            {NIVEIS.map((prob) => (
              <View key={prob} style={s.row}>
                {NIVEIS.map((sev) => (
                  <MatrizCell key={sev} prob={prob} sev={sev} riscos={riscos} />
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Lista de riscos */}
        <Text style={[s.h3, s.mb8]}>Riscos Identificados por Setor</Text>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderTx, { flex: 2 }]}>Risco</Text>
          <Text style={s.tableHeaderTx}>Setor</Text>
          <Text style={s.tableHeaderTx}>Prob.</Text>
          <Text style={s.tableHeaderTx}>Sev.</Text>
          <Text style={s.tableHeaderTx}>Class.</Text>
        </View>
        {riscos.map((r, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={[s.tableCell, { flex: 2 }]}>{r.descricao.replace('Risco Psicossocial — ', '')}</Text>
            <Text style={s.tableCell}>{r.setor}</Text>
            <Text style={s.tableCell}>{nivelLabel(r.probabilidade)}</Text>
            <Text style={s.tableCell}>{nivelLabel(r.severidade)}</Text>
            <Text style={[s.tableCell, { color: classifColor(r.classificacao), fontFamily: 'Helvetica-Bold' }]}>
              {classifLabel(r.classificacao)}
            </Text>
          </View>
        ))}
        <Footer dataGeracao={dataGeracao} versao={versao} />
      </Page>

      {/* ─── 4. Plano de Ação ────────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>4. Plano de Ação (5W2H)</Text>
        {riscos.filter((r) => r.planos.length > 0).map((r, ri) => (
          <View key={ri} style={[s.riscoCard, { borderColor: classifColor(r.classificacao), marginBottom: 12 }]}>
            <View style={[s.row, s.mb4, { alignItems: 'center', gap: 6 }]}>
              <View style={[s.badge, { backgroundColor: classifColor(r.classificacao) }]}>
                <Text style={{ color: C.white }}>{classifLabel(r.classificacao)}</Text>
              </View>
              <Text style={{ fontFamily: 'Helvetica-Bold', flex: 1 }}>
                {r.descricao.replace('Risco Psicossocial — ', '')} — {r.setor}
              </Text>
            </View>
            {r.planos.map((p, pi) => (
              <View key={pi} style={[s.card, { marginBottom: 6 }]}>
                <View style={s.grid2}>
                  <View style={s.col}>
                    <View style={s.campo}>
                      <Text style={s.campoLabel}>WHAT — O que será feito:</Text>
                      <Text style={s.campoValue}>{p.whatAcao}</Text>
                    </View>
                    <View style={s.campo}>
                      <Text style={s.campoLabel}>WHY — Justificativa:</Text>
                      <Text style={s.campoValue}>{p.whyJustif}</Text>
                    </View>
                    <View style={s.campo}>
                      <Text style={s.campoLabel}>HOW — Como executar:</Text>
                      <Text style={s.campoValue}>{p.howExecucao}</Text>
                    </View>
                  </View>
                  <View style={s.col}>
                    <View style={s.campo}>
                      <Text style={s.campoLabel}>WHO — Responsável:</Text>
                      <Text style={s.campoValue}>{p.whoResponsavel}</Text>
                    </View>
                    <View style={s.campo}>
                      <Text style={s.campoLabel}>WHEN — Prazo:</Text>
                      <Text style={s.campoValue}>{formatDate(p.whenPrazo)}</Text>
                    </View>
                    {p.whereLocal && (
                      <View style={s.campo}>
                        <Text style={s.campoLabel}>WHERE — Local:</Text>
                        <Text style={s.campoValue}>{p.whereLocal}</Text>
                      </View>
                    )}
                    {p.howMuchCusto && (
                      <View style={s.campo}>
                        <Text style={s.campoLabel}>HOW MUCH — Custo:</Text>
                        <Text style={s.campoValue}>
                          R$ {Number(p.howMuchCusto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                      </View>
                    )}
                    <View style={s.campo}>
                      <Text style={s.campoLabel}>Status:</Text>
                      <Text style={s.campoValue}>{statusLabel(p.status)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}
        <Footer dataGeracao={dataGeracao} versao={versao} />
      </Page>

      {/* ─── 5. Evidências ───────────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>5. Evidências Documentais</Text>
        {evidencias.length === 0 ? (
          <Text style={s.p}>Nenhuma evidência documental foi anexada a este diagnóstico.</Text>
        ) : (
          <>
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderTx, { flex: 2 }]}>Label</Text>
              <Text style={s.tableHeaderTx}>Tipo</Text>
              <Text style={s.tableHeaderTx}>Data de Upload</Text>
            </View>
            {evidencias.map((ev, i) => (
              <View key={i} style={s.tableRow}>
                <Text style={[s.tableCell, { flex: 2 }]}>{ev.label}</Text>
                <Text style={s.tableCell}>{tipoLabel(ev.tipo)}</Text>
                <Text style={s.tableCell}>{formatDate(ev.criadoEm)}</Text>
              </View>
            ))}
          </>
        )}
        <Footer dataGeracao={dataGeracao} versao={versao} />
      </Page>
    </Document>
  )
}
