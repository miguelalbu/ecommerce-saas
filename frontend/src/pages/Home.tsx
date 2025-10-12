import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Link } from "react-router-dom";
import { Sparkles, TruckIcon, Shield, CreditCard } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import productLipstick from "@/assets/product-lipstick.jpg";
import productPerfume from "@/assets/product-perfume.jpg";
import productCream from "@/assets/product-cream.jpg";
import oBoticario from "@/assets/oboticario.png";
import natura from "@/assets/natura.png";
import eudora from "@/assets/eudora.png";
import avon from "@/assets/avon.png";
import giovanna from "@/assets/giovanna.png";
import mahogany from "@/assets/mahogany.png";

const brands = [
  { name: "O Boticário", logo: oBoticario, },
  { name: "Natura", logo: natura, },
  { name: "Eudora", logo: eudora, },
  { name: "Avon", logo: avon, },
  { name: "Giovanna Baby", logo: giovanna, },
  { name: "Mahogany", logo: mahogany, },
]

const featuredProducts = [
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
];

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBanner}
            alt="Banner Principal"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>

        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-accent" />
              <span className="text-accent font-semibold tracking-wide"></span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Luar Cosméticos e Perfumaria
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Sua loja multimarcas de cosméticos, com entrega rápida e produtos de qualidade.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/catalog">Explorar Produtos</Link>
              </Button>
              <Button variant="accent" size="lg" asChild>
                <Link to="/catalog?promo=true">Ver Promoções</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-4 animate-fade-in">
              <div className="h-12 w-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TruckIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Frete Grátis</h3>
                <p className="text-sm text-muted-foreground">Acima de R$ 499</p>
              </div>
            </div>

            <div className="flex items-center gap-4 animate-fade-in">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Compra Segura</h3>
                <p className="text-sm text-muted-foreground">100% Protegida</p>
              </div>
            </div>

            <div className="flex items-center gap-4 animate-fade-in">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Parcelamento</h3>
                <p className="text-sm text-muted-foreground">Em até 12x</p>
              </div>
            </div>

            <div className="flex items-center gap-4 animate-fade-in">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Produtos Originais</h3>
                <p className="text-sm text-muted-foreground">Qualidade Garantida</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Produtos em Destaque
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Produtos recem adicionados e com Promoções.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/catalog">Ver Todos os Produtos</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              As Melhores Marcas em um Só Lugar
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Trabalhamos com as marcas mais amadas e confiáveis do mercado para garantir a sua satisfação.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:gap-x-16">
            {brands.map((brand) => (
              <img
                key={brand.name}
                src={brand.logo}
                alt={`Logo ${brand.name}`}
                className="h-10 md:h-12 object-contain cursor-pointer"
              />
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <Footer />
    </div>
  );
};

export default Home;
