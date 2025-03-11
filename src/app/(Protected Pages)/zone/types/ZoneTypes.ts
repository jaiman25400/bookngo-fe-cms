export interface Zone {
  id: number;
  name: string;
  description: string;
  capacity?: number | null; // Optional, can be null
  price?: string | null; // Optional, can be null
}

export interface CreateZone {
  name: string;
  description: string;
  capacity?: number | null; // Optional, can be null
  price?: string | null; // Optional, can be null
}
