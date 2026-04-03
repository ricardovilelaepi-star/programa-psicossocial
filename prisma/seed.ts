import { PrismaClient } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Iniciando seed...')

  const existente = await prisma.questionario.findFirst()
  if (existente) {
    console.log('Ja existem questionarios no banco. Seed ignorado.')
    return
  }

  const empresa = await prisma.empresa.findFirst()
  if (!empresa) {
    console.log('Nenhuma empresa cadastrada. Registre uma conta primeiro, depois rode o seed.')
    return
  }

  const questionario = await prisma.questionario.create({
    data: {
      titulo: 'Avaliacao de Riscos Psicossociais - ISO 45003 / NR-1',
      descricao: 'Questionario padrao para avaliacao de fatores de risco psicossocial no ambiente de trabalho.',
      tipo: 'PSICOSSOCIAL',
      status: 'RASCUNHO',
      empresaId: empresa.id,
      perguntas: {
        create: [
          { texto: 'Consigo realizar minhas tarefas dentro do horario normal de trabalho.', categoria: 'Carga de Trabalho', subcategoria: 'Volume e ritmo', fatorNR1: 'Exigencias da tarefa', fatorISO45003: 'Carga de trabalho e ritmo', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 1, peso: 1.0, invertida: false },
          { texto: 'O volume de trabalho que me e atribuido e razoavel.', categoria: 'Carga de Trabalho', subcategoria: 'Volume e ritmo', fatorNR1: 'Exigencias da tarefa', fatorISO45003: 'Carga de trabalho e ritmo', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 2, peso: 1.0, invertida: false },
          { texto: 'Sinto que sou pressionado a trabalhar em um ritmo excessivo.', categoria: 'Carga de Trabalho', subcategoria: 'Volume e ritmo', fatorNR1: 'Exigencias da tarefa', fatorISO45003: 'Carga de trabalho e ritmo', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 3, peso: 1.0, invertida: true },
          { texto: 'Tenho autonomia para decidir como realizar minhas tarefas.', categoria: 'Autonomia e Controle', subcategoria: 'Controle sobre o trabalho', fatorNR1: 'Grau de autonomia', fatorISO45003: 'Controle do trabalho', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 4, peso: 1.0, invertida: false },
          { texto: 'Posso participar das decisoes que afetam meu trabalho.', categoria: 'Autonomia e Controle', subcategoria: 'Participacao', fatorNR1: 'Grau de autonomia', fatorISO45003: 'Controle do trabalho', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 5, peso: 1.0, invertida: false },
          { texto: 'O relacionamento com meus colegas de trabalho e respeitoso.', categoria: 'Relacoes Interpessoais', subcategoria: 'Relacao entre pares', fatorNR1: 'Relacoes socioprofissionais', fatorISO45003: 'Relacionamentos no trabalho', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 6, peso: 1.0, invertida: false },
          { texto: 'Sinto que posso contar com apoio dos colegas quando preciso.', categoria: 'Relacoes Interpessoais', subcategoria: 'Suporte social', fatorNR1: 'Relacoes socioprofissionais', fatorISO45003: 'Apoio social', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 7, peso: 1.0, invertida: false },
          { texto: 'Ja presenciei ou sofri situacoes de assedio ou desrespeito no trabalho.', categoria: 'Relacoes Interpessoais', subcategoria: 'Assedio e violencia', fatorNR1: 'Relacoes socioprofissionais', fatorISO45003: 'Violencia no trabalho', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 8, peso: 1.5, invertida: true },
          { texto: 'Minha chefia direta me trata com respeito e consideracao.', categoria: 'Lideranca e Gestao', subcategoria: 'Estilo de lideranca', fatorNR1: 'Estilo de gestao', fatorISO45003: 'Lideranca e gestao', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 9, peso: 1.0, invertida: false },
          { texto: 'Recebo feedback claro sobre meu desempenho.', categoria: 'Lideranca e Gestao', subcategoria: 'Comunicacao', fatorNR1: 'Estilo de gestao', fatorISO45003: 'Lideranca e gestao', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 10, peso: 1.0, invertida: false },
          { texto: 'Sinto que meu trabalho e valorizado e reconhecido.', categoria: 'Reconhecimento e Crescimento', subcategoria: 'Reconhecimento', fatorNR1: 'Reconhecimento', fatorISO45003: 'Reconhecimento no trabalho', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 11, peso: 1.0, invertida: false },
          { texto: 'Tenho oportunidades reais de crescimento profissional na empresa.', categoria: 'Reconhecimento e Crescimento', subcategoria: 'Desenvolvimento', fatorNR1: 'Reconhecimento', fatorISO45003: 'Desenvolvimento de carreira', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 12, peso: 1.0, invertida: false },
          { texto: 'Consigo manter um bom equilibrio entre vida pessoal e trabalho.', categoria: 'Equilibrio Trabalho-Vida', subcategoria: 'Equilibrio', fatorNR1: 'Jornada de trabalho', fatorISO45003: 'Equilibrio trabalho-vida', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 13, peso: 1.0, invertida: false },
          { texto: 'Sou frequentemente demandado fora do horario de trabalho.', categoria: 'Equilibrio Trabalho-Vida', subcategoria: 'Limites de jornada', fatorNR1: 'Jornada de trabalho', fatorISO45003: 'Equilibrio trabalho-vida', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 14, peso: 1.0, invertida: true },
          { texto: 'Tenho clareza sobre minhas responsabilidades e o que se espera de mim.', categoria: 'Clareza de Papel', subcategoria: 'Definicao de papel', fatorNR1: 'Exigencias da tarefa', fatorISO45003: 'Papel na organizacao', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 15, peso: 1.0, invertida: false },
          { texto: 'Me sinto seguro(a) no meu ambiente de trabalho.', categoria: 'Seguranca e Condicoes', subcategoria: 'Seguranca fisica e psicologica', fatorNR1: 'Condicoes do ambiente', fatorISO45003: 'Ambiente e equipamentos', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 16, peso: 1.0, invertida: false },
          { texto: 'As condicoes fisicas do meu local de trabalho sao adequadas.', categoria: 'Seguranca e Condicoes', subcategoria: 'Condicoes fisicas', fatorNR1: 'Condicoes do ambiente', fatorISO45003: 'Ambiente e equipamentos', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 17, peso: 1.0, invertida: false },
          { texto: 'Sinto que minha saude mental e afetada negativamente pelo trabalho.', categoria: 'Saude Emocional', subcategoria: 'Impacto emocional', fatorNR1: 'Exigencias emocionais', fatorISO45003: 'Saude psicologica', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 18, peso: 1.5, invertida: true },
          { texto: 'Sinto-me emocionalmente esgotado(a) com frequencia.', categoria: 'Saude Emocional', subcategoria: 'Esgotamento', fatorNR1: 'Exigencias emocionais', fatorISO45003: 'Saude psicologica', tipoResposta: 'ESCALA', escalaMin: 1, escalaMax: 5, escalaMinLabel: 'Discordo totalmente', escalaMaxLabel: 'Concordo totalmente', obrigatoria: true, ordem: 19, peso: 1.5, invertida: true },
          { texto: 'Se desejar, deixe aqui um comentario ou sugestao sobre o ambiente de trabalho.', categoria: 'Comentario Aberto', subcategoria: null, fatorNR1: null, fatorISO45003: null, tipoResposta: 'TEXTO', escalaMin: 1, escalaMax: 5, escalaMinLabel: null, escalaMaxLabel: null, obrigatoria: false, ordem: 20, peso: 0, invertida: false }
        ]
      }
    }
  })

  console.log('Questionario criado: ' + questionario.titulo)
  console.log('Seed finalizado com sucesso!')
}

main()
  .catch((e) => { console.error('Erro no seed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

