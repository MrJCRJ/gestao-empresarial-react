// src/components/FormCliente/types.ts
export type ClienteTab = 'lista' | 'detalhes';

export type EnderecoType = {
  cep: string; // Adicionei o cep aqui
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  numero: string;
  complemento?: string; // Adicionei como opcional
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
  endereco: EnderecoType; // Removi o cep daqui já que está no EnderecoType
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
