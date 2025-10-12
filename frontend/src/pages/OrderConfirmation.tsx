import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, Mail } from "lucide-react";

const OrderConfirmation = () => {
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
                  <p className="text-2xl font-bold text-primary">#123456</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-left mb-8">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Preparação do Pedido</h3>
                      <p className="text-sm text-muted-foreground">
                        Seu pedido será preparado nas próximas 24 horas
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Confirmação por E-mail</h3>
                      <p className="text-sm text-muted-foreground">
                        Enviamos um e-mail com os detalhes do pedido
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link to="/catalog">Continuar Comprando</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/">Voltar ao Início</Link>
                  </Button>
                </div>
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
