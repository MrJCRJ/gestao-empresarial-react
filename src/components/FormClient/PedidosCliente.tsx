// src/components/FormCliente/PedidosCliente.tsx
import { PedidoType } from './types';
import styles from './FormCliente.module.css';

type PedidosClienteProps = {
  pedidos: PedidoType[];
  onAddPedido?: () => void;
};

export function PedidosCliente({ pedidos, onAddPedido }: PedidosClienteProps) {
  return (
    <div>
      <h3>Histórico de Pedidos</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Data</th>
            <th>Produto</th>
            <th>Quantidade</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.length > 0 ? (
            pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.data}</td>
                <td>{pedido.produto}</td>
                <td>{pedido.quantidade}</td>
                <td>R$ {pedido.valor.toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className={styles.noData}>
                Nenhum pedido registrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {onAddPedido && (
        <button onClick={onAddPedido} className={styles.addButton}>
          + Novo Pedido
        </button>
      )}
    </div>
  );
}
