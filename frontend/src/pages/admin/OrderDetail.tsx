import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Funções de formatação
const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>(); // Pega o ID da URL
  const { token } = useAuth();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id!, token!),
    enabled: !!id && !!token,
  });

  if (isLoading) return <div>Carregando detalhes do pedido...</div>;
  if (error) return <div>Erro: {error.message}</div>;
  if (!order) return <div>Pedido não encontrado.</div>;

  return (
    <div>
        <button>
        <a href="/admin/orders" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Voltar para Pedidos</a>
        </button>
      <h1 className="text-3xl font-bold mb-4">Detalhes do Pedido</h1>
      <p className="text-muted-foreground mb-8">Pedido #{order.id.substring(0, 8).toUpperCase()}</p>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Itens do Pedido (Placeholder por enquanto) */}
          <Card>
            <CardHeader><CardTitle>Itens do Pedido</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Qtd.</TableHead>
                    <TableHead>Preço Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* TODO: Substituir por dados reais quando a tabela ItemPedido for criada */}
                  <TableRow>
                    <TableCell>Produto de Teste 1</TableCell>
                    <TableCell>1</TableCell>
                    <TableCell>{formatCurrency(Number(order.valor_total))}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(order.valor_total))}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Resumo */}
          <Card>
            <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between"><span>Subtotal</span> <span>{formatCurrency(Number(order.valor_total))}</span></div>
              <div className="flex justify-between"><span>Frete</span> <span>R$ 0,00</span></div>
              <div className="flex justify-between font-bold text-lg"><span>Total</span> <span>{formatCurrency(Number(order.valor_total))}</span></div>
            </CardContent>
          </Card>

          {/* Informações do Cliente */}
          <Card>
            <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Nome:</strong> {order.cliente.nome}</p>
              <p><strong>Email:</strong> {order.cliente.email}</p>
              {/* TODO: Adicionar endereço de entrega quando existir */}
            </CardContent>
          </Card>
          
          {/* Status do Pedido */}
          <Card>
            <CardHeader><CardTitle>Status do Pedido</CardTitle></CardHeader>
            <CardContent>
              <Badge>{order.status}</Badge>
              <p className="text-sm text-muted-foreground mt-2">Data: {formatDate(order.criadoEm)}</p>
              {/* TODO: Adicionar funcionalidade para alterar o status */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;