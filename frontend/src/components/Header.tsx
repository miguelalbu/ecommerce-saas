import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogIn, UserPlus } from "lucide-react";
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
  // 2. PEGAR OS DADOS DE AUTENTICAÇÃO E DO CARRINHO
  const { isAuthenticated, userRole, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold">
          Luar Cosméticos
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary">Página Inicial</Link>
          <Link to="/catalog" className="text-sm font-medium hover:text-primary">Catálogo</Link>
          {/* Adicione outros links de navegação aqui se precisar */}
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-4">
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
          
          {/* --- 3. LÓGICA DE AUTENTICAÇÃO --- */}
          {isAuthenticated ? (
            // SE ESTIVER LOGADO: MOSTRA O MENU DO PERFIL
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Meu Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  {/* TODO: Criar esta página no futuro */}
                  <Link to="/my-orders">Meus Pedidos</Link>
                </DropdownMenuItem>

                {/* Mostra um link para o painel de admin se o usuário for um admin */}
                {userRole === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard">Painel Admin</Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                {/* O botão de sair não é um Link, ele chama a função 'logout' */}
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // SE NÃO ESTIVER LOGADO: MOSTRA OS BOTÕES DE ENTRAR/CADASTRAR
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </Link>
              </Button>
              <Button asChild>
                <Link to="/login">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Cadastre-se
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};