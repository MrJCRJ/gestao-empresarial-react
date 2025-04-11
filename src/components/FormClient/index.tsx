import { useState, useEffect } from 'react';
import { FiWifi, FiWifiOff, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { ClientesList } from './ClientesList';
import { ClienteModal } from './ClienteModal';
import { offlineManager } from '../../services/offlineManager';
import styles from './FormCliente.module.css';
import statusStyles from './StatusBar.module.css';
import loadingStyles from './Loading.module.css';
import { Cliente } from './types';

export default function FormCliente() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'error' | 'checking'>(
    'checking',
  );

  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'view' | 'edit' | 'create';
    cliente: Cliente | null;
  }>({
    open: false,
    mode: 'view',
    cliente: null,
  });

  const checkBackendOnce = async () => {
    setBackendStatus('checking');
    const isAlive = await offlineManager.checkBackendStatus();
    setBackendStatus(isAlive ? 'online' : 'error');
  };

  useEffect(() => {
    checkBackendOnce();

    const loadClientes = async () => {
      const clientes = await offlineManager.getClientes();
      setClientes(clientes);
      setPendingSyncCount(clientes.filter((c) => c.pendingSync).length);
    };

    loadClientes();

    const handleOnline = () => {
      setIsOnline(true);
      offlineManager.checkSyncQueue();
      loadClientes();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', cliente?: Cliente) => {
    setModalState({
      open: true,
      mode,
      cliente: cliente || {
        id: '',
        tipo: 'petshop',
        nomeFantasia: '',
        razaoSocial: '',
        documento: '',
        responsavel: '',
        telefone: '',
        email: '',
        cep: '',
        endereco: {
          logradouro: '',
          bairro: '',
          localidade: '',
          uf: '',
          numero: '',
        },
        observacoes: '',
        pendingSync: true,
      },
    });
  };

  const handleSaveCliente = async (cliente: Cliente) => {
    const result = await offlineManager.saveCliente(cliente, isOnline);

    if (result.success) {
      if (result.backendError) {
        setBackendStatus('error');
      } else {
        setBackendStatus('online');
      }
      const updatedClientes = await offlineManager.getClientes();
      setClientes(updatedClientes);
      setPendingSyncCount(updatedClientes.filter((c) => c.pendingSync).length);
      setModalState({ open: false, mode: 'view', cliente: null });
    }
  };

  const handleDeleteCliente = async (id: string) => {
    const updatedClientes = await offlineManager.deleteCliente(id);
    setClientes(updatedClientes);
    setModalState({ open: false, mode: 'view', cliente: null });
  };

  const renderStatus = () => {
    const statusConfig = {
      checking: {
        icon: <div className={loadingStyles.checkingSpinner} />,
        text: 'Verificando conexão com o servidor...',
        showButton: false,
        className: styles.checkingStatus,
      },
      online: {
        icon: <FiWifi className={styles.onlineIcon} />,
        text: 'Conectado ao servidor',
        showButton: false,
        className: styles.onlineStatus,
      },
      error: {
        icon: <FiAlertTriangle className={styles.errorIcon} />,
        text: 'Erro no servidor',
        showButton: true,
        className: styles.errorStatus,
      },
      offline: {
        icon: <FiWifiOff className={styles.offlineIcon} />,
        text: 'Sem conexão com a internet',
        showButton: false,
        className: styles.offlineStatus,
      },
    };

    const currentStatus = statusConfig[backendStatus];

    return (
      <div className={`${styles.statusMessage} ${currentStatus.className}`}>
        {currentStatus.icon}
        <span>{currentStatus.text}</span>
        {currentStatus.showButton && (
          <button
            className={styles.retryButton}
            onClick={checkBackendOnce}
            disabled={backendStatus === 'checking'}
          >
            <FiRefreshCw /> Tentar novamente
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.statusBar}>
        <div className={styles.onlineStatus}>
          {renderStatus()}
          {pendingSyncCount > 0 && (
            <span className={styles.pendingCount}>{pendingSyncCount} para sincronizar</span>
          )}
        </div>
      </div>

      <ClientesList
        clientes={clientes}
        onAdd={() => handleOpenModal('create')}
        onEdit={(cliente) => handleOpenModal('edit', cliente)}
        onView={(cliente) => handleOpenModal('view', cliente)}
        onDelete={handleDeleteCliente}
        pendingSyncCount={pendingSyncCount}
        isOnline={isOnline}
      />

      {modalState.open && modalState.cliente && (
        <ClienteModal
          cliente={modalState.cliente}
          mode={modalState.mode}
          onClose={() => setModalState({ ...modalState, open: false })}
          onSave={handleSaveCliente}
          onDelete={modalState.mode === 'view' ? handleDeleteCliente : undefined}
        />
      )}
    </div>
  );
}
