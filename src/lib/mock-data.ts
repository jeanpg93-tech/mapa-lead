// Dados fictícios apenas para demonstração do protótipo MapaLead.
// Nenhum dado real de morador, proprietário ou base externa.

export type TipoLocal = "Condomínio" | "Edifício" | "Bairro" | "Rua" | "Região Comercial";
export type GrauConfianca = "Baixo" | "Médio" | "Alto";
export type OrigemDado = "manual" | "demo" | "parceiro" | "importação" | "público";

export type Local = {
  id: string;
  nome: string;
  tipo: TipoLocal;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  unidadesEstimadas?: number;
  observacoes?: string;
  origem: OrigemDado;
  confianca: GrauConfianca;
  oportunidadesAbertas: number;
  tarefasPendentes: number;
  atualizadoEm: string;
};

export type StatusOportunidade =
  | "Novo"
  | "Em pesquisa"
  | "Potencial identificado"
  | "Contato permitido"
  | "Em negociação"
  | "Convertido"
  | "Perdido";

export const STATUS_OPORTUNIDADE: StatusOportunidade[] = [
  "Novo",
  "Em pesquisa",
  "Potencial identificado",
  "Contato permitido",
  "Em negociação",
  "Convertido",
  "Perdido",
];

export type Oportunidade = {
  id: string;
  titulo: string;
  localId: string;
  status: StatusOportunidade;
  responsavel: string;
  valorEstimado?: number;
  criadaEm: string;
};

export type StatusTarefa = "Aberta" | "Em andamento" | "Concluída";

export type Tarefa = {
  id: string;
  titulo: string;
  localId?: string;
  oportunidadeId?: string;
  status: StatusTarefa;
  responsavel: string;
  prazo: string;
};

export type Contato = {
  id: string;
  nome: string;
  tipo: "Administradora" | "Síndico" | "Empresa" | "Lead manual" | "Demo";
  email?: string;
  telefone?: string;
  localId?: string;
  origem: OrigemDado;
  consentimento: "Sim" | "Não" | "Pendente";
  baseLegal: string;
  naoContatar: boolean;
};

export type Fonte = {
  id: string;
  nome: string;
  tipo: "Base manual" | "Mock/Demo" | "API" | "Parceiro" | "Importação" | "Dados públicos";
  descricao: string;
  status: "Ativa" | "Planejada" | "Pausada";
  registros: number;
};

export const locais: Local[] = [
  {
    id: "l1",
    nome: "Condomínio Jardim do Mar",
    tipo: "Condomínio",
    endereco: "Av. Presidente Wilson, 1200",
    bairro: "Boqueirão",
    cidade: "Praia Grande",
    uf: "SP",
    unidadesEstimadas: 180,
    observacoes: "Vista para o mar, 2 torres, área de lazer completa.",
    origem: "demo",
    confianca: "Alto",
    oportunidadesAbertas: 3,
    tarefasPendentes: 4,
    atualizadoEm: "2026-06-18",
  },
  {
    id: "l2",
    nome: "Edifício Atlântico",
    tipo: "Edifício",
    endereco: "Rua Marechal Deodoro, 345",
    bairro: "Canto do Forte",
    cidade: "Praia Grande",
    uf: "SP",
    unidadesEstimadas: 64,
    observacoes: "Prédio residencial, síndico profissional.",
    origem: "manual",
    confianca: "Médio",
    oportunidadesAbertas: 2,
    tarefasPendentes: 1,
    atualizadoEm: "2026-06-15",
  },
  {
    id: "l3",
    nome: "Residencial Vista Verde",
    tipo: "Condomínio",
    endereco: "Rua das Acácias, 87",
    bairro: "Vila Tupi",
    cidade: "Praia Grande",
    uf: "SP",
    unidadesEstimadas: 96,
    origem: "demo",
    confianca: "Médio",
    oportunidadesAbertas: 1,
    tarefasPendentes: 2,
    atualizadoEm: "2026-06-10",
  },
  {
    id: "l4",
    nome: "Bairro Boqueirão",
    tipo: "Bairro",
    endereco: "—",
    bairro: "Boqueirão",
    cidade: "Praia Grande",
    uf: "SP",
    observacoes: "Região com alta concentração de prédios residenciais.",
    origem: "demo",
    confianca: "Alto",
    oportunidadesAbertas: 5,
    tarefasPendentes: 3,
    atualizadoEm: "2026-06-20",
  },
  {
    id: "l5",
    nome: "Edifício Marina Bay",
    tipo: "Edifício",
    endereco: "Av. Costa e Silva, 980",
    bairro: "Aviação",
    cidade: "Praia Grande",
    uf: "SP",
    unidadesEstimadas: 48,
    origem: "manual",
    confianca: "Baixo",
    oportunidadesAbertas: 0,
    tarefasPendentes: 1,
    atualizadoEm: "2026-06-08",
  },
  {
    id: "l6",
    nome: "Região Canto do Forte",
    tipo: "Região Comercial",
    endereco: "—",
    bairro: "Canto do Forte",
    cidade: "Praia Grande",
    uf: "SP",
    origem: "demo",
    confianca: "Médio",
    oportunidadesAbertas: 2,
    tarefasPendentes: 2,
    atualizadoEm: "2026-06-19",
  },
];

export const oportunidades: Oportunidade[] = [
  { id: "o1", titulo: "Mapear imóveis disponíveis no Jardim do Mar", localId: "l1", status: "Em pesquisa", responsavel: "Ana Souza", valorEstimado: 45000, criadaEm: "2026-06-10" },
  { id: "o2", titulo: "Prospectar síndico do Edifício Atlântico", localId: "l2", status: "Contato permitido", responsavel: "Bruno Lima", criadaEm: "2026-06-12" },
  { id: "o3", titulo: "Campanha comercial — bairro Boqueirão", localId: "l4", status: "Potencial identificado", responsavel: "Ana Souza", valorEstimado: 120000, criadaEm: "2026-06-14" },
  { id: "o4", titulo: "Avaliar locação no Canto do Forte", localId: "l6", status: "Novo", responsavel: "Carla Mendes", criadaEm: "2026-06-18" },
  { id: "o5", titulo: "Negociar parceria com administradora", localId: "l1", status: "Em negociação", responsavel: "Bruno Lima", valorEstimado: 32000, criadaEm: "2026-06-05" },
  { id: "o6", titulo: "Mapear unidades do Vista Verde", localId: "l3", status: "Em pesquisa", responsavel: "Carla Mendes", criadaEm: "2026-06-09" },
  { id: "o7", titulo: "Proposta fechada — Jardim do Mar", localId: "l1", status: "Convertido", responsavel: "Ana Souza", valorEstimado: 28000, criadaEm: "2026-05-28" },
  { id: "o8", titulo: "Marina Bay — sem interesse", localId: "l5", status: "Perdido", responsavel: "Bruno Lima", criadaEm: "2026-05-30" },
];

export const tarefas: Tarefa[] = [
  { id: "t1", titulo: "Ligar para administradora do Jardim do Mar", localId: "l1", status: "Aberta", responsavel: "Ana Souza", prazo: "2026-06-23" },
  { id: "t2", titulo: "Visitar Edifício Atlântico", localId: "l2", status: "Em andamento", responsavel: "Bruno Lima", prazo: "2026-06-24" },
  { id: "t3", titulo: "Atualizar dados do Vista Verde", localId: "l3", status: "Aberta", responsavel: "Carla Mendes", prazo: "2026-06-26" },
  { id: "t4", titulo: "Preparar proposta para Boqueirão", localId: "l4", status: "Aberta", responsavel: "Ana Souza", prazo: "2026-06-28" },
  { id: "t5", titulo: "Retornar contato com síndico", localId: "l2", status: "Concluída", responsavel: "Bruno Lima", prazo: "2026-06-15" },
  { id: "t6", titulo: "Pesquisar unidades do Marina Bay", localId: "l5", status: "Aberta", responsavel: "Carla Mendes", prazo: "2026-06-30" },
];

export const contatos: Contato[] = [
  { id: "c1", nome: "Administradora Litoral", tipo: "Administradora", email: "contato@adm-litoral.demo", telefone: "(13) 0000-0000", localId: "l1", origem: "manual", consentimento: "Sim", baseLegal: "Relação comercial existente", naoContatar: false },
  { id: "c2", nome: "Síndico (demo)", tipo: "Síndico", email: "sindico@demo.local", localId: "l2", origem: "demo", consentimento: "Pendente", baseLegal: "Cadastro de demonstração", naoContatar: false },
  { id: "c3", nome: "Empresa Parceira XYZ", tipo: "Empresa", email: "comercial@xyz.demo", localId: "l4", origem: "parceiro", consentimento: "Sim", baseLegal: "Contrato vigente", naoContatar: false },
  { id: "c4", nome: "Lead manual — visita estande", tipo: "Lead manual", telefone: "(13) 0000-1111", origem: "manual", consentimento: "Sim", baseLegal: "Opt-in registrado", naoContatar: false },
  { id: "c5", nome: "Contato bloqueado (exemplo)", tipo: "Demo", origem: "demo", consentimento: "Não", baseLegal: "—", naoContatar: true },
];

export const fontes: Fonte[] = [
  { id: "f1", nome: "Base manual interna", tipo: "Base manual", descricao: "Locais e contatos cadastrados manualmente pela equipe.", status: "Ativa", registros: 12 },
  { id: "f2", nome: "Demonstração", tipo: "Mock/Demo", descricao: "Dados fictícios para validar a experiência do produto.", status: "Ativa", registros: 6 },
  { id: "f3", nome: "ViaCEP", tipo: "API", descricao: "Enriquecimento de endereços a partir do CEP.", status: "Planejada", registros: 0 },
  { id: "f4", nome: "BrasilAPI / IBGE", tipo: "Dados públicos", descricao: "Localidades, bairros e municípios oficiais.", status: "Planejada", registros: 0 },
  { id: "f5", nome: "OpenStreetMap / Overpass", tipo: "Dados públicos", descricao: "Geometria de bairros e ruas.", status: "Planejada", registros: 0 },
  { id: "f6", nome: "Parceiro imobiliário (futuro)", tipo: "Parceiro", descricao: "Integração legítima com fornecedor contratado.", status: "Planejada", registros: 0 },
];

export function getLocal(id: string): Local | undefined {
  return locais.find((l) => l.id === id);
}
export function oportunidadesDoLocal(id: string) {
  return oportunidades.filter((o) => o.localId === id);
}
export function tarefasDoLocal(id: string) {
  return tarefas.filter((t) => t.localId === id);
}
export function contatosDoLocal(id: string) {
  return contatos.filter((c) => c.localId === id);
}
