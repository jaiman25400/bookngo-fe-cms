export interface ActivityFormData {
  activity_name: string;
  base_price: number | null;
  duration_hours: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
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

export interface CreateActivityPayload extends ActivityFormData {
  zone_id: number[];
  schedules: ActivitySchedulePayload[];
  holidays: ActivityHolidayPayload[];
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


export interface UpdateActivityPayload extends ActivityFormData {
  id: Number
  zones: UpdateZone[];
  schedules: ActivitySchedulePayload[];
  holidays: ActivityHolidayPayload[];
}
