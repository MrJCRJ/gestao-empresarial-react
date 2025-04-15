import { Cliente } from '../components/FormClient/types';

interface SyncResult {
  success: boolean;
  errors?: any[];
}

class OfflineManager {
  // Usando configuração para frontend
  private backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
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
      // Aguarda 2 segundos antes de verificar para evitar flood
      setTimeout(async () => {
        await this.checkBackendStatus();
        if (this.isBackendAlive) {
          await this.syncQueue();
        }
      }, 2000);
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

      // Cria uma cópia do cliente omitindo o id se for temporário
      const clienteParaSalvar: Omit<Cliente, 'id'> & { id?: string } = { ...cliente };

      if (clienteParaSalvar.id?.startsWith('temp_')) {
        delete clienteParaSalvar.id;
      }

      // Garante um ID local
      if (!clienteParaSalvar.id) {
        clienteParaSalvar.id = `local_${Date.now()}`;
      }

      clienteParaSalvar.pendingSync = true;

      const clienteRequest = clientesStore.put(clienteParaSalvar);

      const syncRequest = syncStore.add({
        type: 'cliente',
        action: 'save',
        data: clienteParaSalvar,
        timestamp: new Date().toISOString(),
      });

      clienteRequest.onsuccess = () => {
        syncRequest.onsuccess = () => resolve({ success: true, isOffline: true });
        syncRequest.onerror = () => resolve({ success: false, isOffline: true });
      };
      clienteRequest.onerror = () => resolve({ success: false, isOffline: true });
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
    try {
      if (this.isOnline && this.isBackendAlive) {
        try {
          const response = await fetch(`${this.backendUrl}/clientes`);
          if (response.ok) {
            let clientes = await response.json();

            // Garante que cada cliente tem um ID
            clientes = clientes.map((cliente) => ({
              ...cliente,
              id: cliente.id || cliente._id || `temp_${Date.now()}`,
            }));

            await this.saveClientesLocally(clientes);
            return clientes;
          }
        } catch (error) {
          console.error('Falha ao buscar clientes do backend:', error);
        }
      }

      return this.getClientesFromIndexedDB();
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }
  }

  private async getClientesFromIndexedDB(): Promise<Cliente[]> {
    if (!this.db) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['clientes'], 'readonly');
      const store = transaction.objectStore('clientes');
      const request = store.getAll();

      request.onsuccess = () => {
        const clientes = (request.result || []).sort((a, b) => {
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

  private async saveClientesLocally(clientes: Cliente[]): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['clientes'], 'readwrite');
      const store = transaction.objectStore('clientes');

      // Limpa os clientes existentes
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        // Adiciona os novos clientes garantindo que cada um tem um ID
        const requests = clientes.map((cliente) => {
          // Garante que o cliente tem um ID válido
          if (!cliente.id) {
            cliente.id = `temp_${Date.now()}`; // Cria um ID temporário se não existir
          }

          return new Promise<void>((resolveItem, rejectItem) => {
            const putRequest = store.put(cliente);
            putRequest.onsuccess = () => resolveItem();
            putRequest.onerror = (event) => {
              console.error('Error saving cliente:', event);
              rejectItem(new Error('Failed to save cliente'));
            };
          });
        });

        Promise.all(requests)
          .then(() => resolve())
          .catch((error) => {
            console.error('Error saving clientes:', error);
            reject(error);
          });
      };

      clearRequest.onerror = () => {
        reject(new Error('Failed to clear clientes store'));
      };
    });
  }

  // Sincroniza a fila de operações pendentes
  public async syncQueue(): Promise<SyncResult> {
    if (!this.db) {
      console.error('Banco de dados não está inicializado');
      return { success: false, errors: ['Banco de dados não inicializado'] };
    }

    if (!this.isOnline || !this.isBackendAlive) {
      console.log('Não sincronizando - offline ou backend indisponível');
      return { success: false, errors: ['Não está online ou backend indisponível'] };
    }

    console.log('Iniciando processo de sincronização');

    // Primeiro obtemos todos os itens pendentes em uma transação separada
    const items = await new Promise<any[]>((resolve) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const queueStore = transaction.objectStore('syncQueue');
      const request = queueStore.getAll();

      request.onsuccess = () => {
        console.log(`Encontrados ${request.result?.length || 0} itens para sincronizar`);
        resolve(request.result || []);
      };
      request.onerror = () => {
        console.error('Erro ao obter itens da fila de sincronização');
        resolve([]);
      };
    });

    if (items.length === 0) {
      console.log('Nada para sincronizar - fila vazia');
      return { success: true };
    }

    console.log('Preparando dados para envio:', JSON.stringify(items, null, 2));

    try {
      // Fazemos a requisição para o backend
      const response = await fetch(`${this.backendUrl}/clientes/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientes: items.map((item) => {
            const data = { ...item.data };
            if (data.id?.startsWith('temp_') || data.id?.startsWith('local_')) {
              delete data.id;
            }
            return {
              ...data,
              action: item.action || 'save',
            };
          }),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erro na resposta do servidor: ${response.status} - ${errorText}`);
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Resposta da sincronização:', JSON.stringify(result, null, 2));

      if (!result.success) {
        console.error('Erros na sincronização:', result.errors);
        return { success: false, errors: result.errors };
      }

      // Agora criamos uma NOVA transação apenas para as exclusões
      await new Promise<void>((resolve, reject) => {
        const deleteTransaction = this.db!.transaction(['syncQueue', 'clientes'], 'readwrite');
        const queueStore = deleteTransaction.objectStore('syncQueue');
        const clientesStore = deleteTransaction.objectStore('clientes');

        // Para cada item sincronizado com sucesso
        items.forEach((item) => {
          if (item.action === 'save') {
            // Atualiza o cliente local removendo a flag pendingSync
            const updateRequest = clientesStore.get(item.data.id);
            updateRequest.onsuccess = () => {
              const cliente = updateRequest.result;
              if (cliente) {
                cliente.pendingSync = false;
                clientesStore.put(cliente);
              }
            };
          }

          // Remove da fila de sincronização
          const deleteRequest = queueStore.delete(item.id);
          deleteRequest.onerror = () => {
            console.error(`Erro ao remover item ${item.id} da fila`);
          };
        });

        deleteTransaction.oncomplete = () => {
          console.log('Todos os itens foram processados');
          resolve();
        };

        deleteTransaction.onerror = () => {
          console.error('Erro na transação de exclusão');
          reject(deleteTransaction.error);
        };
      });

      console.log('Sincronização concluída com sucesso');
      return { success: true };
    } catch (error) {
      console.error('Erro durante a sincronização:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido'],
      };
    }
  }

  // Método privado para sincronizar com o backend real
  public async syncWithRealBackend(data: any, endpoint: string): Promise<boolean> {
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
