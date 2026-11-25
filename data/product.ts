export type ProductStatus = "active" | "inactive";

export interface ProductVariant {
  id: string; // unique id for variant

  color: string;
  size: string;

  stock: number; // stock per size + color
  fit?: string; // e.g. "small", "true to size", "large"
}

export interface Product {
  id: string;

  title: string;
  description: string;

  category: string;

  /** Public label name for the multi-brand storefront, when provided by the catalog. */
  brandName?: string;
  audience?: string;
  gender?: string;

  price: number;

  status: ProductStatus;
  isBestSeller: boolean;

  originalPrice?: number;
  offerId?: string;

  images: string[];
  /** Dedicated transparent mannequin mockups, separate from catalog photos. */
  stylingSlot?: "top" | "bottom" | "";
  colorMockups?: { color: string; image: string }[];
  shareCount?: number;

  variants: ProductVariant[];
  averageRating?: number;
  reviewCount?: number;

  createdAt?: any;
  updatedAt?: any;
}
