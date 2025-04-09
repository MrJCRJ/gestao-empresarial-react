// src/stores/useEmpresaStore.d.ts
import { StateCreator } from 'zustand';

export interface Cliente {
  // Defina a estrutura do cliente
  id: string;
  nome: string;
  // ... outros campos
}

export interface Fornecedor {
  // Defina a estrutura do fornecedor
  id: string;
  nome: string;
  // ... outros campos
}

export interface Produto {
  // Defina a estrutura do produto
  id: string;
  nome: string;
  preco: number;
  // ... outros campos
}

export interface EmpresaState {
  clientes: Cliente[];
  fornecedores: Fornecedor[];
  produtos: Produto[];
  exportToFile: () => void;
  importFromFile: (file: File) => Promise<void>;
  // Adicione outros métodos/estados conforme necessário
}

declare const useEmpresaStore: {
  (): EmpresaState;
  set: (partial: Partial<EmpresaState> | ((state: EmpresaState) => Partial<EmpresaState>)) => void;
  get: () => EmpresaState;
};

export default useEmpresaStore;
