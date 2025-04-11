// src/components/FormFornecedor/DadosFornecedor.tsx
import { ChangeEvent, FormEvent } from 'react';
import { FornecedorType, tiposRacao } from './types';
import styles from './FormFornecedor.module.css';

type DadosFornecedorProps = {
  fornecedor: FornecedorType;
  onFormSubmit: (e: FormEvent) => void;
  onInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  onCheckboxChange: (tipo: string) => void;
};

export function DadosFornecedor({
  fornecedor,
  onFormSubmit,
  onInputChange,
  onCheckboxChange,
}: DadosFornecedorProps) {
  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Cadastro de Fornecedor</h2>
      <form onSubmit={onFormSubmit}>
        <div className={styles.formGroup}>
          <label>Nome do Fornecedor:</label>
          <input
            type="text"
            name="nome"
            value={fornecedor.nome}
            onChange={onInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>CNPJ:</label>
          <input
            type="text"
            name="cnpj"
            value={fornecedor.cnpj}
            onChange={onInputChange}
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
              onChange={onInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>E-mail:</label>
            <input
              type="email"
              name="email"
              value={fornecedor.email}
              onChange={onInputChange}
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
            onChange={onInputChange}
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
                  onChange={() => onCheckboxChange(tipo)}
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
              onChange={onInputChange}
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
              onChange={onInputChange}
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
            onChange={onInputChange}
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
  );
}
