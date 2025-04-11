// src/components/App/Footer/Footer.tsx
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.appFooter} role="contentinfo">
      <div className={styles.footerInfo}>
        <p>HeroPet © 2025 - Todos os direitos reservados</p>
        <p>Versão 1.0.0</p>
      </div>
    </footer>
  );
}
