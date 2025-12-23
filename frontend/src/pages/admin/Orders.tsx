// /src/pages/admin/Orders.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/services/apiService";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

// Funções de formatação
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// Configuração visual dos Status (Tradução e Cores)
const getStatusConfig = (status: string) => {
  // Normaliza para maiúsculo para garantir a comparação
  const normalizedStatus = status ? status.toUpperCase() : "UNKNOWN";

  switch (normalizedStatus) {
    case 'PAID':
      return { label: 'PAGO', className: 'bg-green-600 hover:bg-green-700 text-white border-transparent' };
    case 'PENDING':
      return { label: 'PENDENTE', className: 'bg-red-500 hover:bg-red-600 text-white border-transparent' };
    case 'PROCESSANDO':
    case 'PROCESSING':
      return { label: 'PROCESSANDO', className: 'bg-yellow-500 hover:bg-yellow-600 text-black border-transparent' };
    case 'SHIPPED':
      return { label: 'ENVIADO', className: 'bg-blue-500 hover:bg-blue-600 text-white border-transparent' };
    case 'DELIVERED':
      return { label: 'ENTREGUE', className: 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent' };
    case 'CANCELED':
      return { label: 'CANCELADO', className: 'bg-gray-500 hover:bg-gray-600 text-white border-transparent' };
    default:
      return { label: normalizedStatus, className: 'bg-gray-400 text-white border-transparent' };
  }
};

const Orders = () => {
  const { token } = useAuth();

  // Busca os pedidos usando react-query
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrders(token!),
    enabled: !!token, 
  });

  if (isLoading) return <div className="p-8 text-center">Carregando pedidos...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Erro ao carregar pedidos: {error.message}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Pedidos</h1>
        <Button asChild>
          <Link to="/admin/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Venda
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {orders && orders.length > 0 ? (
          orders.map((order: any) => {
            // Calcula a configuração do status para cada pedido
            const statusInfo = getStatusConfig(order.status);
            
            // Tenta contar os itens se vierem do backend, senão assume 1
            const itemCount = order.itens?.length || order.items?.length || 1;

            return (
              <Card key={order.id} className="animate-fade-in hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-800">
                          #{order.id.substring(0, 8).toUpperCase()}
                        </h3>
                        {/* Badge com a cor e texto traduzido */}
                        <Badge className={`${statusInfo.className} px-3 py-1`}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mt-3">
                        <div>
                          <span className="font-medium block text-gray-500">Cliente:</span> 
                          <span className="text-gray-900">{order.cliente_nome || 'Cliente Balcão'}</span>
                        </div>
                        <div>
                          <span className="font-medium block text-gray-500">Data:</span> 
                          <span className="text-gray-900">{formatDate(order.criadoEm)}</span>
                        </div>
                        <div>
                          <span className="font-medium block text-gray-500">Itens:</span> 
                          <span className="text-gray-900">{itemCount}</span>
                        </div>
                        <div>
                          <span className="font-medium block text-gray-500">Total:</span>
                          <span className="font-bold text-emerald-600 text-base">
                            {formatCurrency(Number(order.valor_total || order.valorTotal || 0))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" asChild>
                      {/* Ajuste a rota se necessário, ex: /admin/orders/edit/ID */}
                      <Link to={`/admin/orders/${order.id}`}>
                        Detalhes
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-muted-foreground mb-4">Nenhuma venda registrada ainda.</p>
            <Button variant="outline" asChild>
              <Link to="/admin/orders/new">Criar primeira venda</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;