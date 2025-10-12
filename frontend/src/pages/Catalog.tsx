import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import productLipstick from "@/assets/product-lipstick.jpg";
import productPerfume from "@/assets/product-perfume.jpg";
import productCream from "@/assets/product-cream.jpg";

const allProducts = [
  {
    id: 1,
    name: "Batom Matte Luxo Rosa",
    price: 89.90,
    image: productLipstick,
    category: "Maquiagem",
    stock: 15,
    isNew: true,
  },
  {
    id: 2,
    name: "Perfume Golden Elegance 50ml",
    price: 249.90,
    image: productPerfume,
    category: "Perfumes",
    stock: 8,
    discount: 15,
  },
  {
    id: 3,
    name: "Creme Facial Anti-idade Premium",
    price: 179.90,
    image: productCream,
    category: "Skincare",
    stock: 3,
  },
  {
    id: 4,
    name: "Batom Nude Elegante",
    price: 79.90,
    image: productLipstick,
    category: "Maquiagem",
    stock: 20,
  },
  {
    id: 5,
    name: "Sérum Facial Vitamina C",
    price: 149.90,
    image: productCream,
    category: "Skincare",
    stock: 12,
    isNew: true,
  },
  {
    id: 6,
    name: "Perfume Floral Elegance 100ml",
    price: 329.90,
    image: productPerfume,
    category: "Perfumes",
    stock: 5,
  },
  {
    id: 7,
    name: "Paleta de Sombras Nude",
    price: 129.90,
    image: productLipstick,
    category: "Maquiagem",
    stock: 18,
    discount: 20,
  },
  {
    id: 8,
    name: "Hidratante Corporal Luxury",
    price: 89.90,
    image: productCream,
    category: "Skincare",
    stock: 25,
  },
];

const Catalog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");

  const filteredProducts = allProducts.filter(
    (product) => selectedCategory === "all" || product.category === selectedCategory
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <div className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2 animate-fade-in">Catálogo</h1>
            <p className="text-muted-foreground animate-fade-in">
              Explore nossa seleção completa de produtos premium
            </p>
          </div>
        </div>

        {/* Filters */}
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
                <Button
                  variant={selectedCategory === "Maquiagem" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("Maquiagem")}
                >
                  Maquiagem
                </Button>
                <Button
                  variant={selectedCategory === "Skincare" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("Skincare")}
                >
                  Skincare
                </Button>
                <Button
                  variant={selectedCategory === "Perfumes" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("Perfumes")}
                >
                  Perfumes
                </Button>
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
                
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="container mx-auto px-4 py-12">
          <div className="mb-6">
            <p className="text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Catalog;
