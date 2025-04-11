import { useState, ChangeEvent, FormEvent } from 'react';
import { FiTruck, FiShoppingCart, FiList } from 'react-icons/fi';
import styles from './FormFornecedor.module.css';

type FornecedorType = {
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  tipoRacao: string[];
  prazoEntrega: string;
  condicoesPagamento: string;
  observacoes: string;
};

type FornecedorTab = 'dados' | 'pedidos' | 'catalogo';

type PedidoType = {
  id: string;
  produto: string;
  quantidade: number;
  data: string;
  status: string;
};

type ProdutoType = {
  id: string;
  nome: string;
  preco: number;
  disponivel: boolean;
};

export default function FormFornecedor() {
  const [activeTab, setActiveTab] = useState<FornecedorTab>('dados');
  const [fornecedor, setFornecedor] = useState<FornecedorType>({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    tipoRacao: [],
    prazoEntrega: '',
    condicoesPagamento: '',
    observacoes: '',
  });
  const [pedidos, setPedidos] = useState<PedidoType[]>([]);
  const [produtos, setProdutos] = useState<ProdutoType[]>([]);

  const tiposRacao = [
    'Cães Adultos',
    'Cães Filhotes',
    'Gatos Adultos',
    'Gatos Filhotes',
    'Aves',
    'Peixes',
    'Roedores',
    'Outros',
  ];

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFornecedor((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (tipo: string) => {
    setFornecedor((prev) => {
      const updatedTipos = prev.tipoRacao.includes(tipo)
        ? prev.tipoRacao.filter((item) => item !== tipo)
        : [...prev.tipoRacao, tipo];
      return { ...prev, tipoRacao: updatedTipos };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Fornecedor cadastrado:', fornecedor);
    // Aqui você faria a submissão para sua API ou store
  };

  const handleAddPedido = () => {
    const novoPedido: PedidoType = {
      id: Date.now().toString(),
      produto: 'Novo Produto',
      quantidade: 1,
      data: new Date().toLocaleDateString(),
      status: 'Pendente',
    };
    setPedidos([...pedidos, novoPedido]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabButtons}>
        <button
          className={activeTab === 'dados' ? styles.active : ''}
          onClick={() => setActiveTab('dados')}
        >
          <FiTruck /> Dados
        </button>
        <button
          className={activeTab === 'pedidos' ? styles.active : ''}
          onClick={() => setActiveTab('pedidos')}
        >
          <FiShoppingCart /> Pedidos ({pedidos.length})
        </button>
        <button
          className={activeTab === 'catalogo' ? styles.active : ''}
          onClick={() => setActiveTab('catalogo')}
        >
          <FiList /> Catálogo ({produtos.length})
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'dados' && (
          <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>Cadastro de Fornecedor</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Nome do Fornecedor:</label>
                <input
                  type="text"
                  name="nome"
                  value={fornecedor.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>CNPJ:</label>
                <input
                  type="text"
                  name="cnpj"
                  value={fornecedor.cnpj}
                  onChange={handleChange}
                  required
                  pattern="\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Telefone:</label>
                  <input
                    type="tel"
                    name="telefone"
                    value={fornecedor.telefone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>E-mail:</label>
                  <input
                    type="email"
                    name="email"
                    value={fornecedor.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Endereço Completo:</label>
                <input
                  type="text"
                  name="endereco"
                  value={fornecedor.endereco}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Tipos de Ração Fornecidos:</label>
                <div className={styles.checkboxGroup}>
                  {tiposRacao.map((tipo) => (
                    <label key={tipo} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={fornecedor.tipoRacao.includes(tipo)}
                        onChange={() => handleCheckboxChange(tipo)}
                      />
                      {tipo}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Prazo de Entrega:</label>
                  <select
                    name="prazoEntrega"
                    value={fornecedor.prazoEntrega}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="24h">24 horas</option>
                    <option value="48h">48 horas</option>
                    <option value="3-5d">3-5 dias</option>
                    <option value="7d">7 dias</option>
                    <option value="sobConsulta">Sob consulta</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Condições de Pagamento:</label>
                  <select
                    name="condicoesPagamento"
                    value={fornecedor.condicoesPagamento}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="aVista">À vista</option>
                    <option value="7d">7 dias</option>
                    <option value="14d">14 dias</option>
                    <option value="30d">30 dias</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Observações:</label>
                <textarea
                  name="observacoes"
                  value={fornecedor.observacoes}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                  {fornecedor.nome ? 'Atualizar' : 'Cadastrar'} Fornecedor
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'pedidos' && (
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
                          <span
                            className={`${styles.status} ${styles[pedido.status.toLowerCase()]}`}
                          >
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
            <button onClick={handleAddPedido} className={styles.addButton}>
              + Novo Pedido
            </button>
          </div>
        )}

        {activeTab === 'catalogo' && (
          <div className={styles.catalogoContainer}>
            <h2 className={styles.sectionTitle}>Catálogo de Produtos</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Preço</th>
                    <th>Disponibilidade</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.length > 0 ? (
                    produtos.map((produto) => (
                      <tr key={produto.id}>
                        <td>{produto.nome}</td>
                        <td>R$ {produto.preco.toFixed(2)}</td>
                        <td>
                          {produto.disponivel ? (
                            <span className={styles.available}>Disponível</span>
                          ) : (
                            <span className={styles.unavailable}>Indisponível</span>
                          )}
                        </td>
                        <td>
                          <button className={styles.actionButton}>Editar</button>
                          <button className={styles.actionButton}>Excluir</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className={styles.noData}>
                        Nenhum produto cadastrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <button className={styles.addButton}>+ Adicionar Produto</button>
          </div>
        )}
      </div>
    </div>
  );
}
