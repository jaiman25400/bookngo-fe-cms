export interface Size {
  id?: number; // Optional id for sizes that already exist
  size: string;
  quantity: number;
  description?: string; // Optional descriptive details for the size
}

export interface InventoryItem {
  id: number;
  equipment_name: string;
  totalQuantity: number;
  availableQuantity: number;
  rental_price_per_hour: number;
  description: string; // Optional inventory description
  thumbnailImageUrl?: string | null; // Optional URL for the inventory thumbnail image
  sizes: Size[]; // ✅ Always an array
}

export interface CreateInventoryItem {
  equipment_name: string;
  totalQuantity: number | null;
  availableQuantity: number | null;
  rental_price_per_hour: number | null;
  description?: string; // Optional inventory description
  sizes: Size[]; // ✅ Always an array
  thumbnailImageUrl?: string; 
}

export interface UpdateInventoryItem {
  equipment_name: string;
  totalQuantity: number;
  availableQuantity: number;
  rental_price_per_hour: number;
  description?: string; // Optional inventory description
  thumbnailImageUrl?: string; // Optional URL for the inventory thumbnail image
  sizes: Size[]; // ✅ Always an array
}
