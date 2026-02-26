import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogIn, UserPlus, MoreVertical } from "lucide-react"; // Importei MoreVertical
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { isAuthenticated, userRole, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold">
          Luar Cosméticos
        </Link>

        {/* --- NAVEGAÇÃO DESKTOP (Escondida no Mobile) --- */}
        <nav className="hidden md:flex gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary">Página Inicial</Link>
          <Link to="/catalog" className="text-sm font-medium hover:text-primary">Catálogo</Link>
        </nav>

        {/* Ícones de Ação */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Carrinho (Visível em Mobile e Desktop) */}
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          
          {/* --- PERFIL DESKTOP (Escondido no Mobile) --- */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userRole === 'ADMIN' ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard">Painel Admin</Link>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem asChild><Link to="/profile">Meu Perfil</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link to="/my-orders">Meus Pedidos</Link></DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login"><LogIn className="mr-2 h-4 w-4" /> Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/login"><UserPlus className="mr-2 h-4 w-4" /> Cadastre-se</Link>
                </Button>
              </div>
            )}
          </div>

          {/* --- MENU MOBILE (TRÊS PONTINHOS) --- */}
          {/* Só aparece em telas pequenas (md:hidden) */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Menu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Links de Navegação */}
                <DropdownMenuItem asChild><Link to="/">Página Inicial</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/catalog">Catálogo</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/cart">Carrinho ({totalItems})</Link></DropdownMenuItem>
                
                <DropdownMenuSeparator />

                {/* Área do Usuário Mobile */}
                {isAuthenticated ? (
                    <>
                        <DropdownMenuLabel>Conta</DropdownMenuLabel>
                        {userRole === 'ADMIN' ? (
                            <DropdownMenuItem asChild className="text-primary font-medium">
                                <Link to="/admin/dashboard">Painel Admin</Link>
                            </DropdownMenuItem>
                        ) : (
                            <>
                                <DropdownMenuItem asChild><Link to="/profile">Meu Perfil</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link to="/my-orders">Meus Pedidos</Link></DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-red-600">Sair</DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <DropdownMenuItem asChild><Link to="/login">Entrar</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link to="/login">Cadastrar-se</Link></DropdownMenuItem>
                    </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>
      </div>
    </header>
  );
};