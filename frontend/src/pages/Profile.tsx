import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, getAddresses, addAddress } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useViaCEP } from '@/hooks/useViaCEP';
import { maskCEP, maskEstado } from '@/lib/validators';
import { Loader2 } from 'lucide-react';

const Profile = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Estados do formulário de endereço
  const [cepAddr, setCepAddr] = useState('');
  const [ruaAddr, setRuaAddr] = useState('');
  const [numeroAddr, setNumeroAddr] = useState('');
  const [bairroAddr, setBairroAddr] = useState('');
  const [complementoAddr, setComplementoAddr] = useState('');
  const [cidadeAddr, setCidadeAddr] = useState('');
  const [estadoAddr, setEstadoAddr] = useState('');

  const { isLoadingCEP, cepNotFound, fetchAddressByCEP, resetCEPState } = useViaCEP();

  const handleCEPChange = useCallback(async (maskedCep: string) => {
    setCepAddr(maskedCep);
    const digits = maskedCep.replace(/\D/g, '');
    if (digits.length === 8) {
      const address = await fetchAddressByCEP(maskedCep);
      if (address) {
        setRuaAddr(address.rua);
        setBairroAddr(address.bairro);
        setCidadeAddr(address.cidade);
        setEstadoAddr(address.estado);
      }
    }
  }, [fetchAddressByCEP]);

  const resetAddressForm = () => {
    setCepAddr(''); setRuaAddr(''); setNumeroAddr('');
    setBairroAddr(''); setComplementoAddr(''); setCidadeAddr('');
    setEstadoAddr(''); resetCEPState();
  };

  // Busca os dados do perfil
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile(token!),
    enabled: !!token,
  });

  // Busca a lista de endereços
  const { data: addresses, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => getAddresses(token!),
    enabled: !!token,
  });

  // Mutação para adicionar um novo endereço
  const addAddressMutation = useMutation({
    mutationFn: (addressData: any) => addAddress(addressData, token!),
    onSuccess: () => {
      toast({ title: 'Sucesso!', description: 'Endereço adicionado.' });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setIsDialogOpen(false);
      resetAddressForm();
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const handleAddAddress = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addAddressMutation.mutate({
      rua: ruaAddr, numero: numeroAddr, bairro: bairroAddr,
      complemento: complementoAddr, cidade: cidadeAddr,
      estado: estadoAddr, cep: cepAddr,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Minha Conta</h1>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Informações Pessoais */}
            <Card className="md:col-span-1 h-fit">
              <CardHeader>
                <CardTitle>Minhas Informações</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingProfile ? <p>Carregando...</p> : (
                  <div className="space-y-4 text-sm">
                    <p><strong>Nome:</strong> {profile?.nome} {profile?.sobrenome}</p>
                    <p><strong>Email:</strong> {profile?.email}</p>
                    <p><strong>CPF:</strong> {profile?.cpf || 'Não informado'}</p>
                    <p><strong>Telefone:</strong> {profile?.telefone || 'Não informado'}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Endereços */}
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Meus Endereços</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetAddressForm(); }}>
                  <DialogTrigger asChild>
                    <Button>Adicionar Endereço</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Endereço</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddAddress} className="space-y-4">
                      {/* CEP com busca automática */}
                      <div>
                        <Label htmlFor="cep">CEP *</Label>
                        <div className="relative">
                          <Input
                            id="cep"
                            value={cepAddr}
                            onChange={(e) => handleCEPChange(maskCEP(e.target.value))}
                            placeholder="00000-000"
                            required
                          />
                          {isLoadingCEP && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                        {cepNotFound && <p className="text-xs text-red-500 mt-1">CEP não encontrado.</p>}
                      </div>

                      {/* Rua + Número */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="rua">Rua *</Label>
                          <Input id="rua" value={ruaAddr} onChange={(e) => setRuaAddr(e.target.value)} required />
                        </div>
                        <div>
                          <Label htmlFor="numero">Número *</Label>
                          <Input id="numero" value={numeroAddr} onChange={(e) => setNumeroAddr(e.target.value)} required />
                        </div>
                      </div>

                      {/* Bairro */}
                      <div>
                        <Label htmlFor="bairro">Bairro *</Label>
                        <Input id="bairro" value={bairroAddr} onChange={(e) => setBairroAddr(e.target.value)} required />
                      </div>

                      {/* Complemento */}
                      <div>
                        <Label htmlFor="complemento">Complemento (Opcional)</Label>
                        <Input id="complemento" value={complementoAddr} onChange={(e) => setComplementoAddr(e.target.value)} />
                      </div>

                      {/* Cidade + Estado */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cidade">Cidade *</Label>
                          <Input id="cidade" value={cidadeAddr} onChange={(e) => setCidadeAddr(e.target.value)} required />
                        </div>
                        <div>
                          <Label htmlFor="estado">Estado *</Label>
                          <Input
                            id="estado"
                            value={estadoAddr}
                            onChange={(e) => setEstadoAddr(maskEstado(e.target.value))}
                            placeholder="PE"
                            maxLength={2}
                            required
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={addAddressMutation.isPending}>
                        {addAddressMutation.isPending ? 'Salvando...' : 'Salvar Endereço'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {isLoadingAddresses ? <p>Carregando...</p> : (
                  <div className="space-y-4">
                    {addresses?.length > 0 ? addresses.map(address => (
                      <div key={address.id} className="p-4 border rounded text-sm">
                        <p className="font-semibold">{address.rua}, {address.numero}</p>
                        <p>{address.bairro}, {address.cidade} - {address.estado}</p>
                        <p>CEP: {address.cep}</p>
                      </div>
                    )) : <p className="text-muted-foreground">Nenhum endereço cadastrado.</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;