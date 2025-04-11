import { useState } from 'react';
import { FiUser, FiShoppingBag } from 'react-icons/fi';
import styles from './FormCliente.module.css';

type ClienteTab = 'dados' | 'pedidos';

type Pedido = {
  data: string;
  produto: string;
  quantidade: number;
  valor: number;
};

export default function FormCliente() {
  const [activeTab, setActiveTab] = useState<ClienteTab>('dados');

  return (
    <div className={styles.container}>
      <div className={styles.tabButtons}>
        <button
          className={activeTab === 'dados' ? styles.active : ''}
          onClick={() => setActiveTab('dados')}
        >
          <FiUser /> Dados do Cliente
        </button>
        <button
          className={activeTab === 'pedidos' ? styles.active : ''}
          onClick={() => setActiveTab('pedidos')}
        >
          <FiShoppingBag /> Pedidos
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'dados' && <DadosCliente />}
        {activeTab === 'pedidos' && <PedidosCliente />}
      </div>
    </div>
  );
}

// Subcomponentes
function DadosCliente() {
  return (
    <form className={styles.formContainer}>
      <h3 className={styles.formTitle}>Dados do Cliente</h3>

      {/* Identificação */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Tipo de Cliente</label>
          <select>
            <option value="petshop">Petshop</option>
            <option value="mercadinho">Mercadinho</option>
            <option value="clínica">Clínica Veterinária</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Nome Fantasia</label>
          <input type="text" placeholder="Nome do estabelecimento" />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Razão Social</label>
          <input type="text" placeholder="Razão Social" />
        </div>
        <div className={styles.formGroup}>
          <label>CNPJ ou CPF</label>
          <input type="text" placeholder="00.000.000/0000-00" />
        </div>
      </div>

      {/* Contato */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Responsável</label>
          <input type="text" placeholder="Nome do responsável" />
        </div>
        <div className={styles.formGroup}>
          <label>Telefone</label>
          <input type="tel" placeholder="(00) 00000-0000" />
        </div>
        <div className={styles.formGroup}>
          <label>Email</label>
          <input type="email" placeholder="contato@email.com" />
        </div>
      </div>

      {/* Endereço */}
      <div className={styles.formGroup}>
        <label>CEP</label>
        <input type="text" placeholder="00000-000" />
      </div>

      <div className={styles.formGroup}>
        <label>Endereço</label>
        <input type="text" placeholder="Rua, número, complemento" />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Bairro</label>
          <input type="text" />
        </div>
        <div className={styles.formGroup}>
          <label>Cidade</label>
          <input type="text" />
        </div>
        <div className={styles.formGroup}>
          <label>Estado</label>
          <input type="text" placeholder="UF" />
        </div>
      </div>

      {/* Info adicional */}
      <div className={styles.formGroup}>
        <label>Observações</label>
        <textarea rows={3} placeholder="Alguma informação adicional..." />
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.submitButton}>
          Salvar Cliente
        </button>
      </div>
    </form>
  );
}

function PedidosCliente() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

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
          {pedidos.map((pedido, index) => (
            <tr key={index}>
              <td>{pedido.data}</td>
              <td>{pedido.produto}</td>
              <td>{pedido.quantidade}</td>
              <td>R$ {pedido.valor.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
