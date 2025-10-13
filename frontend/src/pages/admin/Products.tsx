// /src/admin/Products.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
// 1. IMPORTAR OS HOOKS E FUNÇÕES NECESSÁRIAS
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, deleteProduct, BACKEND_URL } from "@/services/apiService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
// 2. IMPORTAR OS COMPONENTES DO ALERT DIALOG
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// 3. (Opcional, mas recomendado) Definir um tipo para o objeto de produto para melhor organização
type Product = {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  categoria: { nome: string };
  imageUrl?: string;
};

// Função para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  // 4. ESTADO PARA CONTROLAR O DIALOG: Guarda o produto que o usuário quer deletar.
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { token } = useAuth();
  const { toast } = useToast();
  // 5. O QueryClient é o cérebro do react-query, usado para invalidar dados.
  const queryClient = useQueryClient();

  // Efeito para "atrasar" a busca (debouncing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Busca os produtos usando react-query.
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['products', debouncedSearchTerm],
    queryFn: () => getProducts(debouncedSearchTerm),
  });

  // 6. USEMUTATION: Hook do react-query para ações que modificam dados (Criar, Atualizar, Deletar).
  const deleteMutation = useMutation({
    mutationFn: (productId: string) => deleteProduct(productId, token!),
    // onSuccess é chamado quando a API retorna sucesso.
    onSuccess: () => {
      toast({ title: "Sucesso!", description: "Produto deletado com sucesso." });
      // A MÁGICA: Invalida a query 'products', forçando o react-query a buscar a lista atualizada.
      // A tela se atualiza sozinha, sem precisarmos manipular o estado manualmente.
      queryClient.invalidateQueries({ queryKey: ['products', debouncedSearchTerm] });
    },
    // onError é chamado quando a API retorna um erro.
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
    // onSettled é chamado ao final, seja sucesso ou erro. Usamos para fechar o dialog.
    onSettled: () => {
      setProductToDelete(null);
    }
  });

  // 7. FUNÇÃO PARA ABRIR O DIALOG: Chamada quando o usuário clica no ícone de lixeira.
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
  };

  // 8. FUNÇÃO PARA CONFIRMAR A EXCLUSÃO: Chamada quando o usuário clica em "Deletar" no dialog.
  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
  };
  
  if (isLoading) return <div>Carregando produtos...</div>;
  if (error) return <div>Erro ao carregar produtos: {error.message}</div>;

  return (
    <div>
      {/* O cabeçalho e a busca permanecem os mesmos */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Produtos</h1>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Link>
        </Button>
      </div>
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {products && products.length > 0 ? (
          products.map((product) => (
            <Card key={product.id} className="animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <img
                    src={product.imageUrl ? `${BACKEND_URL}/${product.imageUrl}` : `https://via.placeholder.com/80x80.png?text=${product.nome.charAt(0)}`}
                    alt={product.nome}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{product.nome}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="outline">{product.categoria.nome}</Badge>
                      <span>Estoque: {product.estoque}</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(Number(product.preco))}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link to={`/admin/products/edit/${product.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    {/* 9. BOTÃO DE DELETAR ATUALIZADO: Agora chama a função para abrir o dialog. */}
                    <Button variant="outline" size="icon" onClick={() => handleDeleteClick(product)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">Nenhum produto encontrado.</p>
        )}
      </div>

      {/* 10. DIALOG DE CONFIRMAÇÃO: Fica no final do JSX, invisível até que 'productToDelete' tenha um valor. */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente o produto 
              <span className="font-bold"> "{productToDelete?.nome}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;