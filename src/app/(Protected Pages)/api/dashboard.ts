import axios, { AxiosError } from "axios";

const API_BASE_URL = process.env.SERVER_API_BASE_URL || "http://localhost:3000";

interface ApiError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
}

export interface DashboardOverview {
  date: string;
  totalBookings: number;
  confirmedBookings: number;
  stagedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
}

export interface RentalDetail {
  equipmentId: number;
  equipmentName: string;
  sizeId: number;
  sizeValue: string;
  quantity: number;
  price: number;
}

export interface Booking {
  id: string;
  confirmationId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  activityName: string;
  activityId: number;
  zoneName: string;
  zoneId: number;
  timeSlot: string;
  startTime: string;
  endTime: string;
  participants: number;
  status: string;
  paymentStatus: boolean;
  price?: number; // Made optional in case backend doesn't always return it
  activityPrice?: number;
  rentalPrice?: number;
  bookingDate: string;
  createdAt: string;
  // Detailed booking information (from GET /cms/bookings/:id)
  rentals?: RentalDetail[]; // Optional: only present when fetching detailed booking
  requiresWaiver?: boolean; // Optional: from activity data
  waiverSigned?: boolean; // Optional: from booking data
  waiverSignedAt?: string; // Optional: ISO 8601 timestamp when waiver was signed
  checkedInAt?: string; // Optional: ISO 8601 timestamp when customer was checked in
  checkedInBy?: string; // Optional: Employee ID or name who performed check-in
}

// Fetch dashboard overview (booking counts)
export const fetchDashboardOverview = async (date?: string): Promise<DashboardOverview> => {
  try {
    const params = date ? { date } : {};
    const response = await axios.get(`${API_BASE_URL}/cms/dashboard/overview`, {
      params,
      withCredentials: true,
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as any;
      
      const apiError: ApiError = {
        message: data?.message || `Failed to fetch dashboard overview (${status})`,
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

// Fetch dashboard bookings for a date
export const fetchDashboardBookings = async (date?: string): Promise<Booking[]> => {
  try {
    const params = date ? { date } : {};
    const response = await axios.get(`${API_BASE_URL}/cms/dashboard/bookings`, {
      params,
      withCredentials: true,
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as any;
      
      const apiError: ApiError = {
        message: data?.message || `Failed to fetch dashboard bookings (${status})`,
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
 * Get detailed booking information for check-in modal
 * This endpoint should return complete booking details including rentals, waiver status, etc.
 */
export const getBookingDetailsForCheckIn = async (bookingId: string): Promise<Booking> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cms/bookings/${bookingId}`, {
      withCredentials: true,
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as any;
      
      const apiError: ApiError = {
        message: data?.message || `Failed to fetch booking details (${status})`,
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

// Check-in a booking
export interface CheckInPayload {
  paymentVerified: boolean;
  waiverSigned: boolean;
}

export const checkInBooking = async (bookingId: string, payload: CheckInPayload): Promise<Booking> => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/cms/bookings/${bookingId}/check-in`,
      payload,
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
      const data = axiosError.response.data as any;
      
      const apiError: ApiError = {
        message: data?.message || `Failed to check in booking (${status})`,
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