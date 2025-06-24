import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Trash2, ShoppingCart, CreditCard } from 'lucide-react';

const Cart = ({ 
  itens, 
  onAdicionarItem, 
  onRemoverItem, 
  onLimparCarrinho, 
  total, 
  isElectron 
}) => {
  const [desconto, setDesconto] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [processandoVenda, setProcessandoVenda] = useState(false);

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const calcularSubtotal = () => total;
  const calcularDesconto = () => (total * desconto) / 100;
  const calcularTotal = () => total - calcularDesconto();

  const finalizarVenda = async () => {
    if (itens.length === 0) return;

    setProcessandoVenda(true);
    
    try {
      const venda = {
        usuario_id: 1, // ID do usuário logado
        cliente_id: null, // Implementar seleção de cliente
        subtotal: calcularSubtotal(),
        desconto: calcularDesconto(),
        total: calcularTotal(),
        forma_pagamento: formaPagamento,
        itens: itens.map(item => ({
          produto_id: item.id,
          quantidade: item.quantidade,
          preco_unitario: item.preco,
          subtotal: item.preco * item.quantidade
        }))
      };

      if (isElectron && window.electronAPI) {
        const resultado = await window.electronAPI.pdv.criarVenda(venda);
        console.log('Venda criada:', resultado);
        
        // Buscar dados completos da venda para impressão
        const vendaCompleta = await window.electronAPI.pdv.getVendaPorId(resultado.id);
        
        // Tentar imprimir recibo
        try {
          const resultadoImpressao = await window.electronAPI.print.receipt(vendaCompleta);
          if (resultadoImpressao.sucesso) {
            console.log('Recibo impresso:', resultadoImpressao.mensagem);
          }
        } catch (errorImpressao) {
          console.warn('Erro na impressão:', errorImpressao);
        }
        
        // Limpar carrinho após venda bem-sucedida
        onLimparCarrinho();
        setDesconto(0);
        
        alert(`Venda finalizada com sucesso!\nNúmero: ${resultado.numero_venda}`);
      } else {
        // Simulação para desenvolvimento web
        console.log('Venda simulada:', venda);
        onLimparCarrinho();
        setDesconto(0);
        alert('Venda finalizada com sucesso! (Modo simulação)');
      }
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      alert('Erro ao finalizar venda. Tente novamente.');
    } finally {
      setProcessandoVenda(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header do Carrinho */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrinho
          </h2>
          {itens.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLimparCarrinho}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Itens do Carrinho */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {itens.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Carrinho vazio</p>
            <p className="text-sm">Adicione produtos para começar</p>
          </div>
        ) : (
          itens.map((item) => (
            <Card key={item.id} className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.nome}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatarPreco(item.preco)} cada
                  </p>
                </div>
                
                <div className="flex items-center gap-2 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoverItem(item.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantidade}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAdicionarItem(item)}
                    className="h-6 w-6 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-2 text-right">
                <span className="font-semibold">
                  {formatarPreco(item.preco * item.quantidade)}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Resumo e Pagamento */}
      {itens.length > 0 && (
        <div className="p-4 border-t border-border space-y-4">
          {/* Desconto */}
          <div className="space-y-2">
            <Label htmlFor="desconto">Desconto (%)</Label>
            <Input
              id="desconto"
              type="number"
              min="0"
              max="100"
              value={desconto}
              onChange={(e) => setDesconto(Number(e.target.value))}
              placeholder="0"
            />
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={formaPagamento === 'dinheiro' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormaPagamento('dinheiro')}
              >
                Dinheiro
              </Button>
              <Button
                variant={formaPagamento === 'cartao' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormaPagamento('cartao')}
              >
                Cartão
              </Button>
              <Button
                variant={formaPagamento === 'pix' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormaPagamento('pix')}
              >
                PIX
              </Button>
              <Button
                variant={formaPagamento === 'credito' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormaPagamento('credito')}
              >
                Crédito
              </Button>
            </div>
          </div>

          <Separator />

          {/* Totais */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatarPreco(calcularSubtotal())}</span>
            </div>
            
            {desconto > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Desconto ({desconto}%):</span>
                <span>-{formatarPreco(calcularDesconto())}</span>
              </div>
            )}
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatarPreco(calcularTotal())}</span>
            </div>
          </div>

          {/* Botão Finalizar */}
          <Button
            onClick={finalizarVenda}
            disabled={processandoVenda}
            className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            {processandoVenda ? 'Processando...' : 'Finalizar Venda'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Cart;

