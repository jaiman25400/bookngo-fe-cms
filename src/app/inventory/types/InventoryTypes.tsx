export interface Size {
  id?: number;  // Optional id for sizes that already exist
  size: string;
  quantity: number;
}


export interface InventoryItem {
  id: number;
  equipment_name: string;
  totalQuantity: number;
  availableQuantity: number;
  sizes: Size[]; // ✅ Always an array
}

export interface UpdateInventoryItem {
  equipment_name: string;
  totalQuantity: number;
  availableQuantity: number;
  sizes: Size[]; // ✅ Always an array
}