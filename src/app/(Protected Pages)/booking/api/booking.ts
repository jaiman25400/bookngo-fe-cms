import axios, { AxiosError } from "axios";

const API_BASE_URL = process.env.SERVER_API_BASE_URL || "http://localhost:3000";

interface ApiError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
}

// Error response structure from API
interface ErrorResponse {
  message?: string;
  error?: string;
  [key: string]: unknown; // Allow other properties
}

// Rental equipment from API response
interface ApiRentalEquipment {
  id: number;
  equipment_name?: string;
  name?: string;
  equipment_description?: string;
  description?: string;
  rental_price_per_hour?: string;
  price?: string | number;
  sizes?: ApiRentalSize[];
}

interface ApiRentalSize {
  id: number;
  size?: string;
  value?: string;
  availableQuantity?: number;
  available?: number;
  price?: string | number;
}

// Activity Details for Booking
export interface ActivityBookingDetails {
  id: number;
  activity_name: string;
  activity_description: string;
  base_price: number;
  slot_interval_minutes: number;
  max_per_slot: number;
  provides_rentals: boolean;
  requires_waiver: boolean;
  start_date: string;
  end_date: string;
  zones: Zone[];
  schedules: Schedule[];
  holidays: Holiday[];
}

export interface Zone {
  id: number;
  name: string;
  description: string;
  age_group: string;
  capacity: number;
  price: number;
  status: string;
  zone_thumbnail_image?: string;
}

export interface Schedule {
  day: string;
  start_time: string | null;
  end_time: string | null;
  duration: string | null;
  price: string | null;
  is_24hours: boolean;
  is_holiday: boolean;
}

export interface Holiday {
  date: string;
}

// Available Time Slot
export interface TimeSlot {
  slotTime: string;
  availableTickets: number;
}

export interface AvailabilityResponse {
  success: boolean;
  data: {
    slots: TimeSlot[];
  };
}

// Rental Equipment
export interface RentalEquipment {
  id: number;
  name: string;
  description?: string;
  sizes: RentalSize[];
  price: number;
}

export interface RentalSize {
  id: number;
  value: string;
  available: number;
  price?: number;
}

// Booking Request/Response
export interface BookingRequest {
  userDetails: {
    name: string;
    email: string;
    phone: string;
  };
  activityId: number;
  vendorSlug: string; // Still required in payload, but backend validates/forces to employee's customer
  tickets: number;
  date: string;
  time: string;
  zoneId: number;
  zoneName: string;
  rentals?: RentalSelection[];
}

export interface RentalSelection {
  equipmentId: number;
  equipmentName: string;
  sizeValue: string;
  sizeId: number;
  quantity: number;
  price: string;
}

export interface BookingResponse {
  BookingID: string;
}

export interface BookingDetails {
  id: string;
  userDetails: {
    name: string;
    email: string;
    phone: string;
  };
  activityName: string;
  zoneName: string;
  date: string;
  time: string;
  tickets: number;
  activityPrice: number;
  rentalPrice: number;
  subtotal: number;
  tax: number;
  total: number;
  rentals?: RentalSelection[];
}

// ============ API Functions ============

/**
 * Get activities available to the logged-in employee (filtered by their vendor)
 * Uses existing activities endpoint - backend validates employee access
 */
export const getEmployeeActivities = async (): Promise<unknown[]> => {
  try {
    // Use existing activities endpoint - backend validates employee's vendor
    const response = await axios.get(`${API_BASE_URL}/activities`, {
      withCredentials: true,
      timeout: 10000,
    });
    return response.data || [];
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as ErrorResponse;
      
      const apiError: ApiError = {
        message: data?.message || data?.error || `Failed to fetch available activities (${status})`,
        status,
        isNetworkError: false,
      };
      throw apiError;
    } else if (axiosError.request) {
      const apiError: ApiError = {
        message: 'Unable to connect to the server. Please check your connection.',
        isNetworkError: true,
      };
      throw apiError;
    } else {
      const apiError: ApiError = {
        message: axiosError.message || 'An unexpected error occurred.',
        isNetworkError: false,
      };
      throw apiError;
    }
  }
};

/**
 * Get activity details for booking
 * CMS endpoint validates that activity belongs to logged-in customer
 */
export const getActivityBookingDetails = async (activityId: number): Promise<ActivityBookingDetails> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cms/bookings/activity/${activityId}`, {
      withCredentials: true,
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as ErrorResponse;
      
      const apiError: ApiError = {
        message: data?.message || data?.error || `Failed to fetch activity details (${status})`,
        status,
        isNetworkError: false,
      };
      throw apiError;
    } else if (axiosError.request) {
      const apiError: ApiError = {
        message: 'Unable to connect to the server. Please check your connection.',
        isNetworkError: true,
      };
      throw apiError;
    } else {
      const apiError: ApiError = {
        message: axiosError.message || 'An unexpected error occurred.',
        isNetworkError: false,
      };
      throw apiError;
    }
  }
};

/**
 * Check availability for a date and activity
 * CMS endpoint validates activity belongs to logged-in customer
 */
export const checkAvailability = async (date: string, activityId: number): Promise<AvailabilityResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cms/bookings/check-availability`, {
      params: { date, activityId },
      withCredentials: true,
      timeout: 10000,
    });
    console.log('Check Availability API Call:', {
      url: `${API_BASE_URL}/cms/bookings/check-availability`,
      params: { date, activityId },
      response: response.data
    });
    
    // Handle response structure (matching user frontend pattern)
    // Expected: { success: true, data: { slots: [...] } }
    const responseData = response.data;
    
    // If response already matches expected structure (response.data.data.slots)
    if (responseData?.success !== false && responseData?.data?.slots && Array.isArray(responseData.data.slots)) {
      return responseData;
    }
    
    // If response is directly an array of slots
    if (Array.isArray(responseData)) {
      return {
        success: true,
        data: {
          slots: responseData
        }
      };
    }
    
    // If response has a 'slots' property directly (response.data.slots)
    if (responseData?.slots && Array.isArray(responseData.slots)) {
      return {
        success: true,
        data: {
          slots: responseData.slots
        }
      };
    }
    
    // Default: return empty slots (no slots available)
    console.warn('Unexpected response structure from check-availability API:', responseData);
    return {
      success: true,
      data: {
        slots: []
      }
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as ErrorResponse;
      
      const apiError: ApiError = {
        message: data?.message || data?.error || `Failed to check availability (${status})`,
        status,
        isNetworkError: false,
      };
      throw apiError;
    } else if (axiosError.request) {
      const apiError: ApiError = {
        message: 'Unable to connect to the server. Please check your connection.',
        isNetworkError: true,
      };
      throw apiError;
    } else {
      const apiError: ApiError = {
        message: axiosError.message || 'An unexpected error occurred.',
        isNetworkError: false,
      };
      throw apiError;
    }
  }
};

/**
 * Get rental inventory for a booking
 * CMS endpoint validates activity belongs to logged-in customer
 * vendorSlug is handled internally by backend
 * 
 * Maps API response fields to match interface:
 * API returns: equipment_name, rental_price_per_hour, sizes[].size, sizes[].availableQuantity
 * Interface expects: name, price, sizes[].value, sizes[].available
 */
export const getRentalInventory = async (
  bookingDate: string,
  bookingTime: string,
  activityId: number
): Promise<RentalEquipment[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cms/bookings/rentals`, {
      params: {
        activityId,
        bookingDate,
        bookingTime,
      },
      withCredentials: true,
      timeout: 10000,
    });
    
    console.log('Get Rental Inventory API Call:', {
      url: `${API_BASE_URL}/cms/bookings/rentals`,
      params: { activityId, bookingDate, bookingTime },
      response: response.data
    });
    
    // Handle response: API returns array directly or wrapped in object
    const responseData = response.data as ApiRentalEquipment[] | { data?: ApiRentalEquipment[]; inventory?: ApiRentalEquipment[] };
    let inventoryArray: ApiRentalEquipment[] = [];
    
    if (Array.isArray(responseData)) {
      inventoryArray = responseData;
    } else if (responseData?.data && Array.isArray(responseData.data)) {
      inventoryArray = responseData.data;
    } else if (responseData?.inventory && Array.isArray(responseData.inventory)) {
      inventoryArray = responseData.inventory;
    }
    
    // Map API response fields to match our interface (matching user frontend field names)
    return inventoryArray.map((item: ApiRentalEquipment) => ({
      id: item.id,
      name: item.equipment_name || item.name || '', // Map equipment_name -> name
      description: item.equipment_description || item.description || undefined,
      price: parseFloat(String(item.rental_price_per_hour || item.price || 0)), // Map rental_price_per_hour -> price (as number)
      sizes: (item.sizes || []).map((size: ApiRentalSize) => ({
        id: size.id,
        value: size.size || size.value || '', // Map size -> value
        available: size.availableQuantity || size.available || 0, // Map availableQuantity -> available
        price: size.price ? parseFloat(String(size.price)) : undefined,
      })),
    }));
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as ErrorResponse;
      
      const apiError: ApiError = {
        message: data?.message || data?.error || `Failed to fetch rental inventory (${status})`,
        status,
        isNetworkError: false,
      };
      throw apiError;
    } else if (axiosError.request) {
      const apiError: ApiError = {
        message: 'Unable to connect to the server. Please check your connection.',
        isNetworkError: true,
      };
      throw apiError;
    } else {
      const apiError: ApiError = {
        message: axiosError.message || 'An unexpected error occurred.',
        isNetworkError: false,
      };
      throw apiError;
    }
  }
};

/**
 * Create booking (proceed to checkout)
 * CMS endpoint validates activity belongs to logged-in customer
 * vendorSlug is automatically set to employee's customer slug by backend
 */
export const createBooking = async (bookingData: BookingRequest): Promise<BookingResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/cms/bookings/proceedToCheckout`,
      bookingData,
      {
        withCredentials: true,
        timeout: 15000,
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as ErrorResponse;
      
      const apiError: ApiError = {
        message: data?.message || data?.error || `Failed to create booking (${status})`,
        status,
        isNetworkError: false,
      };
      throw apiError;
    } else if (axiosError.request) {
      const apiError: ApiError = {
        message: 'Unable to connect to the server. Please check your connection.',
        isNetworkError: true,
      };
      throw apiError;
    } else {
      const apiError: ApiError = {
        message: axiosError.message || 'An unexpected error occurred.',
        isNetworkError: false,
      };
      throw apiError;
    }
  }
};

/**
 * Get booking details for checkout
 * Reuses user API - backend should validate employee access
 */
export const getBookingDetails = async (bookingId: string): Promise<BookingDetails> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/bookings/bookingID`, {
      params: { id: bookingId },
      withCredentials: true,
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as ErrorResponse;
      
      const apiError: ApiError = {
        message: data?.message || data?.error || `Failed to fetch booking details (${status})`,
        status,
        isNetworkError: false,
      };
      throw apiError;
    } else if (axiosError.request) {
      const apiError: ApiError = {
        message: 'Unable to connect to the server. Please check your connection.',
        isNetworkError: true,
      };
      throw apiError;
    } else {
      const apiError: ApiError = {
        message: axiosError.message || 'An unexpected error occurred.',
        isNetworkError: false,
      };
      throw apiError;
    }
  }
};

/**
 * Confirm booking payment
 * CMS endpoint validates booking belongs to employee's customer
 */
export const confirmBookingPayment = async (bookingId: string): Promise<unknown> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/cms/bookings/confirmBooking`,
      { bookingId },
      {
        withCredentials: true,
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as ErrorResponse;
      
      const apiError: ApiError = {
        message: data?.message || data?.error || `Failed to confirm booking (${status})`,
        status,
        isNetworkError: false,
      };
      throw apiError;
    } else if (axiosError.request) {
      const apiError: ApiError = {
        message: 'Unable to connect to the server. Please check your connection.',
        isNetworkError: true,
      };
      throw apiError;
    } else {
      const apiError: ApiError = {
        message: axiosError.message || 'An unexpected error occurred.',
        isNetworkError: false,
      };
      throw apiError;
    }
  }
};
