export interface CustomerAddress {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  building?: string;
  apartment?: string;
  isDefault: boolean;
}

export interface AddressPayload {
  label: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  building?: string;
  apartment?: string;
  isDefault?: boolean;
}

export interface AddressEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}
