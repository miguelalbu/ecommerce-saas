// /src/admin/Products.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/apiService";

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

  // Efeito para "atrasar" a busca (debouncing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Espera 500ms após o usuário parar de digitar

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Busca os produtos usando react-query. A query refaz a busca quando 'debouncedSearchTerm' muda.
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', debouncedSearchTerm],
    queryFn: () => getProducts(debouncedSearchTerm),
  });

  if (isLoading) return <div>Carregando produtos...</div>;
  if (error) return <div>Erro ao carregar produtos: {error.message}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Produtos</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-4">
        {products && products.length > 0 ? (
          products.map((product) => (
            <Card key={product.id} className="animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <img
                    // Usamos uma imagem placeholder por enquanto. Você precisará de um campo para a URL da imagem no seu modelo de Produto.
                    src={`https://via.placeholder.com/80x80.png?text=${product.nome.charAt(0)}`}
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
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
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
    </div>
  );
};

export default Products;