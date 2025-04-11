// src/components/FormFornecedor/CatalogoFornecedor.tsx
import { ProdutoType } from './types';
import styles from './FormFornecedor.module.css';

type CatalogoFornecedorProps = {
  produtos: ProdutoType[];
};

export function CatalogoFornecedor({ produtos }: CatalogoFornecedorProps) {
  return (
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
  );
}
