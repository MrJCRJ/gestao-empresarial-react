import { useState, useRef } from "react";
import { useEmpresaStore } from "./stores/useEmpresaStore";
import BalancoView from "./components/BalancoView";
import FormFornecedor from "./components/FormFornecedor";
import FormCliente from "./components/FormCliente";
import FormProduto from "./components/FormProduto";

const components = {
  BalancoView,
  FormFornecedor,
  FormCliente,
  FormProduto,
};

export default function App() {
  const empresaStore = useEmpresaStore();
  const [activeComponent, setActiveComponent] = useState("BalancoView");
  const fileInput = useRef(null);

  const ActiveComponent = components[activeComponent];

  async function handleExport() {
    try {
      empresaStore.exportToFile();
    } catch (error) {
      alert(`Erro ao exportar: ${error.message}`);
    }
  }

  function triggerImport() {
    fileInput.current.click();
  }

  async function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await empresaStore.importFromFile(file);
      alert("Dados importados com sucesso!");
    } catch (error) {
      alert(`Erro ao importar: ${error.message}`);
    } finally {
      event.target.value = null;
    }
  }

  return (
    <div className="app-container">
      <header>
        <h1>Gestão Empresarial</h1>
        <nav>
          <button onClick={() => setActiveComponent("BalancoView")}>
            Balanço
          </button>
          <button onClick={() => setActiveComponent("FormFornecedor")}>
            Fornecedores
          </button>
          <button onClick={() => setActiveComponent("FormCliente")}>
            Clientes
          </button>
          <button onClick={() => setActiveComponent("FormProduto")}>
            Produtos
          </button>
        </nav>
      </header>

      <main>
        <ActiveComponent />
      </main>

      <footer>
        <div className="file-actions">
          <input
            ref={fileInput}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: "none" }}
          />
          <button onClick={handleExport}>Exportar Dados</button>
          <button onClick={triggerImport}>Importar Dados</button>
        </div>
      </footer>
    </div>
  );
}
