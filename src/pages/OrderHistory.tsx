import { useAuth } from "@/AuthContext";
import NavBar from "@/components/Common/NavBar";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { db } from "@/firebase";
import { useDataLoad } from "@/hooks/useDataLoad";
import { Order, OrderStatus } from "@/interfaces/Order";
import { Product } from "@/interfaces/Product";
import { Timestamp, collection, doc, getDoc, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type History = {
  orderGroupId: string;
  mainImageSrc: string;
  mainProductName: string;
  orderCreatedAt: Timestamp;
  orderStatus: OrderStatus;
  orderLength: number;
};

const OrderHistory = () => {
  const { fetchData } = useDataLoad<Order>();
  const { user } = useAuth() || {};
  const [history, setHistory] = useState<History[]>([]);

  useEffect(() => {
    const load = async () => {
      const q = query(
        collection(db, "order"),
        where("buyerId", "==", user?.userId),
        orderBy("createdAt", "desc")
      );
      const { data } = await fetchData(q, null);

      if (data) {
        const groupedData = Object.values(
          (data as Order[]).reduce((acc, cur) => {
            (acc[cur.orderGroupId] = acc[cur.orderGroupId] || []).push(cur);
            return acc;
          }, {} as Record<string, Order[]>)
        );

        const historyPromises = groupedData.map(async (group) => {
          const firstOrder = group[0];

          const collectionRef = collection(db, "products");
          const docRef = doc(collectionRef, firstOrder.productId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const product = docSnap.data() as Product;
            return {
              orderGroupId: firstOrder.orderGroupId,
              mainImageSrc: product.productImage[0],
              mainProductName: product.productName,
              orderCreatedAt: firstOrder.createdAt,
              orderStatus: firstOrder.status,
              orderLength: group.length,
            } as History;
          }
          return null;
        });

        const historyData = (await Promise.all(historyPromises)).filter(Boolean) as History[];
        setHistory(historyData);
      }
    };
    load();
  }, []);

  return (
    <>
      <NavBar />
      <div className="w-full flex flex-col items-center p-20 mt-16 gap-5">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Order History
        </h2>
        <div className="w-4/5 flex flex-col gap-4">
          {history?.map((lst, idx) => (
            <Link to={`/orderdetail/${user?.userId}/${lst.orderGroupId}`} key={idx}>
              <Card key={idx} className="flex items-center p-3 pl-4 hover:bg-slate-50">
                <img src={lst.mainImageSrc} className="w-20 h-20 object-cover" />
                <div className="ml-4">
                  <CardTitle className="text-lg m-0">주문 번호 : {lst.orderGroupId}</CardTitle>
                  <CardDescription className="text-gray-700 font-semibold">
                    {lst.mainProductName}
                    {lst.orderLength - 1 > 0 ? ` 외 ${lst.orderLength - 1}` : ""}
                  </CardDescription>
                  <CardDescription className="text-gray-400">
                    {lst.orderCreatedAt.toDate().toString().split(" ").slice(0, 5).join(" ")}
                  </CardDescription>
                  <CardDescription className="text-gray-500">{lst.orderStatus}</CardDescription>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default OrderHistory;
