import { Cliente } from '../components/FormClient/types';

interface SyncResult {
  success: boolean;
  errors?: any[];
}

class OfflineManager {
  private backendUrl = 'https://seuservidor.com/api';
  private dbName = 'HeroPetDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private syncInterval: number | null = null;
  private isOnline = navigator.onLine;
  private isBackendAlive = false;

  constructor() {
    this.initDB().then(() => {
      this.setupListeners();
      this.startSyncInterval();
      this.checkBackendStatus(); // Verifica status do backend mas não bloqueia a inicialização
    });
  }

  // Método para inicializar o banco de dados com retorno de Promise
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('clientes')) {
          db.createObjectStore('clientes', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        console.error('Erro ao abrir o banco de dados:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  // Verifica status do backend (com timeout)
  public async checkBackendStatus(): Promise<boolean> {
    if (!this.isOnline) {
      this.isBackendAlive = false;
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.backendUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      this.isBackendAlive = response.ok;
      return response.ok;
    } catch (error) {
      this.isBackendAlive = false;
      console.error('Erro ao verificar backend:', error);
      return false;
    }
  }

  private setupListeners() {
    window.addEventListener('online', async () => {
      this.isOnline = true;
      await this.checkBackendStatus();
      if (this.isBackendAlive) {
        await this.syncQueue();
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.isBackendAlive = false;
    });
  }

  private startSyncInterval() {
    this.syncInterval = window.setInterval(async () => {
      if (this.isOnline) {
        await this.checkBackendStatus();
        if (this.isBackendAlive) {
          await this.syncQueue();
        }
      }
    }, 30000); // Tenta sincronizar a cada 30 segundos
  }

  // Método principal para salvar clientes (funciona offline)
  public async saveCliente(cliente: Cliente): Promise<{ success: boolean; isOffline: boolean }> {
    try {
      // Se estiver online e backend disponível, tenta sincronizar direto
      if (this.isOnline && this.isBackendAlive) {
        try {
          const saved = await this.syncWithRealBackend(cliente, 'clientes');
          if (saved) {
            return { success: true, isOffline: false };
          }
        } catch (error) {
          console.error('Falha ao salvar no backend, salvando localmente', error);
        }
      }

      // Se offline ou falha no backend, salva localmente
      return this.saveClienteOffline(cliente);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      return { success: false, isOffline: !this.isOnline || !this.isBackendAlive };
    }
  }

  private async saveClienteOffline(
    cliente: Cliente,
  ): Promise<{ success: boolean; isOffline: true }> {
    if (!this.db) {
      console.error('Banco de dados não inicializado');
      return { success: false, isOffline: true };
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['clientes', 'syncQueue'], 'readwrite');
      const clientesStore = transaction.objectStore('clientes');
      const syncStore = transaction.objectStore('syncQueue');

      // Garante que o cliente tem um ID
      if (!cliente.id) {
        cliente.id = `temp_${Date.now()}`;
      }

      // Marca como pendente de sincronização
      cliente.pendingSync = true;

      // Salva nos clientes locais
      const clienteRequest = clientesStore.put(cliente);

      // Adiciona à fila de sincronização
      const syncRequest = syncStore.add({
        type: 'cliente',
        action: 'save',
        data: cliente,
        timestamp: new Date().toISOString(),
      });

      clienteRequest.onsuccess = () => {
        syncRequest.onsuccess = () => {
          resolve({ success: true, isOffline: true });
        };
        syncRequest.onerror = () => {
          resolve({ success: false, isOffline: true });
        };
      };

      clienteRequest.onerror = () => {
        resolve({ success: false, isOffline: true });
      };
    });
  }

  // Método para deletar cliente (funciona offline)
  public async deleteCliente(id: string): Promise<{ success: boolean; isOffline: boolean }> {
    try {
      // Se online, tenta deletar no backend
      if (this.isOnline && this.isBackendAlive) {
        try {
          const deleted = await this.syncWithRealBackend({ id }, 'clientes/delete');
          if (deleted) {
            return { success: true, isOffline: false };
          }
        } catch (error) {
          console.error('Falha ao deletar no backend, salvando localmente', error);
        }
      }

      // Se offline, marca para deletar quando voltar
      return this.deleteClienteOffline(id);
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      return { success: false, isOffline: !this.isOnline || !this.isBackendAlive };
    }
  }

  private async deleteClienteOffline(id: string): Promise<{ success: boolean; isOffline: true }> {
    if (!this.db) {
      console.error('Banco de dados não inicializado');
      return { success: false, isOffline: true };
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['clientes', 'syncQueue'], 'readwrite');
      const clientesStore = transaction.objectStore('clientes');
      const syncStore = transaction.objectStore('syncQueue');

      // Remove dos clientes locais
      const deleteRequest = clientesStore.delete(id);

      // Adiciona à fila de sincronização
      const syncRequest = syncStore.add({
        type: 'cliente',
        action: 'delete',
        data: { id },
        timestamp: new Date().toISOString(),
      });

      deleteRequest.onsuccess = () => {
        syncRequest.onsuccess = () => {
          resolve({ success: true, isOffline: true });
        };
        syncRequest.onerror = () => {
          resolve({ success: false, isOffline: true });
        };
      };

      deleteRequest.onerror = () => {
        resolve({ success: false, isOffline: true });
      };
    });
  }

  // Obtém todos os clientes (sempre do banco local)
  public async getClientes(): Promise<Cliente[]> {
    if (!this.db) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['clientes'], 'readonly');
      const store = transaction.objectStore('clientes');
      const request = store.getAll();

      request.onsuccess = () => {
        const clientes = (request.result || []).sort((a, b) => {
          // Ordena por pendingSync (pendentes primeiro) e depois por nome
          if (a.pendingSync && !b.pendingSync) return -1;
          if (!a.pendingSync && b.pendingSync) return 1;
          return a.nomeFantasia?.localeCompare(b.nomeFantasia) || 0;
        });
        resolve(clientes);
      };

      request.onerror = () => {
        resolve([]);
      };
    });
  }

  // Sincroniza a fila de operações pendentes
  public async syncQueue(): Promise<SyncResult> {
    if (!this.db || !this.isOnline || !this.isBackendAlive) {
      return { success: false, errors: ['Não está online ou backend indisponível'] };
    }

    const transaction = this.db.transaction(['syncQueue', 'clientes'], 'readwrite');
    const queueStore = transaction.objectStore('syncQueue');
    const clientesStore = transaction.objectStore('clientes');
    const items = await new Promise<any[]>((resolve) => {
      const request = queueStore.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });

    const errors: any[] = [];

    for (const item of items) {
      try {
        // Tenta sincronizar com o backend
        const success = await this.syncWithRealBackend(
          item.data,
          item.action === 'delete' ? 'clientes/delete' : 'clientes',
        );

        if (success) {
          // Se for delete, remove do banco local também
          if (item.action === 'delete') {
            await new Promise((resolve) => {
              const deleteRequest = clientesStore.delete(item.data.id);
              deleteRequest.onsuccess = () => resolve(true);
              deleteRequest.onerror = () => resolve(false);
            });
          }

          // Remove da fila de sincronização
          await new Promise((resolve) => {
            const deleteRequest = queueStore.delete(item.id);
            deleteRequest.onsuccess = () => resolve(true);
            deleteRequest.onerror = () => resolve(false);
          });
        } else {
          throw new Error('Falha na sincronização com o backend');
        }
      } catch (error) {
        errors.push({ id: item.id, error });
        console.error('Erro ao sincronizar item:', item, error);
      }
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // Método privado para sincronizar com o backend real
  private async syncWithRealBackend(data: any, endpoint: string): Promise<boolean> {
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
export const offlineManager = new OfflineManager();
