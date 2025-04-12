import { useState, useEffect, useCallback } from 'react';
import { FiWifi, FiWifiOff, FiAlertTriangle, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { ClientesList } from './ClientesList';
import { ClienteModal } from './ClienteModal';
import { offlineManager } from '../../services/offlineManager';
import styles from './FormCliente.module.css';
import { Cliente } from './types';

type BackendStatus = 'online' | 'offline' | 'error' | 'checking' | 'syncing';

export default function FormCliente() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'view' | 'edit' | 'create';
    cliente: Cliente | null;
  }>({
    open: false,
    mode: 'view',
    cliente: null,
  });

  // Template para novo cliente
  const newClienteTemplate: Cliente = {
    id: '',
    tipo: 'petshop',
    nomeFantasia: '',
    razaoSocial: '',
    documento: '',
    responsavel: '',
    telefone: '',
    email: '',
    endereco: {
      cep: '',
      logradouro: '',
      bairro: '',
      localidade: '',
      uf: '',
      numero: '',
    },
    observacoes: '',
    pendingSync: true,
  };

  // Verifica status do backend
  const checkBackendStatus = useCallback(async () => {
    try {
      setBackendStatus('checking');
      const isAlive = await offlineManager.checkBackendStatus();
      setBackendStatus(isAlive ? 'online' : 'error');
      return isAlive;
    } catch (error) {
      setBackendStatus('error');
      return false;
    }
  }, []);

  // Carrega clientes do IndexedDB
  const loadClientes = useCallback(async () => {
    try {
      const clientes = await offlineManager.getClientes();
      setClientes(clientes);
      const pendingCount = clientes.filter((c) => c.pendingSync).length;
      setPendingSyncCount(pendingCount);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  }, []);

  // Sincroniza alterações pendentes
  const syncPendingChanges = useCallback(async () => {
    if (backendStatus !== 'online') return;

    try {
      setBackendStatus('syncing');
      const result = await offlineManager.syncQueue();

      if (result.success) {
        setSyncMessage('Alterações sincronizadas com sucesso!');
        setLastSyncTime(new Date());
      } else {
        setSyncMessage('Erro ao sincronizar algumas alterações');
      }

      await loadClientes();
      setBackendStatus('online');
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (error) {
      console.error('Erro na sincronização:', error);
      setBackendStatus('error');
      setSyncMessage('Falha na sincronização');
    }
  }, [backendStatus, loadClientes]);

  // Efeitos para monitorar conexão e carregar dados
  useEffect(() => {
    const init = async () => {
      await checkBackendStatus();
      await loadClientes();
    };

    init();

    const handleOnline = () => {
      setIsOnline(true);
      checkBackendStatus().then((isAlive) => {
        if (isAlive) syncPendingChanges();
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, [checkBackendStatus, loadClientes, syncPendingChanges]);

  // Manipuladores de eventos
  const handleOpenModal = (mode: 'create' | 'edit' | 'view', cliente?: Cliente) => {
    setModalState({
      open: true,
      mode,
      cliente: cliente || { ...newClienteTemplate },
    });
  };

  const handleSaveCliente = async (cliente: Cliente) => {
    try {
      const result = await offlineManager.saveCliente(
        cliente,
        isOnline && backendStatus === 'online',
      );

      if (result.success) {
        await loadClientes();
        setModalState({ open: false, mode: 'view', cliente: null });
        setSyncMessage(
          result.backendError
            ? 'Salvo localmente (sincronização pendente)'
            : 'Cliente salvo com sucesso!',
        );
        setTimeout(() => setSyncMessage(null), 3000);
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      setSyncMessage('Erro ao salvar cliente');
    }
  };

  const handleDeleteCliente = async (id: string) => {
    try {
      await offlineManager.deleteCliente(id);
      await loadClientes();
      setModalState({ open: false, mode: 'view', cliente: null });
      setSyncMessage('Cliente removido com sucesso!');
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      setSyncMessage('Erro ao remover cliente');
    }
  };

  // Renderização do status
  const renderStatus = () => {
    const statusMap = {
      checking: {
        icon: <div className={styles.spinner} />,
        text: 'Verificando...',
        className: styles.statusChecking,
      },
      online: { icon: <FiWifi />, text: 'Online', className: styles.statusOnline },
      error: { icon: <FiAlertTriangle />, text: 'Erro no servidor', className: styles.statusError },
      offline: { icon: <FiWifiOff />, text: 'Offline', className: styles.statusOffline },
      syncing: {
        icon: <div className={styles.spinner} />,
        text: 'Sincronizando...',
        className: styles.statusSyncing,
      },
    };

    const status = statusMap[backendStatus];

    return (
      <div className={`${styles.statusBar} ${status.className}`}>
        <div className={styles.statusContent}>
          {status.icon}
          <span>{status.text}</span>
          {backendStatus === 'error' && (
            <button onClick={checkBackendStatus} className={styles.retryButton}>
              <FiRefreshCw /> Tentar novamente
            </button>
          )}
          {pendingSyncCount > 0 && backendStatus === 'online' && (
            <button onClick={syncPendingChanges} className={styles.syncButton}>
              <FiRefreshCw /> Sincronizar ({pendingSyncCount})
            </button>
          )}
          {lastSyncTime && (
            <span className={styles.lastSync}>
              Última sincronização: {lastSyncTime.toLocaleTimeString()}
            </span>
          )}
        </div>
        {syncMessage && (
          <div className={styles.syncMessage}>
            <FiCheckCircle /> {syncMessage}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {renderStatus()}

      <ClientesList
        clientes={clientes}
        onAdd={() => handleOpenModal('create')}
        onEdit={(cliente) => handleOpenModal('edit', cliente)}
        onView={(cliente) => handleOpenModal('view', cliente)}
        onDelete={handleDeleteCliente}
        pendingSyncCount={pendingSyncCount}
        isOnline={isOnline && backendStatus === 'online'}
      />

      {modalState.open && modalState.cliente && (
        <ClienteModal
          cliente={modalState.cliente}
          mode={modalState.mode}
          onClose={() => setModalState({ ...modalState, open: false })}
          onSave={handleSaveCliente}
          onDelete={modalState.mode === 'view' ? handleDeleteCliente : undefined}
          isOnline={isOnline && backendStatus === 'online'}
        />
      )}
    </div>
  );
}
