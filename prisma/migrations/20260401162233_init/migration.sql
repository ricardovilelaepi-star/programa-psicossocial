-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "porte" TEXT,
    "segmento" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "responsavelNome" TEXT,
    "responsavelCargo" TEXT,
    "responsavelRegistro" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "papel" TEXT NOT NULL DEFAULT 'ADMIN',
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "totalColaboradores" INTEGER NOT NULL DEFAULT 0,
    "turnos" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Questionario" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'PSICOSSOCIAL',
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "dataInicio" TIMESTAMP(3),
    "dataFim" TIMESTAMP(3),
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Questionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionarioSetor" (
    "id" TEXT NOT NULL,
    "questionarioId" TEXT NOT NULL,
    "setorId" TEXT NOT NULL,
    "linkAnonimo" TEXT NOT NULL,
    "totalEsperado" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionarioSetor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pergunta" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "subcategoria" TEXT,
    "fatorNR1" TEXT,
    "fatorISO45003" TEXT,
    "tipoResposta" TEXT NOT NULL DEFAULT 'ESCALA',
    "escalaMin" INTEGER NOT NULL DEFAULT 1,
    "escalaMax" INTEGER NOT NULL DEFAULT 5,
    "escalaMinLabel" TEXT,
    "escalaMaxLabel" TEXT,
    "obrigatoria" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "invertida" BOOLEAN NOT NULL DEFAULT false,
    "questionarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pergunta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resposta" (
    "id" TEXT NOT NULL,
    "questionarioId" TEXT NOT NULL,
    "setor" TEXT,
    "turno" TEXT,
    "faixaEtaria" TEXT,
    "tempoEmpresa" TEXT,
    "tokenResposta" TEXT NOT NULL,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "dataResposta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RespostaItem" (
    "id" TEXT NOT NULL,
    "respostaId" TEXT NOT NULL,
    "perguntaId" TEXT NOT NULL,
    "valorNumerico" INTEGER,
    "valorTexto" TEXT,

    CONSTRAINT "RespostaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvaliacaoRisco" (
    "id" TEXT NOT NULL,
    "questionarioId" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "subcategoria" TEXT,
    "fatorNR1" TEXT,
    "probabilidade" INTEGER NOT NULL,
    "severidade" INTEGER NOT NULL,
    "nivelRisco" INTEGER NOT NULL,
    "classificacao" TEXT NOT NULL,
    "mediaPontuacao" DOUBLE PRECISION NOT NULL,
    "totalRespostas" INTEGER NOT NULL,
    "percentualCritico" DOUBLE PRECISION,
    "descricaoPerigo" TEXT,
    "consequencias" TEXT,
    "medidasExistentes" TEXT,
    "medidasRecomendadas" TEXT,
    "responsavel" TEXT,
    "prazo" TIMESTAMP(3),
    "statusAcao" TEXT NOT NULL DEFAULT 'PENDENTE',
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvaliacaoRisco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PGR" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "dataElaboracao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataRevisao" TIMESTAMP(3),
    "questionarioId" TEXT,
    "periodoAvaliacao" TEXT,
    "totalRespondentes" INTEGER,
    "totalColaboradores" INTEGER,
    "taxaParticipacao" DOUBLE PRECISION,
    "objetivos" TEXT,
    "escopo" TEXT,
    "responsabilidades" TEXT,
    "metodologia" TEXT,
    "inventarioJSON" TEXT,
    "matrizRiscoJSON" TEXT,
    "indicadoresJSON" TEXT,
    "analiseSetoresJSON" TEXT,
    "medidasJSON" TEXT,
    "planoAcaoJSON" TEXT,
    "cronogramaJSON" TEXT,
    "conformidadeJSON" TEXT,
    "parecerTecnico" TEXT,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PGR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Indicador360" (
    "id" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "totalFuncionarios" INTEGER NOT NULL,
    "totalAfastamentos" INTEGER NOT NULL,
    "diasPerdidos" INTEGER NOT NULL,
    "taxaAbsenteismo" DOUBLE PRECISION,
    "principaisCausas" TEXT,
    "admissoes" INTEGER NOT NULL DEFAULT 0,
    "desligamentos" INTEGER NOT NULL DEFAULT 0,
    "taxaRotatividade" DOUBLE PRECISION,
    "tempoMedioPermanencia" DOUBLE PRECISION,
    "npsInterno" DOUBLE PRECISION,
    "taxaRespostaQuestionario" DOUBLE PRECISION,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Indicador360_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedidaControle" (
    "id" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "fatorNR1" TEXT,
    "nivelRisco" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "responsavel" TEXT,
    "prazoSugerido" TEXT,
    "referenciaLegal" TEXT,
    "prioridade" INTEGER NOT NULL DEFAULT 1,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedidaControle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CausaProvavel" (
    "id" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "fatorNR1" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "impactos" TEXT,
    "indicadorRelacionado" TEXT,
    "evidencia" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CausaProvavel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_cnpj_key" ON "Empresa"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Setor_nome_empresaId_key" ON "Setor"("nome", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionarioSetor_linkAnonimo_key" ON "QuestionarioSetor"("linkAnonimo");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionarioSetor_questionarioId_setorId_key" ON "QuestionarioSetor"("questionarioId", "setorId");

-- CreateIndex
CREATE UNIQUE INDEX "Resposta_tokenResposta_key" ON "Resposta"("tokenResposta");

-- CreateIndex
CREATE INDEX "MedidaControle_categoria_nivelRisco_idx" ON "MedidaControle"("categoria", "nivelRisco");

-- CreateIndex
CREATE INDEX "CausaProvavel_categoria_idx" ON "CausaProvavel"("categoria");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setor" ADD CONSTRAINT "Setor_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questionario" ADD CONSTRAINT "Questionario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionarioSetor" ADD CONSTRAINT "QuestionarioSetor_questionarioId_fkey" FOREIGN KEY ("questionarioId") REFERENCES "Questionario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionarioSetor" ADD CONSTRAINT "QuestionarioSetor_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pergunta" ADD CONSTRAINT "Pergunta_questionarioId_fkey" FOREIGN KEY ("questionarioId") REFERENCES "Questionario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resposta" ADD CONSTRAINT "Resposta_questionarioId_fkey" FOREIGN KEY ("questionarioId") REFERENCES "Questionario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespostaItem" ADD CONSTRAINT "RespostaItem_respostaId_fkey" FOREIGN KEY ("respostaId") REFERENCES "Resposta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespostaItem" ADD CONSTRAINT "RespostaItem_perguntaId_fkey" FOREIGN KEY ("perguntaId") REFERENCES "Pergunta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoRisco" ADD CONSTRAINT "AvaliacaoRisco_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PGR" ADD CONSTRAINT "PGR_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indicador360" ADD CONSTRAINT "Indicador360_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
