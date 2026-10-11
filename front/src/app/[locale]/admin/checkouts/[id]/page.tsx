'use client'

import { useOrder } from "@/hooks/order.hook";
import { useParams } from "next/navigation";
import OrderDetailsPage from "./OrderDetailsPage";

export default function ShowDetailCheckout() {
    const params = useParams();
    const { data, isLoading } = useOrder((params?.id)?.toString() || '')
    if (isLoading || !data?.id) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-12 text-center text-muted-foreground">
                در حال بارگذاری سفارش...
            </div>
        );
    }
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <OrderDetailsPage data={data} isAdmin />
        </div>
    )
}