import { FiPlus, FiEdit2, FiTrash2, FiUser, FiRefreshCw, FiWifiOff } from 'react-icons/fi';
import styles from './ClientesList.module.css';
import { Cliente } from './types';

type ClientesListProps = {
  clientes: Cliente[];
  onAdd: () => void;
  onEdit: (cliente: Cliente) => void;
  onView: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onRefresh?: () => void;
  pendingSyncCount: number;
  isOnline: boolean;
  isLoading?: boolean;
};

export function ClientesList({
  clientes,
  onAdd,
  onEdit,
  onView,
  onDelete,
  onRefresh,
  pendingSyncCount,
  isOnline,
  isLoading = false,
}: ClientesListProps) {
  return (
    <div className={styles.clientesContainer}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h2>Clientes Cadastrados</h2>
          {isLoading && <span className={styles.loadingIndicator}>Carregando...</span>}
        </div>

        <div className={styles.headerActions}>
          {!isOnline && (
            <div className={styles.offlineBadge}>
              <FiWifiOff />
              <span>{pendingSyncCount} pendentes</span>
            </div>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              className={styles.refreshButton}
              disabled={!isOnline || isLoading}
              title="Recarregar clientes"
            >
              <FiRefreshCw className={isLoading ? styles.spin : ''} />
            </button>
          )}

          <button onClick={onAdd} className={styles.addButton} disabled={!isOnline}>
            <FiPlus /> Novo Cliente
          </button>
        </div>
      </div>

      {clientes.length === 0 ? (
        <div className={styles.emptyState}>
          <FiUser size={48} />
          <p>Nenhum cliente cadastrado</p>
          <button onClick={onAdd} className={styles.addButton}>
            <FiPlus /> Adicionar primeiro cliente
          </button>
        </div>
      ) : (
        <div className={styles.clientesGrid}>
          {clientes.map((cliente) => (
            <div
              key={cliente.id}
              className={`${styles.clienteCard} ${cliente.pendingSync ? styles.pending : ''}`}
              onClick={() => onView(cliente)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  <FiUser className={styles.userIcon} />
                </div>
                <div className={styles.cardTitle}>
                  <h3>{cliente.nomeFantasia || cliente.razaoSocial}</h3>
                  <p className={styles.documento}>{cliente.documento}</p>
                </div>
                {cliente.pendingSync && (
                  <span className={styles.syncIndicator}>
                    <FiRefreshCw /> Pendente
                  </span>
                )}
              </div>

              <div className={styles.cardContent}>
                {cliente.email && (
                  <p className={styles.email}>
                    <a href={`mailto:${cliente.email}`}>{cliente.email}</a>
                  </p>
                )}
                {cliente.telefone && <p className={styles.telefone}>{cliente.telefone}</p>}
                {cliente.endereco.localidade && (
                  <p className={styles.localidade}>
                    {cliente.endereco.localidade}, {cliente.endereco.uf}
                  </p>
                )}
              </div>

              <div className={styles.cardActions}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(cliente);
                  }}
                  className={styles.viewButton}
                >
                  Detalhes
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(cliente);
                  }}
                  className={styles.editButton}
                  disabled={!isOnline}
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(cliente.id);
                  }}
                  className={styles.deleteButton}
                  disabled={!isOnline}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
