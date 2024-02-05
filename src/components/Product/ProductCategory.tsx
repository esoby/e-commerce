import { Product } from "@/interfaces/Product";
import { ProductCard } from "./ProductCard";
import { db } from "@/firebase";
import { useDataLoad } from "@/hooks/useDataLoad";
import { collection, limit, orderBy, query, where } from "firebase/firestore";
import { useQuery } from "react-query";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  category: string;
}

export const ProductCategory = ({ category }: ProductCardProps) => {
  const { fetchData } = useDataLoad<Product>();

  const q = query(
    collection(db, "products"),
    orderBy("updatedAt", "desc"),
    where("productCategory", "==", category),
    limit(4)
  );

  const { data } = useQuery(category, () => fetchData(q, null));

  return (
    <div className="w-full border-b p-6 hover:bg-slate-100 overflow-scroll">
      <Link className="cursor-pointer" to={`/category/${category}`}>
        <h4 className="text-xl font-semibold tracking-tight absolute flex gap-4 items-center">
          {category} <ChevronRight color="#757575" />
        </h4>
        <div className="w-56 flex p-5 h-fit gap-2 mr-3 mt-6">
          {data?.data.map((product, i) => (
            <ProductCard product={product} key={i}></ProductCard>
          ))}
        </div>
      </Link>
    </div>
  );
};
