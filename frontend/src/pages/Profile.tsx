import { useState } from 'react';
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

const Profile = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      setIsDialogOpen(false); // Fecha o dialog
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const handleAddAddress = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const addressData = Object.fromEntries(formData.entries());
    addAddressMutation.mutate(addressData);
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Adicionar Endereço</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Endereço</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddAddress} className="space-y-4">
                      {/* Formulário de Endereço */}
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label htmlFor="rua">Rua</Label><Input id="rua" name="rua" required /></div>
                        <div><Label htmlFor="numero">Número</Label><Input id="numero" name="numero" required /></div>
                      </div>
                      <div><Label htmlFor="bairro">Bairro</Label><Input id="bairro" name="bairro" required /></div>
                      <div><Label htmlFor="complemento">Complemento (Opcional)</Label><Input id="complemento" name="complemento" /></div>
                      <div className="grid grid-cols-3 gap-4">
                        <div><Label htmlFor="cidade">Cidade</Label><Input id="cidade" name="cidade" required /></div>
                        <div><Label htmlFor="estado">Estado</Label><Input id="estado" name="estado" maxLength={2} required /></div>
                        <div><Label htmlFor="cep">CEP</Label><Input id="cep" name="cep" required /></div>
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