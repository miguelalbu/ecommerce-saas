// src/pages/MyOrders.tsx

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getMyOrders } from "@/services/apiService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, LogIn, UserPlus, Package, ArrowRight, Calendar, ArrowLeft } from "lucide-react"; // Adicionei ArrowLeft

// Formatações
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateString: string) => 
  new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

// Configuração de Status
const getStatusConfig = (status: string) => {
  const normalizedStatus = status ? status.toUpperCase() : "UNKNOWN";
  switch (normalizedStatus) {
    case 'PAID': return { label: 'PAGO', className: 'bg-green-100 text-green-800 border-green-200' };
    case 'PENDING': return { label: 'PENDENTE', className: 'bg-red-100 text-red-800 border-red-200' };
    case 'PROCESSANDO': return { label: 'PROCESSANDO', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    case 'SHIPPED': return { label: 'ENVIADO', className: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'DELIVERED': return { label: 'ENTREGUE', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'CANCELED': return { label: 'CANCELADO', className: 'bg-gray-100 text-gray-800 border-gray-200' };
    default: return { label: normalizedStatus, className: 'bg-gray-100 text-gray-600 border-gray-200' };
  }
};

const MyOrders = () => {
  const { isAuthenticated, token } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => getMyOrders(token!),
    enabled: isAuthenticated && !!token,
  });

  // --- 1. ESTADO: NÃO LOGADO ---
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
        <div className="bg-muted/30 p-6 rounded-full mb-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Acesse seus Pedidos</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          Entre na sua conta para acompanhar suas compras.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link to="/login"><LogIn className="mr-2 h-4 w-4" /> Entrar</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/register"><UserPlus className="mr-2 h-4 w-4" /> Criar Conta</Link>
          </Button>
        </div>
      </div>
    );
  }

  // --- 2. ESTADO: LOGADO ---
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50/50">
      
      {/* --- [NOVO] Botão Voltar Mobile --- */}
      <div className="md:hidden mb-4">
        <Button variant="ghost" asChild className="pl-0 hover:bg-transparent -ml-2">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-5 w-5" />
                Voltar para o Início
            </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
            <p className="text-muted-foreground mt-1">Histórico de compras recentes.</p>
        </div>
        
        {/* Botão Desktop */}
        <Button variant="outline" asChild className="hidden md:flex">
            <Link to="/catalog">Continuar Comprando</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando seus pedidos...</div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
          {orders.map((order: any) => {
            const status = getStatusConfig(order.status);
            const itemsCount = order.itens?.length || order.items?.length || 0;

            return (
              <Card key={order.id} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary group">
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg">
                          Pedido #{order.id.substring(0, 8).toUpperCase()}
                        </CardTitle>
                        <Badge variant="outline" className={`${status.className} font-semibold border-0`}>
                          {status.label}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Realizado em {formatDate(order.criadoEm)}
                      </CardDescription>
                    </div>
                    
                    <div className="text-left md:text-right">
                      <p className="text-sm text-muted-foreground">Total do Pedido</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(Number(order.valor_total || order.totalAmount))}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between pt-4 border-t mt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>{itemsCount} {itemsCount === 1 ? 'item' : 'itens'}</span>
                    </div>
                    
                    <Button asChild variant="ghost" size="sm" className="group-hover:text-primary group-hover:bg-primary/5">
                      <Link to={`/my-orders/${order.id}`}>
                        Ver Detalhes <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed shadow-sm">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Você ainda não tem pedidos</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Explore nosso catálogo e faça sua primeira compra!
          </p>
          <Button asChild size="lg">
            <Link to="/catalog">Ir para o Catálogo</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyOrders;