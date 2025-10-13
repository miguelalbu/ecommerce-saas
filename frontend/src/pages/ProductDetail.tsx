// /src/pages/ProductDetail.tsx

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart, Heart, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getProductById, BACKEND_URL } from "@/services/apiService";
import { useCart } from "@/context/CartContext";

type Product = {
  id: string;
  nome: string;
  preco: number;
  imageUrl?: string;
  categoria: { nome: string };
  estoque: number;
  descricao?: string;
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>(); // Pega o ID da URL
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['product', id], // Chave única para este produto específico
    queryFn: () => getProductById(id!), // Função que busca os dados
    enabled: !!id, // A busca só é ativada se o 'id' existir na URL
  });

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity); // Chama a função do contexto
    toast({
      title: "Produto adicionado!",
      description: `${quantity}x ${product.nome} foi adicionado ao carrinho.`,
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando produto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Erro ao carregar o produto: {error.message}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Produto não encontrado.</p>
      </div>
    );
  }

  // Se chegou até aqui, os dados foram carregados com sucesso!
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb agora é dinâmico */}
          <nav className="mb-8 text-sm text-muted-foreground animate-fade-in">
            <Link to="/" className="hover:text-primary">Home</Link> {" / "}
            <Link to="/catalog" className="hover:text-primary">Catálogo</Link> {" / "}
            <Link to={`/catalog?category=${product.categoria.nome}`} className="hover:text-primary">
              {product.categoria.nome}
            </Link> {" / "}
            <span className="text-foreground">{product.nome}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Imagem do Produto */}
            <div className="animate-fade-in">
              <div className="sticky top-24">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted shadow-elegant">
                  <img
                    src={product.imageUrl ? `${BACKEND_URL}/${product.imageUrl}` : `https://via.placeholder.com/600x600.png?text=Luar`}
                    alt={product.nome}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Informações do Produto */}
            <div className="animate-fade-in">
              <Badge className="mb-4">{product.categoria.nome}</Badge>
              
              <h1 className="text-4xl font-bold mb-4">{product.nome}</h1>
              
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl font-bold text-primary">
                  R$ {Number(product.preco).toFixed(2)}
                </span>
                <span className="text-muted-foreground">
                  ou 6x de R$ {(Number(product.preco) / 6).toFixed(2)} sem juros
                </span>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                {product.descricao || "Descrição não disponível."}
              </p>

              {/* Informação de Estoque */}
              {product.estoque < 5 && product.estoque > 0 && (
                <p className="text-destructive text-sm mb-4">
                  ⚠️ Apenas {product.estoque} unidades em estoque!
                </p>
              )}

              {/* Seletor de Quantidade */}
              <div className="flex items-center gap-4 mb-6">
                <span className="font-medium">Quantidade:</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(product.estoque, quantity + 1))}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.estoque === 0}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.estoque === 0 ? "Produto Indisponível" : "Adicionar ao Carrinho"}
                </Button>
                {/* ... (outros botões) ... */}
              </div>

              {/* ... (informações adicionais) ... */}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;