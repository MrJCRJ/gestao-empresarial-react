import { useState, ChangeEvent, FormEvent } from 'react';
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

export default function FormFornecedor() {
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

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Cadastro de Fornecedor</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Nome do Fornecedor:</label>
          <input type="text" name="nome" value={fornecedor.nome} onChange={handleChange} required />
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
            Cadastrar Fornecedor
          </button>
        </div>
      </form>
    </div>
  );
}
