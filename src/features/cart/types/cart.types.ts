export interface CartProduct {
  _id: string;
  name?: string;
  slug?: string;
  price?: number;
  images?: string[];
  stock?: number;
  isActive?: boolean;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
  available: boolean;
  unitPriceMinor?: number;
  subtotal: number;
  subtotalMinor: number;
}

export interface CartResponse {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  subtotalMinor: number;
  currency: string;
  currencyExponent: number;
  version: number;
}

export interface CartEnvelope {
  success: boolean;
  message: string;
  data: CartResponse;
}

export interface AddCartItemPayload {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemPayload {
  productId: string;
  quantity: number;
}
