export interface ActivityFormData {
  activity_name: string;
  activity_tagline: string | null;
  activity_description: string;
  age_group?: AgeGroup;
  base_price: number | null;
  requires_waiver: boolean;
  safety_instructions: string;
  duration_hours: number | null;
  start_date?: string | null;
  end_date?: string | null;
  booking_type: string;
  is_active: boolean;
  activity_thumbnail_image?: File;
  activity_image_gallery?: File[];
}

export enum AgeGroup {
  CHILD = "5+",
  TEEN = "10+",
  ADULT = "18+",
  SENIOR = "50+",
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
  age_group?: AgeGroup;
  booking_type: string;
  activity_tagline?: string;
  activity_description?: string;
  requires_waiver: boolean;
  safety_instructions?: string;
  activity_thumbnail_image?: string | null;
  activity_image_gallery?: string[] | null;
}

export interface ScheduleItem {
  day: string;
  start_time: string;
  end_time: string;
  is_24hours: boolean;
  is_holiday: boolean;
}

export interface currentActivityPayload extends UpdateActivityFormData {
  id: number;
  zones: UpdateZone[];
  schedules: ActivitySchedulePayload[];
  holidays: ActivityHolidayPayload[];
}


