import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardDescription, CardTitle } from "../ui/card";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Product } from "@/interfaces/Product";
import { useAuth } from "@/AuthContext";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { user } = useAuth() || {};
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <Card
      className="w-56 flex flex-col p-5 h-fit gap-2 mr-4 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        navigate(
          pathname.split("/")[1] == "products"
            ? `/productupdate/${user?.userId}/${product.id}`
            : `/productdetail/${product.id}`
        );
      }}
    >
      {/* image carousel */}
      <div className="flex justify-center">
        <Carousel
          plugins={[
            Autoplay({
              delay: 2000,
            }),
          ]}
          className="w-56 h-44"
        >
          <CarouselContent>
            {product.productImage.map((img: string, idx: number) => (
              <CarouselItem key={idx} className="flex items-center justify-center bg-gray-100 h-44">
                <img src={img} className="w-full h-full object-cover"></img>{" "}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      <CardTitle className="pt-3">{product.productName}</CardTitle>
      <CardDescription className="">{product.productCategory}</CardDescription>
      <div className="flex justify-between">
        {product.productQuantity > 0 ? (
          <small className="text-sm font-medium text-gray-600">{product.productPrice}원</small>
        ) : (
          <small className="text-sm font-medium text-gray-600">SOLD OUT</small>
        )}
        {pathname.split("/")[1] == "products" && (
          <small className="text-sm font-medium text-red-500">{product.productQuantity}</small>
        )}
      </div>
      {pathname.split("/")[1] == "products" && (
        <p className="text-sm border-t pt-2 break-words text-gray-600">
          {product.productDescription}
        </p>
      )}
    </Card>
  );
};
