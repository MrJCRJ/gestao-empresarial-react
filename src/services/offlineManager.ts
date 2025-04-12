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
    this.initDB();
    this.setupListeners();
    this.startSyncInterval();
    this.checkBackendStatus().then((status) => {
      this.isBackendAlive = status;
    });
  }

  // Novo método para verificar status do backend
  public async checkBackendStatus(): Promise<boolean> {
    try {
      console.log('[OfflineManager] Verificando status do backend...');

      // Configuração do timeout de 5 segundos
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
      if (error === 'AbortError') {
        console.error('[OfflineManager] Timeout: Backend não respondeu em 5 segundos');
      } else {
        console.error('[OfflineManager] Erro ao verificar backend:', error);
      }
      return false;
    }
  }

  // Método para sincronizar com o backend real
  private async syncWithRealBackend(data: any, endpoint: string): Promise<boolean> {
    try {
      console.log(`[OfflineManager] Enviando dados para ${endpoint}`, data);
      const response = await fetch(`${this.backendUrl}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return true;
    } catch (error) {
      console.error(`[OfflineManager] Erro ao sincronizar ${endpoint}:`, error);
      throw error;
    }
  }

  private initDB() {
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
    };

    request.onerror = (event) => {
      console.error('Erro ao abrir o banco de dados:', (event.target as IDBOpenDBRequest).error);
    };
  }

  private setupListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.checkSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private startSyncInterval() {
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline) {
        this.checkSyncQueue();
      }
    }, 30000); // Verifica a cada 30 segundos
  }

  public async checkSyncQueue() {
    if (!this.db || !this.isBackendAlive) {
      console.log('[OfflineManager] Ignorando sincronização - backend offline');
      return;
    }

    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.getAll();

    request.onsuccess = async () => {
      const items = request.result;
      for (const item of items) {
        try {
          // Aqui você implementaria a chamada real para seu backend
          console.log('Enviando para o backend:', item.data);

          // Simulando uma chamada de API bem-sucedida
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Remove da fila se for bem-sucedido
          const deleteRequest = store.delete(item.id);
          deleteRequest.onsuccess = () => {
            console.log('Item sincronizado com sucesso:', item.id);
          };
        } catch (error) {
          console.error('Erro ao sincronizar item:', error);
        }
      }
    };
  }

  public async saveCliente(
    cliente: Cliente,
    isOnline: boolean,
  ): Promise<{
    success: boolean;
    isOffline: boolean;
    backendError?: boolean;
  }> {
    if (isOnline && this.isBackendAlive) {
      try {
        const saved = await this.syncWithRealBackend(cliente, 'clientes');
        return { success: saved, isOffline: false };
      } catch (error) {
        const result = await this.saveClienteOffline(cliente);
        return { ...result, backendError: true };
      }
    }
    return this.saveClienteOffline(cliente);
  }

  private async saveClienteOffline(cliente: any): Promise<{ success: boolean; isOffline: true }> {
    if (!this.db) return { success: false, isOffline: true };

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['clientes', 'syncQueue'], 'readwrite');
      const clientesStore = transaction.objectStore('clientes');
      const syncStore = transaction.objectStore('syncQueue');

      // Adiciona um ID temporário se não existir
      if (!cliente.id) {
        cliente.id = `temp_${Date.now()}`;
      }

      // Salva nos clientes locais
      const clienteRequest = clientesStore.put(cliente);

      // Adiciona à fila de sincronização
      const syncRequest = syncStore.add({
        type: 'cliente',
        data: cliente,
        timestamp: new Date().toISOString(),
      });

      clienteRequest.onsuccess = () => {
        syncRequest.onsuccess = () => {
          resolve({ success: true, isOffline: true });
        };
      };

      clienteRequest.onerror = () => {
        resolve({ success: false, isOffline: true });
      };
    });
  }

  public async deleteCliente(id: string): Promise<Cliente[]> {
    if (!this.db) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['clientes', 'syncQueue'], 'readwrite');
      const clientesStore = transaction.objectStore('clientes');
      const syncStore = transaction.objectStore('syncQueue');

      // Remove dos clientes
      clientesStore.delete(id);

      // Adiciona à fila de sincronização
      syncStore.add({
        type: 'deleteCliente',
        data: { id },
        timestamp: new Date().toISOString(),
      });

      transaction.oncomplete = async () => {
        const updatedClientes = await this.getClientes();
        resolve(updatedClientes);
      };
    });
  }

  public async getClientes(): Promise<Cliente[]> {
    if (!this.db) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['clientes'], 'readonly');
      const store = transaction.objectStore('clientes');
      const request = store.getAll();

      request.onsuccess = () => {
        // Ordena por pendingSync (pendentes primeiro) e depois por data
        const clientes = (request.result || []).sort((a, b) => {
          if (a.pendingSync && !b.pendingSync) return -1;
          if (!a.pendingSync && b.pendingSync) return 1;
          return 0;
        });
        resolve(clientes);
      };

      request.onerror = () => {
        resolve([]);
      };
    });
  }

  // Método público para sincronização
  public async syncQueue(): Promise<SyncResult> {
    if (!this.db) return { success: false, errors: ['Database not initialized'] };

    try {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const items = await new Promise<any[]>((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });

      const errors: any[] = [];

      for (const item of items) {
        try {
          // Simulação de chamada ao backend
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Remove da fila se bem-sucedido
          await new Promise((resolve) => {
            const deleteRequest = store.delete(item.id);
            deleteRequest.onsuccess = () => resolve(true);
            deleteRequest.onerror = () => resolve(false);
          });
        } catch (error) {
          errors.push({ id: item.id, error });
        }
      }

      return {
        success: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return { success: false, errors: [error] };
    }
  }
}

export const offlineManager = new OfflineManager();
