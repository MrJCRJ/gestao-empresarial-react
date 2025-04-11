// src/components/Header/Header.tsx
import {
  FiHome,
  FiTruck,
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiShoppingBag,
  FiList,
} from 'react-icons/fi';
import styles from './Header.module.css';
import { Dispatch, SetStateAction, ReactElement, useEffect, useState } from 'react';

// Atualize seu tipo AppComponent
type AppComponent = 'BalancoView' | 'FormFornecedor' | 'FormCliente';

interface HeaderProps {
  activeComponent: AppComponent;
  setValidComponent: (componentName: AppComponent) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Header({
  activeComponent,
  setValidComponent,
  isMenuOpen,
  setIsMenuOpen,
}: HeaderProps): ReactElement {
  const [scrolled, setScrolled] = useState(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50; // Aumentei o threshold para 50px (do primeiro header)
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const navItems = [
    { component: 'BalancoView', icon: <FiHome />, label: 'Início' },
    { component: 'FormFornecedor', icon: <FiTruck />, label: 'Fornecedores' },
    { component: 'FormCliente', icon: <FiUsers />, label: 'Clientes' },
  ];

  return (
    <header className={`${styles.appHeader} ${scrolled ? styles.scrolled : ''}`} role="banner">
      <div className={styles.headerContent}>
        <h1 className={styles.logo}>
          <span className={styles.logoHero}>Hero</span>
          <span className={styles.logoPet}>Pet</span>
        </h1>

        <nav className={styles.desktopNav} aria-label="Navegação principal">
          {navItems.map((item) => (
            <button
              key={item.component}
              onClick={() => setValidComponent(item.component as AppComponent)}
              className={activeComponent === item.component ? styles.active : ''}
              aria-current={activeComponent === item.component ? 'page' : undefined}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <button
          className={styles.mobileMenuButton}
          onClick={toggleMenu}
          aria-label="Abrir menu"
          aria-expanded={isMenuOpen}
        >
          ☰
        </button>
      </div>

      {isMenuOpen && (
        <nav className={styles.mobileNav} role="navigation" aria-label="Menu mobile">
          {navItems.map((item) => (
            <button
              key={item.component}
              onClick={() => {
                setValidComponent(item.component as AppComponent);
                setIsMenuOpen(false);
              }}
              className={activeComponent === item.component ? styles.active : ''}
              aria-current={activeComponent === item.component ? 'page' : undefined}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
