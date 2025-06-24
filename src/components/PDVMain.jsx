import { useState, useEffect } from 'react';
import { Search, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import ProductGrid from './ProductGrid';
import CategoryTabs from './CategoryTabs';
import Cart from './Cart';
import CustomerInfo from './CustomerInfo';

const PDVMain = ({ isElectron }) => {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();

    if (isElectron && window.electronAPI?.onProdutosAtualizados) {
      window.electronAPI.onProdutosAtualizados(() => {
        carregarDados();
      });
    }

    return () => {
      if (isElectron && window.electronAPI?.removeProdutosAtualizados) {
        window.electronAPI.removeProdutosAtualizados();
      }
    };
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      if (isElectron && window.electronAPI) {
        const [produtosData, categoriasData] = await Promise.all([
          window.electronAPI.pdv.getProdutos(),
          window.electronAPI.pdv.getCategorias()
        ]);

        setProdutos(produtosData);
        setCategorias(categoriasData);
      } else {
        console.error('Modo web não suportado — dados devem vir via Electron.');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarAoCarrinho = (produto) => {
    const itemExistente = carrinho.find(item => item.id === produto.id);

    if (itemExistente) {
      setCarrinho(carrinho.map(item =>
        item.id === produto.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
    }
  };

  const removerDoCarrinho = (produtoId) => {
    const itemExistente = carrinho.find(item => item.id === produtoId);

    if (itemExistente && itemExistente.quantidade > 1) {
      setCarrinho(carrinho.map(item =>
        item.id === produtoId
          ? { ...item, quantidade: item.quantidade - 1 }
          : item
      ));
    } else {
      setCarrinho(carrinho.filter(item => item.id !== produtoId));
    }
  };

  const limparCarrinho = () => {
    setCarrinho([]);
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  const produtosFiltrados = produtos.filter(produto => {
    const nome = produto.nome?.toLowerCase() || '';
    const matchBusca = busca.trim() === '' || nome.includes(busca.toLowerCase());
    const matchCategoria = !categoriaAtiva || produto.categoria_id === categoriaAtiva;
    return matchBusca && matchCategoria;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando produtos...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Coluna Principal */}
      <div className="flex-1 flex flex-col">
        {/* Cabeçalho */}
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-foreground">
                Central de Vendas
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Categorias */}
        <div className="p-4 border-b border-border">
          <CategoryTabs
            categorias={categorias}
            categoriaAtiva={categoriaAtiva}
            onCategoriaChange={setCategoriaAtiva}
          />
        </div>

        {/* Produtos */}
        <div className="flex-1 p-4 overflow-y-auto">
          {produtosFiltrados.length > 0 ? (
            <ProductGrid
              produtos={produtosFiltrados}
              onAdicionarAoCarrinho={adicionarAoCarrinho}
            />
          ) : (
            <div className="text-center text-muted-foreground mt-10">
              Nenhum produto encontrado.
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - Carrinho */}
      <div className="w-96 bg-card border-l border-border flex flex-col">
        <CustomerInfo cliente={cliente} onClienteChange={setCliente} />
        <Separator />
        <Cart
          itens={carrinho}
          onAdicionarItem={adicionarAoCarrinho}
          onRemoverItem={removerDoCarrinho}
          onLimparCarrinho={limparCarrinho}
          total={calcularTotal()}
          isElectron={isElectron}
        />
      </div>
    </div>
  );
};

export default PDVMain;
