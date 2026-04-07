// src/app/dashboard/pgr/templates/doc-01-apresentacao.ts
// Documento 1 — Apresentação e Contextualização do PGR Psicossocial
// Estruturado conforme NR-1 (Portaria SEPRT nº 6.730/2020)
// ============================================================

export interface DadosContratante {
  razaoSocial: string
  cnpj: string
  endereco: string
  cidade: string
  uf: string
  cep: string
  telefone: string
  email: string
  cnae: string
  descricaoCnae: string
  grauRisco: string
  totalColaboradores: number
  setoresAvaliados: string[]
  responsavelEmpresa: string
  cargoResponsavel: string
}

export interface DadosPGR {
  dataElaboracao: string
  periodoAvaliacao: string
  versao: number
  totalRespondentes: number
  taxaParticipacao: number | null
}

// ============================================================
// DADOS FIXOS DA PRESTADORA
// ============================================================
export const PRESTADORA = {
  razaoSocial: 'Ricardo Vilela Assessoria, Consultoria e Gestão de Pessoas Ltda',
  cnpj: '17.461.060/0001-04',
  endereco: 'Avenida Sete de Setembro, 375 – Centro – Ibitinga/SP – CEP 14940-157',
  telefone: '(16) 99783-5572',
  email: 'ricardovilela@gruporicardovilela.com.br',
  responsavelTecnico: 'Ricardo Estevanatto Vilela',
  formacao: 'Técnico em Segurança do Trabalho',
  registroProfissional: 'MTE SP/01260',
}

// ============================================================
// GERADOR DO DOCUMENTO 1
// ============================================================
export function gerarDoc01Apresentacao(
  contratante: DadosContratante,
  dadosPGR: DadosPGR
): string {

  const setoresLista = contratante.setoresAvaliados.length > 0
    ? contratante.setoresAvaliados.map(s => `    - ${s}`).join('\n')
    : '    - Todos os setores da organização'

  return `
================================================================================
PROGRAMA DE GERENCIAMENTO DE RISCOS — PGR
GERENCIAMENTO DE RISCOS PSICOSSOCIAIS NO TRABALHO
DOCUMENTO 1 — APRESENTAÇÃO E CONTEXTUALIZAÇÃO
================================================================================

Documento: PGR-PSI-001
Versão: ${String(dadosPGR.versao).padStart(2, '0')}
Data de Elaboração: ${dadosPGR.dataElaboracao}
Período de Referência: ${dadosPGR.periodoAvaliacao}
Classificação: Documento Técnico Oficial
Status: Vigente

================================================================================
1. IDENTIFICAÇÃO DA EMPRESA CONTRATANTE
================================================================================

Razão Social: ${contratante.razaoSocial}
CNPJ: ${contratante.cnpj}
Endereço: ${contratante.endereco} – ${contratante.cidade}/${contratante.uf} – CEP ${contratante.cep}
Telefone: ${contratante.telefone}
E-mail: ${contratante.email}
CNAE: ${contratante.cnae} – ${contratante.descricaoCnae}
Grau de Risco: ${contratante.grauRisco}
Total de Colaboradores: ${contratante.totalColaboradores}
Responsável pela Empresa: ${contratante.responsavelEmpresa}
Cargo: ${contratante.cargoResponsavel}

================================================================================
2. IDENTIFICAÇÃO DA EMPRESA PRESTADORA
================================================================================

Razão Social: ${PRESTADORA.razaoSocial}
CNPJ: ${PRESTADORA.cnpj}
Endereço: ${PRESTADORA.endereco}
Telefone: ${PRESTADORA.telefone}
E-mail: ${PRESTADORA.email}

Responsável Técnico: ${PRESTADORA.responsavelTecnico}
Formação: ${PRESTADORA.formacao}
Registro Profissional: ${PRESTADORA.registroProfissional}

================================================================================
3. APRESENTAÇÃO DO DOCUMENTO
================================================================================

O presente documento constitui o Programa de Gerenciamento de Riscos — PGR,
com foco específico no gerenciamento de riscos psicossociais relacionados ao
trabalho, elaborado em conformidade com as disposições da Norma Regulamentadora
nº 1 — NR-1 (Portaria SEPRT nº 6.730, de 09 de março de 2020), atualizada
pela Portaria MTE nº 1.419, de 27 de agosto de 2024.

Este PGR atende às exigências do Gerenciamento de Riscos Ocupacionais — GRO,
conforme estabelecido no item 1.5.3 da NR-1, que determina que a organização
deve implementar, por estabelecimento, o gerenciamento de riscos ocupacionais
em suas atividades, contemplando todas as categorias de perigos e riscos
reconhecidas pela norma, incluindo expressamente os fatores de riscos
psicossociais relacionados ao trabalho.

O documento foi elaborado sob a responsabilidade técnica de
${PRESTADORA.responsavelTecnico}, profissional habilitado com registro
${PRESTADORA.registroProfissional}, em atendimento ao disposto no
item 1.5.3.1 da NR-1.

================================================================================
4. OBJETIVO DO PGR PSICOSSOCIAL
================================================================================

Este Programa tem por objetivo:

a) Identificar sistematicamente os perigos e fatores de risco psicossociais
   presentes no ambiente de trabalho da empresa ${contratante.razaoSocial},
   conforme item 1.5.4.2 da NR-1;

b) Avaliar os riscos psicossociais ocupacionais identificados, determinando
   a necessidade de adoção de medidas de prevenção, conforme item 1.5.4.3
   da NR-1;

c) Implementar medidas de prevenção adequadas, de acordo com a classificação
   de risco e a ordem de prioridade estabelecida no item 1.5.5.2 da NR-1;

d) Acompanhar, monitorar e revisar periodicamente o controle dos riscos
   ocupacionais psicossociais, conforme item 1.5.4.4 da NR-1;

e) Registrar e documentar digitalmente todas as etapas do processo,
   conforme disposições do item 1.5.7.1 da NR-1;

f) Assegurar a participação dos trabalhadores no processo de gerenciamento
   de riscos, conforme item 1.5.3.3 da NR-1.

================================================================================
5. BASE LEGAL E NORMATIVA
================================================================================

Este documento fundamenta-se nas seguintes disposições legais e normativas:

5.1 NORMA REGULAMENTADORA Nº 1 — DISPOSIÇÕES GERAIS E GRO
────────────────────────────────────────────────────────────

• Item 1.5.1 — Objetivo do GRO:
  "A organização deve implementar, por estabelecimento, o gerenciamento
  de riscos ocupacionais em suas atividades."

• Item 1.5.3 — Estrutura do PGR:
  Determina que o PGR deve contemplar, no mínimo, os documentos de
  Inventário de Riscos Ocupacionais e Plano de Ação.

• Item 1.5.3.1 — Responsabilidade:
  "O PGR pode ser atendido por sistemas de gestão, desde que estes
  cumpram as exigências previstas nesta NR e em dispositivos legais
  de segurança e saúde no trabalho."

• Item 1.5.3.2 — Abrangência:
  O PGR deve abranger os riscos que decorram dos agentes físicos,
  químicos, biológicos, de acidentes e fatores ergonômicos, incluindo
  os fatores de riscos psicossociais relacionados ao trabalho.

• Item 1.5.3.3 — Participação dos trabalhadores:
  "A organização deve adotar mecanismos para consultar os trabalhadores
  quanto à percepção de riscos ocupacionais, podendo ser adotadas as
  manifestações da CIPA."

• Item 1.5.4.1 — Levantamento preliminar de perigos:
  "O levantamento preliminar de perigos deve ser realizado para fins
  de determinação da necessidade de elaboração do inventário de riscos."

• Item 1.5.4.2 — Identificação de perigos:
  "A etapa de identificação de perigos deve incluir a descrição dos
  perigos e possíveis lesões ou agravos à saúde, a identificação das
  fontes ou circunstâncias e a indicação do grupo de trabalhadores
  sujeitos aos riscos."

• Item 1.5.4.3 — Avaliação de riscos:
  "A organização deve avaliar os riscos ocupacionais relativos aos
  perigos identificados, considerando as exigências previstas nas NR,
  a probabilidade e a severidade."

• Item 1.5.4.4 — Controle e monitoramento:
  "A organização deve adotar medidas de prevenção para eliminar, reduzir
  ou controlar os riscos, acompanhando continuamente a eficácia das
  medidas implementadas."

• Item 1.5.4.4.5 — Classificação dos riscos:
  "A gradação da probabilidade e da severidade deve ser definida pela
  organização, considerando critérios preestabelecidos."

• Item 1.5.5.1 — Medidas de prevenção:
  Determina que as medidas devem ser compatíveis com a classificação
  de risco atribuída.

• Item 1.5.5.2 — Ordem de prioridade:
  "As medidas de prevenção devem obedecer à seguinte hierarquia:
  eliminação, substituição, controles de engenharia, medidas
  administrativas e uso de EPI."

• Item 1.5.6 — Inventário de Riscos:
  "O inventário de riscos ocupacionais deve contemplar: caracterização
  dos processos, perigos identificados, lesões ou agravos possíveis,
  fontes e circunstâncias, medidas de prevenção existentes, avaliação
  dos riscos e classificação para fins de elaboração do plano de ação."

• Item 1.5.7.1 — Documentação digital:
  "O PGR e demais documentos previstos nas NR podem ser emitidos e
  armazenados em meio digital, com certificação de data e autenticidade."

• Item 1.5.7.2 — Disponibilidade:
  "Os documentos integrantes do PGR devem estar sempre disponíveis aos
  trabalhadores e seus representantes e à Inspeção do Trabalho."

• Item 1.5.8 — Revisão do PGR:
  "O PGR deve ser revisado no máximo a cada 2 anos ou quando houver
  modificações nas condições de trabalho que possam alterar os riscos."

5.2 DEMAIS REFERÊNCIAS NORMATIVAS E LEGAIS
────────────────────────────────────────────

• Portaria MTE nº 1.419/2024 — Atualiza a NR-1 para incluir expressamente
  os fatores de riscos psicossociais relacionados ao trabalho no GRO.

• ISO 45003:2021 — Gestão da saúde e segurança ocupacional — Saúde
  psicológica e segurança no trabalho — Diretrizes para o gerenciamento
  de riscos psicossociais.

• ISO 45001:2018 — Sistemas de gestão de saúde e segurança ocupacional
  — Requisitos com orientação para uso.

• Convenção OIT nº 155 — Segurança e Saúde dos Trabalhadores e o Meio
  Ambiente de Trabalho.

• Convenção OIT nº 187 — Quadro Promocional para a Segurança e Saúde
  no Trabalho.

• CLT — Consolidação das Leis do Trabalho, arts. 154 a 201, que dispõem
  sobre segurança e medicina do trabalho.

• Constituição Federal de 1988, art. 7º, incisos XXII e XXVIII — direito
  à redução dos riscos inerentes ao trabalho.

• Lei nº 8.213/1991 — Planos de Benefícios da Previdência Social, com
  disposições sobre acidentes de trabalho e doenças ocupacionais.

================================================================================
6. ESCOPO E ABRANGÊNCIA
================================================================================

6.1 ABRANGÊNCIA ORGANIZACIONAL

Este PGR Psicossocial aplica-se a ${contratante.razaoSocial},
CNPJ ${contratante.cnpj}, abrangendo todos os colaboradores vinculados ao
estabelecimento localizado em ${contratante.endereco} –
${contratante.cidade}/${contratante.uf}.

6.2 SETORES AVALIADOS

Os seguintes setores e/ou unidades organizacionais foram contemplados
na avaliação:

${setoresLista}

6.3 POPULAÇÃO AVALIADA

• Total de colaboradores no estabelecimento: ${contratante.totalColaboradores}
• Total de respondentes da pesquisa: ${dadosPGR.totalRespondentes}
• Taxa de participação: ${dadosPGR.taxaParticipacao !== null ? dadosPGR.taxaParticipacao.toFixed(1) + '%' : 'Não calculada (total de colaboradores não informado)'}

Conforme item 1.5.3.3 da NR-1, a participação dos trabalhadores foi
viabilizada por meio de instrumento estruturado de pesquisa, aplicado de
forma anônima e voluntária, garantindo a livre manifestação sobre a
percepção dos riscos psicossociais no ambiente de trabalho.

6.4 FATORES PSICOSSOCIAIS AVALIADOS

Em conformidade com o item 1.5.3.2 da NR-1 e com as diretrizes da
ISO 45003:2021, os seguintes domínios de riscos psicossociais foram
contemplados na avaliação:

a) Organização do trabalho — aspectos relacionados à carga de trabalho,
   ritmo, jornada, autonomia e controle sobre as tarefas;

b) Relações interpessoais no trabalho — qualidade das relações entre
   colegas, supervisores e subordinados, incluindo situações de assédio
   e conflito;

c) Condições do ambiente de trabalho — percepção sobre o ambiente físico,
   recursos disponíveis e adequação das condições de trabalho;

d) Reconhecimento e crescimento profissional — percepção sobre valorização,
   oportunidades de desenvolvimento e perspectivas de carreira;

e) Demanda e controle — equilíbrio entre as exigências do trabalho e a
   capacidade de decisão do trabalhador;

f) Segurança e estabilidade — percepção de segurança no emprego,
   estabilidade organizacional e previsibilidade;

g) Comunicação organizacional — clareza, transparência e eficácia dos
   canais de comunicação internos;

h) Liderança e gestão — qualidade da gestão, suporte da liderança e
   práticas gerenciais;

i) Equilíbrio trabalho-vida pessoal — impacto do trabalho na vida
   pessoal e familiar do trabalhador;

j) Saúde e bem-estar — percepção geral de saúde física e mental
   relacionada ao trabalho.

================================================================================
7. METODOLOGIA
================================================================================

7.1 INSTRUMENTO DE AVALIAÇÃO

A avaliação dos riscos psicossociais foi realizada por meio de questionário
estruturado, composto por perguntas objetivas distribuídas nos domínios
descritos na seção 6.4, utilizando escala Likert de 5 pontos:

  1 — Discordo totalmente    (exposição crítica ao risco)
  2 — Discordo parcialmente  (exposição alta ao risco)
  3 — Indiferente / Neutro   (exposição moderada ao risco)
  4 — Concordo parcialmente  (exposição baixa ao risco)
  5 — Concordo totalmente    (condição favorável / risco muito baixo)

7.2 CLASSIFICAÇÃO DOS RISCOS

Conforme item 1.5.4.4.5 da NR-1, a classificação dos riscos adota
critérios preestabelecidos de probabilidade e severidade:

  Nível de Risco = Probabilidade × Severidade

  ┌──────────────┬────────────┬─────────────────────────────────────┐
  │ Classificação│   Faixa    │ Descrição                           │
  ├──────────────┼────────────┼─────────────────────────────────────┤
  │ Crítico      │   20 – 25  │ Risco intolerável — ação imediata   │
  │ Alto         │   12 – 19  │ Risco substancial — ação prioritária│
  │ Moderado     │    6 – 11  │ Risco moderado — ação programada    │
  │ Baixo        │    3 – 5   │ Risco tolerável — monitoramento     │
  │ Muito Baixo  │    1 – 2   │ Risco desprezível — manutenção      │
  └──────────────┴────────────┴─────────────────────────────────────┘

7.3 PROCESSO DE AVALIAÇÃO

O processo de avaliação seguiu as etapas previstas nos itens 1.5.4.1 a
1.5.4.4 da NR-1:

a) Levantamento preliminar de perigos (item 1.5.4.1):
   Identificação inicial dos fatores psicossociais aplicáveis ao
   contexto organizacional;

b) Identificação de perigos (item 1.5.4.2):
   Aplicação do instrumento de pesquisa para mapeamento detalhado
   dos fatores de risco;

c) Avaliação de riscos (item 1.5.4.3):
   Análise quantitativa e qualitativa dos dados coletados, com
   classificação por probabilidade e severidade;

d) Controle dos riscos (item 1.5.4.4):
   Definição de medidas de prevenção e controle, com base na
   hierarquia do item 1.5.5.2 da NR-1.

================================================================================
8. ESTRUTURA DOCUMENTAL DO PGR
================================================================================

Este PGR Psicossocial é composto pelos seguintes documentos, organizados
em conformidade com as exigências da NR-1:

  Doc 01 — Apresentação e Contextualização (este documento)
  Doc 02 — Inventário de Riscos Psicossociais (item 1.5.6)
  Doc 03 — Matriz de Risco — Probabilidade × Severidade (item 1.5.4.4.5)
  Doc 04 — Análise Preliminar de Riscos — APR (item 1.5.4.1)
  Doc 05 — Relatório de Avaliação dos Riscos (item 1.5.4.3)
  Doc 06 — Análise por Setor / Unidade Organizacional
  Doc 07 — Plano de Ação e Medidas de Controle (itens 1.5.3 e 1.5.5)
  Doc 08 — Cronograma de Implementação (item 1.5.5.1)
  Doc 09 — Programa de Monitoramento e Revisão (item 1.5.8)
  Doc 10 — Conformidade Legal e Regulatória
  Doc 11 — Relatório de Conformidade ISO 45003
  Doc 12 — Indicadores de Saúde Ocupacional Psicossocial
  Doc 13 — Política de Segurança e Saúde no Trabalho — SST
  Doc 14 — Plano de Comunicação e Consulta (item 1.5.3.3)
  Doc 15 — Declaração de Conformidade Regulatória
  Doc 16 — Parecer Técnico Conclusivo

================================================================================
9. RESPONSABILIDADES
================================================================================

9.1 DA ORGANIZAÇÃO CONTRATANTE

Conforme NR-1, item 1.5.3, é responsabilidade da organização:

a) Implementar o PGR em seu estabelecimento;
b) Disponibilizar os recursos necessários para execução das medidas;
c) Garantir a participação dos trabalhadores no processo;
d) Manter os documentos do PGR disponíveis para consulta;
e) Promover a revisão do PGR conforme periodicidade estabelecida.

Responsável: ${contratante.responsavelEmpresa}
Cargo: ${contratante.cargoResponsavel}

9.2 DA EMPRESA PRESTADORA

Compete à empresa prestadora:

a) Elaborar tecnicamente o PGR e seus documentos integrantes;
b) Aplicar instrumentos validados de avaliação de riscos psicossociais;
c) Analisar os dados coletados com rigor metodológico;
d) Classificar os riscos conforme critérios preestabelecidos;
e) Propor medidas de prevenção e controle adequadas;
f) Orientar a organização na implementação das ações.

Responsável Técnico: ${PRESTADORA.responsavelTecnico}
Registro: ${PRESTADORA.registroProfissional}

================================================================================
10. VIGÊNCIA E REVISÃO
================================================================================

Conforme item 1.5.8 da NR-1:

• Este PGR entra em vigor na data de sua elaboração: ${dadosPGR.dataElaboracao}

• A revisão ordinária deve ocorrer no prazo máximo de 2 (dois) anos,
  ou antes, nos seguintes casos:

  - Após implementação das medidas de prevenção, para avaliação de eficácia
  - Quando da ocorrência de acidentes ou doenças relacionadas ao trabalho
  - Quando houver mudanças nas condições de trabalho que possam introduzir
    novos perigos ou riscos
  - Quando os dados de monitoramento indicarem necessidade de reavaliação

================================================================================
11. DISPOSIÇÕES FINAIS
================================================================================

Este documento integra o Programa de Gerenciamento de Riscos — PGR da
empresa ${contratante.razaoSocial}, conforme exigências da NR-1
(Portaria SEPRT nº 6.730/2020), atualizada pela Portaria MTE nº 1.419/2024.

Todos os dados, análises e conclusões apresentados neste PGR e seus
documentos integrantes foram elaborados com base nas informações fornecidas
pela organização contratante e nos dados coletados junto aos trabalhadores
por meio de instrumento estruturado de pesquisa.

A documentação está disponível em meio digital, conforme item 1.5.7.1 da
NR-1, e deve permanecer acessível aos trabalhadores, seus representantes
e à Inspeção do Trabalho, nos termos do item 1.5.7.2.

${contratante.cidade}/${contratante.uf}, ${dadosPGR.dataElaboracao}.


________________________________________
${PRESTADORA.responsavelTecnico}
${PRESTADORA.formacao}
Registro Profissional: ${PRESTADORA.registroProfissional}
${PRESTADORA.razaoSocial}


________________________________________
${contratante.responsavelEmpresa}
${contratante.cargoResponsavel}
${contratante.razaoSocial}
`
}
