// src/app/api/pgr/gerar/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// ============================================================
// FUNCOES AUXILIARES
// ============================================================

function classificarProbabilidade(media: number): { valor: number; descricao: string } {
  if (media <= 1.5) return { valor: 5, descricao: 'Muito Alta' }
  if (media <= 2.0) return { valor: 5, descricao: 'Muito Alta' }
  if (media <= 2.5) return { valor: 4, descricao: 'Alta' }
  if (media <= 3.0) return { valor: 3, descricao: 'Media' }
  if (media <= 3.75) return { valor: 2, descricao: 'Baixa' }
  return { valor: 1, descricao: 'Muito Baixa' }
}

function classificarSeveridade(
  percentualCritico: number,
  pesoMedio: number,
  categoria: string
): { valor: number; descricao: string } {
  const categoriasAltoImpacto = ['Saude Emocional', 'Relacoes Interpessoais']
  const bonusCategoria = categoriasAltoImpacto.includes(categoria) ? 1 : 0
  let base = 1
  if (percentualCritico >= 50) base = 5
  else if (percentualCritico >= 35) base = 4
  else if (percentualCritico >= 20) base = 3
  else if (percentualCritico >= 10) base = 2
  else base = 1
  if (pesoMedio > 1.2) base = Math.min(5, base + 1)
  base = Math.min(5, base + bonusCategoria)
  const descricoes: Record<number, string> = {
    1: 'Desprezivel', 2: 'Menor', 3: 'Moderada', 4: 'Significativa', 5: 'Catastrofica'
  }
  return { valor: Math.max(1, Math.min(5, base)), descricao: descricoes[Math.max(1, Math.min(5, base))] }
}

function classificarNivelRisco(nivelRisco: number): { classificacao: string; cor: string; prioridade: string } {
  if (nivelRisco >= 20) return { classificacao: 'Critico', cor: '#dc2626', prioridade: 'Acao imediata obrigatoria' }
  if (nivelRisco >= 12) return { classificacao: 'Alto', cor: '#f97316', prioridade: 'Acao em curto prazo' }
  if (nivelRisco >= 6) return { classificacao: 'Moderado', cor: '#f59e0b', prioridade: 'Monitoramento e acao planejada' }
  if (nivelRisco >= 3) return { classificacao: 'Baixo', cor: '#84cc16', prioridade: 'Manter controles existentes' }
  return { classificacao: 'Muito Baixo', cor: '#16a34a', prioridade: 'Monitoramento periodico' }
}

// ============================================================
// GERADORES DE DOCUMENTOS
// ============================================================

function gerarParecerTecnico(
  avaliacoes: Array<{ categoria: string; classificacao: string; nivelRisco: number; media: number }>,
  totalRespostas: number, totalColaboradores: number, nomeEmpresa: string
): string {
  const criticos = avaliacoes.filter(a => a.classificacao === 'Critico')
  const altos = avaliacoes.filter(a => a.classificacao === 'Alto')
  const moderados = avaliacoes.filter(a => a.classificacao === 'Moderado')
  const baixos = avaliacoes.filter(a => ['Baixo', 'Muito Baixo'].includes(a.classificacao))
  const taxaParticipacao = totalColaboradores > 0 ? ((totalRespostas / totalColaboradores) * 100).toFixed(1) : 'N/D'
  const mediaGeral = avaliacoes.length > 0 ? (avaliacoes.reduce((s, a) => s + a.media, 0) / avaliacoes.length).toFixed(2) : 'N/D'

  let p = `PARECER TECNICO — AVALIACAO DE RISCOS PSICOSSOCIAIS\n`
  p += `Empresa: ${nomeEmpresa}\nData de elaboracao: ${new Date().toLocaleDateString('pt-BR')}\n\n`
  p += `1. CONTEXTO DA AVALIACAO\nA presente avaliacao de riscos psicossociais foi conduzida em conformidade com a NR-1 (Gerenciamento de Riscos Ocupacionais) e com base nas diretrizes da ISO 45003:2021.\n`
  p += `Total de respondentes: ${totalRespostas}\nTaxa de participacao estimada: ${taxaParticipacao}%\nMedia geral: ${mediaGeral}/5.00\n\n`
  p += `2. SINTESE DOS RESULTADOS\nForam avaliados ${avaliacoes.length} fatores/categorias de risco psicossocial.\n`
  if (criticos.length > 0) p += `- ${criticos.length} fator(es) CRITICO: ${criticos.map(c => c.categoria).join(', ')}.\n`
  if (altos.length > 0) p += `- ${altos.length} fator(es) ALTO: ${altos.map(a => a.categoria).join(', ')}.\n`
  if (moderados.length > 0) p += `- ${moderados.length} fator(es) MODERADO: ${moderados.map(m => m.categoria).join(', ')}.\n`
  if (baixos.length > 0) p += `- ${baixos.length} fator(es) BAIXO/MUITO BAIXO: ${baixos.map(b => b.categoria).join(', ')}.\n`
  p += `\n3. CLASSIFICACAO GERAL DO RISCO PSICOSSOCIAL\n`
  if (criticos.length > 0) {
    p += `A organizacao apresenta risco psicossocial CRITICO em ${criticos.length} fator(es), demandando intervencao imediata e prioritaria. A presenca de fatores criticos indica exposicao significativa dos trabalhadores a condicoes que podem resultar em adoecimento mental, afastamentos e impacto na seguranca operacional.\n\n`
  } else if (altos.length > 0) {
    p += `A organizacao apresenta risco psicossocial ALTO em ${altos.length} fator(es). Os fatores em nivel alto requerem acao em curto prazo para prevenir agravamento.\n\n`
  } else if (moderados.length > 0) {
    p += `A organizacao apresenta risco psicossocial predominantemente MODERADO. Os fatores identificados requerem monitoramento ativo e acoes planejadas.\n\n`
  } else {
    p += `A organizacao apresenta risco psicossocial predominantemente BAIXO, indicando um ambiente de trabalho saudavel.\n\n`
  }
  p += `4. RECOMENDACOES\n`
  p += `a) Implementar as medidas prioritarias nos prazos indicados;\n`
  p += `b) Realizar nova avaliacao em 12 meses ou apos implementacao das medidas;\n`
  p += `c) Manter registro das acoes para comprovacao de conformidade;\n`
  p += `d) Incluir os riscos psicossociais no PGR da organizacao.\n\n`
  p += `5. FUNDAMENTACAO LEGAL\n`
  p += `- NR-1 (Portaria SEPRT 6.730/2020)\n- NR-7 — PCMSO\n- NR-17 — Ergonomia\n- ISO 45003:2021\n- Lei 14.457/2022\n`
  return p
}

function gerarAPR(
  inventario: Array<Record<string, unknown>>,
  nomeEmpresa: string,
  totalRespostas: number
): Record<string, unknown> {
  const dataAtual = new Date().toLocaleDateString('pt-BR')
  const itens = inventario.map((item, idx) => {
    const medidas = (item.medidasRecomendadas as Array<Record<string, unknown>>) || []
    const causas = (item.causasProvaveis as Array<Record<string, unknown>>) || []
    return {
      id: idx + 1,
      atividade: `Exposicao ao fator psicossocial: ${item.categoria}`,
      perigo: item.fatorNR1 || `Fator de risco psicossocial — ${item.categoria}`,
      consequencias: causas.length > 0
        ? causas.map(c => c.impactos || c.descricao).join('; ')
        : 'Potencial adoecimento mental, estresse cronico, absenteismo, queda de produtividade',
      probabilidade: (item.probabilidade as { valor: number; descricao: string }),
      severidade: (item.severidade as { valor: number; descricao: string }),
      nivelRisco: item.nivelRisco,
      classificacao: item.classificacao,
      medidasControle: medidas.map(m => m.titulo).join('; ') || 'Medidas a definir',
      responsavel: medidas.length > 0 ? (medidas[0].responsavel || 'RH + SESMT') : 'RH + SESMT',
      prazo: medidas.length > 0 ? (medidas[0].prazoSugerido || 'A definir') : 'A definir',
      status: 'PENDENTE'
    }
  })

  return {
    titulo: `Analise Preliminar de Riscos Psicossociais — ${nomeEmpresa}`,
    dataElaboracao: dataAtual,
    responsavel: 'Equipe de SST / RH',
    descricaoAtividade: 'Avaliacao dos fatores de risco psicossocial no ambiente de trabalho conforme NR-1 e ISO 45003:2021',
    localAplicacao: nomeEmpresa,
    totalTrabalhadores: totalRespostas,
    referenciaLegal: 'NR-1 (GRO), NR-7 (PCMSO), NR-17 (Ergonomia), ISO 45003:2021, Lei 14.457/2022',
    itens,
    observacoes: 'A presente APR deve ser revisada sempre que houver mudancas significativas nas condicoes de trabalho, apos incidentes ou no prazo maximo de 12 meses.',
    resumo: {
      totalRiscos: itens.length,
      criticos: itens.filter(i => i.classificacao === 'Critico').length,
      altos: itens.filter(i => i.classificacao === 'Alto').length,
      moderados: itens.filter(i => i.classificacao === 'Moderado').length,
      baixos: itens.filter(i => ['Baixo', 'Muito Baixo'].includes(i.classificacao as string)).length
    }
  }
}

function gerarRelatorioAvaliacao(
  inventario: Array<Record<string, unknown>>,
  indicadores: Record<string, unknown>,
  analiseSetores: Array<Record<string, unknown>>,
  nomeEmpresa: string,
  periodoAvaliacao: string,
  totalRespostas: number,
  totalColaboradores: number
): Record<string, unknown> {
  const dataAtual = new Date().toLocaleDateString('pt-BR')
  const ind = indicadores as Record<string, number | string | null>

  const distribuicaoRisco = {
    critico: inventario.filter(i => i.classificacao === 'Critico').map(i => ({ categoria: i.categoria, nivel: i.nivelRisco, media: i.mediaPontuacao })),
    alto: inventario.filter(i => i.classificacao === 'Alto').map(i => ({ categoria: i.categoria, nivel: i.nivelRisco, media: i.mediaPontuacao })),
    moderado: inventario.filter(i => i.classificacao === 'Moderado').map(i => ({ categoria: i.categoria, nivel: i.nivelRisco, media: i.mediaPontuacao })),
    baixo: inventario.filter(i => ['Baixo', 'Muito Baixo'].includes(i.classificacao as string)).map(i => ({ categoria: i.categoria, nivel: i.nivelRisco, media: i.mediaPontuacao }))
  }

  const topRiscos = inventario.slice(0, 3).map(i => ({
    categoria: i.categoria,
    classificacao: i.classificacao,
    nivelRisco: i.nivelRisco,
    media: i.mediaPontuacao,
    percentualCritico: i.percentualCritico
  }))

  return {
    titulo: `Relatorio de Avaliacao de Riscos Psicossociais — ${nomeEmpresa}`,
    dataElaboracao: dataAtual,
    periodoAvaliacao,
    introducao: `Este relatorio apresenta os resultados da avaliacao de riscos psicossociais realizada na empresa ${nomeEmpresa}, conforme requisitos da NR-1 (Gerenciamento de Riscos Ocupacionais) e diretrizes da ISO 45003:2021. A avaliacao foi conduzida por meio de questionario anonimo aplicado aos colaboradores, utilizando escala Likert de 5 pontos para mensurar a percepcao sobre fatores psicossociais no ambiente de trabalho.`,
    metodologia: {
      instrumento: 'Questionario anonimo baseado na ISO 45003:2021',
      escala: 'Escala Likert de 5 pontos (1=Discordo Totalmente a 5=Concordo Totalmente)',
      classificacaoRisco: 'Matriz Probabilidade x Severidade (5x5) conforme NR-1',
      periodoColeta: periodoAvaliacao,
      amostra: { totalRespondentes: totalRespostas, totalColaboradores, taxaParticipacao: ind.taxaParticipacao }
    },
    resultadosGerais: {
      mediaGeral: ind.mediaGeral,
      totalFatoresAvaliados: ind.totalFatoresAvaliados,
      fatoresCriticos: ind.fatoresCriticos,
      fatoresAltos: ind.fatoresAltos,
      fatoresModerados: ind.fatoresModerados,
      fatoresBaixos: ind.fatoresBaixos
    },
    distribuicaoRisco,
    topRiscos,
    analiseSetorial: analiseSetores,
    conclusao: `A avaliacao identificou ${ind.totalFatoresAvaliados} categorias de risco psicossocial. ${Number(ind.fatoresCriticos) > 0 ? `Destaca-se a presenca de ${ind.fatoresCriticos} fator(es) em nivel CRITICO, que demandam intervencao imediata.` : 'Nao foram identificados fatores em nivel critico.'} ${Number(ind.fatoresAltos) > 0 ? `Ha ${ind.fatoresAltos} fator(es) em nivel ALTO que requerem atencao em curto prazo.` : ''} Recomenda-se a implementacao das medidas de controle constantes no Plano de Acao e a reavaliacao no prazo de 12 meses.`,
    referenciaLegal: ['NR-1 (Portaria SEPRT 6.730/2020)', 'NR-7 — PCMSO', 'NR-17 — Ergonomia', 'ISO 45003:2021', 'Lei 14.457/2022']
  }
}

function gerarMonitoramento(
  inventario: Array<Record<string, unknown>>,
  nomeEmpresa: string
): Record<string, unknown> {
  const dataAtual = new Date().toLocaleDateString('pt-BR')
  const proximaAvaliacao = new Date()
  proximaAvaliacao.setFullYear(proximaAvaliacao.getFullYear() + 1)

  const indicadoresMonitoramento = inventario.map(item => ({
    categoria: item.categoria,
    classificacaoAtual: item.classificacao,
    nivelRiscoAtual: item.nivelRisco,
    mediaAtual: item.mediaPontuacao,
    percentualCriticoAtual: item.percentualCritico,
    metaReducao: (item.classificacao === 'Critico' || item.classificacao === 'Alto') ? 'Reduzir nivel de risco em pelo menos 1 faixa em 12 meses' : 'Manter ou melhorar nivel atual',
    frequenciaMonitoramento: item.classificacao === 'Critico' ? 'Mensal' : item.classificacao === 'Alto' ? 'Trimestral' : 'Semestral',
    indicadorAcompanhamento: 'Media de pontuacao, % respostas criticas, absenteismo no setor',
    statusAcompanhamento: 'PENDENTE',
    observacoes: ''
  }))

  return {
    titulo: `Registro de Monitoramento e Reavaliacao — ${nomeEmpresa}`,
    dataElaboracao: dataAtual,
    dataProximaAvaliacao: proximaAvaliacao.toLocaleDateString('pt-BR'),
    cicloAvaliacao: '12 meses',
    criteriosReavaliacao: [
      'Reavaliacao programada a cada 12 meses',
      'Apos implementacao de medidas de controle significativas',
      'Apos incidentes relacionados a saude mental',
      'Quando houver mudancas organizacionais relevantes',
      'Apos deteccao de aumento de absenteismo ou turnover',
      'Por solicitacao do SESMT, CIPA ou representantes dos trabalhadores'
    ],
    indicadores: indicadoresMonitoramento,
    registroAcoes: [
      { data: dataAtual, acao: 'Avaliacao inicial de riscos psicossociais realizada', responsavel: 'RH + SESMT', resultado: 'Inventario de riscos e plano de acao elaborados', proximoPasso: 'Implementar medidas prioritarias' }
    ],
    metricas: {
      absenteismo: { valorAtual: 'A coletar', meta: 'Reducao de 10% em 12 meses', fonte: 'RH / Folha de pagamento' },
      turnover: { valorAtual: 'A coletar', meta: 'Reducao de 5% em 12 meses', fonte: 'RH' },
      afastamentosMentais: { valorAtual: 'A coletar', meta: 'Reducao de 15% em 12 meses', fonte: 'SESMT / PCMSO' },
      reclamacoesAssedio: { valorAtual: 'A coletar', meta: 'Zero ocorrencias nao tratadas', fonte: 'Canal de denuncia / CIPA' }
    }
  }
}
function gerarPoliticaSST(
  nomeEmpresa: string,
  inventario: Array<Record<string, unknown>>
): string {
  const dataAtual = new Date().toLocaleDateString('pt-BR')
  const fatoresCriticos = inventario.filter(i => i.classificacao === 'Critico' || i.classificacao === 'Alto')
  const categoriasCriticas = fatoresCriticos.map(f => f.categoria).join(', ')

  let pol = `POLITICA DE SAUDE PSICOLOGICA E SEGURANCA NO TRABALHO\n`
  pol += `${nomeEmpresa}\n`
  pol += `Data de aprovacao: ${dataAtual}\n`
  pol += `Revisao: 01\n\n`
  pol += `1. DECLARACAO DE COMPROMISSO\n`
  pol += `A ${nomeEmpresa} reconhece que a saude psicologica e a seguranca no trabalho sao componentes essenciais da gestao de pessoas e da sustentabilidade organizacional. Esta politica estabelece o compromisso da organizacao com a prevencao de riscos psicossociais, a promocao do bem-estar mental dos trabalhadores e a conformidade com a legislacao vigente.\n\n`
  pol += `2. OBJETIVOS\n`
  pol += `a) Identificar, avaliar e controlar os fatores de risco psicossocial no ambiente de trabalho;\n`
  pol += `b) Promover um ambiente de trabalho saudavel, respeitoso e livre de assedio;\n`
  pol += `c) Prevenir o adoecimento mental relacionado ao trabalho;\n`
  pol += `d) Garantir conformidade com NR-1, NR-7, NR-17, ISO 45003:2021 e Lei 14.457/2022;\n`
  pol += `e) Fomentar a participacao ativa dos trabalhadores na gestao dos riscos psicossociais;\n`
  pol += `f) Estabelecer processos de monitoramento continuo e melhoria.\n\n`
  pol += `3. ESCOPO\n`
  pol += `Esta politica aplica-se a todos os trabalhadores, gestores, terceirizados e estagiarios da ${nomeEmpresa}, em todas as suas unidades e operacoes.\n\n`
  pol += `4. PRINCIPIOS\n`
  pol += `a) Prevencao: priorizar a eliminacao e controle dos riscos na origem;\n`
  pol += `b) Participacao: envolver trabalhadores no processo de identificacao e controle de riscos;\n`
  pol += `c) Confidencialidade: garantir o sigilo das informacoes individuais;\n`
  pol += `d) Nao-retaliacao: assegurar que nenhum trabalhador sofrera represalia por relatar riscos;\n`
  pol += `e) Equidade: garantir tratamento justo e igualitario;\n`
  pol += `f) Melhoria continua: revisar e aprimorar continuamente os processos.\n\n`
  pol += `5. COMPROMISSOS ESPECIFICOS\n`
  pol += `5.1 A organizacao se compromete a:\n`
  pol += `- Realizar avaliacao de riscos psicossociais com periodicidade minima anual;\n`
  pol += `- Incluir riscos psicossociais no Programa de Gerenciamento de Riscos (PGR);\n`
  pol += `- Disponibilizar canais seguros para relato de situacoes de risco;\n`
  pol += `- Capacitar gestores para identificacao e manejo de riscos psicossociais;\n`
  pol += `- Oferecer suporte psicologico aos trabalhadores quando necessario;\n`
  pol += `- Investigar e tratar todas as denuncias de assedio moral e sexual;\n`
  pol += `- Monitorar indicadores de saude mental ocupacional.\n\n`
  if (categoriasCriticas) {
    pol += `5.2 ATENCAO PRIORITARIA\n`
    pol += `Com base na avaliacao mais recente, os seguintes fatores requerem atencao prioritaria: ${categoriasCriticas}. A organizacao se compromete a implementar as medidas de controle definidas no Plano de Acao do PGR dentro dos prazos estabelecidos.\n\n`
  }
  pol += `6. RESPONSABILIDADES\n`
  pol += `- Alta Direcao: prover recursos, garantir implementacao, aprovar politica;\n`
  pol += `- RH: coordenar avaliacoes, implementar programas, monitorar indicadores;\n`
  pol += `- SESMT: apoio tecnico, investigacao de incidentes, acompanhamento do PCMSO;\n`
  pol += `- Gestores: execucao no dia a dia, identificacao precoce de riscos, suporte a equipe;\n`
  pol += `- CIPA: participar das avaliacoes, acolher relatos, fiscalizar cumprimento;\n`
  pol += `- Trabalhadores: participar das avaliacoes, relatar riscos, adotar praticas de autocuidado.\n\n`
  pol += `7. CANAIS DE COMUNICACAO E SUPORTE\n`
  pol += `- Canal de denuncia anonimo (a implementar conforme Lei 14.457/2022);\n`
  pol += `- CIPA e representantes dos trabalhadores;\n`
  pol += `- RH e SESMT;\n`
  pol += `- Programa de apoio psicologico (a implementar).\n\n`
  pol += `8. REVISAO\n`
  pol += `Esta politica sera revisada anualmente ou sempre que houver mudancas significativas nas condicoes de trabalho, na legislacao ou nos resultados das avaliacoes de risco.\n\n`
  pol += `9. FUNDAMENTACAO LEGAL\n`
  pol += `- NR-1 (Portaria SEPRT 6.730/2020) — GRO\n`
  pol += `- NR-7 — PCMSO\n- NR-17 — Ergonomia\n`
  pol += `- ISO 45003:2021 — Saude e seguranca psicologica no trabalho\n`
  pol += `- Lei 14.457/2022 — Prevencao ao assedio\n`
  pol += `- Convencao OIT n. 190 — Violencia e assedio no trabalho\n`
  return pol
}

function gerarComunicacao(
  inventario: Array<Record<string, unknown>>,
  nomeEmpresa: string,
  totalRespostas: number
): Record<string, unknown> {
  const dataAtual = new Date().toLocaleDateString('pt-BR')
  const fatoresCriticos = inventario.filter(i => i.classificacao === 'Critico' || i.classificacao === 'Alto')

  const etapas = [
    {
      fase: 'Comunicacao dos Resultados',
      prazo: '0 a 15 dias',
      publicoAlvo: 'Alta Direcao e Gestores',
      canal: 'Reuniao presencial / videoconferencia',
      conteudo: 'Apresentacao executiva dos resultados da avaliacao, niveis de risco identificados e plano de acao proposto.',
      responsavel: 'RH + SESMT'
    },
    {
      fase: 'Devolutiva aos Trabalhadores',
      prazo: '15 a 30 dias',
      publicoAlvo: 'Todos os colaboradores',
      canal: 'Comunicado interno / reuniao por setor',
      conteudo: 'Resumo dos resultados gerais (sem exposicao individual), acoes planejadas e canais de suporte disponiveis.',
      responsavel: 'RH + Gestores'
    },
    {
      fase: 'Consulta sobre Medidas',
      prazo: '30 a 60 dias',
      publicoAlvo: 'Representantes dos trabalhadores / CIPA',
      canal: 'Reuniao de CIPA / grupos focais',
      conteudo: 'Consulta sobre as medidas de controle propostas, sugestoes de melhoria e priorizacao participativa.',
      responsavel: 'SESMT + CIPA'
    },
    {
      fase: 'Acompanhamento e Feedback',
      prazo: '60 a 180 dias',
      publicoAlvo: 'Todos os colaboradores',
      canal: 'Mural / e-mail / intranet',
      conteudo: 'Atualizacao sobre o andamento das acoes implementadas e proximos passos.',
      responsavel: 'RH'
    },
    {
      fase: 'Reavaliacao e Nova Consulta',
      prazo: '12 meses',
      publicoAlvo: 'Todos os colaboradores',
      canal: 'Questionario anonimo',
      conteudo: 'Nova avaliacao de riscos psicossociais para medir eficacia das acoes e identificar novos riscos.',
      responsavel: 'RH + SESMT'
    }
  ]

  return {
    titulo: `Plano de Comunicacao e Consulta — Riscos Psicossociais — ${nomeEmpresa}`,
    dataElaboracao: dataAtual,
    objetivo: 'Garantir que os resultados da avaliacao de riscos psicossociais sejam comunicados de forma transparente e que os trabalhadores sejam consultados sobre as medidas de controle, conforme requisitos da NR-1 e ISO 45003.',
    principios: [
      'Transparencia: comunicar resultados de forma clara e acessivel',
      'Confidencialidade: nunca expor dados individuais dos respondentes',
      'Participacao: envolver trabalhadores na definicao das medidas',
      'Regularidade: manter comunicacao continua sobre o andamento das acoes',
      'Acessibilidade: usar linguagem simples e canais adequados ao publico'
    ],
    etapas,
    pontosAtencao: fatoresCriticos.length > 0
      ? `Os fatores ${fatoresCriticos.map(f => f.categoria).join(', ')} foram classificados como nivel critico ou alto e devem receber destaque especial na comunicacao com gestores, com orientacoes claras sobre o que se espera como resposta imediata.`
      : 'Nao foram identificados fatores em nivel critico, porem e importante manter a comunicacao ativa para prevencao.',
    registroConsulta: {
      descricao: 'Registrar todas as consultas realizadas com trabalhadores e seus representantes, incluindo data, participantes, temas discutidos e encaminhamentos.',
      modelo: [
        { campo: 'Data', valor: '' },
        { campo: 'Participantes', valor: '' },
        { campo: 'Temas discutidos', valor: '' },
        { campo: 'Sugestoes recebidas', valor: '' },
        { campo: 'Encaminhamentos', valor: '' }
      ]
    },
    referenciaLegal: 'NR-1 item 1.5.3.3 (consulta aos trabalhadores), ISO 45003 item 5.4 (participacao dos trabalhadores), Lei 14.457/2022'
  }
}

function gerarRelatorioISO45003(
  inventario: Array<Record<string, unknown>>,
  indicadores: Record<string, unknown>,
  nomeEmpresa: string,
  totalRespostas: number,
  totalColaboradores: number
): Record<string, unknown> {
  const dataAtual = new Date().toLocaleDateString('pt-BR')
  const ind = indicadores as Record<string, number | string | null>

  const mapeamentoFatores = inventario.map(item => ({
    categoria: item.categoria,
    fatorISO45003: item.fatorISO45003 || 'Fator psicossocial geral',
    fatorNR1: item.fatorNR1,
    media: item.mediaPontuacao,
    classificacao: item.classificacao,
    nivelRisco: item.nivelRisco,
    totalMedidas: ((item.medidasRecomendadas as Array<unknown>) || []).length,
    conformidade: (item.classificacao === 'Baixo' || item.classificacao === 'Muito Baixo')
      ? 'Adequado' : (item.classificacao === 'Moderado' ? 'Requer atencao' : 'Nao conforme')
  }))

  const requisitos = [
    { clausula: '4.1', requisito: 'Contexto da organizacao', status: 'Atendido', evidencia: 'Avaliacao de riscos psicossociais realizada com participacao dos trabalhadores' },
    { clausula: '4.2', requisito: 'Necessidades e expectativas dos trabalhadores', status: 'Parcialmente atendido', evidencia: `Questionario aplicado a ${totalRespostas} respondentes. Recomenda-se complementar com grupos focais.` },
    { clausula: '5.1', requisito: 'Lideranca e compromisso', status: 'Em implementacao', evidencia: 'Politica de saude psicologica em elaboracao. Necessaria aprovacao da alta direcao.' },
    { clausula: '5.2', requisito: 'Politica', status: 'Em implementacao', evidencia: 'Politica de saude psicologica e seguranca no trabalho elaborada como parte deste PGR.' },
    { clausula: '5.4', requisito: 'Participacao dos trabalhadores', status: 'Parcialmente atendido', evidencia: 'Trabalhadores participaram via questionario. Plano de consulta elaborado para proximas etapas.' },
    { clausula: '6.1', requisito: 'Acoes para abordar riscos e oportunidades', status: 'Atendido', evidencia: 'Inventario de riscos elaborado com matriz de probabilidade x severidade e plano de acao.' },
    { clausula: '8.1', requisito: 'Planejamento e controle operacional', status: 'Em implementacao', evidencia: 'Plano de acao com medidas de controle, responsaveis e prazos definidos.' },
    { clausula: '9.1', requisito: 'Monitoramento e medicao', status: 'Em implementacao', evidencia: 'Registro de monitoramento elaborado com indicadores e metas. Primeira medicao realizada.' },
    { clausula: '10.1', requisito: 'Melhoria continua', status: 'Planejado', evidencia: 'Ciclo de reavaliacao de 12 meses definido. Criterios de reavaliacao antecipada estabelecidos.' }
  ]

  return {
    titulo: `Relatorio de Analise ISO 45003:2021 — ${nomeEmpresa}`,
    dataElaboracao: dataAtual,
    resumoExecutivo: `Este relatorio apresenta a analise de conformidade da ${nomeEmpresa} com a ISO 45003:2021 (Gestao da saude e segsharon psicologica no trabalho). A avaliacao abrangeu ${totalRespostas} trabalhadores e identificou ${ind.totalFatoresAvaliados} categorias de risco psicossocial. A organizacao encontra-se em processo de adequacao, com inventario de riscos elaborado e plano de acao definido.`,
    mapeamentoFatores,
    analiseRequisitos: requisitos,
    lacunasIdentificadas: [
      requisitos.some(r => r.status === 'Nao atendido') ? 'Existem requisitos nao atendidos que demandam acao corretiva' : null,
      Number(ind.fatoresCriticos) > 0 ? `${ind.fatoresCriticos} fator(es) em nivel critico requerem intervencao imediata` : null,
      'Canal de denuncia anonimo pode necessitar de implementacao ou revisao',
      'Programa de apoio psicologico pode necessitar de implementacao'
    ].filter(Boolean),
    recomendacoes: [
      'Formalizar e aprovar a Politica de Saude Psicologica e Seguranca',
      'Implementar o Plano de Comunicacao e Consulta com os trabalhadores',
      'Estabelecer programa de capacitacao de gestores em riscos psicossociais',
      'Implementar ou revisar canal de denuncia anonimo conforme Lei 14.457/2022',
      'Integrar monitoramento de riscos psicossociais ao sistema de gestao de SST existente'
    ],
    statusGeral: Number(ind.fatoresCriticos) > 0 ? 'Requer acao imediata'
      : Number(ind.fatoresAltos) > 0 ? 'Em adequacao — atencao necessaria'
      : 'Em conformidade parcial — manter monitoramento'
  }
}

function gerarIndicadoresSaude(
  inventario: Array<Record<string, unknown>>,
  indicadores: Record<string, unknown>,
  analiseSetores: Array<Record<string, unknown>>,
  totalRespostas: number,
  totalColaboradores: number
): Record<string, unknown> {
  const ind = indicadores as Record<string, number | string | null>
  const dataAtual = new Date().toLocaleDateString('pt-BR')

  const categoriasOrdenadas = inventario.map(i => ({
    categoria: i.categoria as string,
    media: i.mediaPontuacao as number,
    classificacao: i.classificacao as string,
    percentualCritico: i.percentualCritico as number
  }))

  const piorCategoria = categoriasOrdenadas[0] || null
  const melhorCategoria = categoriasOrdenadas.length > 0 ? categoriasOrdenadas[categoriasOrdenadas.length - 1] : null

  const indiceRiscoPsicossocial = inventario.length > 0
    ? Math.round((inventario.reduce((s, i) => s + (i.nivelRisco as number), 0) / (inventario.length * 25)) * 100 * 100) / 100
    : 0

  return {
    titulo: 'Indicadores e Metricas de Saude Psicossocial',
    dataApuracao: dataAtual,
    indicadoresPrincipais: {
      mediaGeral: { valor: ind.mediaGeral, escala: '1 a 5', interpretacao: Number(ind.mediaGeral) >= 3.5 ? 'Favoravel' : Number(ind.mediaGeral) >= 2.5 ? 'Atencao' : 'Critico' },
      indiceRiscoPsicossocial: { valor: indiceRiscoPsicossocial, escala: '0% a 100%', interpretacao: indiceRiscoPsicossocial <= 30 ? 'Risco baixo' : indiceRiscoPsicossocial <= 60 ? 'Risco moderado' : 'Risco elevado', descricao: 'Percentual do nivel de risco maximo possivel (quanto menor, melhor)' },
      taxaParticipacao: { valor: ind.taxaParticipacao, meta: '>=70%', interpretacao: Number(ind.taxaParticipacao) >= 70 ? 'Adequada' : Number(ind.taxaParticipacao) >= 50 ? 'Aceitavel' : 'Insuficiente' },
      concentracaoRiscoCritico: { valor: `${ind.fatoresCriticos} de ${ind.totalFatoresAvaliados} fatores`, percentual: Number(ind.totalFatoresAvaliados) > 0 ? Math.round((Number(ind.fatoresCriticos) / Number(ind.totalFatoresAvaliados)) * 100) : 0 }
    },
    perfilRisco: {
      piorCategoria: piorCategoria ? { nome: piorCategoria.categoria, media: piorCategoria.media, classificacao: piorCategoria.classificacao } : null,
      melhorCategoria: melhorCategoria ? { nome: melhorCategoria.categoria, media: melhorCategoria.media, classificacao: melhorCategoria.classificacao } : null,
      amplitude: piorCategoria && melhorCategoria ? Math.round((melhorCategoria.media - piorCategoria.media) * 100) / 100 : 0,
      categoriasCriticas: categoriasOrdenadas.filter(c => c.classificacao === 'Critico').map(c => c.categoria),
      categoriasSeguras: categoriasOrdenadas.filter(c => ['Baixo', 'Muito Baixo'].includes(c.classificacao)).map(c => c.categoria)
    },
    indicadoresComplementares: {
      absenteismo: { valorAtual: 'A coletar', meta: 'Reducao progressiva', fonte: 'RH / Folha', frequencia: 'Mensal' },
      turnover: { valorAtual: 'A coletar', meta: 'Reducao progressiva', fonte: 'RH', frequencia: 'Mensal' },
      afastamentosCID_F: { valorAtual: 'A coletar', meta: 'Reducao de 15% em 12 meses', fonte: 'SESMT / PCMSO', frequencia: 'Mensal' },
      reclamacoesAssedio: { valorAtual: 'A coletar', meta: 'Zero ocorrencias nao tratadas', fonte: 'Canal de denuncia', frequencia: 'Continuo' },
      presenteismo: { valorAtual: 'A coletar', meta: 'Identificar e monitorar', fonte: 'Gestores / RH', frequencia: 'Trimestral' },
      satisfacaoGeral: { valorAtual: ind.mediaGeral, meta: '>=3.5', fonte: 'Avaliacao psicossocial', frequencia: 'Anual' }
    },
    metas12meses: [
      { indicador: 'Media geral da avaliacao', meta: Number(ind.mediaGeral) < 3.5 ? 'Elevar para >=3.5' : 'Manter >=3.5', prazo: '12 meses' },
      { indicador: 'Fatores em nivel critico', meta: 'Reduzir a zero', prazo: '6 meses' },
      { indicador: 'Fatores em nivel alto', meta: 'Reduzir classificacao em 1 faixa', prazo: '12 meses' },
      { indicador: 'Taxa de participacao', meta: '>=70%', prazo: 'Proxima avaliacao' },
      { indicador: 'Indice de risco psicossocial', meta: '<=30%', prazo: '12 meses' }
    ]
  }
}

function gerarDeclaracaoConformidade(
  nomeEmpresa: string,
  inventario: Array<Record<string, unknown>>,
  totalRespostas: number,
  totalColaboradores: number
): string {
  const dataAtual = new Date().toLocaleDateString('pt-BR')
  const totalFatores = inventario.length
  const criticos = inventario.filter(i => i.classificacao === 'Critico').length
  const taxaPart = totalColaboradores > 0 ? ((totalRespostas / totalColaboradores) * 100).toFixed(1) : 'N/D'

  let decl = `DECLARACAO DE CONFORMIDADE\n`
  decl += `GERENCIAMENTO DE RISCOS OCUPACIONAIS — FATORES PSICOSSOCIAIS\n\n`
  decl += `Empresa: ${nomeEmpresa}\n`
  decl += `Data: ${dataAtual}\n`
  decl += `Documento: PGR — Riscos Psicossociais\n\n`
  decl += `DECLARAMOS, para os devidos fins, que a empresa ${nomeEmpresa} realizou a avaliacao de riscos psicossociais no ambiente de trabalho, em conformidade com os seguintes requisitos legais e normativos:\n\n`
  decl += `1. NORMAS E LEGISLACAO ATENDIDAS\n`
  decl += `[X] NR-1 — Gerenciamento de Riscos Ocupacionais (Portaria SEPRT 6.730/2020)\n`
  decl += `    - Identificacao de perigos (item 1.5.4.2)\n`
  decl += `    - Avaliacao de riscos (item 1.5.4.3)\n`
  decl += `    - Medidas de prevencao (item 1.5.4.4)\n`
  decl += `    - Inventario de riscos (item 1.5.7.1)\n`
  decl += `    - Plano de acao (item 1.5.5.2)\n\n`
  decl += `[X] NR-7 — PCMSO\n`
  decl += `    - Riscos psicossociais identificados para inclusao no PCMSO\n\n`
  decl += `[X] NR-17 — Ergonomia\n`
  decl += `    - Fatores de organizacao do trabalho avaliados\n\n`
  decl += `[X] ISO 45003:2021\n`
  decl += `    - Diretrizes de gestao de saude psicologica e seguranca aplicadas\n\n`
  decl += `[X] Lei 14.457/2022\n`
  decl += `    - Medidas de prevencao ao assedio consideradas\n\n`
  decl += `2. ESCOPO DA AVALIACAO\n`
  decl += `- Respondentes: ${totalRespostas}\n`
  decl += `- Taxa de participacao: ${taxaPart}%\n`
  decl += `- Fatores avaliados: ${totalFatores}\n`
  decl += `- Fatores em nivel critico: ${criticos}\n\n`
  decl += `3. DOCUMENTOS GERADOS\n`
  decl += `[X] Inventario de Riscos Psicossociais\n`
  decl += `[X] Matriz de Risco (Probabilidade x Severidade)\n`
  decl += `[X] Analise Preliminar de Riscos (APR)\n`
  decl += `[X] Relatorio de Avaliacao de Riscos Psicossociais\n`
  decl += `[X] Plano de Acao com medidas de controle\n`
  decl += `[X] Cronograma de implementacao\n`
  decl += `[X] Politica de Saude Psicologica e Seguranca\n`
  decl += `[X] Plano de Comunicacao e Consulta\n`
  decl += `[X] Registro de Monitoramento e Reavaliacao\n`
  decl += `[X] Relatorio de Analise ISO 45003\n`
  decl += `[X] Indicadores e Metricas de Saude Psicossocial\n`
  decl += `[X] Parecer Tecnico\n`
  decl += `[X] Declaracao de Conformidade (este documento)\n\n`
  decl += `4. COMPROMISSO\n`
  decl += `A organizacao se compromete a:\n`
  decl += `a) Implementar as medidas de controle nos prazos estabelecidos no Plano de Acao;\n`
  decl += `b) Manter os documentos atualizados e disponiveis para fiscalizacao;\n`
  decl += `c) Realizar reavaliacao no prazo maximo de 12 meses;\n`
  decl += `d) Comunicar os resultados aos trabalhadores conforme Plano de Comunicacao;\n`
  decl += `e) Integrar os riscos psicossociais ao GRO da organizacao.\n\n`
  decl += `5. VALIDADE\n`
  decl += `Esta declaracao e valida ate a proxima reavaliacao programada ou ate que mudancas significativas nas condicoes de trabalho exijam revisao antecipada.\n\n`
  decl += `_______________________________________________\n`
  decl += `Responsavel Tecnico / Empregador\n`
  decl += `${nomeEmpresa}\n`
  decl += `${dataAtual}\n`
  return decl
}

// ============================================================
// ROTA PRINCIPAL — POST /api/pgr/gerar
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    const body = await request.json()
    const { questionarioId } = body
    if (!questionarioId) return NextResponse.json({ error: 'questionarioId obrigatorio' }, { status: 400 })

    const questionario = await prisma.questionario.findFirst({
      where: { id: questionarioId, empresaId: auth.empresaId },
      include: { empresa: true }
    })
    if (!questionario) return NextResponse.json({ error: 'Questionario nao encontrado' }, { status: 404 })

    const respostas = await prisma.resposta.findMany({
      where: { questionarioId, completada: true },
      include: {
        itens: {
          include: {
            pergunta: {
              select: {
                id: true, texto: true, categoria: true, subcategoria: true,
                fatorNR1: true, fatorISO45003: true, ordem: true,
                peso: true, invertida: true, escalaMax: true, escalaMin: true,
                tipoResposta: true
              }
            }
          }
        }
      }
    })

    const totalRespostas = respostas.length
    if (totalRespostas === 0) return NextResponse.json({ error: 'Nao ha respostas coletadas' }, { status: 400 })

    const setoresEmpresa = await prisma.setor.findMany({
      where: { empresaId: auth.empresaId },
      select: { totalColaboradores: true }
    })
    const totalColaboradores = setoresEmpresa.reduce((s, se) => s + se.totalColaboradores, 0)

    const ajustarValor = (valor: number, invertida: boolean, escalaMax: number | null): number => {
      if (invertida && escalaMax) return (escalaMax + 1) - valor
      return valor
    }

    interface CategoriaData {
      soma: number; count: number; somaOriginal: number; pesos: number[]
      fatorNR1: string | null; fatorISO45003: string | null
      subcategorias: Set<string>; faixas: Record<number, number>; perguntasTexto: string[]
    }

    const categoriaMap: Record<string, CategoriaData> = {}
    respostas.forEach(r => {
      r.itens.forEach(item => {
        if (item.valorNumerico === null) return
        if (item.pergunta.tipoResposta !== 'ESCALA') return
        const cat = item.pergunta.categoria
        const val = ajustarValor(item.valorNumerico, item.pergunta.invertida, item.pergunta.escalaMax)
        if (!categoriaMap[cat]) {
          categoriaMap[cat] = {
            soma: 0, count: 0, somaOriginal: 0, pesos: [],
            fatorNR1: item.pergunta.fatorNR1, fatorISO45003: item.pergunta.fatorISO45003,
            subcategorias: new Set(), faixas: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, perguntasTexto: []
          }
        }
        categoriaMap[cat].soma += val
        categoriaMap[cat].somaOriginal += item.valorNumerico
        categoriaMap[cat].count += 1
        categoriaMap[cat].pesos.push(item.pergunta.peso)
        if (item.pergunta.subcategoria) categoriaMap[cat].subcategorias.add(item.pergunta.subcategoria)
        if (!categoriaMap[cat].perguntasTexto.includes(item.pergunta.texto)) {
          categoriaMap[cat].perguntasTexto.push(item.pergunta.texto)
        }
        const faixa = Math.min(5, Math.max(1, Math.round(val)))
        categoriaMap[cat].faixas[faixa] += 1
      })
    })

    interface SetorData {
      soma: number; count: number; respondentes: number
      categorias: Record<string, { soma: number; count: number }>
    }
    const setorMap: Record<string, SetorData> = {}
    respostas.forEach(r => {
      const setor = r.setor || 'Nao informado'
      if (!setorMap[setor]) setorMap[setor] = { soma: 0, count: 0, respondentes: 0, categorias: {} }
      setorMap[setor].respondentes += 1
      r.itens.forEach(item => {
        if (item.valorNumerico === null || item.pergunta.tipoResposta !== 'ESCALA') return
        const val = ajustarValor(item.valorNumerico, item.pergunta.invertida, item.pergunta.escalaMax)
        setorMap[setor].soma += val
        setorMap[setor].count += 1
        const cat = item.pergunta.categoria
        if (!setorMap[setor].categorias[cat]) setorMap[setor].categorias[cat] = { soma: 0, count: 0 }
        setorMap[setor].categorias[cat].soma += val
        setorMap[setor].categorias[cat].count += 1
      })
    })

    const medidasBanco = await prisma.medidaControle.findMany({ where: { ativo: true }, orderBy: { prioridade: 'asc' } })
    const causasBanco = await prisma.causaProvavel.findMany({ where: { ativo: true } })

    const inventario: Array<Record<string, unknown>> = []
    const avaliacoesParaSalvar: Array<Record<string, unknown>> = []

    for (const [categoria, dados] of Object.entries(categoriaMap)) {
      const media = Math.round((dados.soma / dados.count) * 100) / 100
      const pesoMedio = dados.pesos.reduce((s, p) => s + p, 0) / dados.pesos.length
      const totalCritico = dados.faixas[1] + dados.faixas[2]
      const percentualCritico = Math.round((totalCritico / dados.count) * 100 * 100) / 100
      const prob = classificarProbabilidade(media)
      const sev = classificarSeveridade(percentualCritico, pesoMedio, categoria)
      const nivelRisco = prob.valor * sev.valor
      const classif = classificarNivelRisco(nivelRisco)

      const medidasCategoria = medidasBanco.filter(m => m.categoria === categoria && m.nivelRisco === classif.classificacao)
      const niveis = ['Critico', 'Alto', 'Moderado', 'Baixo']
      let medidasFinais = medidasCategoria
      if (medidasFinais.length === 0) {
        const idxAtual = niveis.indexOf(classif.classificacao)
        for (let i = idxAtual - 1; i >= 0; i--) {
          medidasFinais = medidasBanco.filter(m => m.categoria === categoria && m.nivelRisco === niveis[i])
          if (medidasFinais.length > 0) break
        }
      }
      if (medidasFinais.length === 0) medidasFinais = medidasBanco.filter(m => m.categoria === categoria).slice(0, 2)

      const causasCategoria = causasBanco.filter(c => c.categoria === categoria)

      inventario.push({
        categoria,
        subcategorias: Array.from(dados.subcategorias),
        fatorNR1: dados.fatorNR1, fatorISO45003: dados.fatorISO45003,
        mediaPontuacao: media, totalRespostas: dados.count, totalRespondentes: totalRespostas,
        percentualCritico, distribuicao: dados.faixas,
        probabilidade: prob, severidade: sev, nivelRisco,
        classificacao: classif.classificacao, cor: classif.cor, prioridade: classif.prioridade,
        causasProvaveis: causasCategoria.map(c => ({
          titulo: c.titulo, descricao: c.descricao, impactos: c.impactos,
          indicadorRelacionado: c.indicadorRelacionado, evidencia: c.evidencia
        })),
        medidasRecomendadas: medidasFinais.map(m => ({
          tipo: m.tipo, titulo: m.titulo, descricao: m.descricao,
          responsavel: m.responsavel, prazoSugerido: m.prazoSugerido,
          referenciaLegal: m.referenciaLegal, prioridade: m.prioridade
        })),
        perguntasAvaliadas: dados.perguntasTexto
      })

      avaliacoesParaSalvar.push({
        questionarioId, categoria,
        subcategoria: Array.from(dados.subcategorias).join('; ') || null,
        fatorNR1: dados.fatorNR1,
        probabilidade: prob.valor, severidade: sev.valor, nivelRisco,
        classificacao: classif.classificacao, mediaPontuacao: media,
        totalRespostas: dados.count, percentualCritico,
        descricaoPerigo: `Exposicao a fatores de risco psicossocial na categoria "${categoria}"`,
        consequencias: causasCategoria.map(c => c.impactos).filter(Boolean).join('; ') || 'Potencial adoecimento mental, absenteismo, queda de performance',
        medidasExistentes: null,
        medidasRecomendadas: medidasFinais.map(m => m.titulo).join('; '),
        responsavel: medidasFinais[0]?.responsavel || 'RH + SESMT',
        prazo: null, statusAcao: 'PENDENTE', empresaId: auth.empresaId
      })
    }

    inventario.sort((a, b) => (b.nivelRisco as number) - (a.nivelRisco as number))

    const matrizRisco = inventario.map(item => ({
      categoria: item.categoria,
      probabilidade: (item.probabilidade as { valor: number }).valor,
      probabilidadeDesc: (item.probabilidade as { descricao: string }).descricao,
      severidade: (item.severidade as { valor: number }).valor,
      severidadeDesc: (item.severidade as { descricao: string }).descricao,
      nivelRisco: item.nivelRisco, classificacao: item.classificacao
    }))

    const analiseSetores = Object.entries(setorMap).map(([setor, dados]) => {
      const mediaSetor = Math.round((dados.soma / dados.count) * 100) / 100
      const categoriasSetor = Object.entries(dados.categorias).map(([cat, catDados]) => ({
        categoria: cat, media: Math.round((catDados.soma / catDados.count) * 100) / 100
      })).sort((a, b) => a.media - b.media)
      return {
        setor, media: mediaSetor, respondentes: dados.respondentes, totalItens: dados.count,
        categorias: categoriasSetor,
        pontosCriticos: categoriasSetor.filter(c => c.media <= 2.5).map(c => c.categoria),
        pontosFortes: categoriasSetor.filter(c => c.media >= 4.0).map(c => c.categoria)
      }
    }).sort((a, b) => a.media - b.media)

    let ordemAcao = 1
    const planoAcao: Array<Record<string, unknown>> = []
    for (const item of inventario) {
      for (const medida of (item.medidasRecomendadas as Array<Record<string, unknown>>)) {
        planoAcao.push({
          ordem: ordemAcao++, categoria: item.categoria, fatorNR1: item.fatorNR1,
          classificacaoRisco: item.classificacao, nivelRisco: item.nivelRisco,
          acao: medida.titulo, descricao: medida.descricao, tipo: medida.tipo,
          responsavel: medida.responsavel, prazo: medida.prazoSugerido,
          referenciaLegal: medida.referenciaLegal, status: 'PENDENTE'
        })
      }
    }

    const mediaGeral = inventario.length > 0
      ? Math.round((inventario.reduce((s, i) => s + (i.mediaPontuacao as number), 0) / inventario.length) * 100) / 100 : 0

    const indicadores = {
      mediaGeral, totalRespondentes: totalRespostas, totalColaboradores,
      taxaParticipacao: totalColaboradores > 0 ? Math.round((totalRespostas / totalColaboradores) * 100 * 100) / 100 : null,
      totalFatoresAvaliados: inventario.length,
      fatoresCriticos: inventario.filter(i => i.classificacao === 'Critico').length,
      fatoresAltos: inventario.filter(i => i.classificacao === 'Alto').length,
      fatoresModerados: inventario.filter(i => i.classificacao === 'Moderado').length,
      fatoresBaixos: inventario.filter(i => ['Baixo', 'Muito Baixo'].includes(i.classificacao as string)).length,
      totalMedidasRecomendadas: planoAcao.length,
      setorMaisCritico: analiseSetores.length > 0 ? analiseSetores[0].setor : null,
      setorMaisSeguro: analiseSetores.length > 0 ? analiseSetores[analiseSetores.length - 1].setor : null,
    }

    const avaliacoesParaParecer = inventario.map(i => ({
      categoria: i.categoria as string, classificacao: i.classificacao as string,
      nivelRisco: i.nivelRisco as number, media: i.mediaPontuacao as number
    }))

    const parecer = gerarParecerTecnico(avaliacoesParaParecer, totalRespostas, totalColaboradores, questionario.empresa.nomeFantasia)

    const cronograma = [
      { fase: 'Fase 1 — Acao Imediata', prazo: '0 a 30 dias', descricao: 'Implementar medidas para fatores CRITICO. Ativar protocolos emergenciais.', status: 'PENDENTE' },
      { fase: 'Fase 2 — Curto Prazo', prazo: '30 a 90 dias', descricao: 'Implementar medidas para fatores ALTO. Iniciar programas estruturados.', status: 'PENDENTE' },
      { fase: 'Fase 3 — Medio Prazo', prazo: '90 a 180 dias', descricao: 'Implementar medidas para fatores MODERADOS. Consolidar programas.', status: 'PENDENTE' },
      { fase: 'Fase 4 — Monitoramento', prazo: '180 a 360 dias', descricao: 'Monitoramento continuo. Nova avaliacao para medir eficacia.', status: 'PENDENTE' },
    ]

    const conformidade = {
      nr1: { descricao: 'NR-1 — Gerenciamento de Riscos Ocupacionais', status: 'EM ATENDIMENTO', evidencia: 'Avaliacao realizada. Inventario elaborado. Plano de acao definido.' },
      nr7: { descricao: 'NR-7 — PCMSO', status: 'VERIFICAR', evidencia: 'Recomenda-se incluir riscos psicossociais no PCMSO e ASOs.' },
      nr17: { descricao: 'NR-17 — Ergonomia (Organizacao do Trabalho)', status: 'VERIFICAR', evidencia: 'Fatores organizacionais avaliados. Verificar alinhamento com AET.' },
      iso45003: { descricao: 'ISO 45003:2021 — Saude e Seguranca Psicologica', status: 'EM ATENDIMENTO', evidencia: 'Avaliacao baseada nos fatores da ISO 45003. Medidas alinhadas.' },
      lei14457: { descricao: 'Lei 14.457/2022 — Prevencao ao Assedio', status: 'VERIFICAR', evidencia: 'Fator de relacoes interpessoais avaliado. Verificar canal de denuncia e CIPA.' }
    }

    // ============================================================
    // GERAR NOVOS DOCUMENTOS
    // ============================================================
    const nomeEmpresa = questionario.empresa.nomeFantasia
    const periodoAvaliacao = questionario.dataInicio
      ? `${questionario.dataInicio.toLocaleDateString('pt-BR')} a ${(questionario.dataFim || new Date()).toLocaleDateString('pt-BR')}`
      : new Date().toLocaleDateString('pt-BR')

    const apr = gerarAPR(inventario, nomeEmpresa, totalRespostas)
    const relatorioAval = gerarRelatorioAvaliacao(inventario, indicadores, analiseSetores, nomeEmpresa, periodoAvaliacao, totalRespostas, totalColaboradores)
    const monitoramento = gerarMonitoramento(inventario, nomeEmpresa)
    const politica = gerarPoliticaSST(nomeEmpresa, inventario)
    const comunicacao = gerarComunicacao(inventario, nomeEmpresa, totalRespostas)
    const relatorioISO = gerarRelatorioISO45003(inventario, indicadores, nomeEmpresa, totalRespostas, totalColaboradores)
    const indicadoresSaude = gerarIndicadoresSaude(inventario, indicadores, analiseSetores, totalRespostas, totalColaboradores)
    const declaracao = gerarDeclaracaoConformidade(nomeEmpresa, inventario, totalRespostas, totalColaboradores)

    // ============================================================
    // SALVAR NO BANCO
    // ============================================================
    const pgrExistente = await prisma.pGR.findFirst({
      where: { questionarioId, empresaId: auth.empresaId },
      orderBy: { versao: 'desc' }
    })
    const novaVersao = pgrExistente ? pgrExistente.versao + 1 : 1

    const pgr = await prisma.pGR.create({
      data: {
        titulo: `PGR Psicossocial — ${nomeEmpresa} — v${novaVersao}`,
        versao: novaVersao,
        status: 'RASCUNHO',
        questionarioId,
        periodoAvaliacao,
        totalRespondentes: totalRespostas,
        totalColaboradores,
        taxaParticipacao: totalColaboradores > 0 ? (totalRespostas / totalColaboradores) * 100 : null,
        objetivos: 'Identificar, avaliar e controlar os fatores de risco psicossocial no ambiente de trabalho, em conformidade com a NR-1 e a ISO 45003:2021.',
        escopo: `Avaliacao aplicada a todos os setores da empresa ${nomeEmpresa}, abrangendo ${inventario.length} categorias de risco psicossocial.`,
        responsabilidades: 'Empregador: garantir recursos e implementacao. RH: coordenar acoes. SESMT: apoio tecnico. Gestores: execucao no setor. Colaboradores: participacao ativa.',
        metodologia: 'Questionario anonimo baseado na ISO 45003:2021 com escala Likert de 5 pontos. Classificacao de risco por matriz Probabilidade x Severidade (5x5). Medidas de controle baseadas em banco de dados tecnico.',
        inventarioJSON: JSON.stringify(inventario),
        matrizRiscoJSON: JSON.stringify(matrizRisco),
        indicadoresJSON: JSON.stringify(indicadores),
        analiseSetoresJSON: JSON.stringify(analiseSetores),
        medidasJSON: JSON.stringify(inventario.map(i => ({ categoria: i.categoria, classificacao: i.classificacao, medidas: i.medidasRecomendadas }))),
        planoAcaoJSON: JSON.stringify(planoAcao),
        cronogramaJSON: JSON.stringify(cronograma),
        conformidadeJSON: JSON.stringify(conformidade),
        aprJSON: JSON.stringify(apr),
        relatorioAvalJSON: JSON.stringify(relatorioAval),
        monitoramentoJSON: JSON.stringify(monitoramento),
        politicaSST: politica,
        comunicacaoJSON: JSON.stringify(comunicacao),
        relatorioISO45003JSON: JSON.stringify(relatorioISO),
        indicadoresSaudeJSON: JSON.stringify(indicadoresSaude),
        declaracaoConformidade: declaracao,
        parecerTecnico: parecer,
        empresaId: auth.empresaId
      }
    })

    await prisma.avaliacaoRisco.deleteMany({ where: { questionarioId, empresaId: auth.empresaId } })
    for (const av of avaliacoesParaSalvar) {
      await prisma.avaliacaoRisco.create({ data: av as any })
    }

    return NextResponse.json({
      id: pgr.id, titulo: pgr.titulo, versao: pgr.versao, status: pgr.status,
      totalRespondentes: totalRespostas, totalColaboradores,
      totalFatoresAvaliados: inventario.length,
      fatoresCriticos: indicadores.fatoresCriticos,
      fatoresAltos: indicadores.fatoresAltos,
      totalMedidasRecomendadas: planoAcao.length,
      documentosGerados: ['inventario', 'matriz', 'apr', 'relatorioAvaliacao', 'planoAcao', 'cronograma', 'conformidade', 'monitoramento', 'politicaSST', 'comunicacao', 'relatorioISO45003', 'indicadoresSaude', 'declaracaoConformidade', 'parecerTecnico'],
      message: 'PGR gerado com sucesso — 14 documentos'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao gerar PGR:', error)
    return NextResponse.json({ error: 'Erro interno ao gerar PGR' }, { status: 500 })
  }
}
