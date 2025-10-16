import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getCategories, BACKEND_URL } from "@/services/apiService";

const Catalog = () => {
  // 1. ESTADOS PARA CONTROLAR OS FILTROS
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");

  // 2. BUSCAR CATEGORIAS E PRODUTOS DA API
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: products, isLoading: isLoadingProducts, error } = useQuery({
    // A queryKey agora depende dos filtros. Se um filtro mudar, o react-query refaz a busca.
    queryKey: ['products', selectedCategory, sortBy],
    queryFn: () => getProducts(undefined, selectedCategory, sortBy),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <div className="bg-muted/30 py-12">
          {/* ... (código do header da página inalterado) ... */}
        </div>

        {/* --- FILTROS DINÂMICOS --- */}
        <div className="border-b bg-background sticky top-16 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  Todos
                </Button>
                {/* Renderiza os botões de categoria dinamicamente */}
                {isLoadingCategories ? <p>...</p> : categories?.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.nome}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Destaques</SelectItem>
                    <SelectItem value="price-asc">Menor Preço</SelectItem>
                    <SelectItem value="price-desc">Maior Preço</SelectItem>
                    <SelectItem value="name">Nome A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* --- GRID DE PRODUTOS DINÂMICO --- */}
        <div className="container mx-auto px-4 py-12">
          {isLoadingProducts && <p className="text-center">Carregando produtos...</p>}
          {error && <p className="text-center text-destructive">Erro ao carregar produtos.</p>}
          
          {!isLoadingProducts && !error && (
            <>
              <div className="mb-6">
                <p className="text-muted-foreground">
                  {products?.length || 0} {products?.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products?.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.nome}
                    price={Number(product.preco)}
                    category={product.categoria.nome}
                    image={product.imageUrl}
                    stock={product.estoque}                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Catalog;