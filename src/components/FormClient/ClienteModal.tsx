import { FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import styles from './ClienteModal.module.css';
import { Cliente } from './types';

// Implementação das máscaras (mantido igual)
const maskCnpj = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18);
};

const maskCpf = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .substring(0, 14);
};

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2')
    .substring(0, 15);
};

const maskCep = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .substring(0, 9);
};

type ClienteModalProps = {
  cliente: Cliente;
  mode: 'view' | 'edit' | 'create';
  onClose: () => void;
  onSave: (cliente: Cliente) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
};

export function ClienteModal({
  cliente,
  mode,
  onClose,
  onSave,
  onDelete,
  loading = false,
}: ClienteModalProps) {
  const [formData, setFormData] = useState<Cliente>(cliente);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Atualiza formData quando o cliente prop muda
  useEffect(() => {
    setFormData(cliente);
  }, [cliente]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Aplica máscaras conforme o campo
    let processedValue = value;
    if (name === 'documento') {
      processedValue = value.length > 14 ? maskCnpj(value) : maskCpf(value);
    } else if (name === 'telefone') {
      processedValue = maskPhone(value);
    } else if (name === 'endereco.cep') {
      processedValue = maskCep(value);
    }

    if (name.startsWith('endereco.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [field]: processedValue,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: processedValue }));
    }

    validateField(name, processedValue);
  };

  const validateField = (name: string, value: string) => {
    let error = '';

    if (name === 'nomeFantasia' && !value.trim()) {
      error = 'Nome fantasia é obrigatório';
    } else if (name === 'documento' && !isValidDocument(value)) {
      error = 'Documento inválido';
    } else if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Email inválido';
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const isValidDocument = (doc: string): boolean => {
    const cleanDoc = doc.replace(/\D/g, '');
    return cleanDoc.length === 11 || cleanDoc.length === 14;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação final antes de salvar
    const requiredFields = ['nomeFantasia', 'documento', 'telefone'];
    const newErrors: Record<string, string> = {};

    requiredFields.forEach((field) => {
      if (!formData[field as keyof Cliente]) {
        newErrors[field] = 'Campo obrigatório';
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      await onSave(formData);
    }
  };

  const handleCepBlur = async () => {
    const cep = formData.endereco.cep?.replace(/\D/g, '');
    if (cep && cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            endereco: {
              ...prev.endereco,
              logradouro: data.logradouro || '',
              bairro: data.bairro || '',
              localidade: data.localidade || '',
              uf: data.uf || '',
              complemento: data.complemento || '',
            },
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const isFormValid = Object.values(errors).every((error) => !error);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>
            {mode === 'create'
              ? 'Novo Cliente'
              : mode === 'edit'
                ? 'Editar Cliente'
                : 'Detalhes do Cliente'}
          </h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Fechar"
            disabled={loading}
          >
            <FiX />
          </button>
        </div>

        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit}>
            {/* Identificação */}
            <fieldset className={styles.fieldset}>
              <legend>Identificação</legend>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="tipo" className={styles.label}>
                    Tipo de Cliente
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    disabled={mode === 'view'}
                    className={styles.input}
                  >
                    <option value="petshop">Petshop</option>
                    <option value="mercadinho">Mercadinho</option>
                    <option value="clínica">Clínica Veterinária</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="nomeFantasia" className={`${styles.label} ${styles.required}`}>
                    Nome Fantasia
                  </label>
                  <input
                    id="nomeFantasia"
                    type="text"
                    name="nomeFantasia"
                    value={formData.nomeFantasia}
                    onChange={handleChange}
                    disabled={mode === 'view'}
                    placeholder="Nome do estabelecimento"
                    className={`${styles.input} ${errors.nomeFantasia ? styles.errorInput : ''}`}
                  />
                  {errors.nomeFantasia && (
                    <span className={styles.errorMessage}>{errors.nomeFantasia}</span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="razaoSocial" className={styles.label}>
                    Razão Social
                  </label>
                  <input
                    id="razaoSocial"
                    type="text"
                    name="razaoSocial"
                    value={formData.razaoSocial}
                    onChange={handleChange}
                    disabled={mode === 'view'}
                    placeholder="Razão Social"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="documento" className={`${styles.label} ${styles.required}`}>
                    CNPJ/CPF
                  </label>
                  <input
                    id="documento"
                    type="text"
                    name="documento"
                    value={formData.documento}
                    onChange={handleChange}
                    disabled={mode === 'view'}
                    placeholder="00.000.000/0000-00 ou 000.000.000-00"
                    className={`${styles.input} ${errors.documento ? styles.errorInput : ''}`}
                  />
                  {errors.documento && (
                    <span className={styles.errorMessage}>{errors.documento}</span>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Contato */}
            <fieldset className={styles.fieldset}>
              <legend>Contato</legend>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="responsavel" className={styles.label}>
                    Responsável
                  </label>
                  <input
                    id="responsavel"
                    type="text"
                    name="responsavel"
                    value={formData.responsavel}
                    onChange={handleChange}
                    disabled={mode === 'view'}
                    placeholder="Nome do responsável"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="telefone" className={`${styles.label} ${styles.required}`}>
                    Telefone
                  </label>
                  <input
                    id="telefone"
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    disabled={mode === 'view'}
                    placeholder="(00) 00000-0000"
                    className={`${styles.input} ${errors.telefone ? styles.errorInput : ''}`}
                  />
                  {errors.telefone && (
                    <span className={styles.errorMessage}>{errors.telefone}</span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={mode === 'view'}
                    placeholder="contato@email.com"
                    className={`${styles.input} ${errors.email ? styles.errorInput : ''}`}
                  />
                  {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
                </div>
              </div>
            </fieldset>

            {/* Endereço */}
            <fieldset className={styles.fieldset}>
              <legend>Endereço</legend>
              <div className={styles.formGroup}>
                <label htmlFor="cep" className={styles.label}>
                  CEP
                </label>
                <input
                  id="cep"
                  type="text"
                  name="endereco.cep"
                  value={formData.endereco.cep || ''}
                  onChange={handleChange}
                  onBlur={handleCepBlur}
                  disabled={mode === 'view'}
                  placeholder="00000-000"
                  className={styles.input}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="logradouro" className={styles.label}>
                    Endereço
                  </label>
                  <input
                    id="logradouro"
                    type="text"
                    name="endereco.logradouro"
                    value={formData.endereco.logradouro || ''}
                    onChange={handleChange}
                    disabled={mode === 'view'}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="numero" className={styles.label}>
                    Número
                  </label>
                  <input
                    id="numero"
                    type="text"
                    name="endereco.numero"
                    value={formData.endereco.numero || ''}
                    onChange={handleChange}
                    disabled={mode === 'view'}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="bairro" className={styles.label}>
                    Bairro
                  </label>
                  <input
                    id="bairro"
                    type="text"
                    name="endereco.bairro"
                    value={formData.endereco.bairro || ''}
                    onChange={handleChange}
                    disabled={mode === 'view'}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="localidade" className={styles.label}>
                    Cidade
                  </label>
                  <input
                    id="localidade"
                    type="text"
                    name="endereco.localidade"
                    value={formData.endereco.localidade || ''}
                    onChange={handleChange}
                    disabled={mode === 'view'}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="uf" className={styles.label}>
                    Estado
                  </label>
                  <input
                    id="uf"
                    type="text"
                    name="endereco.uf"
                    value={formData.endereco.uf || ''}
                    onChange={handleChange}
                    disabled={mode === 'view'}
                    maxLength={2}
                    className={styles.input}
                  />
                </div>
              </div>
            </fieldset>

            {/* Info adicional */}
            <div className={styles.formGroup}>
              <label htmlFor="observacoes" className={styles.label}>
                Observações
              </label>
              <textarea
                id="observacoes"
                rows={3}
                name="observacoes"
                value={formData.observacoes || ''}
                onChange={handleChange}
                disabled={mode === 'view'}
                placeholder="Alguma informação adicional..."
                className={styles.input}
              />
            </div>

            {mode === 'view' ? (
              <div className={styles.viewActions}>
                <button
                  type="button"
                  onClick={() => onSave({ ...formData })}
                  className={`${styles.button} ${styles.successButton}`}
                  disabled={loading}
                >
                  {loading ? <span className={styles.loading}>Editar</span> : 'Editar'}
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(formData.id)}
                    className={`${styles.button} ${styles.dangerButton}`}
                    disabled={loading}
                  >
                    {loading ? <span className={styles.loading}>Excluir</span> : 'Excluir'}
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={onClose}
                  className={`${styles.button} ${styles.secondaryButton}`}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`${styles.button} ${styles.primaryButton}`}
                  disabled={!isFormValid || loading}
                >
                  {loading ? <span className={styles.loading}>Salvando...</span> : 'Salvar'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
