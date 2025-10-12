import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart, Heart, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import productLipstick from "@/assets/product-lipstick.jpg";

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const product = {
    id: 1,
    name: "Batom Matte Luxo Rosa",
    price: 89.90,
    image: productLipstick,
    category: "Maquiagem",
    stock: 15,
    description:
      "Batom de alta cobertura com acabamento matte e longa duração. Fórmula enriquecida com vitamina E e óleos naturais que hidratam os lábios. Cor vibrante e uniforme que dura até 12 horas.",
    features: [
      "Acabamento matte",
      "Longa duração (12h)",
      "Fórmula hidratante",
      "Vitamina E",
      "Cruelty-free",
    ],
  };

  const handleAddToCart = () => {
    toast({
      title: "Produto adicionado!",
      description: `${quantity}x ${product.name} adicionado ao carrinho.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-muted-foreground animate-fade-in">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            {" / "}
            <Link to="/catalog" className="hover:text-primary">
              Catálogo
            </Link>
            {" / "}
            <Link to={`/catalog?category=${product.category}`} className="hover:text-primary">
              {product.category}
            </Link>
            {" / "}
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="animate-fade-in">
              <div className="sticky top-24">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted shadow-elegant">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="animate-fade-in">
              <Badge className="mb-4">{product.category}</Badge>
              
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl font-bold text-primary">
                  R$ {product.price.toFixed(2)}
                </span>
                <span className="text-muted-foreground">
                  ou 6x de R$ {(product.price / 6).toFixed(2)} sem juros
                </span>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Features */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Características:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stock Info */}
              {product.stock < 5 && (
                <p className="text-destructive text-sm mb-4">
                  ⚠️ Apenas {product.stock} unidades em estoque!
                </p>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="font-medium">Quantidade:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Adicionar ao Carrinho
                </Button>
                <Button size="lg" variant="outline">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Additional Info */}
              <div className="border-t pt-6 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categoria:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disponibilidade:</span>
                  <span className="font-medium text-green-600">Em estoque</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete:</span>
                  <span className="font-medium">Calcular no checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
