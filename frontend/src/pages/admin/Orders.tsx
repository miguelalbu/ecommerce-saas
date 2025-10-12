import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/services/apiService";
import { useAuth } from "@/context/AuthContext";

// Funções de formatação para deixar os dados mais amigáveis
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const Orders = () => {
  const { token } = useAuth();

  // Busca os pedidos usando react-query
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrders(token!),
    enabled: !!token, // Só executa a query se o token existir
  });

  const getStatusColor = (status: string) => {
    // Ajustado para os status que vêm do backend (maiúsculas)
    switch (status.toUpperCase()) {
      case "PROCESSANDO":
        return "bg-yellow-100 text-yellow-800";
      case "ENVIADO":
        return "bg-blue-100 text-blue-800";
      case "ENTREGUE":
        return "bg-green-100 text-green-800";
      case "CANCELADO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) return <div>Carregando pedidos...</div>;
  if (error) return <div>Erro ao carregar pedidos: {error.message}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Pedidos</h1>
      </div>

      <div className="space-y-4">
        {orders && orders.length > 0 ? (
          orders.map((order) => (
            <Card key={order.id} className="animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-bold text-lg">#{order.id.substring(0, 8).toUpperCase()}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Cliente:</span> {order.cliente_nome || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Data:</span> {formatDate(order.criadoEm)}
                      </div>
                      <div>
                        {/* O número de itens precisará vir de uma relação futura, por enquanto deixamos um placeholder */}
                        <span className="font-medium">Items:</span> 1 
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Total:</span>{" "}
                        <span className="font-bold text-primary">
                          {formatCurrency(Number(order.valor_total))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">Nenhum pedido encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default Orders;