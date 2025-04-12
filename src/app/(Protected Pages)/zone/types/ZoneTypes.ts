export interface Zone {
  id: number;
  name: string;
  description: string;
  status: ZoneStatus;

  // Optional fields
  capacity?: number | null;
  price?: string | null;
  age_group?: AgeGroup | null;
  zone_tagline?: string;

  // File handling
  zone_thumbnail_image?: string;
  zone_image_gallery?: string[];
}
export enum AgeGroup {
  CHILD = "5+",
  TEEN = "10+",
  ADULT = "18+",
  SENIOR = "50+",
}

export enum ZoneStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  CLOSED = "closed",
}

export interface CreateZoneFormData {
  // Required fields
  name: string;
  description: string;
  status: ZoneStatus;

  // Optional fields
  capacity?: string;
  price?: string;
  age_group?: AgeGroup;
  zone_tagline?: string;

  // File handling
  zone_thumbnail_image?: File;
  zone_image_gallery?: File[];
}

export interface UpdateZoneFormData {
  id: number;
  name: string;
  description: string;
  status: ZoneStatus;

  // Optional fields
  capacity?: number | null;
  price?: string | null;
  age_group?: AgeGroup | null;
  zone_tagline?: string;

  // File handling
  zone_thumbnail_image?: string | null;
  zone_image_gallery?: string[] | null;
  existingThumbnail?: string;
  existingGallery?: string[];
}
