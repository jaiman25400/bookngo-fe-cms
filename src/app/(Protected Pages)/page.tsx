"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ClockIcon, ClipboardDocumentListIcon, MagnifyingGlassIcon, PlusIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { fetchDashboardOverview, fetchDashboardBookings, checkInBooking, getBookingDetailsForCheckIn, Booking, DashboardOverview } from "./api/dashboard";
import Notification from "@/components/Notification";
import CheckInModal from "./components/CheckInModal";

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "checked-in":
    case "CHECKED_IN":
      return "bg-green-100 text-green-800";
    case "confirmed":
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800";
    case "completed":
    case "COMPLETED":
      return "bg-gray-100 text-gray-800";
    case "cancelled":
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    case "staged":
    case "STAGED":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
};

// Helper function to get today's date in local timezone as YYYY-MM-DD
const getTodayLocalDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  // Initialize selectedDate with empty string to avoid hydration mismatch, then set it in useEffect
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [statusFilters, setStatusFilters] = useState<{ confirmed: boolean; staged: boolean }>({
    confirmed: true,
    staged: false,
  });
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
  }>({ message: '', type: 'info', visible: false });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Get today's date client-side only to avoid hydration mismatch
  const today = useMemo(() => {
    if (!isClient) return "";
    return getTodayLocalDate();
  }, [isClient]);

  // Set client-side flag and initial date after mount to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    if (!selectedDate) {
      setSelectedDate(getTodayLocalDate());
    }
  }, []); // Empty dependency array - only run once on mount

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ message, type, visible: true });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, visible: false }));
  }, []);

  const fetchData = useCallback(async (date?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const [overviewData, bookingsData] = await Promise.all([
        fetchDashboardOverview(date),
        fetchDashboardBookings(date),
      ]);
      
      setOverview(overviewData);
      setBookings(bookingsData);
    } catch (err: unknown) {
      const errorMessage = (err as { message?: string }).message || "Failed to load dashboard data.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate, fetchData]);

  const handleCreateBooking = () => {
    router.push("/booking/new");
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleCheckIn = async (booking: Booking) => {
    // Set basic booking data first (for immediate modal display)
    setSelectedBooking(booking);
    setIsCheckInModalOpen(true);

    // Fetch detailed booking information including rentals
    try {
      const detailedBooking = await getBookingDetailsForCheckIn(booking.id);
      // Update booking with detailed information (rentals, waiver status, etc.)
      setSelectedBooking(detailedBooking);
    } catch (err: unknown) {
      // If fetching details fails, still show modal with basic data
      // Error is logged but doesn't prevent modal from opening
      console.error('Failed to fetch detailed booking information:', err);
      // Optionally show a warning notification
      // showNotification("Could not load detailed booking information. Showing basic details.", 'warning');
    }
  };

  const handleConfirmCheckIn = async (paymentVerified: boolean, waiverSigned: boolean) => {
    if (!selectedBooking) return;

    setIsCheckingIn(true);
    try {
      // Call the check-in API
      const updatedBooking = await checkInBooking(selectedBooking.id, {
        paymentVerified,
        waiverSigned,
      });
      
      // Update booking status locally with the response from API
      // Merge the updated fields with existing booking data to preserve all details
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === selectedBooking.id
            ? {
                ...booking, // Preserve all existing booking data (customerName, price, etc.)
                ...updatedBooking, // Update with check-in response (status, checkedInAt, etc.)
              }
            : booking
        )
      );

      // Refresh bookings list and overview to ensure we have latest data
      try {
        const bookingsData = await fetchDashboardBookings(selectedDate);
        setBookings(bookingsData);
        const overviewData = await fetchDashboardOverview(selectedDate);
        setOverview(overviewData);
      } catch (refreshError) {
        // If refresh fails, the merged data above should still work
        console.warn('Failed to refresh bookings after check-in:', refreshError);
      }

      showNotification(`${selectedBooking.customerName} has been checked in successfully!`, 'success');
      setIsCheckInModalOpen(false);
      setSelectedBooking(null);
    } catch (err: unknown) {
      const errorMessage = (err as { message?: string }).message || "Failed to check in customer.";
      showNotification(errorMessage, 'error');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCancelCheckIn = () => {
    setIsCheckInModalOpen(false);
    setSelectedBooking(null);
  };

  // Format date for display (client-side only to avoid hydration mismatch)
  const formatDateForDisplay = (dateString: string) => {
    if (!isClient || !dateString) return dateString;
    if (dateString === today && today) return "Today";
    // Parse YYYY-MM-DD string in local timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter((booking) => {
    // Always show checked-in bookings regardless of filter
    const statusUpper = booking.status.toUpperCase();
    if (statusUpper === "CHECKED_IN") return true;
    
    // Filter by selected status (can have both CONFIRMED and STAGED selected)
    let matchesStatus = false;
    if (statusFilters.confirmed && statusUpper === "CONFIRMED") matchesStatus = true;
    if (statusFilters.staged && statusUpper === "STAGED") matchesStatus = true;
    if (!matchesStatus) return false;
    
    // Filter by search query
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      booking.customerName.toLowerCase().includes(query) ||
      booking.confirmationId.toLowerCase().includes(query)
    );
  });

  // Calculate total bookings count: only CONFIRMED + CHECKED_IN (exclude STAGED and other statuses)
  const totalBookingsCount = bookings.filter((booking) => {
    const statusUpper = booking.status.toUpperCase();
    return statusUpper === "CONFIRMED" || statusUpper === "CHECKED_IN";
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.visible}
          onClose={hideNotification}
        />
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bookings Overview
              </h1>
              <p className="text-gray-600 text-sm">
                {!selectedDate || !isClient 
                  ? "Loading..." 
                  : selectedDate === today 
                  ? "Today's bookings and activity" 
                  : `Bookings for ${formatDateForDisplay(selectedDate)}`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 rounded-lg px-4 py-3 border border-blue-100">
                <div className="flex items-center gap-3">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? "..." : totalBookingsCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search, Date Picker, Status Filter, and Create Booking Button */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            {/* First Row: Search, Date, and Create Button */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              {/* Search Bar */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by Last Name or Confirmation ID
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by last name or confirmation ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
              <input
                type="date"
                value={selectedDate}
                min={today || undefined}
                onChange={handleDateChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              </div>

              {/* Create Booking Button */}
              <button
                onClick={handleCreateBooking}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <PlusIcon className="h-5 w-5" />
                Create Booking
              </button>
            </div>

            {/* Second Row: Status Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filters
              </label>
              <div className="flex gap-4 items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statusFilters.confirmed}
                    onChange={(e) => setStatusFilters(prev => ({ ...prev, confirmed: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Confirmed</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statusFilters.staged}
                    onChange={(e) => setStatusFilters(prev => ({ ...prev, staged: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Staged</span>
                </label>
                <span className="text-xs text-gray-500 ml-2">
                  (Checked-in bookings always shown)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Bookings ({filteredBookings.length})
            </h2>
          </div>
        <div className="p-6">
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading bookings...</p>
          ) : error ? (
            <p className="text-red-500 text-center py-8">{error}</p>
          ) : filteredBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchQuery ? "No bookings found matching your search" : "No bookings for this date"}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {booking.customerName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Confirmation ID: <span className="font-mono">{booking.confirmationId}</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{booking.activityName}</p>
                      <p className="text-xs text-gray-500 mt-1">{booking.zoneName}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {formatStatus(booking.status)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {booking.timeSlot}
                      </div>
                      <div>
                        {booking.participants} participant{booking.participants > 1 ? "s" : ""}
                      </div>
                      <div className="font-semibold text-gray-900">
                        ${(booking.price ?? 0).toFixed(2)}
                      </div>
                    </div>
                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCheckIn(booking)}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Check In
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Check-In Modal */}
      <CheckInModal
        isOpen={isCheckInModalOpen}
        booking={selectedBooking}
        onConfirm={handleConfirmCheckIn}
        onCancel={handleCancelCheckIn}
        isLoading={isCheckingIn}
      />
    </div>
  );
}
