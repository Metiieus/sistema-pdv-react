import { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit, Trash2, Tag, DollarSign, RefreshCw, Eye, Barcode, Warehouse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Toaster, toast } from 'sonner'; // Importar Toaster e toast para notificações

const CadastroProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]); // Estado para categorias reais
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formProduto, setFormProduto] = useState({
    id: null,
    nome: '',
    codigo_barras: '',
    referencia: '',
    categoria_id: '',
    preco: '',
    custo: '',
    estoque_atual: '',
    estoque_minimo: '',
    ativo: true,
  });

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const carregarDadosIniciais = async () => {
    setLoading(true);
    try {
      // Carregar categorias
      // Verifica se window.electronAPI e pdv.getCategorias existem antes de chamar
      if (window.electronAPI && window.electronAPI.pdv && window.electronAPI.pdv.getCategorias) {
        const fetchedCategorias = await window.electronAPI.pdv.getCategorias(); // CHAMADA REAL
        setCategorias(fetchedCategorias);
      } else {
        // Fallback para mock se não for Electron (para desenvolvimento web)
        setCategorias([
          { id: 1, nome: 'Eletrônicos' },
          { id: 2, nome: 'Alimentos' },
          { id: 3, nome: 'Bebidas' },
          { id: 4, nome: 'Limpeza' },
          { id: 5, nome: 'Papelaria' },
        ]);
      }
      // Carregar produtos
      await carregarProdutos();
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar dados iniciais (categorias/produtos)!');
    } finally {
      setLoading(false);
    }
  };

  const carregarProdutos = async () => {
    setLoading(true);
    try {
      // Verifica se window.electronAPI e pdv.getProdutos existem antes de chamar
      if (window.electronAPI && window.electronAPI.pdv && window.electronAPI.pdv.getProdutos) {
        const fetchedProdutos = await window.electronAPI.pdv.getProdutos(); // CHAMADA REAL
        setProdutos(fetchedProdutos);
        toast.success('Produtos carregados com sucesso!');
      } else {
        // Fallback para mock se não for Electron (para desenvolvimento web)
        const mockProdutos = [
          { id: 1, nome: 'Smart TV 50"', codigo_barras: '1234567890123', referencia: 'TV50-XYZ', categoria_id: 1, categoria_nome: 'Eletrônicos', preco: 2500.00, custo: 1800.00, estoque_atual: 10, estoque_minimo: 3, ativo: true },
          { id: 2, nome: 'Café Torrado 500g', codigo_barras: '9876543210987', referencia: 'CAFE-500G', categoria_id: 2, categoria_nome: 'Alimentos', preco: 15.90, custo: 8.50, estoque_atual: 150, estoque_minimo: 30, ativo: true },
          { id: 3, nome: 'Água Mineral 1.5L', codigo_barras: '5554443332221', referencia: 'AGUA-1.5L', categoria_id: 3, categoria_nome: 'Bebidas', preco: 3.50, custo: 1.80, estoque_atual: 300, estoque_minimo: 50, ativo: false },
              { id: 4, nome: 'Detergente Líquido', codigo_barras: '1112223334445', referencia: 'DET-001', categoria_id: 4, categoria_nome: 'Limpeza', preco: 4.99, custo: 2.10, estoque_atual: 200, estoque_minimo: 40, ativo: true },
        ];
        setProdutos(mockProdutos);
        toast.info('Modo de desenvolvimento: produtos mockados.');
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos!');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormProduto(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Verifica se window.electronAPI e pdv existem antes de chamar
      if (window.electronAPI && window.electronAPI.pdv) {
        if (isEditing) {
          await window.electronAPI.pdv.atualizarProduto(formProduto); // CHAMADA REAL
          toast.success('Produto atualizado com sucesso!');
        } else {
          await window.electronAPI.pdv.adicionarProduto(formProduto); // CHAMADA REAL
          toast.success('Produto cadastrado com sucesso!');
        }
        await carregarProdutos(); // Recarregar a lista após a operação
        setModalOpen(false);
        resetForm();
      } else {
        console.warn('Electron API não disponível. Simulação de salvamento.');
        // Simulação de salvamento para desenvolvimento web
        const newId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
        const savedProduto = {
          ...formProduto,
          id: isEditing ? formProduto.id : newId,
          categoria_nome: categorias.find(cat => String(cat.id) === String(formProduto.categoria_id))?.nome || 'N/A'
        };
        setProdutos(prev => isEditing ? prev.map(p => p.id === savedProduto.id ? savedProduto : p) : [...prev, savedProduto]);
        toast.info('Produto salvo (simulação web).');
        setModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const editarProduto = (produto) => {
    // Certifique-se que o ID da categoria seja o correto para preencher o select
    setFormProduto({
      ...produto,
      categoria_id: produto.categoria_id, // Usamos o categoria_id que já vem do DB
      preco: String(produto.preco),
      custo: String(produto.custo),
      estoque_atual: String(produto.estoque_atual),
      estoque_minimo: String(produto.estoque_minimo),
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const excluirProduto = async (id) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      setLoading(true);
      try {
        // Verifica se window.electronAPI e pdv.deletarProduto existem antes de chamar
        if (window.electronAPI && window.electronAPI.pdv && window.electronAPI.pdv.deletarProduto) {
          await window.electronAPI.pdv.deletarProduto(id); // CHAMADA REAL
          toast.success('Produto excluído com sucesso!');
          await carregarProdutos();
        } else {
          console.warn('Electron API não disponível. Simulação de exclusão.');
          setProdutos(prev => prev.filter(p => p.id !== id));
          toast.info('Produto excluído (simulação web).');
        }
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        toast.error('Erro ao excluir produto: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormProduto({
      id: null,
      nome: '',
      codigo_barras: '',
      referencia: '',
      categoria_id: '',
      preco: '',
      custo: '',
      estoque_atual: '',
      estoque_minimo: '',
      ativo: true,
    });
    setIsEditing(false);
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster /> {/* Adicione o Toaster aqui para exibir as notificações */}
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cadastro de Produtos</h1>
            <p className="text-gray-600">Gerencie todos os produtos do seu sistema</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => { setModalOpen(true); resetForm(); }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </Button>
          <Button
            onClick={carregarProdutos}
            disabled={loading}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Lista</span>
          </Button>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Produtos Cadastrados ({produtos.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Código/Ref</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="7" className="h-24 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-500">Carregando produtos...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : produtos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="7" className="h-24 text-center text-gray-500">
                    Nenhum produto cadastrado. Adicione um novo produto!
                  </TableCell>
                </TableRow>
              ) : (
                produtos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span>{produto.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>{produto.codigo_barras || produto.referencia}</TableCell>
                    <TableCell>{produto.categoria_nome}</TableCell>
                    <TableCell>{formatarMoeda(produto.preco)}</TableCell>
                    <TableCell>{produto.estoque_atual}</TableCell>
                    <TableCell>
                      <Badge variant={produto.ativo ? 'default' : 'destructive'}>
                        {produto.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => editarProduto(produto)} title="Editar">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => excluirProduto(produto.id)} title="Excluir">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal de Cadastro/Edição de Produto */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="nome">Nome do Produto</Label>
              <Input
                id="nome"
                name="nome"
                value={formProduto.nome}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="codigo_barras">Código de Barras</Label>
              <Input
                id="codigo_barras"
                name="codigo_barras"
                value={formProduto.codigo_barras}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="referencia">Referência</Label>
              <Input
                id="referencia"
                name="referencia"
                value={formProduto.referencia}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="categoria_id">Categoria</Label>
              <select
                id="categoria_id"
                name="categoria_id"
                value={formProduto.categoria_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="preco">Preço de Venda (R$)</Label>
              <Input
                id="preco"
                name="preco"
                type="number"
                step="0.01"
                value={formProduto.preco}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="custo">Custo (R$)</Label>
              <Input
                id="custo"
                name="custo"
                type="number"
                step="0.01"
                value={formProduto.custo}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="estoque_atual">Estoque Atual</Label>
              <Input
                id="estoque_atual"
                name="estoque_atual"
                type="number"
                value={formProduto.estoque_atual}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
              <Input
                id="estoque_minimo"
                name="estoque_minimo"
                type="number"
                value={formProduto.estoque_minimo}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex items-center mt-2">
              <input
                id="ativo"
                name="ativo"
                type="checkbox"
                checked={formProduto.ativo}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <Label htmlFor="ativo" className="ml-2">Produto Ativo</Label>
            </div>
            
            <DialogFooter className="md:col-span-2 pt-4">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Produto')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CadastroProdutos;