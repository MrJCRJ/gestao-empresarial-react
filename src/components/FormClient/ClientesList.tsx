import { FiPlus, FiEdit2, FiTrash2, FiUser, FiRefreshCw, FiEye } from 'react-icons/fi';
import styles from './ClientesList.module.css';
import { Cliente } from './types';

type ClientesListProps = {
  clientes: Cliente[];
  onAdd: () => void;
  onEdit: (cliente: Cliente) => void;
  onView: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  onRefresh?: () => void;
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
  isOnline,
  isLoading = false,
}: ClientesListProps) {
  return (
    <div className={styles.clientesContainer}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h2>Clientes Cadastrados</h2>
          {!isOnline && <span className={styles.offlineBadge}>Modo offline</span>}
          {isLoading && <span className={styles.loadingIndicator}>Carregando...</span>}
        </div>

        <div className={styles.headerActions}>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className={styles.iconButton}
              disabled={isLoading || !isOnline}
              title="Recarregar clientes"
              aria-label="Recarregar"
            >
              <FiRefreshCw className={isLoading ? styles.spin : ''} />
            </button>
          )}

          <button
            onClick={onAdd}
            className={`${styles.button} ${styles.primaryButton}`}
            disabled={!isOnline}
          >
            <FiPlus /> Novo Cliente
          </button>
        </div>
      </div>

      {clientes.length === 0 ? (
        <div className={styles.emptyState}>
          <FiUser size={48} color="var(--text-light)" />
          <p>Nenhum cliente cadastrado</p>
          <button
            onClick={onAdd}
            className={`${styles.button} ${styles.primaryButton}`}
            disabled={!isOnline}
          >
            <FiPlus /> Adicionar primeiro cliente
          </button>
        </div>
      ) : (
        <div className={styles.clientesGrid}>
          {clientes.map((cliente) => (
            <div key={cliente.id} className={styles.clienteCard} onClick={() => onView(cliente)}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  <FiUser className={styles.userIcon} />
                </div>
                <div className={styles.cardTitle}>
                  <h3>{cliente.nomeFantasia || cliente.razaoSocial}</h3>
                  <p className={styles.documento}>{cliente.documento}</p>
                </div>
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
                  className={`${styles.actionButton} ${styles.viewButton}`}
                  aria-label="Ver detalhes"
                >
                  <FiEye /> Detalhes
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(cliente);
                  }}
                  className={`${styles.actionButton} ${styles.editButton}`}
                  disabled={!isOnline}
                  aria-label="Editar"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(cliente.id);
                  }}
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  disabled={!isOnline}
                  aria-label="Excluir"
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
