import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

const Orders = () => {
  const orders = [
    {
      id: "#123456",
      customer: "João Silva",
      date: "10/10/2025",
      total: 189.90,
      status: "Processando",
      items: 2,
    },
    {
      id: "#123455",
      customer: "Maria Santos",
      date: "10/10/2025",
      total: 249.90,
      status: "Enviado",
      items: 1,
    },
    {
      id: "#123454",
      customer: "Pedro Costa",
      date: "09/10/2025",
      total: 459.80,
      status: "Entregue",
      items: 3,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Processando":
        return "bg-yellow-100 text-yellow-800";
      case "Enviado":
        return "bg-blue-100 text-blue-800";
      case "Entregue":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Pedidos</h1>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-bold text-lg">{order.id}</h3>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Cliente:</span> {order.customer}
                    </div>
                    <div>
                      <span className="font-medium">Data:</span> {order.date}
                    </div>
                    <div>
                      <span className="font-medium">Items:</span> {order.items}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Total:</span>{" "}
                      <span className="font-bold text-primary">
                        R$ {order.total.toFixed(2)}
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
        ))}
      </div>
    </div>
  );
};

export default Orders;
