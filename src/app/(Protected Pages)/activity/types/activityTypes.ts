export interface ActivityFormData {
  activity_name: string;
  activity_tagline: string | null;
  activity_description: string;
  age_group?: AgeGroup;
  base_price: number | null;
  slot_interval_minutes: number;
  max_per_slot: number;
  requires_waiver: boolean;
  provides_rentals: boolean;
  safety_instructions: string;
  duration_hours: number | null;
  start_date?: string | null;
  end_date?: string | null;
  booking_type: string;
  activity_type?: ActivityType;
  is_active: boolean;
  activity_thumbnail_image?: File;
  activity_image_gallery?: File[];
  redirect_to_external_website?: boolean;
  external_booking_url?: string | null;
}

export enum AgeGroup {
  CHILD = "5+",
  TEEN = "10+",
  ADULT = "18+",
  SENIOR = "50+",
}

export enum ActivityType {
  SKIING = "skiing",
  SKATING = "skating",
  HIKING = "hiking",
  SNOWBOARDING = "snowboarding",
  TUBING = "tubing",
}

export interface CreateActivityPayload extends ActivityFormData {
  zone_id: number[];
  schedules: ActivitySchedulePayload[];
  holidays: ActivityHolidayPayload[];
}

export interface ActivitySchedulePayload {
  day: string;
  start_time: string | null;
  end_time: string | null;
  duration: string | null;
  price: string | null;
  is_24hours: boolean;
  is_holiday: boolean;
}

export interface ActivityHolidayPayload {
  date: string;
}

export interface Zone {
  id: number;
  name: string;
  // Add other zone properties as needed
}

interface UpdateZone {
  id: number;
  name: string;
  description: string;
  capacity: number;
  price: string;
}

export interface UpdateActivityFormData {
  id: number;
  activity_name: string;
  base_price: string; // using string for form state
  duration_hours: string; // using string for form state
  start_date: string;
  end_date: string;
  is_active: boolean;
  slot_interval_minutes: number;
  max_per_slot: number;
  age_group?: AgeGroup;
  activity_type?: ActivityType;
  booking_type: string;
  activity_tagline?: string;
  activity_description?: string;
  requires_waiver: boolean;
  provides_rentals: boolean;
  safety_instructions?: string;
  activity_thumbnail_image?: string | null;
  activity_image_gallery?: string[] | null;
  redirect_to_external_website?: boolean;
  external_booking_url?: string | null;
}

export interface ScheduleItem {
  day: string;
  start_time: string;
  end_time: string;
  duration: string;
  price: string;
  is_24hours: boolean;
  is_holiday: boolean;
}

export interface currentActivityPayload extends UpdateActivityFormData {
  id: number;
  zones: UpdateZone[];
  schedules: ActivitySchedulePayload[];
  holidays: ActivityHolidayPayload[];
}
