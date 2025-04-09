// src/components/App/Footer/Footer.tsx
import { FiDownload, FiUpload } from 'react-icons/fi';
import styles from './Footer.module.css';
import { RefObject } from 'react';

interface FooterProps {
  handleExport: () => void;
  handleImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement>;
}

export default function Footer({ handleExport, handleImport, fileInputRef }: FooterProps) {
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.appFooter} role="contentinfo">
      <div className={styles.footerContent}>
        <div className={styles.fileActions}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
            aria-hidden="true"
            tabIndex={-1}
          />
          <button
            onClick={handleExport}
            className={styles.footerButton}
            aria-label="Exportar dados"
          >
            <FiDownload aria-hidden="true" /> Exportar Dados
          </button>
          <button
            onClick={handleImportClick}
            className={styles.footerButton}
            aria-label="Importar dados"
          >
            <FiUpload aria-hidden="true" /> Importar Dados
          </button>
        </div>

        <div className={styles.footerInfo}>
          <p>HeroPet © {currentYear} - Todos os direitos reservados</p>
          <p>Versão 1.0.0</p>
        </div>
      </div>
    </footer>
  );
}
