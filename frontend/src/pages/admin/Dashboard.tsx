import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Pedidos Hoje",
      value: "12",
      icon: ShoppingCart,
      trend: "+15%",
    },
    {
      title: "Faturamento",
      value: "R$ 3.450,00",
      icon: TrendingUp,
      trend: "+23%",
    },
    {
      title: "Produtos",
      value: "87",
      icon: Package,
      trend: "+3",
    },
    {
      title: "Clientes",
      value: "234",
      icon: Users,
      trend: "+12",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

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
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.trend}</span> desde ontem
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Pedido #{123450 + i}</p>
                    <p className="text-sm text-muted-foreground">João Silva</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R$ 189,90</p>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Processando
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Produtos com Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Batom Matte Rosa</p>
                    <p className="text-sm text-muted-foreground">Categoria: Maquiagem</p>
                  </div>
                  <div className="text-right">
                    <span className="text-destructive font-semibold">{3 + i} un.</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
