import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("credit-card");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Pedido realizado com sucesso!",
      description: "Você será redirecionado para a confirmação.",
    });
    setTimeout(() => navigate("/order-confirmation/123456"), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 animate-fade-in">Finalizar Compra</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-6 animate-fade-in">
                {/* Customer Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input id="name" required />
                      </div>
                      <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <Input id="email" type="email" required />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input id="phone" required />
                      </div>
                      <div>
                        <Label htmlFor="cpf">CPF *</Label>
                        <Input id="cpf" required />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle>Endereço de Entrega</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="cep">CEP *</Label>
                        <Input id="cep" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="street">Rua *</Label>
                      <Input id="street" required />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="number">Número *</Label>
                        <Input id="number" required />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="complement">Complemento</Label>
                        <Input id="complement" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="neighborhood">Bairro *</Label>
                        <Input id="neighborhood" required />
                      </div>
                      <div>
                        <Label htmlFor="city">Cidade *</Label>
                        <Input id="city" required />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado *</Label>
                        <Input id="state" required />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Forma de Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="credit-card" id="credit-card" />
                        <Label htmlFor="credit-card">Cartão de Crédito</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pix" id="pix" />
                        <Label htmlFor="pix">PIX (5% de desconto)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="boleto" id="boleto" />
                        <Label htmlFor="boleto">Boleto Bancário</Label>
                      </div>
                    </RadioGroup>

                    {paymentMethod === "credit-card" && (
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label htmlFor="card-number">Número do Cartão *</Label>
                          <Input id="card-number" placeholder="0000 0000 0000 0000" required />
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="card-name">Nome no Cartão *</Label>
                            <Input id="card-name" required />
                          </div>
                          <div>
                            <Label htmlFor="card-expiry">Validade *</Label>
                            <Input id="card-expiry" placeholder="MM/AA" required />
                          </div>
                          <div>
                            <Label htmlFor="card-cvv">CVV *</Label>
                            <Input id="card-cvv" placeholder="123" required />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Order Summary */}
              <div className="animate-fade-in">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Resumo do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>R$ 179,80</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Frete</span>
                        <span>R$ 15,90</span>
                      </div>
                      {paymentMethod === "pix" && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Desconto PIX (5%)</span>
                          <span>- R$ 8,99</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex justify-between">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        R$ {paymentMethod === "pix" ? "186,71" : "195,70"}
                      </span>
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      Confirmar Pedido
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Ao confirmar, você concorda com nossos termos de uso
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
