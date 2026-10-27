// Formato do pacote de conteúdo. É o JSON que o painel publica
// (replica/architecture.md, "Como o conteúdo chega ao aparelho").

export type Regiao = {
  slug: string;
  nome: string;
  nomeEn: string;
  ordem: number;
  areaFigura: string;
};

export type Referencia = {
  id: string;
  citacao: string;
  pmid: string | null;
  doi: string | null;
  ano: number | null;
};

export type Propriedade = {
  id: string;
  referenciaId: string;
  condicaoAlvo: string;
  padraoOuro: string;
  populacao: string;
  n: number | null;
  sensibilidade: number | null;
  sensIc: [number, number] | null;
  especificidade: number | null;
  espIc: [number, number] | null;
  lrPositiva: number | null;
  lrNegativa: number | null;
  confiabilidade: number | null;
  confiabilidadeTipo: 'kappa' | 'icc' | null;
};

export type Video = {
  caminho: string;
  duracaoS: number;
  tamanhoBytes: number;
  temAudio: boolean;
};

export type Teste = {
  slug: string;
  regiao: string;
  nome: string;
  nomeEn: string;
  sinonimos: string[];
  categorias: string[];
  posicaoPaciente: string;
  execucao: string;
  resultadoPositivo: string;
  observacoes: string;
  propriedades: Propriedade[];
  video: Video | null;
  // só existe no pacote de desenvolvimento: dados fictícios para ver as telas cheias
  demonstracao?: boolean;
};

export type Pacote = {
  versao: number;
  geradoEm: string;
  regioes: Regiao[];
  testes: Teste[];
  referencias: Referencia[];
};
