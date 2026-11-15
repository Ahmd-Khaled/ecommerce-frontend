import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/features/orders/types/order.types";

const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  confirmed: "default",
  processing: "default",
  shipped: "outline",
  delivered: "secondary",
  cancelled: "destructive",
  refunded: "destructive",
};

export function OrderStatusBadge({
  status,
  label,
}: {
  status: OrderStatus;
  label: string;
}) {
  return (
    <Badge variant={variants[status.toLowerCase()] ?? "outline"} className="rounded-full px-3 py-1 text-[11px] font-semibold">
      {label}
    </Badge>
  );
}
