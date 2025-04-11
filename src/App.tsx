// src/App.tsx
import { useState, useRef, useEffect } from 'react';
import { useEmpresaStore } from './stores/useEmpresaStore';
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';
import BalancoView from './components/BalancoView';
import FormFornecedor from './components/FormFornecedor';
import FormCliente from './components/FormCliente';
import styles from './App.module.css';

type ComponentKey = 'BalancoView' | 'FormFornecedor' | 'FormCliente';

const COMPONENT_MAP: Record<ComponentKey, React.ComponentType> = {
  BalancoView,
  FormFornecedor,
  FormCliente,
};

const VALID_COMPONENTS = Object.keys(COMPONENT_MAP) as ComponentKey[];

export default function App() {
  const empresaStore = useEmpresaStore();
  const [activeComponent, setActiveComponent] = useState<ComponentKey>('BalancoView');
  const fileInput = useRef<HTMLInputElement>(null!); // Non-null assertion
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    console.log(`Componente ativo alterado para: ${activeComponent}`);
  }, [activeComponent]);

  const ActiveComponent =
    COMPONENT_MAP[activeComponent] ||
    (() => {
      console.error(`Componente "${activeComponent}" não encontrado`);
      return <div className={styles.errorMessage}>Componente não encontrado</div>;
    });

  const setValidComponent = (componentName: string) => {
    if (VALID_COMPONENTS.includes(componentName as ComponentKey)) {
      setActiveComponent(componentName as ComponentKey);
      setIsMenuOpen(false);
    } else {
      console.warn(`Tentativa de acessar componente inválido: ${componentName}`);
    }
  };

  const handleExport = async () => {
    console.log('Iniciando exportação de dados...');
    try {
      await empresaStore.exportToFile();
      console.log('Exportação concluída com sucesso');
    } catch (error) {
      console.error('Falha na exportação:', error);
      alert(`Erro ao exportar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await empresaStore.importFromFile(file);
      alert('Dados importados com sucesso!');
    } catch (error) {
      alert(`Erro ao importar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className={styles.appContainer}>
      <Header
        activeComponent={activeComponent}
        setValidComponent={setValidComponent}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />

      <main className={styles.mainContent}>
        <Main ActiveComponent={ActiveComponent} />
      </main>

      <footer className={styles.footer}>
        <Footer handleExport={handleExport} handleImport={handleImport} fileInputRef={fileInput} />
      </footer>
    </div>
  );
}
