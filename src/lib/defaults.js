// Configurações padrão do Hossony Orçamentos (versão celular) — tudo editável em Ajustes
import { defaultSettings as desktopSettings } from './baseDefaults';

export const PLACEHOLDERS = [
  ['empresa.nome', 'Nome da luthieria'], ['empresa.documento', 'CNPJ/CPF da luthieria'], ['empresa.endereco', 'Endereço da luthieria'],
  ['empresa.cidade', 'Cidade'], ['empresa.uf', 'UF'], ['empresa.responsavel', 'Luthier responsável'], ['empresa.telefone', 'Telefone'], ['empresa.email', 'E-mail'],
  ['cliente.nome', 'Nome do cliente'], ['cliente.documento', 'CPF/CNPJ do cliente'], ['cliente.rg', 'RG'], ['cliente.endereco', 'Endereço do cliente'],
  ['cliente.telefone', 'Telefone do cliente'], ['cliente.email', 'E-mail do cliente'],
  ['ordem.numero', 'Número do orçamento'], ['ordem.tipo', 'Tipo de serviço'], ['ordem.titulo', 'Título'], ['ordem.instrumento', 'Instrumento'],
  ['ordem.descricao', 'Descrição do trabalho'], ['ordem.especificacoes', 'Lista de especificações'], ['ordem.itens', 'Lista de itens e valores'],
  ['ordem.total', 'Valor total'], ['ordem.totalExtenso', 'Valor total por extenso'], ['ordem.sinal', 'Valor do sinal'], ['ordem.sinalPercentual', '% do sinal'],
  ['ordem.saldo', 'Saldo restante'], ['ordem.prazo', 'Data prevista de entrega'], ['ordem.prazoDias', 'Prazo em dias'],
  ['ordem.garantiaDias', 'Garantia (dias)'], ['ordem.condicoesPagamento', 'Condições de pagamento'],
  ['contrato.numero', 'Número do contrato'], ['data.hoje', 'Data de hoje'], ['data.extenso', 'Data por extenso'],
];

export const MSG_PLACEHOLDERS = [
  ['cliente.primeiroNome', 'Primeiro nome do cliente'], ['cliente.nome', 'Nome do cliente'], ['empresa.fantasia', 'Nome da luthieria'],
  ['empresa.responsavel', 'Luthier'], ['doc.numero', 'Número do documento'], ['doc.titulo', 'Título'], ['doc.total', 'Valor total'],
  ['doc.validade', 'Validade do orçamento'], ['doc.prazo', 'Prazo'],
];

export const FONTES_PDF = ['Georgia', 'Times New Roman', 'serif', 'Arial', 'Helvetica', 'sans-serif'];
export const TAMANHOS_PDF = { A4: [210, 297], A5: [148, 210], Carta: [216, 279] };

export function defaultSettings() {
  const d = desktopSettings();
  return {
    empresa: d.empresa,
    aparencia: { tema: 'sistema', corDestaque: '#c0773a' },
    tiposServico: d.tiposServico.map(({ id, nome, cor, garantiaDias, prazoPadraoDias, sinalPercentual, contratoModeloId }) => ({ id, nome, cor, garantiaDias, prazoPadraoDias, sinalPercentual: sinalPercentual || 0, contratoModeloId: contratoModeloId || '' })),
    tiposInstrumento: d.tiposInstrumento,
    camposPersonalizados: d.camposPersonalizados
      .filter((c) => c.aplicaEm === 'ordem' || c.aplicaEm === 'cliente')
      .map((c) => ({ ...c, aplicaEm: c.aplicaEm === 'ordem' ? 'orcamento' : 'cliente' })),
    servicosCatalogo: d.servicosCatalogo,
    numeracao: { orcamento: { prefixo: 'ORC-', digitos: 4 }, contrato: { prefixo: 'CT-', digitos: 4 } },
    textos: {
      condicoesPagamento: d.textos.condicoesPagamento,
      observacaoOrcamento: d.textos.observacaoOrcamento,
      validadeOrcamentoDias: d.textos.validadeOrcamentoDias,
      garantia: d.textos.garantia,
      rodape: 'Obrigado pela confiança!',
    },
    modelosContrato: d.modelosContrato,
    pdf: {
      tamanho: 'A4', fonte: 'Georgia', margemMm: 14, tamanhoFonte: 11,
      mostrarLogo: true, mostrarEspecificacoes: true, mostrarAssinaturas: true, mostrarPix: true, mostrarValidade: true,
      mostrarGarantia: true, mostrarRodape: true, testemunhas: true, mostrarDataAssinatura: true,
    },
    whatsapp: {
      direto: true,
      orcamento: 'Olá, {{cliente.primeiroNome}}! Segue o orçamento {{doc.numero}} da {{empresa.fantasia}}: {{doc.titulo}}. Valor total: {{doc.total}}. Válido até {{doc.validade}}. Qualquer dúvida estou à disposição.',
      contrato: 'Olá, {{cliente.primeiroNome}}! Segue o contrato {{doc.numero}} da {{empresa.fantasia}} referente a {{doc.titulo}}. Por favor, confira e me avise se estiver tudo certo.',
    },
  };
}

export const emptyDB = () => ({ version: 1, settings: defaultSettings(), counters: {}, clientes: [], orcamentos: [], contratos: [] });

export function mergeSettings(saved = {}) {
  const def = defaultSettings();
  const out = { ...def, ...saved };
  for (const k of ['empresa', 'aparencia', 'textos', 'pdf', 'whatsapp', 'numeracao']) out[k] = { ...def[k], ...(saved[k] || {}) };
  return out;
}
