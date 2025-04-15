import { useState, useEffect, useCallback, useRef } from 'react';
import { FiWifi, FiWifiOff, FiAlertTriangle, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { ClientesList } from './ClientesList';
import { ClienteModal } from './ClienteModal';
import { apiManager } from '../../services/apiManager';
import styles from './FormCliente.module.css';
import { Cliente } from './types';

type BackendStatus = 'online' | 'offline' | 'error' | 'checking';

export default function FormCliente() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
  };

  // Verifica status do backend
  const lastCheckRef = useRef<number>(0);
  const CHECK_INTERVAL = 5000; // 5 segundos entre verificações

  const checkBackendStatus = useCallback(async () => {
    const now = Date.now();
    if (now - lastCheckRef.current < CHECK_INTERVAL) {
      return backendStatus === 'online';
    }

    lastCheckRef.current = now;

    try {
      setBackendStatus('checking');
      const isAlive = await apiManager.checkBackendStatus();
      setBackendStatus(isAlive ? 'online' : 'error');
      return isAlive;
    } catch (error) {
      setBackendStatus('error');
      return false;
    }
  }, [backendStatus]);

  // Carrega clientes da API
  const loadClientes = useCallback(async () => {
    setIsLoading(true);
    try {
      const clientes = await apiManager.getClientes();
      setClientes(clientes);
      setMessage('Clientes carregados com sucesso');
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setMessage('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }, []);

  // Efeitos para monitorar conexão e carregar dados
  useEffect(() => {
    const init = async () => {
      await checkBackendStatus();
      await loadClientes();
    };

    init();

    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => checkBackendStatus(), 2000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, [checkBackendStatus, loadClientes]);

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
      const result = await apiManager.saveCliente(cliente);
      if (result.success) {
        await loadClientes();
        setModalState({ open: false, mode: 'view', cliente: null });
        setMessage('Cliente salvo com sucesso!');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      setMessage('Erro ao salvar cliente');
    }
  };

  const handleDeleteCliente = async (id: string) => {
    try {
      const result = await apiManager.deleteCliente(id);
      if (result.success) {
        await loadClientes();
        setModalState({ open: false, mode: 'view', cliente: null });
        setMessage('Cliente removido com sucesso!');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      setMessage('Erro ao remover cliente');
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
        </div>
        {message && (
          <div className={styles.syncMessage}>
            <FiCheckCircle /> {message}
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
        onRefresh={loadClientes}
        isOnline={isOnline && backendStatus === 'online'}
        isLoading={isLoading}
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
