// src/components/FormFornecedor/types.ts
export type FornecedorTab = 'dados' | 'pedidos' | 'catalogo';

export type FornecedorType = {
  _id?: string;
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  tipoRacao: string[];
  prazoEntrega: string;
  condicoesPagamento: string;
  observacoes: string;
};

export type PedidoType = {
  id: string;
  produto: string;
  quantidade: number;
  data: string;
  status: string;
};

export type ProdutoType = {
  id: string;
  nome: string;
  preco: number;
  disponivel: boolean;
};

export const tiposRacao = [
  'Cães Adultos',
  'Cães Filhotes',
  'Gatos Adultos',
  'Gatos Filhotes',
  'Aves',
  'Peixes',
  'Roedores',
  'Outros',
];
