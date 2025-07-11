import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

const formatPrice = (price: number) => {
  return `₹${price.toLocaleString("en-IN")}`;
};

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="overflow-hidden group card-premium bg-white border-premium hover:border-gold shadow-premium text-base">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={!imageError ? product.imageUrl : "/fallback-image.jpg"}
          alt={product.name}
          fill
          className="object-cover transition-premium group-hover:scale-105"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYa..."
          onError={() => setImageError(true)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-premium"></div>

        {product.tags?.length > 0 && (
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
            {product.tags.map((tag, idx) => (
              <Badge
                key={`${tag}-${idx}`}
                className="bg-premium-dark text-white border-0 font-sans-medium"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <h3 className="heading-premium text-lg text-premium mb-3 line-clamp-2">
          {product.name}
        </h3>
        <p className="body-premium text-base mb-4 line-clamp-2">
          {product.description}
        </p>
        <p className="text-xl font-sans-semibold text-premium">
          {formatPrice(product.price)}
        </p>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button
          className="w-full btn-secondary-premium group-hover:bg-premium-dark group-hover:text-white group-hover:border-premium-dark"
          onClick={() => onViewDetails?.(product)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
