export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | (string & {});

export interface OrderAddressSnapshot {
  label?: string;
  fullName?: string;
  phone?: string;
  country?: string;
  city?: string;
  street?: string;
  building?: string;
  apartment?: string;
}

export interface OrderItem {
  product: string;
  name: string | null;
  sku: string | null;
  quantity: number;
  unitPriceMinor?: number;
  lineTotalMinor?: number;
  image?: string | null;
}

export interface CustomerOrder {
  _id: string;
  status: OrderStatus;
  paymentStatus?: string;
  currency: string | null;
  currencyExponent?: number;
  subtotalMinor?: number;
  shippingMinor?: number;
  discountMinor?: number;
  taxMinor?: number;
  grandTotalMinor?: number;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  shippingAddress?: OrderAddressSnapshot;
  address?: OrderAddressSnapshot;
  cancellationReason?: string | null;
}

export interface OrdersPagination {
  page: number;
  limit: number;
  total?: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface OrdersListData {
  orders: CustomerOrder[];
  pagination: OrdersPagination;
}

export interface OrdersListEnvelope {
  success: boolean;
  data: OrdersListData;
}

export interface OrderEnvelope {
  success: boolean;
  data: CustomerOrder;
}

export interface CancelOrderPayload {
  reason?: string;
}
