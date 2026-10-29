// Configurações e dados padrão do Hossony Pro — tudo editável em Configurações

export const DOC_TYPES = [
  { id: 'os', nome: 'Ordem de serviço / Encomenda (completa)', grupo: 'Documentos' },
  { id: 'osCupom', nome: 'Comprovante de entrada (via do cliente)', grupo: 'Cupons' },
  { id: 'orcamento', nome: 'Orçamento', grupo: 'Documentos' },
  { id: 'contrato', nome: 'Contrato', grupo: 'Documentos' },
  { id: 'recibo', nome: 'Recibo de pagamento', grupo: 'Documentos' },
  { id: 'nota', nome: 'Nota de serviço / venda (não fiscal)', grupo: 'Documentos' },
  { id: 'cupomVenda', nome: 'Cupom de venda (balcão)', grupo: 'Cupons' },
  { id: 'etiquetaProduto', nome: 'Etiqueta de produto', grupo: 'Etiquetas' },
  { id: 'etiquetaInstrumento', nome: 'Etiqueta de identificação do instrumento', grupo: 'Etiquetas' },
  { id: 'etiquetaEnvio', nome: 'Etiqueta de envio', grupo: 'Etiquetas' },
  { id: 'certificado', nome: 'Certificado de autenticidade', grupo: 'Documentos' },
];

export const PLACEHOLDERS = [
  ['empresa.nome', 'Nome da luthieria'], ['empresa.documento', 'CNPJ/CPF da luthieria'],
  ['empresa.endereco', 'Endereço da luthieria'], ['empresa.cidade', 'Cidade'], ['empresa.uf', 'UF'],
  ['empresa.responsavel', 'Luthier responsável'], ['empresa.telefone', 'Telefone'], ['empresa.email', 'E-mail'],
  ['cliente.nome', 'Nome do cliente'], ['cliente.documento', 'CPF/CNPJ do cliente'], ['cliente.rg', 'RG'],
  ['cliente.endereco', 'Endereço do cliente'], ['cliente.telefone', 'Telefone do cliente'], ['cliente.email', 'E-mail do cliente'],
  ['ordem.numero', 'Número da encomenda/OS'], ['ordem.tipo', 'Tipo de serviço'], ['ordem.titulo', 'Título'],
  ['ordem.instrumento', 'Instrumento (tipo, modelo)'], ['ordem.descricao', 'Descrição do trabalho'],
  ['ordem.especificacoes', 'Lista de especificações'], ['ordem.itens', 'Lista de itens e valores'],
  ['ordem.total', 'Valor total (R$)'], ['ordem.totalExtenso', 'Valor total por extenso'],
  ['ordem.sinal', 'Valor do sinal (R$)'], ['ordem.sinalPercentual', '% do sinal'], ['ordem.saldo', 'Saldo restante (R$)'],
  ['ordem.prazo', 'Data prevista de entrega'], ['ordem.prazoDias', 'Prazo em dias'], ['ordem.dataEntrada', 'Data de entrada'],
  ['ordem.garantiaDias', 'Garantia (dias)'], ['ordem.condicoesPagamento', 'Condições de pagamento'],
  ['data.hoje', 'Data de hoje (curta)'], ['data.extenso', 'Data de hoje por extenso'],
];

const CONTRATO_CONSTRUCAO = `CONTRATO DE ENCOMENDA E CONSTRUÇÃO DE INSTRUMENTO MUSICAL

Contrato nº {{contrato.numero}} — referente à encomenda {{ordem.numero}}

CONTRATADO (LUTHIER): {{empresa.nome}}, inscrito(a) sob o nº {{empresa.documento}}, com oficina em {{empresa.endereco}}, neste ato representado(a) por {{empresa.responsavel}}.

CONTRATANTE (CLIENTE): {{cliente.nome}}, CPF/CNPJ {{cliente.documento}}, residente em {{cliente.endereco}}, telefone {{cliente.telefone}}, e-mail {{cliente.email}}.

As partes acima identificadas têm entre si justo e acertado o presente contrato, que se regerá pelas cláusulas seguintes.

CLÁUSULA 1ª — DO OBJETO
O CONTRATADO se obriga a construir artesanalmente, sob encomenda, o seguinte instrumento: {{ordem.instrumento}}.
Descrição: {{ordem.descricao}}

CLÁUSULA 2ª — DAS ESPECIFICAÇÕES
O instrumento será construído conforme as especificações abaixo, acordadas entre as partes:
{{ordem.especificacoes}}
Por se tratar de trabalho artesanal com madeiras naturais, variações de veio, cor e figura da madeira são inerentes ao material e não caracterizam defeito.

CLÁUSULA 3ª — DO PREÇO E DA FORMA DE PAGAMENTO
Pelo serviço, o CONTRATANTE pagará o valor total de {{ordem.total}} ({{ordem.totalExtenso}}), da seguinte forma: sinal de {{ordem.sinal}} ({{ordem.sinalPercentual}}) no ato da assinatura deste contrato, destinado à aquisição de materiais e início dos trabalhos, e o saldo de {{ordem.saldo}} na entrega do instrumento.
Condições adicionais: {{ordem.condicoesPagamento}}

CLÁUSULA 4ª — DO PRAZO
O prazo estimado para conclusão é de {{ordem.prazoDias}} dias, com previsão de entrega em {{ordem.prazo}}. Por depender de processos naturais (secagem de colas e verniz, estabilização da madeira), o prazo poderá ser prorrogado em até 30 (trinta) dias mediante comunicação prévia ao CONTRATANTE.

CLÁUSULA 5ª — DAS ALTERAÇÕES
Alterações nas especificações solicitadas após o início da construção poderão gerar acréscimo de valor e de prazo, que serão previamente informados e aprovados por escrito pelo CONTRATANTE.

CLÁUSULA 6ª — DA DESISTÊNCIA
Em caso de desistência do CONTRATANTE após o início da construção, o sinal pago não será restituído, por cobrir materiais adquiridos e horas de trabalho já empregadas. Caso a desistência ocorra por parte do CONTRATADO, o sinal será integralmente devolvido.

CLÁUSULA 7ª — DA ENTREGA E DA PROPRIEDADE
A propriedade do instrumento será transferida ao CONTRATANTE após a quitação integral do valor contratado. O instrumento não retirado em até 90 (noventa) dias após a comunicação de conclusão, sem justificativa, poderá ser comercializado pelo CONTRATADO para ressarcimento do saldo devedor, devolvendo-se ao CONTRATANTE o valor eventualmente excedente.

CLÁUSULA 8ª — DA GARANTIA
O CONTRATADO oferece garantia de {{ordem.garantiaDias}} dias contra defeitos de construção (descolamentos estruturais, rachaduras não decorrentes de mau uso). A garantia não cobre danos por quedas, umidade ou calor excessivos, transporte inadequado, intervenção de terceiros ou desgaste natural de cordas, cerdas e acessórios.

CLÁUSULA 9ª — DO FORO
Fica eleito o foro da comarca de {{empresa.cidade}}/{{empresa.uf}} para dirimir quaisquer dúvidas oriundas deste contrato.

E, por estarem assim justos e contratados, firmam o presente instrumento.

{{empresa.cidade}}, {{data.extenso}}.`;

const CONTRATO_RESTAURACAO = `CONTRATO DE PRESTAÇÃO DE SERVIÇO DE RESTAURAÇÃO

Contrato nº {{contrato.numero}} — referente à ordem {{ordem.numero}}

CONTRATADO: {{empresa.nome}}, {{empresa.documento}}, {{empresa.endereco}}.
CONTRATANTE: {{cliente.nome}}, CPF/CNPJ {{cliente.documento}}, {{cliente.endereco}}, telefone {{cliente.telefone}}.

CLÁUSULA 1ª — DO OBJETO
Restauração do instrumento {{ordem.instrumento}}, compreendendo: {{ordem.descricao}}

CLÁUSULA 2ª — DO ESTADO DO INSTRUMENTO
O CONTRATANTE declara ciência do estado em que o instrumento foi entregue, documentado por fotografias anexas à ordem {{ordem.numero}}. Danos ocultos identificados durante a desmontagem serão comunicados e orçados à parte antes de qualquer intervenção adicional.

CLÁUSULA 3ª — DOS SERVIÇOS E VALORES
{{ordem.itens}}
Valor total: {{ordem.total}} ({{ordem.totalExtenso}}). Sinal: {{ordem.sinal}}. Saldo na entrega: {{ordem.saldo}}.

CLÁUSULA 4ª — DO PRAZO
Previsão de entrega: {{ordem.prazo}}.

CLÁUSULA 5ª — DA PRESERVAÇÃO
O CONTRATADO empregará técnicas reversíveis e materiais compatíveis com a construção original sempre que possível, preservando o valor histórico do instrumento.

CLÁUSULA 6ª — DA GARANTIA
Garantia de {{ordem.garantiaDias}} dias sobre os serviços executados, excluídos danos por mau uso, acidentes e variações climáticas extremas.

CLÁUSULA 7ª — DA RETIRADA
Instrumentos não retirados em até 90 dias após o aviso de conclusão estarão sujeitos a taxa de guarda.

{{empresa.cidade}}, {{data.extenso}}.`;

const CONTRATO_CONSIGNACAO = `TERMO DE CONSIGNAÇÃO DE INSTRUMENTO

CONSIGNATÁRIO: {{empresa.nome}}, {{empresa.documento}}, {{empresa.endereco}}.
CONSIGNANTE: {{cliente.nome}}, CPF/CNPJ {{cliente.documento}}, {{cliente.endereco}}.

O CONSIGNANTE entrega ao CONSIGNATÁRIO, em consignação para venda, o instrumento {{ordem.instrumento}} — {{ordem.descricao}}, pelo valor mínimo de venda de {{ordem.total}}.

1. A comissão do CONSIGNATÁRIO será a combinada entre as partes e descontada do valor da venda.
2. O prazo de consignação é de 90 dias, renovável por acordo.
3. O CONSIGNATÁRIO se responsabiliza pela guarda e conservação do instrumento enquanto estiver sob sua posse.
4. O CONSIGNANTE poderá retirar o instrumento a qualquer momento, mediante aviso prévio de 5 dias.

{{empresa.cidade}}, {{data.extenso}}.`;

export const defaultSettings = () => ({
  empresa: {
    nome: 'Hossony Luthieria', fantasia: 'Hossony', documento: '', ie: '', im: '',
    endereco: '', cidade: 'Taquarituba', uf: 'SP', cep: '',
    telefone: '', whatsapp: '', email: '', site: 'hossony.com', instagram: '',
    responsavel: '', slogan: 'Instrumentos de arco sob encomenda desde 1989', logo: '', assinatura: '',
    chavePix: '',
  },
  aparencia: { tema: 'escuro', corDestaque: '#c0773a', densidade: 'normal', fonteDocumentos: 'Georgia' },
  tiposServico: [
    {
      id: 'encomenda', nome: 'Encomenda / Construção', cor: '#c0773a', garantiaDias: 365, prazoPadraoDias: 180,
      usaCronometro: true, contratoModeloId: 'ct-construcao', sinalPercentual: 50,
      etapas: ['Seleção e preparo da madeira', 'Molde, blocos e faixas laterais', 'Tampo — entalhe e graduação', 'Fundo — entalhe e graduação', 'Barra harmônica e fechamento da caixa', 'Braço e voluta', 'Filetes (purfling) e acabamento de bordas', 'Preparo e verniz', 'Encaixe do braço e espelho', 'Setup — alma, cavalete, pestana e cordas', 'Ajuste sonoro final e certificado'],
    },
    {
      id: 'manutencao', nome: 'Manutenção', cor: '#4f9d8c', garantiaDias: 90, prazoPadraoDias: 7, usaCronometro: true, sinalPercentual: 0,
      etapas: ['Avaliação', 'Limpeza', 'Execução do serviço', 'Testes', 'Liberado'],
    },
    {
      id: 'ajuste', nome: 'Ajuste / Regulagem', cor: '#5b8bd0', garantiaDias: 30, prazoPadraoDias: 3, usaCronometro: true, sinalPercentual: 0,
      etapas: ['Avaliação', 'Ajuste de alma', 'Ajuste de cavalete', 'Pestana, espelho e altura de cordas', 'Teste sonoro'],
    },
    {
      id: 'restauracao', nome: 'Restauração', cor: '#a46ac4', garantiaDias: 180, prazoPadraoDias: 60, usaCronometro: true,
      contratoModeloId: 'ct-restauracao', sinalPercentual: 40,
      etapas: ['Documentação fotográfica inicial', 'Desmontagem', 'Reparos estruturais (rachaduras, colagens)', 'Reconstruções e enxertos', 'Retoque de verniz', 'Remontagem', 'Setup e ajuste sonoro', 'Documentação final'],
    },
    {
      id: 'consultoria', nome: 'Consultoria / Avaliação', cor: '#d0a83b', garantiaDias: 0, prazoPadraoDias: 5, usaCronometro: true, sinalPercentual: 0,
      etapas: ['Agendamento', 'Avaliação do instrumento', 'Laudo / relatório'],
    },
    {
      id: 'pecas', nome: 'Peças e acessórios (pedido)', cor: '#8a8a8a', garantiaDias: 30, prazoPadraoDias: 15, usaCronometro: false, sinalPercentual: 0,
      etapas: ['Pedido ao fornecedor', 'Recebido', 'Instalado / entregue'],
    },
  ],
  status: [
    { id: 'aguardando', nome: 'Aguardando aprovação', cor: '#9a8f84', final: false },
    { id: 'fila', nome: 'Na fila', cor: '#5b8bd0', final: false },
    { id: 'andamento', nome: 'Em andamento', cor: '#c0773a', final: false },
    { id: 'secagem', nome: 'Secagem / verniz', cor: '#d0a83b', final: false },
    { id: 'aguardandoPeca', nome: 'Aguardando peça/material', cor: '#c4566a', final: false },
    { id: 'pronto', nome: 'Pronto para retirada', cor: '#4f9d8c', final: false },
    { id: 'entregue', nome: 'Entregue', cor: '#3c7a4b', final: true },
    { id: 'cancelado', nome: 'Cancelado', cor: '#6b6b6b', final: true, cancela: true },
  ],
  prioridades: ['Baixa', 'Normal', 'Alta', 'Urgente'],
  servicosCatalogo: [
    { id: 'sv1', nome: 'Troca de encordoamento (mão de obra)', valor: 40 },
    { id: 'sv2', nome: 'Ajuste de alma', valor: 80 },
    { id: 'sv3', nome: 'Ajuste de cavalete', valor: 70 },
    { id: 'sv4', nome: 'Cavalete novo — confecção e ajuste', valor: 220 },
    { id: 'sv5', nome: 'Alma nova — confecção e ajuste', valor: 150 },
    { id: 'sv6', nome: 'Aplainar espelho', valor: 180 },
    { id: 'sv7', nome: 'Ajuste de cravelhas', valor: 90 },
    { id: 'sv8', nome: 'Pestana nova', valor: 120 },
    { id: 'sv9', nome: 'Colagem de descolamento', valor: 120 },
    { id: 'sv10', nome: 'Reparo de rachadura (por cm)', valor: 35 },
    { id: 'sv11', nome: 'Limpeza e polimento', valor: 90 },
    { id: 'sv12', nome: 'Troca de crina — arco', valor: 150 },
    { id: 'sv13', nome: 'Retoque de verniz', valor: 250 },
    { id: 'sv14', nome: 'Avaliação técnica com laudo', valor: 200 },
    { id: 'sv15', nome: 'Hora técnica', valor: 80 },
  ],
  tiposInstrumento: ['Violino', 'Viola', 'Violoncelo', 'Contrabaixo', 'Arco de violino', 'Arco de viola', 'Arco de violoncelo', 'Arco de contrabaixo', 'Viola da gamba', 'Outro'],
  camposPersonalizados: [
    { id: 'cp-modelo', label: 'Modelo / molde', tipo: 'select', opcoes: ['Stradivari', 'Guarneri del Gesù', 'Amati', 'Montagnana', 'Goffriller', 'Modelo próprio'], aplicaEm: 'ordem', tiposServico: ['encomenda'], imprimir: true },
    { id: 'cp-tamanho', label: 'Tamanho', tipo: 'select', opcoes: ['4/4', '7/8', '3/4', '1/2', '1/4', '1/8', '1/10', '1/16'], aplicaEm: 'ordem', tiposServico: [], imprimir: true },
    { id: 'cp-tampo', label: 'Madeira do tampo', tipo: 'text', opcoes: [], aplicaEm: 'ordem', tiposServico: ['encomenda'], imprimir: true },
    { id: 'cp-fundo', label: 'Madeira do fundo e faixas', tipo: 'text', opcoes: [], aplicaEm: 'ordem', tiposServico: ['encomenda'], imprimir: true },
    { id: 'cp-braco', label: 'Madeira do braço', tipo: 'text', opcoes: [], aplicaEm: 'ordem', tiposServico: ['encomenda'], imprimir: true },
    { id: 'cp-verniz', label: 'Tipo de verniz', tipo: 'select', opcoes: ['Óleo', 'Álcool', 'Misto (óleo + álcool)'], aplicaEm: 'ordem', tiposServico: ['encomenda', 'restauracao'], imprimir: true },
    { id: 'cp-cor', label: 'Cor / tonalidade do verniz', tipo: 'text', opcoes: [], aplicaEm: 'ordem', tiposServico: ['encomenda'], imprimir: true },
    { id: 'cp-envelhecimento', label: 'Acabamento', tipo: 'select', opcoes: ['Novo (limpo)', 'Envelhecido leve', 'Antiqued completo'], aplicaEm: 'ordem', tiposServico: ['encomenda'], imprimir: true },
    { id: 'cp-voluta', label: 'Voluta', tipo: 'select', opcoes: ['Tradicional', 'Cabeça entalhada (leão / figura)', 'Voluta aberta', 'Personalizada'], aplicaEm: 'ordem', tiposServico: ['encomenda'], imprimir: true },
    { id: 'cp-entalhes', label: 'Personalização (efes, entalhes, incrustações)', tipo: 'textarea', opcoes: [], aplicaEm: 'ordem', tiposServico: ['encomenda'], imprimir: true },
    { id: 'cp-guarnicao', label: 'Guarnição (cravelhas, estandarte, queixeira)', tipo: 'text', opcoes: [], aplicaEm: 'ordem', tiposServico: ['encomenda'], imprimir: true },
    { id: 'cp-cordas', label: 'Encordoamento', tipo: 'text', opcoes: [], aplicaEm: 'ordem', tiposServico: [], imprimir: true },
    { id: 'cp-estado', label: 'Estado na entrada', tipo: 'textarea', opcoes: [], aplicaEm: 'ordem', tiposServico: ['manutencao', 'ajuste', 'restauracao', 'consultoria'], imprimir: true },
    { id: 'cp-acessorios', label: 'Acompanha (estojo, arco, etc.)', tipo: 'text', opcoes: [], aplicaEm: 'ordem', tiposServico: ['manutencao', 'ajuste', 'restauracao', 'consultoria'], imprimir: true },
    { id: 'cp-nivel', label: 'Nível do músico', tipo: 'select', opcoes: ['Iniciante', 'Estudante', 'Avançado', 'Profissional'], aplicaEm: 'cliente', tiposServico: [], imprimir: false },
    { id: 'cp-orquestra', label: 'Orquestra / escola', tipo: 'text', opcoes: [], aplicaEm: 'cliente', tiposServico: [], imprimir: false },
    { id: 'cp-madeira-origem', label: 'Origem / safra', tipo: 'text', opcoes: [], aplicaEm: 'produto', tiposServico: [], imprimir: false },
  ],
  formasPagamento: ['PIX', 'Dinheiro', 'Cartão de débito', 'Cartão de crédito', 'Transferência', 'Boleto', 'Permuta'],
  categoriasProduto: ['Cordas', 'Cavaletes', 'Almas', 'Cravelhas', 'Estandartes', 'Microafinadores', 'Queixeiras', 'Espaleiras', 'Breu', 'Arcos', 'Crina', 'Estojos', 'Instrumentos prontos', 'Madeiras (tonewood)', 'Vernizes e pigmentos', 'Colas', 'Ferramentas', 'Outros'],
  unidades: ['un', 'jogo', 'par', 'pç', 'm', 'g', 'kg', 'ml', 'L', 'mecha'],
  categoriasFinanceiro: {
    receita: ['Serviços', 'Encomendas', 'Vendas', 'Aulas / consultoria', 'Outras receitas'],
    despesa: ['Madeiras', 'Materiais e insumos', 'Ferramentas', 'Peças para revenda', 'Aluguel', 'Energia / água', 'Internet / telefone', 'Frete / correios', 'Impostos e taxas', 'Marketing', 'Pró-labore', 'Outras despesas'],
  },
  transportadoras: ['Correios — PAC', 'Correios — SEDEX', 'Jadlog', 'Transportadora', 'Retirada na oficina', 'Entrega própria'],
  numeracao: {
    ordem: { prefixo: 'OS-', digitos: 5 },
    orcamento: { prefixo: 'ORC-', digitos: 5 },
    contrato: { prefixo: 'CT-', digitos: 4 },
    venda: { prefixo: 'VD-', digitos: 5 },
    recibo: { prefixo: 'RC-', digitos: 5 },
    produto: { prefixo: 'HP', digitos: 5 },
  },
  cronometro: { valorHora: 80, mostrarCustoHoras: true, umPorVez: false, autoStatus: true },
  textos: {
    termosOS: 'O instrumento deixado para serviço deve ser retirado em até 90 dias após o aviso de conclusão. Após esse prazo poderá ser cobrada taxa de guarda. A oficina não se responsabiliza por objetos não declarados no ato da entrega.',
    garantia: 'A garantia cobre exclusivamente os serviços executados e não abrange danos por quedas, umidade, calor, transporte inadequado ou intervenção de terceiros.',
    rodapeCupom: 'Obrigado pela confiança! Cuide bem do seu instrumento.',
    observacaoOrcamento: 'Valores sujeitos a alteração caso sejam identificados danos ocultos durante o serviço.',
    condicoesPagamento: 'Sinal na aprovação e saldo na entrega. PIX, cartão ou dinheiro.',
    validadeOrcamentoDias: 15,
    certificado: 'Certificamos que o instrumento descrito acima foi construído artesanalmente em nossa oficina, com materiais selecionados e técnicas tradicionais de luteria.',
    aviso_nota: 'Documento sem valor fiscal.',
  },
  modelosContrato: [
    { id: 'ct-construcao', nome: 'Construção de instrumento (encomenda)', corpo: CONTRATO_CONSTRUCAO },
    { id: 'ct-restauracao', nome: 'Restauração', corpo: CONTRATO_RESTAURACAO },
    { id: 'ct-consignacao', nome: 'Consignação de instrumento', corpo: CONTRATO_CONSIGNACAO },
  ],
  impressoras: [
    { id: 'p-termica80', nome: 'Térmica 80 mm', tipo: 'termica', deviceName: '', larguraMm: 80, alturaMm: 0, margemMm: 3, fontePx: 12, silencioso: false, copias: 1 },
    { id: 'p-termica58', nome: 'Térmica 58 mm', tipo: 'termica', deviceName: '', larguraMm: 58, alturaMm: 0, margemMm: 2, fontePx: 10, silencioso: false, copias: 1 },
    { id: 'p-etq-produto', nome: 'Etiqueta 50 × 30 mm', tipo: 'etiqueta', deviceName: '', larguraMm: 50, alturaMm: 30, margemMm: 1.5, fontePx: 9, silencioso: false, copias: 1 },
    { id: 'p-etq-instr', nome: 'Etiqueta 60 × 40 mm', tipo: 'etiqueta', deviceName: '', larguraMm: 60, alturaMm: 40, margemMm: 2, fontePx: 10, silencioso: false, copias: 1 },
    { id: 'p-etq-envio', nome: 'Etiqueta de envio 100 × 150 mm', tipo: 'etiqueta', deviceName: '', larguraMm: 100, alturaMm: 150, margemMm: 4, fontePx: 12, silencioso: false, copias: 1 },
    { id: 'p-a4', nome: 'Folha A4', tipo: 'folha', deviceName: '', larguraMm: 210, alturaMm: 297, margemMm: 14, fontePx: 11, silencioso: false, copias: 1 },
    { id: 'p-a5', nome: 'Folha A5', tipo: 'folha', deviceName: '', larguraMm: 148, alturaMm: 210, margemMm: 10, fontePx: 10, silencioso: false, copias: 1 },
  ],
  documentos: {
    os: { perfil: 'p-a4', titulo: '', mostrarLogo: true, mostrarEspecificacoes: true, mostrarItens: true, mostrarPagamentos: true, mostrarEtapas: true, mostrarTempo: false, mostrarFotos: true, mostrarTermos: true, mostrarAssinaturas: true, mostrarCodigoBarras: true },
    osCupom: { perfil: 'p-termica80', titulo: 'COMPROVANTE DE ENTRADA', mostrarLogo: true, mostrarItens: true, mostrarTermos: true, mostrarCodigoBarras: true, mostrarAssinaturas: true },
    orcamento: { perfil: 'p-a4', titulo: 'ORÇAMENTO', mostrarLogo: true, mostrarEspecificacoes: true, mostrarAssinaturas: true, mostrarPix: true },
    contrato: { perfil: 'p-a4', mostrarLogo: true, mostrarAssinaturas: true, testemunhas: true },
    recibo: { perfil: 'p-a5', titulo: 'RECIBO', mostrarLogo: true, mostrarAssinaturas: true, vias: 1 },
    nota: { perfil: 'p-a4', titulo: 'NOTA DE SERVIÇO', mostrarLogo: true, mostrarAviso: true, mostrarCodigoBarras: true },
    cupomVenda: { perfil: 'p-termica80', titulo: 'CUPOM DE VENDA', mostrarLogo: true, mostrarAviso: true, mostrarCodigoBarras: false },
    etiquetaProduto: { perfil: 'p-etq-produto', mostrarNome: true, mostrarPreco: true, mostrarSku: true, mostrarCodigoBarras: true, mostrarEmpresa: false, alturaBarrasMm: 9 },
    etiquetaInstrumento: { perfil: 'p-etq-instr', mostrarCliente: true, mostrarPrazo: true, mostrarTipo: true, mostrarCodigoBarras: true, alturaBarrasMm: 10 },
    etiquetaEnvio: { perfil: 'p-etq-envio', mostrarRemetente: true, mostrarCodigoBarras: true, mostrarConteudo: true, mostrarFragil: true },
    certificado: { perfil: 'p-a4', titulo: 'CERTIFICADO DE AUTENTICIDADE', mostrarLogo: true, mostrarFoto: true, mostrarAssinaturas: true },
  },
});

export const emptyDB = () => ({
  version: 1,
  settings: defaultSettings(),
  counters: {},
  clientes: [],
  ordens: [],
  orcamentos: [],
  contratos: [],
  produtos: [],
  movimentos: [],
  vendas: [],
  lancamentos: [],
});

// Mescla configurações salvas com novos padrões (para atualizações do app)
export function mergeSettings(saved) {
  const def = defaultSettings();
  const out = { ...def, ...saved };
  for (const k of ['empresa', 'aparencia', 'numeracao', 'cronometro', 'textos', 'categoriasFinanceiro']) {
    out[k] = { ...def[k], ...(saved?.[k] || {}) };
  }
  out.documentos = { ...def.documentos };
  for (const k of Object.keys(def.documentos)) out.documentos[k] = { ...def.documentos[k], ...(saved?.documentos?.[k] || {}) };
  return out;
}
