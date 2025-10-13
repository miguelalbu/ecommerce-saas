import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, deleteCategory } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

const Categories = () => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Busca a lista de categorias
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Mutação para criar uma nova categoria
  const createMutation = useMutation({
    mutationFn: (name: string) => createCategory(name, token!),
    onSuccess: () => {
      toast({ title: 'Sucesso!', description: 'Categoria criada.' });
      setNewCategoryName('');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  // Mutação para deletar uma categoria
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id, token!),
    onSuccess: () => {
      toast({ title: 'Sucesso!', description: 'Categoria deletada.' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const handleCreate = () => {
    if (newCategoryName.trim()) {
      createMutation.mutate(newCategoryName.trim());
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gerenciar Categorias</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle>Nova Categoria</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Nome da categoria"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Criando...' : 'Criar'}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Categorias Existentes</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <p>Carregando...</p> : (
              <ul className="space-y-2">
                {categories?.map((cat) => (
                  <li key={cat.id} className="flex justify-between items-center p-2 border rounded">
                    <span>{cat.nome}</span>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(cat.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Categories;