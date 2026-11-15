export interface CheckoutItemConfirmation {
  productId: string;
  unitPriceMinor: number;
}

export interface CheckoutPayload {
  version: number;
  addressId: string;
  items: CheckoutItemConfirmation[];
}

export interface PlacedOrder {
  _id: string;
  status: string;
  paymentStatus: string;
  schemaVersion: number;
  currency: string | null;
  currencyExponent?: number;
  subtotalMinor?: number;
  shippingMinor?: number;
  discountMinor?: number;
  taxMinor?: number;
  grandTotalMinor?: number;
  createdAt: string;
  items: {
    product: string;
    name: string | null;
    sku: string | null;
    quantity: number;
    unitPriceMinor?: number;
    lineTotalMinor?: number;
  }[];
}

export interface CheckoutEnvelope {
  success: boolean;
  replayed: boolean;
  data: PlacedOrder;
}
