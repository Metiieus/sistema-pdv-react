import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';

const ProductGrid = ({ produtos, onAdicionarAoCarrinho }) => {
  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const getCategoryClass = (categoria) => {
    if (!categoria) return 'bg-gray-100';
    
    const categoryMap = {
      'Homeware': 'category-homeware',
      'Bedding': 'category-bedding',
      'Skincare': 'category-skincare',
      'Fashion': 'category-fashion',
      'Towels': 'category-towels'
    };
    
    return categoryMap[categoria] || 'bg-gray-100';
  };

  if (produtos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Package className="h-16 w-16 mb-4" />
        <p className="text-lg">Nenhum produto encontrado</p>
        <p className="text-sm">Tente ajustar sua busca ou categoria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {produtos.map((produto) => (
        <Card
          key={produto.id}
          className="group cursor-pointer transition-all hover-lift hover-scale"
          onClick={() => onAdicionarAoCarrinho(produto)}
        >
          <CardContent className="p-4">
            {/* Imagem do Produto */}
            <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              {produto.imagem ? (
                <img
                  src={produto.imagem}
                  alt={produto.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Info do Produto */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-foreground line-clamp-2">
                {produto.nome}
              </h3>
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">
                  {formatarPreco(produto.preco)}
                </span>
                
                {produto.categoria_nome && (
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getCategoryClass(produto.categoria_nome)} text-gray-700 border-0`}
                  >
                    {produto.categoria_nome}
                  </Badge>
                )}
              </div>

              {/* Estoque */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Estoque: {produto.estoque_atual}</span>
                
                <Button
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdicionarAoCarrinho(produto);
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;

