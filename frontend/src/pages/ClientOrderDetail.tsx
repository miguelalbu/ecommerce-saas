// src/pages/ClientOrderDetail.tsx

import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, MapPin, CreditCard, Calendar } from 'lucide-react';

// Formatações
const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' });

// Configuração de Status
const getStatusConfig = (status: string) => {
  const s = status ? status.toUpperCase() : "";
  switch (s) {
    case 'PAID': return { label: 'Pagamento Confirmado', className: 'bg-green-100 text-green-800 hover:bg-green-100' };
    case 'PENDING': return { label: 'Aguardando Pagamento', className: 'bg-red-100 text-red-800 hover:bg-red-100' };
    case 'PROCESSANDO': return { label: 'Em Processamento', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' };
    case 'SHIPPED': return { label: 'Enviado / Em Trânsito', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' };
    case 'DELIVERED': return { label: 'Entregue', className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' };
    case 'CANCELED': return { label: 'Cancelado', className: 'bg-gray-100 text-gray-600 hover:bg-gray-100' };
    default: return { label: s, className: 'bg-gray-100 text-gray-800' };
  }
};

const ClientOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['my-order-detail', id],
    queryFn: () => getOrderById(id!, token!),
    enabled: !!id && !!token,
  });

  if (isLoading) return <div className="py-20 text-center text-muted-foreground">Carregando detalhes...</div>;
  if (error) return <div className="py-20 text-center text-red-500">Erro ao carregar pedido. Tente novamente.</div>;
  if (!order) return <div className="py-20 text-center">Pedido não encontrado.</div>;

  const status = getStatusConfig(order.status);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-in fade-in duration-500">
      
      {/* Botão Voltar */}
      <Button variant="ghost" asChild className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
        <Link to="/my-orders" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar para Meus Pedidos
        </Link>
      </Button>

      {/* Cabeçalho do Pedido */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedido #{order.id.substring(0, 8).toUpperCase()}</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Realizado em {formatDate(order.criadoEm)}</span>
          </div>
        </div>
        <Badge className={`${status.className} text-sm px-4 py-1 rounded-full border-0`}>
          {status.label}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda: Itens */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-gray-500" /> Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {order.itens?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex gap-4">
                      {/* Placeholder de imagem se não tiver */}
                      <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-300">
                         <Package className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.produto?.nome || 'Produto Indisponível'}</p>
                        <p className="text-sm text-muted-foreground">Qtd: {item.quantidade}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(Number(item.precoNoMomentoDaCompra || item.precoUnitario || 0))}
                    </p>
                  </div>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(Number(order.valor_total))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="text-green-600 font-medium">Grátis</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(Number(order.valor_total))}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Informações */}
        <div className="space-y-6">
          {/* Pagamento (Placeholder estático por enquanto) */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-gray-500" /> Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Total: <span className="font-bold text-gray-900">{formatCurrency(Number(order.valor_total))}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {/* Aqui você pode implementar lógica real de pagamento no futuro */}
                Método: Padrão / PIX
              </p>
            </CardContent>
          </Card>

          {/* Endereço (Placeholder ou dados reais se tiver no banco) */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-gray-500" /> Entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.cliente ? (
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">{order.cliente.nome} {order.cliente.sobrenome}</p>
                  <p>{order.cliente.email}</p>
                  {/* Se tiver endereço no objeto cliente, mostre aqui */}
                  <p className="text-muted-foreground italic mt-2">Endereço cadastrado no perfil.</p>
                </div>
              ) : (
                <p className="text-sm text-yellow-600">Retirada no Balcão</p>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default ClientOrderDetail;