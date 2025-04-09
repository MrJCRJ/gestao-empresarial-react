// src/stores/useEmpresaStore.ts
import { create } from 'zustand';

interface Cliente {
  id: string;
  nome: string;
  // ... outros campos
}

interface Fornecedor {
  id: string;
  nome: string;
  // ... outros campos
}

interface Produto {
  id: string;
  nome: string;
  preco: number;
  // ... outros campos
}

interface EmpresaStoreState {
  clientes: Cliente[];
  fornecedores: Fornecedor[];
  produtos: Produto[];
  exportToFile: () => void;
  importFromFile: (file: File) => Promise<void>;
  // Adicione outros estados/métodos conforme necessário
}

export const useEmpresaStore = create<EmpresaStoreState>((set, get) => ({
  clientes: [],
  fornecedores: [],
  produtos: [],

  exportToFile: () => {
    const currentState = get();
    const data = {
      clientes: currentState.clientes,
      fornecedores: currentState.fornecedores,
      produtos: currentState.produtos,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados-empresa-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importFromFile: (file) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result !== 'string') {
            throw new Error('Formato de arquivo inválido');
          }

          const data = JSON.parse(result);

          set({
            clientes: Array.isArray(data.clientes) ? data.clientes : [],
            fornecedores: Array.isArray(data.fornecedores) ? data.fornecedores : [],
            produtos: Array.isArray(data.produtos) ? data.produtos : [],
          });

          resolve();
        } catch (error) {
          console.error('Erro ao importar arquivo:', error);
          reject(new Error('Falha ao processar o arquivo. Verifique o formato.'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Erro ao ler o arquivo.'));
      };

      reader.readAsText(file);
    });
  },
}));
