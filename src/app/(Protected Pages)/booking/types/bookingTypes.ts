// Booking flow state types

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  tickets: number;
}

export interface BookingFlowState {
  step: number;
  customerInfo: CustomerInfo | null;
  selectedActivityId: number | null;
  selectedActivity: any | null;
  selectedDate: string | null;
  selectedTime: string | null;
  selectedZoneId: number | null;
  selectedZone: any | null;
  selectedRentals: RentalSelection[];
  bookingId: string | null;
}

export interface RentalSelection {
  equipmentId: number;
  equipmentName: string;
  sizeValue: string;
  sizeId: number;
  quantity: number;
  price: string;
}

// Step 1: Customer Information
export interface CustomerInfoFormData {
  name: string;
  email: string;
  phone: string;
  tickets: number;
}

// Step 2: Activity Selection
export interface ActivityOption {
  id: number;
  name: string;
  description?: string;
  base_price?: number;
}

// Step 3: Date & Time Selection
export interface DateTimeSelection {
  date: string;
  time: string;
}

// Step 4: Zone Selection
export interface ZoneOption {
  id: number;
  name: string;
  description: string;
  age_group: string;
  price: number;
  thumbnail?: string;
}

// Step 5: Rental Selection (Optional)
export interface RentalOption {
  id: number;
  name: string;
  description?: string;
  sizes: RentalSize[];
}

export interface RentalSize {
  id: number;
  value: string;
  available: number;
  price?: number;
}

// Step 6: Review & Payment
export interface BookingSummary {
  customerInfo: CustomerInfo;
  activityName: string;
  date: string;
  time: string;
  zoneName: string;
  tickets: number;
  activityPrice: number;
  rentalPrice: number;
  subtotal: number;
  tax: number;
  total: number;
  rentals?: RentalSelection[];
}
