// src/components/FormCliente/types.ts
export type ClienteTab = 'lista' | 'detalhes';

export interface EnderecoType {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  numero: string;
  complemento?: string;
}

export interface Cliente {
  id: string;
  _id?: string; // Para compatibilidade com MongoDB
  tipo: 'petshop' | 'mercadinho' | 'clínica' | 'outro';
  nomeFantasia: string;
  razaoSocial?: string;
  documento: string;
  responsavel?: string;
  telefone: string;
  email?: string;
  endereco: EnderecoType;
  observacoes?: string;
  version?: number;
  pendingSync?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PedidoType = {
  id: string;
  data: string;
  produto: string;
  quantidade: number;
  valor: number;
};
