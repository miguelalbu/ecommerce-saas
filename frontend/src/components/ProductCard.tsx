// /src/components/ProductCard.tsx

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { BACKEND_URL } from "@/services/apiService";

// Corrigido: 'id' é string, 'image' é opcional
interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  stock: number;
  isNew?: boolean;
  discount?: number;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const ProductCard = (props: ProductCardProps) => {
  const { id, name, price, image, category, stock, isNew, discount } = props;
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const { toast } = useToast();

  // Verifica se este produto específico já está no carrinho
  const itemInCart = cartItems.find(item => item.id === id);

  const finalPrice = discount ? price * (1 - discount / 100) : price;
  const hasStock = stock > 0;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // O objeto passado aqui agora corresponde ao que o CartContext espera
    addToCart({ id, name, price: finalPrice, image }, 1);
    toast({
      title: "Produto adicionado!",
      description: `"${name}" foi adicionado ao seu carrinho.`,
    });
  };

  return (
    <Card className="group h-full flex flex-col overflow-hidden hover:shadow-elegant transition-all duration-300 animate-fade-in">
      <Link to={`/product/${id}`} className="flex-grow flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={image ? `${BACKEND_URL}/${image}` : `https://via.placeholder.com/300x300.png?text=Luar`}
            alt={name}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
          />
          {isNew && <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">Novo</Badge>}
          {discount && <Badge className="absolute top-2 right-2 bg-primary">-{discount}%</Badge>}
        </div>
        <CardContent className="p-4 flex-grow flex flex-col">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{category}</p>
          <h3 className="font-semibold line-clamp-2 flex-grow">{name}</h3>
          <div className="mt-2 flex items-baseline gap-2">
            {discount ? (
              <>
                <span className="text-lg font-bold text-primary">{formatCurrency(finalPrice)}</span>
                <span className="text-sm text-muted-foreground line-through">{formatCurrency(price)}</span>
              </>
            ) : (
              <span className="text-lg font-bold">{formatCurrency(price)}</span>
            )}
          </div>
          {stock < 5 && stock > 0 && <p className="text-xs text-destructive mt-1">Apenas {stock} em estoque</p>}
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0">
        {/* --- LÓGICA DE RENDERIZAÇÃO CONDICIONAL DO BOTÃO --- */}
        {!hasStock ? (
          <Button variant="outline" className="w-full" disabled>Esgotado</Button>
        ) : itemInCart ? (
          <div className="flex w-full items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => itemInCart.quantity > 1 ? updateQuantity(id, -1) : removeFromCart(id)}>
              {itemInCart.quantity > 1 ? <Minus className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-destructive" />}
            </Button>
            <span className="font-bold text-lg">{itemInCart.quantity}</span>
            <Button variant="outline" size="icon" onClick={() => updateQuantity(id, 1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};