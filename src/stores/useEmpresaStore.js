import { create } from 'zustand';

export const useEmpresaStore = create((set, get) => ({  // Adicione 'get' aqui
  // Seus estados aqui
  clientes: [],
  fornecedores: [],
  produtos: [],

  // Métodos
  exportToFile: () => {
    const currentState = get();  // Agora usando get() corretamente
    const data = {
      clientes: currentState.clientes,
      fornecedores: currentState.fornecedores,
      produtos: currentState.produtos
    };

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dados-empresa.json';
    a.click();
  },

  importFromFile: async (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      set({
        clientes: data.clientes || [],
        fornecedores: data.fornecedores || [],
        produtos: data.produtos || []
      });
    };
    reader.readAsText(file);
  },

  // Adicione outros métodos conforme necessário
}));