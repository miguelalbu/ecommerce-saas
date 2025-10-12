import { ShoppingCart, Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Luar Cosméticos
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/catalog" className="text-sm font-medium transition-colors hover:text-primary">
                Produtos
              </Link>
              <Link to="/catalog?category=makeup" className="text-sm font-medium transition-colors hover:text-primary">
                Maquiagem
              </Link>
              <Link to="/catalog?category=skincare" className="text-sm font-medium transition-colors hover:text-primary">
                Skincare
              </Link>
              <Link to="/catalog?category=perfume" className="text-sm font-medium transition-colors hover:text-primary">
                Perfumes
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <Input
                type="search"
                placeholder="Buscar produtos..."
                className="w-64"
              />
              <Button size="icon" variant="ghost">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <Button size="icon" variant="ghost" asChild>
              <Link to="/login">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            
            <Button size="icon" variant="ghost" asChild className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  0
                </span>
              </Link>
            </Button>

            <Button size="icon" variant="ghost" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
