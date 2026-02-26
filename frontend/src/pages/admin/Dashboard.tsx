// /src/admin/Dashboard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp, Users, Wallet, Percent } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "@/services/apiService";
import { useAuth } from "@/context/AuthContext";

// Função para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const Dashboard = () => {
  const { token } = useAuth();

  // useQuery para buscar os dados do dashboard
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['dashboardSummary'], // Chave única para esta query
    queryFn: () => getDashboardSummary(token!), // Função que busca os dados
    enabled: !!token, // A query só será executada se o token existir
  });

  // Estado de Carregamento
  if (isLoading) {
    return <div>Carregando dashboard...</div>;
  }

  // Estado de Erro
  if (error) {
    return <div>Erro ao carregar os dados: {error.message}</div>;
  }

  // Se os dados ainda não chegaram (raro, mas possível)
  if (!summary) {
    return <div>Nenhum dado para exibir.</div>;
  }

  // Mapeia os dados reais para a estrutura dos cards de estatísticas
  const stats = [
    { title: "Total de Pedidos", value: summary.stats.totalOrders, icon: ShoppingCart },
    { title: "Faturamento Total", value: formatCurrency(summary.stats.totalRevenue), icon: TrendingUp },
    { title: "Total de Produtos", value: summary.stats.totalProducts, icon: Package },
    { title: "Total de Clientes", value: summary.stats.totalCustomers, icon: Users },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Cards de Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cards de Métricas de Estoque */}
      <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Métricas de Estoque</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Potencial do Estoque</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.stats.receitaPotencial)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Se todo o estoque for vendido</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Investimento em Estoque</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.stats.investimentoEstoque > 0
                ? formatCurrency(summary.stats.investimentoEstoque)
                : <span className="text-muted-foreground text-lg">Sem dados</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Custo total dos produtos em estoque</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Margem de Lucro Potencial</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.stats.margemLucro !== null && summary.stats.margemLucro >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {summary.stats.margemLucro !== null
                ? `${summary.stats.margemLucro}%`
                : <span className="text-muted-foreground text-lg">Sem dados</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.stats.margemLucro !== null
                ? `Lucro potencial: ${formatCurrency(summary.stats.lucroPotencial)}`
                : 'Cadastre o preço de compra nos produtos'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Card de Pedidos Recentes */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.recentOrders.length > 0 ? (
                summary.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-medium">Pedido #{order.id.substring(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{order.cliente_nome || 'Cliente não identificado'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(order.valor_total)}</p>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum pedido recente.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card de Estoque Baixo */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Produtos com Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.lowStockProducts.length > 0 ? (
                summary.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-medium">{product.nome}</p>
                      <p className="text-sm text-muted-foreground">Categoria: {product.categoria.nome}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-destructive font-semibold">{product.estoque} un.</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum produto com estoque baixo.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;