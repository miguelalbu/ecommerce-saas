import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProfile, getAddresses, placeOrder } from "@/services/apiService";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, token } = useAuth();
  const { cartItems, clearCart } = useCart();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Busca dados do perfil e endereços se o usuário estiver logado
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: () => getProfile(token!), enabled: isAuthenticated });
  const { data: addresses } = useQuery({ queryKey: ['addresses'], queryFn: () => getAddresses(token!), enabled: isAuthenticated });

  // Define o primeiro endereço como padrão
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
    } else if (isAuthenticated) {
      setShowNewAddressForm(true);
    }
  }, [addresses, isAuthenticated]);

  const checkoutMutation = useMutation({
    mutationFn: (checkoutData: any) => placeOrder(checkoutData, token),
    onSuccess: (data) => {
      toast({ title: "Pedido realizado com sucesso!" });
      clearCart();
      navigate(`/order-confirmation/${data.id}`);
    },
    onError: (error: Error) => toast({ title: "Erro no pedido", description: error.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formProps = Object.fromEntries(formData.entries());

    let addressData;
    if (isAuthenticated) {
      if (selectedAddressId === 'new') {
        addressData = formProps; // Pega do formulário de novo endereço
      } else {
        addressData = addresses?.find(a => a.id === selectedAddressId);
      }
    } else {
      addressData = formProps; // Pega do formulário de convidado
    }
    
    checkoutMutation.mutate({ cartItems, address: addressData });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 animate-fade-in">Finalizar Compra</h1>
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6 animate-fade-in">
                {/* Lógica de exibição de formulário */}
                {!isAuthenticated ? (
                  <Card>
                    <CardHeader><CardTitle>Informações Pessoais</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {/* Formulário para convidado */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><Label htmlFor="nome">Nome *</Label><Input id="nome" name="nome" required /></div>
                        <div><Label htmlFor="sobrenome">Sobrenome *</Label><Input id="sobrenome" name="sobrenome" required /></div>
                      </div>
                      <div><Label htmlFor="email">E-mail *</Label><Input id="email" name="email" type="email" required /></div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader><CardTitle>Olá, {profile?.nome}!</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">Seu pedido será associado ao email: {profile?.email}</p></CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader><CardTitle>Endereço de Entrega</CardTitle></CardHeader>
                  <CardContent>
                    {isAuthenticated && addresses && addresses.length > 0 && (
                      <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="mb-4 space-y-2">
                        {addresses.map(addr => (
                          <div key={addr.id} className="flex items-center space-x-2 border p-3 rounded">
                            <RadioGroupItem value={addr.id} id={addr.id} />
                            <Label htmlFor={addr.id} className="font-normal">{addr.rua}, {addr.numero} - {addr.cidade}</Label>
                          </div>
                        ))}
                        <div className="flex items-center space-x-2 border p-3 rounded">
                          <RadioGroupItem value="new" id="new" />
                          <Label htmlFor="new" className="font-normal">Adicionar novo endereço</Label>
                        </div>
                      </RadioGroup>
                    )}
                    {(showNewAddressForm || !isAuthenticated) && (
                      <div className="space-y-4">
                         {/* Formulário de Endereço Completo */}
                         <div><Label htmlFor="rua">Rua *</Label><Input id="rua" name="rua" required /></div>
                         {/* ... outros campos de endereço: numero, bairro, etc. ... */}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Card de Pagamento (simplificado) */}
                <Card>
                  <CardHeader><CardTitle>Forma de Pagamento</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">O pagamento será simulado nesta versão.</p>
                  </CardContent>
                </Card>
              </div>

              {/* Coluna do Resumo */}
              <div className="animate-fade-in">
                <Card className="sticky top-24">
                  <CardHeader><CardTitle>Resumo do Pedido</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.name} x {item.quantity}</span>
                          <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={checkoutMutation.isPending}>
                      {checkoutMutation.isPending ? 'Processando...' : 'Confirmar Pedido'}
                    </Button>
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