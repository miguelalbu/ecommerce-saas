// /src/pages/OrderConfirmation.tsx
import { Link, useParams } from "react-router-dom"; // Importar useParams
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, Mail } from "lucide-react";

const OrderConfirmation = () => {
  const { orderId } = useParams(); // Pega o ID do pedido da URL

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center animate-scale-in">
              <CardContent className="pt-12 pb-8">
                <div className="mb-6 flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold mb-4">Pedido Confirmado!</h1>
                <p className="text-muted-foreground mb-8">
                  Obrigado pela sua compra. Seu pedido foi recebido e está sendo processado.
                </p>
                <div className="bg-muted rounded-lg p-6 mb-8">
                  <p className="text-sm text-muted-foreground mb-2">Número do Pedido</p>
                  {/* Exibe o ID real do pedido */}
                  <p className="text-2xl font-bold text-primary">#{orderId?.substring(0, 8).toUpperCase()}</p>
                </div>
                {/* ... (resto do JSX) ... */}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;