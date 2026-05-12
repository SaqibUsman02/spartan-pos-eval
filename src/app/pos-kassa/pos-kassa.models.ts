export interface CartLine {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface ProductTile {
  id: string;
  label: string;
  productName: string;
  unitPrice: number;
  kind: 'color' | 'image';
  /** Tailwind bg-* class when kind === 'color' */
  colorClass: string;
  /** Optional hero image when kind === 'image' */
  imageUrl?: string;
}
