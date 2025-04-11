// src/components/FormFornecedor/PedidosFornecedor.tsx
import { PedidoType } from './types';
import styles from './FormFornecedor.module.css';

type PedidosFornecedorProps = {
  pedidos: PedidoType[];
  onAddPedido: () => void;
};

export function PedidosFornecedor({ pedidos, onAddPedido }: PedidosFornecedorProps) {
  return (
    <div className={styles.pedidosContainer}>
      <h2 className={styles.sectionTitle}>Pedidos do Fornecedor</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Data</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length > 0 ? (
              pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td>{pedido.produto}</td>
                  <td>{pedido.quantidade}</td>
                  <td>{pedido.data}</td>
                  <td>
                    <span className={`${styles.status} ${styles[pedido.status.toLowerCase()]}`}>
                      {pedido.status}
                    </span>
                  </td>
                  <td>
                    <button className={styles.actionButton}>Editar</button>
                    <button className={styles.actionButton}>Excluir</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className={styles.noData}>
                  Nenhum pedido registrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button onClick={onAddPedido} className={styles.addButton}>
        + Novo Pedido
      </button>
    </div>
  );
}
