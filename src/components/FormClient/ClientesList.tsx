// src/components/FormCliente/ClientesList.tsx
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import styles from './FormCliente.module.css';
import { Cliente } from './types';

type ClientesListProps = {
  clientes: Cliente[];
  onAdd: () => void;
  onEdit: (cliente: Cliente) => void;
  onView: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
  pendingSyncCount: number;
  isOnline: boolean;
};

export function ClientesList({
  clientes,
  onAdd,
  onEdit,
  onView,
  onDelete,
  pendingSyncCount,
  isOnline,
}: ClientesListProps) {
  return (
    <div className={styles.clientesContainer}>
      <div className={styles.header}>
        <h2>Clientes Cadastrados</h2>
        <div className={styles.statusContainer}>
          {!isOnline && <span className={styles.syncBadge}>{pendingSyncCount} pendentes</span>}
          <button onClick={onAdd} className={styles.addButton}>
            <FiPlus /> Novo Cliente
          </button>
        </div>
      </div>

      <div className={styles.clientesGrid}>
        {clientes.map((cliente) => (
          <div key={cliente.id} className={styles.clienteCard}>
            <div className={styles.cardHeader}>
              <FiUser className={styles.userIcon} />
              <h3>{cliente.nomeFantasia || cliente.razaoSocial}</h3>
              {cliente.pendingSync && <span className={styles.syncIndicator}>Pendente</span>}
            </div>
            <p>{cliente.documento}</p>
            <p>{cliente.email}</p>

            <div className={styles.cardActions}>
              <button onClick={() => onView(cliente)} className={styles.viewButton}>
                Visualizar
              </button>
              <button onClick={() => onEdit(cliente)} className={styles.editButton}>
                <FiEdit2 />
              </button>
              <button onClick={() => onDelete(cliente.id)} className={styles.deleteButton}>
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
