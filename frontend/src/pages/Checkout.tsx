// src/pages/Checkout.tsx

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge"; // Importei Badge para destacar
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProfile, getAddresses, placeOrder } from "@/services/apiService";
import { Store, Truck, MapPin } from "lucide-react"; // Importei ícones novos

// --- CONFIGURAÇÃO DAS LOJAS (PONTOS DE RETIRADA) ---
const pickupLocations = [
  { 
    id: 'store-1', 
    name: 'Loja 1 (Aldeia)', 
    rua: 'Av. Vera Cruz',
    numero: '56',
    complemento: 'Aldeia km 10, Galeria Skabeté',
    bairro: 'Aldeia',
    cidade: 'Camaragibe',
    estado: 'PE',
    cep: '54759-000' // CEP Fictício ou real se tiver
  },
  { 
    id: 'store-2', 
    name: 'Loja 2 (Camaragibe Centro)', 
    rua: 'Rua Eliza Cabral',
    numero: '142',
    complemento: 'Galeria Bom Jesus',
    bairro: 'Centro',
    cidade: 'Camaragibe',
    estado: 'PE',
    cep: '54762-000'
  }
];

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, token } = useAuth();
  const { cartItems, clearCart } = useCart();

  // Estados
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery'); // Novo estado
  const [selectedStoreId, setSelectedStoreId] = useState<string>(pickupLocations[0].id); // Novo estado
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  
  const showNewAddressForm = deliveryMethod === 'delivery' && (!isAuthenticated || selectedAddressId === 'new');

  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: () => getProfile(token!), enabled: isAuthenticated });
  const { data: addresses } = useQuery({ queryKey: ['addresses'], queryFn: () => getAddresses(token!), enabled: isAuthenticated });

  // Seleciona endereço padrão automaticamente
  useEffect(() => {
    if (isAuthenticated && addresses) {
      if (addresses.length > 0) {
        if (!selectedAddressId) setSelectedAddressId(addresses[0].id);
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

    // --- LÓGICA DE RETIRADA ---
    if (deliveryMethod === 'pickup') {
        const store = pickupLocations.find(s => s.id === selectedStoreId);
        if (!store) return;

        // Montamos o endereço com os dados da loja para salvar no pedido
        addressData = {
            rua: store.rua,
            numero: store.numero,
            complemento: `${store.complemento} (RETIRADA NA LOJA: ${store.name})`,
            bairro: store.bairro,
            cidade: store.cidade,
            estado: store.estado,
            cep: store.cep,
            // Se não estiver logado, ainda precisamos dos dados pessoais abaixo
        };
    } 
    // --- LÓGICA DE ENTREGA (Código Antigo) ---
    else {
        if (isAuthenticated) {
            if (!selectedAddressId) {
                toast({ title: "Erro", description: "Selecione ou adicione um endereço de entrega.", variant: "destructive" });
                return;
            }
            if (selectedAddressId === 'new') {
                addressData = {
                    rua: formProps.rua, numero: formProps.numero, complemento: formProps.complemento,
                    bairro: formProps.bairro, cidade: formProps.cidade, estado: formProps.estado, cep: formProps.cep,
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
                rua: formProps.rua, numero: formProps.numero, complemento: formProps.complemento,
                bairro: formProps.bairro, cidade: formProps.cidade, estado: formProps.estado, cep: formProps.cep,
            };
        }
    }

    // Dados Pessoais (Sempre necessários se não logado)
    if (!isAuthenticated) {
        addressData = {
            ...addressData,
            nome: formProps.nome, sobrenome: formProps.sobrenome,
            email: formProps.email, telefone: formProps.telefone, cpf: formProps.cpf,
        };
    }

    // Validações
    if (!addressData?.rua || !addressData?.numero || !addressData?.cidade) {
       toast({ title: "Erro", description: "Endereço inválido.", variant: "destructive" });
       return;
    }
    if(!isAuthenticated && (!addressData?.nome || !addressData?.email || !addressData?.cpf)){
        toast({ title: "Erro", description: "Preencha seus dados pessoais.", variant: "destructive" });
       return;
    }

    const checkoutData = {
      cartItems: cartItems.map(item => ({ id: item.id, quantity: item.quantity })), 
      address: addressData,
      // Você pode adicionar um campo 'deliveryMethod' aqui se o backend suportar
      isPickup: deliveryMethod === 'pickup' 
    };

    checkoutMutation.mutate(checkoutData);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const frete = deliveryMethod === 'pickup' ? 0 : 0; // Se tiver lógica de frete, ajuste aqui

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
                  <span className="font-semibold">Já tem uma conta?</span> Faça login para usar seus endereços salvos.
                </p>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" asChild><Link to="/login">Login</Link></Button>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6 animate-fade-in">
                
                {/* Dados Pessoais (Se não logado) */}
                {isAuthenticated ? (
                   <Card>
                    <CardHeader><CardTitle>Dados do Cliente</CardTitle></CardHeader>
                    <CardContent>
                        <p className="font-medium text-lg">{profile?.nome} {profile?.sobrenome}</p>
                        <p className="text-muted-foreground">{profile?.email}</p>
                    </CardContent>
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

                {/* --- SELEÇÃO DO TIPO DE ENTREGA --- */}
                <Card>
                    <CardHeader><CardTitle>Opções de Entrega</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div 
                                onClick={() => setDeliveryMethod('delivery')}
                                className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all ${deliveryMethod === 'delivery' ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'hover:bg-accent/50'}`}
                            >
                                <Truck className={`h-8 w-8 ${deliveryMethod === 'delivery' ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className={`font-semibold ${deliveryMethod === 'delivery' ? 'text-primary' : 'text-muted-foreground'}`}>Entrega em Casa</span>
                            </div>
                            <div 
                                onClick={() => setDeliveryMethod('pickup')}
                                className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all ${deliveryMethod === 'pickup' ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'hover:bg-accent/50'}`}
                            >
                                <Store className={`h-8 w-8 ${deliveryMethod === 'pickup' ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className={`font-semibold ${deliveryMethod === 'pickup' ? 'text-primary' : 'text-muted-foreground'}`}>Retirada na Loja</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* --- CONTEÚDO DINÂMICO: ENDEREÇO OU LOJAS --- */}
                
                {/* CASO 1: RETIRADA NA LOJA */}
                {deliveryMethod === 'pickup' && (
                    <Card className="border-primary/50 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <MapPin className="h-5 w-5" /> Selecione o Ponto de Retirada
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={selectedStoreId} onValueChange={setSelectedStoreId} className="space-y-3">
                                {pickupLocations.map(store => (
                                    <div key={store.id} className={`flex items-start space-x-3 border p-4 rounded-lg bg-white ${selectedStoreId === store.id ? 'border-primary ring-1 ring-primary' : ''}`}>
                                        <RadioGroupItem value={store.id} id={store.id} className="mt-1" />
                                        <div className="flex-1">
                                            <Label htmlFor={store.id} className="font-bold text-base cursor-pointer block mb-1">
                                                {store.name} <Badge variant="secondary" className="ml-2 text-xs">Grátis</Badge>
                                            </Label>
                                            <p className="text-sm text-muted-foreground">{store.rua}, {store.numero} - {store.bairro}</p>
                                            <p className="text-sm text-muted-foreground">{store.complemento}</p>
                                            <p className="text-sm text-muted-foreground">{store.cidade} - {store.estado}</p>
                                        </div>
                                    </div>
                                ))}
                            </RadioGroup>
                            <p className="text-sm text-muted-foreground mt-4 italic">
                                * Você receberá um aviso quando o pedido estiver pronto para retirada.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* CASO 2: ENTREGA EM CASA (Formulário Original) */}
                {deliveryMethod === 'delivery' && (
                    <Card>
                    <CardHeader><CardTitle>Endereço de Entrega</CardTitle></CardHeader>
                    <CardContent>
                        {isAuthenticated && addresses && addresses.length > 0 && (
                        <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="mb-4 space-y-2">
                            {addresses.map(addr => (
                            <div key={addr.id} className="flex items-center space-x-2 border p-3 rounded hover:bg-accent/5">
                                <RadioGroupItem value={addr.id} id={addr.id} />
                                <Label htmlFor={addr.id} className="font-normal cursor-pointer flex-1">
                                    <span className="font-medium">{addr.rua}, {addr.numero}</span> - {addr.bairro}, {addr.cidade}
                                </Label>
                            </div>
                            ))}
                            <div className="flex items-center space-x-2 border p-3 rounded hover:bg-accent/5">
                            <RadioGroupItem value="new" id="new" />
                            <Label htmlFor="new" className="font-normal cursor-pointer">Adicionar novo endereço</Label>
                            </div>
                        </RadioGroup>
                        )}
                        
                        {showNewAddressForm && (
                        <div className="space-y-4 pt-4 border-t">
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
                )}
                
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
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.name} x {item.quantity}</span>
                          <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>R$ {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Frete</span>
                            {deliveryMethod === 'pickup' ? (
                                <span className="text-green-600 font-medium">Grátis (Retirada)</span>
                            ) : (
                                <span>R$ {frete.toFixed(2)}</span>
                            )}
                        </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>R$ {(subtotal + frete).toFixed(2)}</span>
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