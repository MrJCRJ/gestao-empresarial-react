import { FiX } from 'react-icons/fi';
import { useState } from 'react';
import styles from './ClienteModal.module.css';
import { Cliente } from './types';

type ClienteModalProps = {
  cliente: Cliente;
  mode: 'view' | 'edit' | 'create';
  onClose: () => void;
  onSave: (cliente: Cliente) => void;
  onDelete?: (id: string) => void;
};

export function ClienteModal({ cliente, mode, onClose, onSave, onDelete }: ClienteModalProps) {
  const [formData, setFormData] = useState<Cliente>(cliente);
  const [localCep, setLocalCep] = useState(cliente.cep);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name.startsWith('endereco.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalCep(e.target.value);
    // Aqui você pode adicionar a lógica de busca de CEP se necessário
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>
            {mode === 'create'
              ? 'Novo Cliente'
              : mode === 'edit'
                ? 'Editar Cliente'
                : 'Detalhes do Cliente'}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Identificação */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Tipo de Cliente</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                disabled={mode === 'view'}
              >
                <option value="petshop">Petshop</option>
                <option value="mercadinho">Mercadinho</option>
                <option value="clínica">Clínica Veterinária</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Nome Fantasia</label>
              <input
                type="text"
                name="nomeFantasia"
                value={formData.nomeFantasia}
                onChange={handleChange}
                disabled={mode === 'view'}
                placeholder="Nome do estabelecimento"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Razão Social</label>
              <input
                type="text"
                name="razaoSocial"
                value={formData.razaoSocial}
                onChange={handleChange}
                disabled={mode === 'view'}
                placeholder="Razão Social"
              />
            </div>
            <div className={styles.formGroup}>
              <label>CNPJ ou CPF</label>
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                disabled={mode === 'view'}
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>

          {/* Contato */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Responsável</label>
              <input
                type="text"
                name="responsavel"
                value={formData.responsavel}
                onChange={handleChange}
                disabled={mode === 'view'}
                placeholder="Nome do responsável"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Telefone</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                disabled={mode === 'view'}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={mode === 'view'}
                placeholder="contato@email.com"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className={styles.formGroup}>
            <label>CEP</label>
            <input
              type="text"
              value={localCep}
              onChange={handleCepChange}
              disabled={mode === 'view'}
              placeholder="00000-000"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Endereço</label>
              <input
                type="text"
                name="endereco.logradouro"
                value={formData.endereco.logradouro}
                onChange={handleChange}
                disabled={mode === 'view'}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Número</label>
              <input
                type="text"
                name="endereco.numero"
                value={formData.endereco.numero}
                onChange={handleChange}
                disabled={mode === 'view'}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Bairro</label>
              <input
                type="text"
                name="endereco.bairro"
                value={formData.endereco.bairro}
                onChange={handleChange}
                disabled={mode === 'view'}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Cidade</label>
              <input
                type="text"
                name="endereco.localidade"
                value={formData.endereco.localidade}
                onChange={handleChange}
                disabled={mode === 'view'}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Estado</label>
              <input
                type="text"
                name="endereco.uf"
                value={formData.endereco.uf}
                onChange={handleChange}
                disabled={mode === 'view'}
              />
            </div>
          </div>

          {/* Info adicional */}
          <div className={styles.formGroup}>
            <label>Observações</label>
            <textarea
              rows={3}
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              disabled={mode === 'view'}
              placeholder="Alguma informação adicional..."
            />
          </div>

          {mode === 'view' && (
            <div className={styles.viewActions}>
              <button onClick={() => onSave(formData)} className={styles.editButton}>
                Editar
              </button>
              {onDelete && (
                <button onClick={() => onDelete(formData.id)} className={styles.deleteButton}>
                  Excluir
                </button>
              )}
            </div>
          )}

          {(mode === 'edit' || mode === 'create') && (
            <div className={styles.formActions}>
              <button onClick={() => onSave(formData)} className={styles.saveButton}>
                Salvar
              </button>
              <button onClick={onClose} className={styles.cancelButton}>
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
