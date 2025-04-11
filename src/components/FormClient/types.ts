// src/components/FormCliente/types.ts
export type ClienteTab = 'lista' | 'detalhes';

export type EnderecoType = {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  numero: string;
};

export interface Cliente {
  id: string;
  tipo: string;
  nomeFantasia: string;
  razaoSocial: string;
  documento: string;
  responsavel: string;
  telefone: string;
  email: string;
  cep: string;
  endereco: EnderecoType;
  observacoes: string;
  version?: number;
  pendingSync?: boolean;
}

export type PedidoType = {
  id: string;
  data: string;
  produto: string;
  quantidade: number;
  valor: number;
};
