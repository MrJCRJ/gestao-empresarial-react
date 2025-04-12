import { FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import styles from './ClienteModal.module.css';
import { Cliente } from './types';

// Implementação das máscaras localmente (substitua pelo seu módulo masks se necessário)
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
  isOnline?: boolean; // Adicionado para verificar conexão
};

export function ClienteModal({
  cliente,
  mode,
  onClose,
  onSave,
  onDelete,
  loading = false,
  isOnline = true, // Assume online por padrão
}: ClienteModalProps) {
  const [formData, setFormData] = useState<Cliente>(cliente);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [connectionError, setConnectionError] = useState(false);

  // Atualiza formData quando o cliente prop muda
  useEffect(() => {
    setFormData(cliente);
  }, [cliente]);

  // Verifica a conexão quando o componente é montado
  useEffect(() => {
    if (!isOnline) {
      setConnectionError(true);
    }
  }, [isOnline]);

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

  const handleSubmit = async () => {
    if (!isOnline) {
      setConnectionError(true);
      return;
    }

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
      try {
        await onSave(formData);
        setConnectionError(false);
      } catch (error) {
        setConnectionError(true);
      }
    }
  };

  const handleCepBlur = async () => {
    if (!isOnline) {
      setConnectionError(true);
      return;
    }

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
          setConnectionError(false);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setConnectionError(true);
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
          <button onClick={onClose} className={styles.closeButton} aria-label="Fechar">
            <FiX />
          </button>
        </div>

        {connectionError && (
          <div className={styles.connectionError}>
            <p>Erro de conexão. Verifique sua conexão com a internet.</p>
          </div>
        )}

        <div className={styles.modalBody}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* Identificação */}
            <fieldset className={styles.fieldset}>
              <legend>Identificação</legend>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="tipo">Tipo de Cliente</label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    disabled={mode === 'view' || !isOnline}
                  >
                    <option value="petshop">Petshop</option>
                    <option value="mercadinho">Mercadinho</option>
                    <option value="clínica">Clínica Veterinária</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="nomeFantasia">Nome Fantasia *</label>
                  <input
                    id="nomeFantasia"
                    type="text"
                    name="nomeFantasia"
                    value={formData.nomeFantasia}
                    onChange={handleChange}
                    disabled={mode === 'view' || !isOnline}
                    placeholder="Nome do estabelecimento"
                    className={errors.nomeFantasia ? styles.errorInput : ''}
                  />
                  {errors.nomeFantasia && (
                    <span className={styles.errorMessage}>{errors.nomeFantasia}</span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="razaoSocial">Razão Social</label>
                  <input
                    id="razaoSocial"
                    type="text"
                    name="razaoSocial"
                    value={formData.razaoSocial}
                    onChange={handleChange}
                    disabled={mode === 'view' || !isOnline}
                    placeholder="Razão Social"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="documento">CNPJ/CPF *</label>
                  <input
                    id="documento"
                    type="text"
                    name="documento"
                    value={formData.documento}
                    onChange={handleChange}
                    disabled={mode === 'view' || !isOnline}
                    placeholder="00.000.000/0000-00 ou 000.000.000-00"
                    className={errors.documento ? styles.errorInput : ''}
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
                  <label htmlFor="responsavel">Responsável</label>
                  <input
                    id="responsavel"
                    type="text"
                    name="responsavel"
                    value={formData.responsavel}
                    onChange={handleChange}
                    disabled={mode === 'view' || !isOnline}
                    placeholder="Nome do responsável"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="telefone">Telefone *</label>
                  <input
                    id="telefone"
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    disabled={mode === 'view' || !isOnline}
                    placeholder="(00) 00000-0000"
                    className={errors.telefone ? styles.errorInput : ''}
                  />
                  {errors.telefone && (
                    <span className={styles.errorMessage}>{errors.telefone}</span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={mode === 'view' || !isOnline}
                    placeholder="contato@email.com"
                    className={errors.email ? styles.errorInput : ''}
                  />
                  {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
                </div>
              </div>
            </fieldset>

            {/* Endereço */}
            <fieldset className={styles.fieldset}>
              <legend>Endereço</legend>
              <div className={styles.formGroup}>
                <label htmlFor="cep">CEP</label>
                <input
                  id="cep"
                  type="text"
                  name="endereco.cep"
                  value={formData.endereco.cep || ''}
                  onChange={handleChange}
                  onBlur={handleCepBlur}
                  disabled={mode === 'view' || !isOnline}
                  placeholder="00000-000"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="logradouro">Endereço</label>
                  <input
                    id="logradouro"
                    type="text"
                    name="endereco.logradouro"
                    value={formData.endereco.logradouro || ''}
                    onChange={handleChange}
                    disabled={mode === 'view' || !isOnline}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="numero">Número</label>
                  <input
                    id="numero"
                    type="text"
                    name="endereco.numero"
                    value={formData.endereco.numero || ''}
                    onChange={handleChange}
                    disabled={mode === 'view' || !isOnline}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="bairro">Bairro</label>
                  <input
                    id="bairro"
                    type="text"
                    name="endereco.bairro"
                    value={formData.endereco.bairro || ''}
                    onChange={handleChange}
                    disabled={mode === 'view' || !isOnline}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="localidade">Cidade</label>
                  <input
                    id="localidade"
                    type="text"
                    name="endereco.localidade"
                    value={formData.endereco.localidade || ''}
                    onChange={handleChange}
                    disabled={mode === 'view' || !isOnline}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="uf">Estado</label>
                  <input
                    id="uf"
                    type="text"
                    name="endereco.uf"
                    value={formData.endereco.uf || ''}
                    onChange={handleChange}
                    disabled={mode === 'view' || !isOnline}
                    maxLength={2}
                  />
                </div>
              </div>
            </fieldset>

            {/* Info adicional */}
            <div className={styles.formGroup}>
              <label htmlFor="observacoes">Observações</label>
              <textarea
                id="observacoes"
                rows={3}
                name="observacoes"
                value={formData.observacoes || ''}
                onChange={handleChange}
                disabled={mode === 'view' || !isOnline}
                placeholder="Alguma informação adicional..."
              />
            </div>

            {mode === 'view' ? (
              <div className={styles.viewActions}>
                <button
                  type="button"
                  onClick={() => onSave({ ...formData })}
                  className={styles.editButton}
                  disabled={!isOnline}
                >
                  Editar
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(formData.id)}
                    className={styles.deleteButton}
                    disabled={!isOnline}
                  >
                    Excluir
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={!isFormValid || loading || !isOnline}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
