// /src/pages/admin/Users.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, deleteUser, deleteCustomer } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR');

// Tipo para unificar a estrutura de Admin e Cliente para a tabela
type DisplayUser = {
  id: string;
  nome: string;
  email: string;
  criadoEm: string;
  type: 'ADMIN' | 'CLIENTE';
};

const Users = () => {
  const { token, userRole } = useAuth(); // Pegar a role do usuário logado
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userToDelete, setUserToDelete] = useState<DisplayUser | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(token!),
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (user: DisplayUser) => {
      // Decide qual função da API chamar com base no tipo do usuário
      if (user.type === 'ADMIN') {
        return deleteUser(user.id, token!);
      }
      return deleteCustomer(user.id, token!);
    },
    onSuccess: () => {
      toast({ title: 'Sucesso!', description: 'Usuário removido.' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
    onSettled: () => setUserToDelete(null),
  });

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete);
    }
  };

  // Combina e formata as listas de admins e clientes
  const allUsers: DisplayUser[] = data
    ? [
        ...data.admins.map(u => ({ ...u, type: u.funcao as 'ADMIN' })),
        ...data.customers.map(u => ({ ...u, type: 'CLIENTE' as const })),
      ]
    : [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gerenciar Usuários</h1>
      <Card>
        <CardHeader><CardTitle>Lista de Usuários</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p>Carregando...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow key={`${user.type}-${user.id}`}>
                    <TableCell className="font-medium">{user.nome}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.type === 'ADMIN' ? 'default' : 'outline'}>
                        {user.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.criadoEm)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setUserToDelete(user)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmação */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá remover permanentemente o usuário 
              <span className="font-bold"> {userToDelete?.nome}</span> ({userToDelete?.email}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users;