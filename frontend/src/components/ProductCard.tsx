import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  isNew?: boolean;
  discount?: number;
}

export const ProductCard = ({
  id,
  name,
  price,
  image,
  category,
  stock,
  isNew,
  discount,
}: ProductCardProps) => {
  const finalPrice = discount ? price * (1 - discount / 100) : price;

  return (
    <Card className="group overflow-hidden hover:shadow-elegant transition-all duration-300 animate-fade-in">
      <Link to={`/product/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={image}
            alt={name}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
          />
          {isNew && (
            <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
              Novo
            </Badge>
          )}
          {discount && (
            <Badge className="absolute top-2 right-2 bg-primary">
              -{discount}%
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {category}
        </p>
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          {discount ? (
            <>
              <span className="text-lg font-bold text-primary">
                R$ {finalPrice.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                R$ {price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold">R$ {price.toFixed(2)}</span>
          )}
        </div>
        {stock < 5 && stock > 0 && (
          <p className="text-xs text-destructive mt-1">
            Apenas {stock} em estoque
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full" disabled={stock === 0}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {stock === 0 ? "Esgotado" : "Adicionar"}
        </Button>
      </CardFooter>
    </Card>
  );
};
