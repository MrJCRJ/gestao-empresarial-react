// src/components/FormFornecedor/PedidosFornecedor.tsx
import { useState } from 'react';
import { FornecedorType, PedidoType } from './types';
import styles from './PedidosFornecedor.module.css';
import { FiPlus, FiX } from 'react-icons/fi';

type PedidosFornecedorProps = {
  pedidos: PedidoType[];
  onAddPedido: (pedido: PedidoType) => void;
  fornecedores: FornecedorType[];
};

export function PedidosFornecedor({ pedidos, onAddPedido, fornecedores }: PedidosFornecedorProps) {
  const [showModal, setShowModal] = useState(false);
  const [novoPedido, setNovoPedido] = useState<PedidoType>({
    id: '',
    produto: '',
    quantidade: 1,
    data: new Date().toISOString().split('T')[0],
    status: 'Pendente',
    fornecedorCnpj: '',
    valorUnitario: 0,
    valorTotal: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newValue = name === 'quantidade' || name === 'valorUnitario' ? Number(value) : value;

    setNovoPedido((prev) => {
      const updated = {
        ...prev,
        [name]: newValue,
      };

      // Calcula o valor total automaticamente
      if (name === 'quantidade' || name === 'valorUnitario') {
        updated.valorTotal = updated.quantidade * updated.valorUnitario;
      }

      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoPedido.fornecedorCnpj || !novoPedido.produto) {
      return alert('Preencha os campos obrigatórios');
    }

    onAddPedido({
      ...novoPedido,
      id: Date.now().toString(),
      valorTotal: novoPedido.quantidade * novoPedido.valorUnitario,
    });

    // Resetar o formulário
    setNovoPedido({
      id: '',
      produto: '',
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
      data: new Date().toISOString().split('T')[0],
      status: 'Pendente',
      fornecedorCnpj: '',
    });

    setShowModal(false);
  };

  const openAddPedidoModal = () => {
    setShowModal(true);
  };

  return (
    <div className={styles.pedidosContainer}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>Pedidos do Fornecedor</h2>
        <button onClick={openAddPedidoModal} className={styles.addButton}>
          <FiPlus /> Novo Pedido
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Valor Unitário</th>
              <th>Valor Total</th>
              <th>Data</th>
              <th>Status</th>
              <th>Fornecedor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length > 0 ? (
              pedidos.map((pedido) => {
                const fornecedor = fornecedores.find((f) => f.cnpj === pedido.fornecedorCnpj);
                return (
                  <tr key={pedido.id}>
                    <td>{pedido.produto}</td>
                    <td>{pedido.quantidade}</td>
                    <td>R$ {pedido.valorUnitario.toFixed(2)}</td>
                    <td>R$ {pedido.valorTotal.toFixed(2)}</td>
                    <td>{pedido.data}</td>
                    <td>
                      <span className={`${styles.status} ${styles[pedido.status.toLowerCase()]}`}>
                        {pedido.status}
                      </span>
                    </td>
                    <td>{fornecedor ? `${fornecedor.nome} (${fornecedor.cnpj})` : '—'}</td>
                    <td>
                      <button className={styles.actionButton}>Editar</button>
                      <button className={styles.deleteButton}>Excluir</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className={styles.noData}>
                  Nenhum pedido registrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para adicionar novo pedido */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Adicionar Novo Pedido</h2>
              <button onClick={() => setShowModal(false)} className={styles.closeButton}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Fornecedor *</label>
                <select
                  name="fornecedorCnpj"
                  value={novoPedido.fornecedorCnpj}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione um fornecedor</option>
                  {fornecedores.map((f) => (
                    <option key={f.cnpj} value={f.cnpj}>
                      {f.nome} - {f.cnpj}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Produto *</label>
                <input
                  name="produto"
                  value={novoPedido.produto}
                  onChange={handleChange}
                  placeholder="Nome do produto"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Quantidade *</label>
                  <input
                    name="quantidade"
                    type="number"
                    value={novoPedido.quantidade}
                    onChange={handleChange}
                    min={1}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Valor Unitário (R$) *</label>
                  <input
                    name="valorUnitario"
                    type="number"
                    value={novoPedido.valorUnitario}
                    onChange={handleChange}
                    min={0}
                    step="0.01"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Valor Total (R$)</label>
                  <input
                    type="number"
                    value={(novoPedido.quantidade * novoPedido.valorUnitario).toFixed(2)}
                    disabled
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Data *</label>
                  <input
                    name="data"
                    type="date"
                    value={novoPedido.data}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Status *</label>
                  <select name="status" value={novoPedido.status} onChange={handleChange} required>
                    <option value="Pendente">Pendente</option>
                    <option value="Entregue">Entregue</option>
                  </select>
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.submitButton}>
                  Salvar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
