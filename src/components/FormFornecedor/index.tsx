// src/components/FormFornecedor/FormFornecedor.tsx
import { useState, useEffect } from 'react';
import { FiTruck, FiShoppingCart, FiList, FiPlus } from 'react-icons/fi';
import { DadosFornecedor } from './DadosFornecedor';
import { PedidosFornecedor } from './PedidosFornecedor';
import { CatalogoFornecedor } from './CatalogoFornecedor';
import { FornecedorTab, FornecedorType, PedidoType, ProdutoType, tiposRacao } from './types';
import styles from './FormFornecedor.module.css';
import { apiManager } from '../../services/apiManager';

// Tipo para o estado inicial do fornecedor
const initialFornecedorState: FornecedorType = {
  id: '',
  nome: '',
  cnpj: '',
  telefone: '',
  email: '',
  endereco: '',
  tipoRacao: [],
  prazoEntrega: '',
  condicoesPagamento: '',
  observacoes: '',
};

export default function FormFornecedor() {
  const [activeTab, setActiveTab] = useState<FornecedorTab>('dados');
  const [fornecedores, setFornecedores] = useState<FornecedorType[]>([]);
  const [selectedFornecedor, setSelectedFornecedor] = useState<FornecedorType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pedidos, setPedidos] = useState<PedidoType[]>([]);
  const [produtos, setProdutos] = useState<ProdutoType[]>([]);

  // Carrega os fornecedores ao montar o componente
  useEffect(() => {
    loadFornecedores();
  }, []);

  const loadFornecedores = async () => {
    try {
      const response = await fetch(`${apiManager.getBackendUrl()}/fornecedores`);
      if (response.ok) {
        const data = await response.json();
        // Garante que cada fornecedor tem um ID válido
        const fornecedoresFormatados = data.map((f: any) => ({
          ...f,
          id: f._id || f.id, // Usa _id se id não existir
        }));
        setFornecedores(fornecedoresFormatados);
      }
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFornecedor) return;

    try {
      const method = selectedFornecedor.id ? 'PUT' : 'POST';
      const url = selectedFornecedor.id
        ? `${apiManager.getBackendUrl()}/fornecedores/${selectedFornecedor.id}`
        : `${apiManager.getBackendUrl()}/fornecedores`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedFornecedor),
      });

      if (response.ok) {
        loadFornecedores();
        setShowModal(false);
        setSelectedFornecedor(null);
      }
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    if (!selectedFornecedor) return;
    const { name, value } = e.target;
    setSelectedFornecedor({ ...selectedFornecedor, [name]: value });
  };

  const handleCheckboxChange = (tipo: string) => {
    if (!selectedFornecedor) return;
    setSelectedFornecedor((prev) => {
      if (!prev) return null;
      const updatedTipos = prev.tipoRacao.includes(tipo)
        ? prev.tipoRacao.filter((item) => item !== tipo)
        : [...prev.tipoRacao, tipo];
      return { ...prev, tipoRacao: updatedTipos };
    });
  };

  const handleDeleteFornecedor = async (fornecedor: FornecedorType) => {
    const idParaDeletar = fornecedor._id || fornecedor.id;

    if (!idParaDeletar) {
      console.error('Fornecedor sem ID válido:', fornecedor);
      alert('Fornecedor não possui um ID válido para exclusão');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir ${fornecedor.nome}?`)) {
      return;
    }

    try {
      await apiManager.deleteFornecedor(idParaDeletar);
      loadFornecedores();
      alert(`${fornecedor.nome} foi excluído com sucesso!`);
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert(`Falha ao excluir: ${error}`);
    }
  };

  const openNewFornecedorModal = () => {
    setSelectedFornecedor(initialFornecedorState);
    setShowModal(true);
  };

  const openEditFornecedorModal = (fornecedor: FornecedorType) => {
    setSelectedFornecedor(fornecedor);
    setShowModal(true);
  };

  useEffect(() => {
    const loadPedidos = async () => {
      try {
        const response = await fetch(`${apiManager.getBackendUrl()}/pedidos`);
        if (response.ok) {
          const data = await response.json();
          setPedidos(data);
        }
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
      }
    };

    loadPedidos();
  }, []);

  const handleAddPedido = async (novoPedido: PedidoType) => {
    try {
      const response = await fetch(`${apiManager.getBackendUrl()}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoPedido),
      });

      if (response.ok) {
        const pedidoSalvo = await response.json();
        setPedidos([...pedidos, pedidoSalvo]);
      }
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Fornecedores</h1>
      </div>

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
          <div className={styles.fornecedoresList}>
            <h2>Lista de Fornecedores</h2>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CNPJ</th>
                  <th>Telefone</th>
                  <th>Email</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {fornecedores.map((fornecedor) => (
                  <tr key={fornecedor.id || fornecedor.cnpj}>
                    <td>{fornecedor.nome}</td>
                    <td>{fornecedor.cnpj}</td>
                    <td>{fornecedor.telefone}</td>
                    <td>{fornecedor.email}</td>
                    <td>
                      <button
                        onClick={() => openEditFornecedorModal(fornecedor)}
                        className={styles.actionButton}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteFornecedor(fornecedor)}
                        className={styles.deleteButton}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={openNewFornecedorModal} className={styles.addButton}>
              <FiPlus /> Cadastrar Fornecedor
            </button>
          </div>
        )}

        {activeTab === 'pedidos' && (
          <PedidosFornecedor
            pedidos={pedidos}
            onAddPedido={handleAddPedido}
            fornecedores={fornecedores}
          />
        )}

        {activeTab === 'catalogo' && <CatalogoFornecedor produtos={produtos} />}
      </div>

      {/* Modal para cadastro/edição de fornecedor */}
      {showModal && selectedFornecedor && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>{selectedFornecedor.id ? 'Editar' : 'Cadastrar'} Fornecedor</h2>
            <button className={styles.closeButton} onClick={() => setShowModal(false)}>
              &times;
            </button>

            <DadosFornecedor
              fornecedor={selectedFornecedor}
              onFormSubmit={handleSubmit}
              onInputChange={handleChange}
              onCheckboxChange={handleCheckboxChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
