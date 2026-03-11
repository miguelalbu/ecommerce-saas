// /src/pages/admin/Users.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, UserCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, deleteUser, deleteCustomer } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
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

type DisplayUser = {
  id: string;
  nome: string;
  email: string;
  criadoEm: string;
  type: 'ADMIN' | 'CLIENTE';
};

const Users = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userToDelete, setUserToDelete] = useState<DisplayUser | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(token!),
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (user: DisplayUser) =>
      user.type === 'ADMIN' ? deleteUser(user.id, token!) : deleteCustomer(user.id, token!),
    onSuccess: () => {
      toast({ title: 'Sucesso!', description: 'Usuário removido.' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
    onSettled: () => setUserToDelete(null),
  });

  const allUsers: DisplayUser[] = data
    ? [
        ...data.admins.map((u: any) => ({ ...u, type: u.funcao as 'ADMIN' })),
        ...data.customers.map((u: any) => ({ ...u, type: 'CLIENTE' as const })),
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Gerenciar Usuários</h1>

      <Card>
        <CardHeader><CardTitle>Lista de Usuários</CardTitle></CardHeader>
        <CardContent className="p-0 md:p-6">
          {isLoading ? (
            <p className="p-6">Carregando...</p>
          ) : allUsers.length === 0 ? (
            <p className="p-6 text-muted-foreground">Nenhum usuário encontrado.</p>
          ) : (
            <ul className="divide-y">
              {allUsers.map((user) => (
                <li key={`${user.type}-${user.id}`} className="flex items-center gap-3 p-4">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted flex-shrink-0">
                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{user.nome}</span>
                      <Badge variant={user.type === 'ADMIN' ? 'default' : 'outline'} className="text-xs">
                        {user.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Cadastro: {formatDate(user.criadoEm)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => setUserToDelete(user)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá remover permanentemente o usuário
              <span className="font-bold"> {userToDelete?.nome}</span> ({userToDelete?.email}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && deleteMutation.mutate(userToDelete)}
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
