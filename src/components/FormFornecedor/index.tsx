// src/components/FormFornecedor/FormFornecedor.tsx
import { useState } from 'react';
import { FiTruck, FiShoppingCart, FiList } from 'react-icons/fi';
import { DadosFornecedor } from './DadosFornecedor';
import { PedidosFornecedor } from './PedidosFornecedor';
import { CatalogoFornecedor } from './CatalogoFornecedor';
import { FornecedorTab, FornecedorType, PedidoType, ProdutoType, tiposRacao } from './types';
import styles from './FormFornecedor.module.css';

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
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

  const handleSubmit = (e: React.FormEvent) => {
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
          <DadosFornecedor
            fornecedor={fornecedor}
            onFormSubmit={handleSubmit}
            onInputChange={handleChange}
            onCheckboxChange={handleCheckboxChange}
          />
        )}

        {activeTab === 'pedidos' && (
          <PedidosFornecedor pedidos={pedidos} onAddPedido={handleAddPedido} />
        )}

        {activeTab === 'catalogo' && <CatalogoFornecedor produtos={produtos} />}
      </div>
    </div>
  );
}
