import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { User, UserPlus, Search } from 'lucide-react';

const CustomerInfo = ({ cliente, onClienteChange }) => {
  const [mostrarBusca, setMostrarBusca] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');

  const formatarNome = (nome) => {
    if (!nome) return '';
    return nome.split(' ').map(palavra => 
      palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
    ).join(' ');
  };

  const removerCliente = () => {
    onClienteChange(null);
    setMostrarBusca(false);
    setTermoBusca('');
  };

  const buscarCliente = async () => {
    // Implementar busca de cliente
    console.log('Buscar cliente:', termoBusca);
    
    // Mock para desenvolvimento
    if (termoBusca.toLowerCase().includes('joão')) {
      onClienteChange({
        id: 1,
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '(11) 99999-9999'
      });
      setMostrarBusca(false);
      setTermoBusca('');
    }
  };

  return (
    <div className="p-4">
      {cliente ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">
                    {formatarNome(cliente.nome)}
                  </h3>
                  {cliente.email && (
                    <p className="text-xs text-muted-foreground">
                      {cliente.email}
                    </p>
                  )}
                  {cliente.telefone && (
                    <p className="text-xs text-muted-foreground">
                      {cliente.telefone}
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={removerCliente}
                className="text-xs"
              >
                Remover
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : mostrarBusca ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="busca-cliente">Buscar Cliente</Label>
              <div className="flex space-x-2">
                <Input
                  id="busca-cliente"
                  placeholder="Nome, CPF ou telefone..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && buscarCliente()}
                />
                <Button size="sm" onClick={buscarCliente}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarBusca(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="flex-1"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Novo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          onClick={() => setMostrarBusca(true)}
          className="w-full justify-start"
        >
          <User className="h-4 w-4 mr-2" />
          Adicionar Cliente
        </Button>
      )}
    </div>
  );
};

export default CustomerInfo;

