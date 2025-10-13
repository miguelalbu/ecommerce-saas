import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, ShoppingBag, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import path from "path";

const AdminLayout = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/products", label: "Produtos", icon: Package },
    { path: "/admin/orders", label: "Pedidos", icon: ShoppingBag },
    {  path: "/admin/categories", label: "Categorias", icon: Package },
    { path: "/admin/users", label: "Usuários", icon: Package }
  ];

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-secondary-foreground p-6 flex flex-col">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl font-bold">Luar Cosméticos</span>
          </div>
          <p className="text-sm text-secondary-foreground/70">Painel Admin</p>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  location.pathname === item.path &&
                    "bg-secondary-foreground/10 text-secondary-foreground font-semibold"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link to="/">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Link>
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
