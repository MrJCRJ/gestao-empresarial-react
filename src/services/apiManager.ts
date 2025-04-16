import { Cliente } from '../components/FormClient/types';
import { FornecedorType } from '../components/FormFornecedor/types';

class ApiManager {
  private backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  private isOnline = navigator.onLine;
  private isBackendAlive = false;

  constructor() {
    this.setupListeners();
    this.checkBackendStatus();
  }

  public getBackendUrl(): string {
    return this.backendUrl;
  }

  public async getFornecedores(): Promise<FornecedorType[]> {
    try {
      const response = await fetch(`${this.backendUrl}/fornecedores`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      let fornecedores: FornecedorType[] = await response.json();

      // Garante que cada fornecedor tem um ID
      fornecedores = fornecedores.map((fornecedor: Partial<FornecedorType> & { _id?: string }) => ({
        ...fornecedor,
        id: fornecedor.id || fornecedor._id || `temp_${Date.now()}`,
        ...(fornecedor._id && { _id: undefined }),
      })) as FornecedorType[];

      return fornecedores;
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      return [];
    }
  }

  public async saveFornecedor(fornecedor: FornecedorType): Promise<{ success: boolean }> {
    try {
      const method = fornecedor.id ? 'PUT' : 'POST';
      const url = fornecedor.id
        ? `${this.backendUrl}/fornecedores/${fornecedor.id}`
        : `${this.backendUrl}/fornecedores`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fornecedor),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      return { success: false };
    }
  }

  // Verifica status do backend
  private lastHealthCheck = 0;
  private readonly HEALTH_CHECK_INTERVAL = 5000; // 5 segundos

  public async checkBackendStatus(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastHealthCheck < this.HEALTH_CHECK_INTERVAL) {
      return this.isBackendAlive;
    }

    this.lastHealthCheck = now;

    if (!this.isOnline) {
      this.isBackendAlive = false;
      return false;
    }

    try {
      const response = await fetch(`${this.backendUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      this.isBackendAlive = response.ok && data.status === 'healthy';
      return this.isBackendAlive;
    } catch (error) {
      this.isBackendAlive = false;
      return false;
    }
  }

  private setupListeners() {
    window.addEventListener('online', async () => {
      this.isOnline = true;
      setTimeout(async () => {
        await this.checkBackendStatus();
      }, 2000);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.isBackendAlive = false;
    });
  }

  // Método principal para salvar/editar clientes
  public async saveCliente(cliente: Cliente): Promise<{ success: boolean }> {
    try {
      // Se o cliente tem ID, é uma edição (PUT)
      if (cliente.id && cliente.id !== '') {
        const updated = await this.updateCliente(cliente);
        return { success: updated };
      }
      // Caso contrário, é uma criação (POST)
      const created = await this.createCliente(cliente);
      return { success: created };
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      return { success: false };
    }
  }

  // Método para criar novo cliente (POST)
  private async createCliente(cliente: Cliente): Promise<boolean> {
    const response = await fetch(`${this.backendUrl}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return true;
  }

  // Método para atualizar cliente existente (PUT)
  private async updateCliente(cliente: Cliente): Promise<boolean> {
    const response = await fetch(`${this.backendUrl}/clientes/${cliente.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return true;
  }

  // Método para deletar cliente
  public async deleteCliente(id: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.backendUrl}/clientes/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error(`Erro ao deletar cliente:`, error);
      throw error; // Rejoga o erro para ser tratado no componente
    }
  }

  // Obtém todos os clientes
  public async getClientes(): Promise<Cliente[]> {
    try {
      const response = await fetch(`${this.backendUrl}/clientes`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      let clientes: Cliente[] = await response.json();

      // Garante que cada cliente tem um ID
      clientes = clientes.map((cliente: Partial<Cliente> & { _id?: string }) => ({
        ...cliente,
        id: cliente.id || cliente._id || `temp_${Date.now()}`,
        ...(cliente._id && { _id: undefined }),
      })) as Cliente[];

      return clientes;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }
  }

  // Método privado para sincronizar com o backend
  private async syncWithBackend(data: any, endpoint: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return true;
    } catch (error) {
      console.error(`Erro ao sincronizar ${endpoint}:`, error);
      throw error;
    }
  }
}

// Exporta uma única instância global
export const apiManager = new ApiManager();
