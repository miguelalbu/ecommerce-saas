import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const showNewAddressForm = !isAuthenticated || selectedAddressId === 'new';

  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: () => getProfile(token!), enabled: isAuthenticated });
  const { data: addresses } = useQuery({ queryKey: ['addresses'], queryFn: () => getAddresses(token!), enabled: isAuthenticated });

  useEffect(() => {
    if (isAuthenticated && addresses) {
      if (addresses.length > 0) {
        if (!selectedAddressId) {
           setSelectedAddressId(addresses[0].id);
        }
      } else {
        setSelectedAddressId('new');
      }
    } else if (!isAuthenticated) {
      setSelectedAddressId('new'); 
    }
  }, [addresses, isAuthenticated, selectedAddressId]);

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

    let addressData: any;

    if (isAuthenticated) {
      if (!selectedAddressId) {
        toast({ title: "Erro", description: "Selecione ou adicione um endereço de entrega.", variant: "destructive" });
        return;
      }
      
      if (selectedAddressId === 'new') {
        addressData = {
          rua: formProps.rua,
          numero: formProps.numero,
          complemento: formProps.complemento,
          bairro: formProps.bairro,
          cidade: formProps.cidade,
          estado: formProps.estado,
          cep: formProps.cep,
        };
      } else {
        const selectedSavedAddress = addresses?.find(a => a.id === selectedAddressId);
        if (!selectedSavedAddress) {
           toast({ title: "Erro", description: "Endereço selecionado inválido.", variant: "destructive" });
           return;
        }
        addressData = selectedSavedAddress; 
      }
    } else {
      addressData = {
        nome: formProps.nome,
        sobrenome: formProps.sobrenome,
        email: formProps.email, 
        telefone: formProps.telefone,
        cpf: formProps.cpf,
        rua: formProps.rua,
        numero: formProps.numero,
        complemento: formProps.complemento,
        bairro: formProps.bairro,
        cidade: formProps.cidade,
        estado: formProps.estado,
        cep: formProps.cep,
      };
    }

    if (!addressData?.rua || !addressData?.numero || !addressData?.cidade || !addressData?.cep || !addressData?.bairro || !addressData?.estado) {
       toast({ title: "Erro", description: "Por favor, preencha todos os campos obrigatórios do endereço.", variant: "destructive" });
       return;
    }
    if(!isAuthenticated && (!addressData?.nome || !addressData?.sobrenome || !addressData?.email || !addressData?.telefone || !addressData?.cpf)){
        toast({ title: "Erro", description: "Por favor, preencha todos os campos obrigatórios de informações pessoais.", variant: "destructive" });
       return;
    }


    const checkoutData = {
      cartItems: cartItems.map(item => ({ id: item.id, quantity: item.quantity })), 
      address: addressData,
    };

    checkoutMutation.mutate(checkoutData);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 animate-fade-in">Finalizar Compra</h1>

          {!isAuthenticated && (
            <Card className="mb-6 bg-accent/10 border-accent animate-fade-in">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-center sm:text-left">
                  <span className="font-semibold">Já tem uma conta?</span> Faça login para usar seus endereços salvos e agilizar a compra.
                </p>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" asChild>
                    <Link to="/login">Fazer Login</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/login">Cadastre-se</Link> 
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6 animate-fade-in">
                {isAuthenticated ? (
                   <Card>
                    <CardHeader><CardTitle>Olá, {profile?.nome}!</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">Seu pedido será associado ao email: {profile?.email}</p></CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader><CardTitle>Informações Pessoais</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><Label htmlFor="nome">Nome *</Label><Input id="nome" name="nome" required /></div>
                        <div><Label htmlFor="sobrenome">Sobrenome *</Label><Input id="sobrenome" name="sobrenome" required /></div>
                      </div>
                       <div className="grid sm:grid-cols-2 gap-4">
                         <div><Label htmlFor="email">E-mail *</Label><Input id="email" name="email" type="email" required /></div>
                         <div><Label htmlFor="telefone">Telefone *</Label><Input id="telefone" name="telefone" required /></div>
                       </div>
                       <div><Label htmlFor="cpf">CPF *</Label><Input id="cpf" name="cpf" required /></div>
                    </CardContent>
                  </Card>
                )}

                {/* Endereço de Entrega */}
                <Card>
                  <CardHeader><CardTitle>Endereço de Entrega</CardTitle></CardHeader>
                  <CardContent>
                    {/* Mostra opções de endereço apenas se logado e tiver endereços */}
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
                    {/* Mostra o formulário de endereço se for convidado OU se 'Adicionar novo' estiver selecionado */}
                    {showNewAddressForm && (
                      <div className="space-y-4 pt-4 border-t"> {/* Adicionado padding e borda */}
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div><Label htmlFor="cep">CEP *</Label><Input id="cep" name="cep" required /></div>
                        </div>
                        <div><Label htmlFor="rua">Rua *</Label><Input id="rua" name="rua" required /></div>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div><Label htmlFor="numero">Número *</Label><Input id="numero" name="numero" required /></div>
                            <div className="sm:col-span-2"><Label htmlFor="complemento">Complemento</Label><Input id="complemento" name="complemento" /></div>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div><Label htmlFor="bairro">Bairro *</Label><Input id="bairro" name="bairro" required /></div>
                            <div><Label htmlFor="cidade">Cidade *</Label><Input id="cidade" name="cidade" required /></div>
                            <div><Label htmlFor="estado">Estado *</Label><Input id="estado" name="estado" maxLength={2} required /></div>
                        </div>
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
                    <div className="space-y-2 max-h-60 overflow-y-auto"> {/* Adicionado scroll */}
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
                    <Button type="submit" className="w-full" size="lg" disabled={checkoutMutation.isPending || cartItems.length === 0}>
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