"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  UserIcon, 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  ShoppingBagIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import Notification from "@/components/Notification";
import { 
  getEmployeeActivities,
  getActivityBookingDetails,
  checkAvailability,
  getRentalInventory,
  createBooking,
  confirmBookingPayment,
  getBookingDetails,
  ActivityBookingDetails,
  RentalEquipment,
  BookingRequest,
  BookingDetails
} from "../api/booking";
import { fetchProfileData } from "../../profile/api/profilepage";
import { CustomerInfoFormData, RentalSelection } from "../types/bookingTypes";

type BookingStep = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS = [
  { number: 1, title: "Customer Info", icon: UserIcon },
  { number: 2, title: "Activity", icon: CalendarIcon },
  { number: 3, title: "Date & Time", icon: ClockIcon },
  { number: 4, title: "Zone", icon: MapPinIcon },
  { number: 5, title: "Rentals", icon: ShoppingBagIcon },
  { number: 6, title: "Review", icon: CheckCircleIcon },
];

export default function NewBookingPage() {
  const router = useRouter();
  
  // Step management
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  
  // Notification
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
  }>({ message: '', type: 'info', visible: false });
  
  // Profile/vendor data
  const [vendorSlug, setVendorSlug] = useState<string>("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Step 1: Customer Info
  const [customerInfo, setCustomerInfo] = useState<CustomerInfoFormData>({
    name: "",
    email: "",
    phone: "",
    tickets: 1,
  });
  const [customerInfoErrors, setCustomerInfoErrors] = useState<Partial<CustomerInfoFormData>>({});
  
  // Activity type from API response
  interface ActivityItem {
    id: number;
    activity_name: string;
    activity_tagline?: string;
    activity_description?: string;
    base_price?: number | string;
  }

  // Step 2: Activity Selection
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [activityDetails, setActivityDetails] = useState<ActivityBookingDetails | null>(null);
  const [loadingActivities, setLoadingActivities] = useState(true);
  
  // Step 3: Date & Time
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<{ slotTime: string; availableTickets: number }[]>([]); // Changed to array to match user frontend
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null); // Added dedicated error state
  
  // Step 4: Zone Selection
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [selectedZone, setSelectedZone] = useState<{ id: number; name: string; description?: string; price?: number; zone_thumbnail_image?: string } | null>(null);
  
  // Step 5: Rentals
  const [selectedRentals, setSelectedRentals] = useState<RentalSelection[]>([]);
  const [rentalInventory, setRentalInventory] = useState<RentalEquipment[]>([]);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [loadingRentals, setLoadingRentals] = useState(false);
  
  // Step 6: Review & Payment
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ message, type, visible: true });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, visible: false }));
  }, []);

  // Fetch profile/vendor slug on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await fetchProfileData();
        if (profile.customer_slug) {
          setVendorSlug(profile.customer_slug);
        }
      } catch (err: unknown) {
        const errorMessage = (err as { message?: string }).message || "Failed to load profile.";
        showNotification(errorMessage, 'error');
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [showNotification]);

  // Fetch activities on mount
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        const data = await getEmployeeActivities();
        setActivities((data || []) as ActivityItem[]);
      } catch (err: unknown) {
        const errorMessage = (err as { message?: string }).message || "Failed to load activities.";
        showNotification(errorMessage, 'error');
      } finally {
        setLoadingActivities(false);
      }
    };
    fetchActivities();
  }, [showNotification]);

  // Fetch activity details when activity is selected
  useEffect(() => {
    if (!selectedActivityId) return;
    
    const fetchDetails = async () => {
      try {
        const details = await getActivityBookingDetails(selectedActivityId);
        setActivityDetails(details);
      } catch (err: unknown) {
        const errorMessage = (err as { message?: string }).message || "Failed to load activity details.";
        showNotification(errorMessage, 'error');
      }
    };
    fetchDetails();
  }, [selectedActivityId, showNotification]);

  // Check availability when date is selected (matching user frontend logic)
  useEffect(() => {
    if (!selectedDate || !selectedActivityId) {
      setAvailableSlots([]);
      setSlotError(null);
      return;
    }
    
    const fetchAvailability = async () => {
      try {
        setLoadingSlots(true);
        setSlotError(null);
        setAvailableSlots([]); // Clear previous slots
        
        // Format date to YYYY-MM-DD (already in correct format from date input, but ensure consistency)
        const formattedDate = selectedDate; // Date input already provides YYYY-MM-DD format
        
        const availability = await checkAvailability(formattedDate, selectedActivityId);
        
        // Handle response structure (matching user frontend: response.data.data.slots)
        if (availability?.success !== false && availability?.data?.slots && Array.isArray(availability.data.slots)) {
          // Extract slots array from response.data.slots
          setAvailableSlots(availability.data.slots);
        } else if (Array.isArray(availability)) {
          // Direct array response
          setAvailableSlots(availability);
        } else {
          // No slots or unexpected structure
          setAvailableSlots([]);
        }
      } catch (err: unknown) {
        console.error('Availability API Error:', err);
        const errorMessage = (err as { message?: string }).message || "Failed to fetch available slots. Please try selecting another date.";
        setSlotError(errorMessage);
        setAvailableSlots([]);
        showNotification(errorMessage, 'error');
      } finally {
        setLoadingSlots(false);
      }
    };
    
    fetchAvailability();
  }, [selectedDate, selectedActivityId, showNotification]);

  // Fetch rental inventory when date/time/activity are selected
  useEffect(() => {
    if (!selectedDate || !selectedTime || !selectedActivityId || !activityDetails?.provides_rentals) return;
    
    const fetchRentals = async () => {
      try {
        setLoadingRentals(true);
        const rentals = await getRentalInventory(selectedDate, selectedTime, selectedActivityId);
        setRentalInventory(rentals);
      } catch {
        // Silently fail - rentals are optional
        setRentalInventory([]);
      } finally {
        setLoadingRentals(false);
      }
    };
    fetchRentals();
  }, [selectedDate, selectedTime, selectedActivityId, activityDetails?.provides_rentals]);

  // Validation
  const validateCustomerInfo = (): boolean => {
    const errors: Partial<CustomerInfoFormData> = {};
    
    if (!customerInfo.name || customerInfo.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerInfo.email || !emailRegex.test(customerInfo.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    const phoneDigits = customerInfo.phone.replace(/\D/g, '');
    if (!customerInfo.phone || phoneDigits.length < 10) {
      errors.phone = "Phone number must contain at least 10 digits";
    }
    
    if (!customerInfo.tickets || customerInfo.tickets < 1 || customerInfo.tickets > 20) {
      // Type assertion for error message
      (errors as { tickets?: string }).tickets = "Tickets must be between 1 and 20";
    }
    
    setCustomerInfoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateCustomerInfo()) {
        showNotification("Please fix the errors in the form", 'error');
        return;
      }
    }
    
    if (currentStep < 6) {
      setCurrentStep((prev) => (prev + 1) as BookingStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as BookingStep);
    } else {
      router.back();
    }
  };

  // Get today's date in local timezone
  const getTodayLocalDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  // Calculate total price
  const calculateTotal = () => {
    if (!activityDetails || !selectedZone) return 0;
    
    const zonePrice = selectedZone.price || activityDetails.base_price || 0;
    const activityPrice = zonePrice * customerInfo.tickets;
    
    const rentalTotal = selectedRentals.reduce((sum, rental) => {
      return sum + (parseFloat(rental.price) * rental.quantity);
    }, 0);
    
    const subtotal = activityPrice + rentalTotal;
    const tax = subtotal * 0.13; // HST 13%
    return subtotal + tax;
  };

  // Submit booking (Step 5 -> Step 6)
  const handleSubmitBooking = async () => {
    if (!selectedActivityId || !selectedDate || !selectedTime || !selectedZoneId || !vendorSlug) {
      showNotification("Please complete all required fields", 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingRequest: BookingRequest = {
        userDetails: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
        },
        activityId: selectedActivityId,
        vendorSlug: vendorSlug, // Backend will validate/override this
        tickets: customerInfo.tickets,
        date: selectedDate,
        time: selectedTime,
        zoneId: selectedZoneId,
        zoneName: selectedZone?.name || "",
        rentals: selectedRentals.length > 0 ? selectedRentals : undefined,
      };

      console.log('Create Booking - API Call:', {
        endpoint: `${process.env.SERVER_API_BASE_URL || 'http://localhost:3000'}/cms/bookings/proceedToCheckout`,
        request: bookingRequest
      });

      const response = await createBooking(bookingRequest);
      
      console.log('Create Booking - Response:', response);

      // Handle different possible response structures
      // Expected: { BookingID: "uuid" }
      // Possible alternatives: { bookingId: "uuid" }, { id: "uuid" }, { data: { BookingID: "uuid" } }
      const responseData = response as { BookingID?: string; bookingId?: string; id?: string; data?: { BookingID?: string; bookingId?: string; id?: string } };
      const bookingIdFromResponse = 
        responseData?.BookingID || 
        responseData?.bookingId || 
        responseData?.id || 
        responseData?.data?.BookingID ||
        responseData?.data?.bookingId ||
        responseData?.data?.id;

      if (!bookingIdFromResponse) {
        console.error('Create Booking - No bookingId in response:', response);
        showNotification("Booking created but ID not found in response. Please contact support.", 'error');
        return;
      }

      console.log('Create Booking - Extracted bookingId:', bookingIdFromResponse);
      setBookingId(bookingIdFromResponse);
      
      // Fetch booking details
      try {
        const details = await getBookingDetails(bookingIdFromResponse);
        setBookingDetails(details);
        console.log('Create Booking - Booking details fetched:', details);
      } catch (detailsError) {
        console.warn('Create Booking - Failed to fetch booking details:', detailsError);
        // Continue even if details fetch fails - we have the bookingId
      }
      
      setCurrentStep(6);
    } catch (err: unknown) {
      console.error('Create Booking - Error:', err);
      const errorMessage = (err as { message?: string }).message || "Failed to create booking.";
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm payment (Step 6) - matching user frontend logic
  const handleConfirmPayment = async () => {
    // Validation: Check if bookingId exists (matching user frontend)
    if (!bookingId) {
      console.error('Confirm Payment - Missing bookingId');
      showNotification("Booking ID is missing. Cannot confirm payment.", 'error');
      return;
    }

    // Set loading state (matching user frontend)
    setIsConfirming(true);

    try {
      console.log('Confirm Payment - API Call:', {
        bookingId,
        endpoint: `${process.env.SERVER_API_BASE_URL || 'http://localhost:3000'}/cms/bookings/confirmBooking`
      });

      // API Call: POST /cms/bookings/confirmBooking
      // Body: { bookingId: "uuid" }
      const response = await confirmBookingPayment(bookingId);

      console.log('Confirm Payment - Success Response:', response);

      // Success: Show confirmation message (matching user frontend)
      showNotification("Booking confirmed successfully! Payment processed.", 'success');
      
      // Redirect to dashboard after 3 seconds (matching user frontend pattern)
      setTimeout(() => {
        console.log('Confirm Payment - Redirecting to dashboard');
        router.push('/');
      }, 3000);
    } catch (err: unknown) {
      console.error('Confirm Payment - Error:', err);
      const axiosError = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      
      let errorMessage = "Payment confirmation failed. Please try again.";
      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }
      
      console.error('Confirm Payment - Error Message:', errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      // Always reset loading state (matching user frontend)
      setIsConfirming(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1CustomerInfo();
      case 2:
        return renderStep2ActivitySelection();
      case 3:
        return renderStep3DateTime();
      case 4:
        return renderStep4ZoneSelection();
      case 5:
        return renderStep5Rentals();
      case 6:
        return renderStep6Review();
      default:
        return null;
    }
  };

  // Step 1: Customer Information
  const renderStep1CustomerInfo = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Booking</h2>
        <p className="text-gray-600 mb-6">Please fill in customer details to proceed with the booking.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  customerInfoErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter customer's full name"
              />
            </div>
            {customerInfoErrors.name && (
              <p className="mt-1 text-sm text-red-600">{customerInfoErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  customerInfoErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="customer@example.com"
              />
            </div>
            {customerInfoErrors.email && (
              <p className="mt-1 text-sm text-red-600">{customerInfoErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  customerInfoErrors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="(555) 123-4567"
              />
            </div>
            {customerInfoErrors.phone && (
              <p className="mt-1 text-sm text-red-600">{customerInfoErrors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Tickets <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <input
                type="number"
                min="1"
                max="20"
                value={customerInfo.tickets}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, tickets: parseInt(e.target.value) || 1 }))}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  customerInfoErrors.tickets ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Maximum 20 tickets per booking</p>
            {customerInfoErrors.tickets && (
              <p className="mt-1 text-sm text-red-600">{customerInfoErrors.tickets}</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Summary Card (Right Side) - Shown if activity is selected */}
      {selectedActivityId && activityDetails && (
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-4">
            {activityDetails && (
              <>
                <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  {activityDetails.zones?.[0]?.zone_thumbnail_image ? (
                    <Image 
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${activityDetails.zones[0].zone_thumbnail_image}`} 
                      alt={activityDetails.activity_name}
                      fill
                      className="object-cover rounded-lg"
                      unoptimized
                    />
                  ) : (
                    <CalendarIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">{activityDetails.activity_name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-semibold">$</span>
                    <span>Price per ticket: ${(Number(activityDetails.base_price) || 0).toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">
                      ${((Number(activityDetails.base_price) || 0) * customerInfo.tickets).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Final price calculated after ticket selection</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Step 2: Activity Selection
  const renderStep2ActivitySelection = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Activity</h2>
      <p className="text-gray-600 mb-6">Choose an activity to book for the customer.</p>
      
      {loadingActivities ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading activities...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No activities available for your vendor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => {
                setSelectedActivityId(activity.id);
                setSelectedDate("");
                setSelectedTime("");
                setSelectedZoneId(null);
                setSelectedZone(null);
                setSelectedRentals([]);
              }}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedActivityId === activity.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <h3 className="font-semibold text-gray-900 mb-1">{activity.activity_name}</h3>
              <p className="text-sm text-gray-600 mb-2">{activity.activity_tagline || activity.activity_description?.substring(0, 50)}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium text-gray-700">
                  ${(Number(activity.base_price) || 0).toFixed(2)}
                </span>
                {selectedActivityId === activity.id && (
                  <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Step 3: Date & Time Selection
  const renderStep3DateTime = () => {
    if (!activityDetails) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Please select an activity first.</p>
        </div>
      );
    }

    const today = getTodayLocalDate();

    return (
      <div className="space-y-6">
        {/* Booking Summary */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase mb-1">Customer Details</p>
              <p className="text-sm font-medium text-gray-900">{customerInfo.name}</p>
              <p className="text-xs text-gray-600">{customerInfo.email}</p>
              <p className="text-xs text-gray-600">{customerInfo.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase mb-1">Activity Details</p>
              <p className="text-sm font-medium text-gray-900">Tickets: {customerInfo.tickets}</p>
              <p className="text-sm font-medium text-gray-900">{activityDetails.activity_name}</p>
              <p className="text-xs text-gray-600">Vendor: {vendorSlug}</p>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            Select Date & Time
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose a date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={today}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime(""); // Clear previous time selection
                  setSlotError(null); // Clear any previous errors
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {selectedDate && (
                <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-800">
                    Selected Date: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              )}
            </div>

            {/* Time Slot Selection (matching user frontend logic) */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select time slot
                </label>
                
                {/* Loading State */}
                {loadingSlots && (
                  <div className="flex items-center gap-2 py-4">
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm text-gray-600">Loading available time slots...</span>
                  </div>
                )}
                
                {/* Error State */}
                {slotError && !loadingSlots && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-red-800">Error Loading Slots</p>
                        <p className="text-sm text-red-700 mt-1">{slotError}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* No Slots Available */}
                {availableSlots.length === 0 && !loadingSlots && !slotError && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">No Time Slots Available</p>
                        <p className="text-sm text-yellow-700 mt-1">There are no available time slots for the selected date.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Slots Dropdown (matching user frontend: shows all slots, disables insufficient ones) */}
                {availableSlots.length > 0 && !loadingSlots && (
                  <>
                    <select
                      value={selectedTime ?? ""}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="" disabled>Choose a time slot</option>
                      {availableSlots.map((slot) => {
                        const isDisabled = slot.availableTickets < (customerInfo?.tickets || 0);
                        const displayTime = slot.slotTime.substring(0, 5); // HH:MM format (matching user frontend)
                        
                        return (
                          <option
                            key={slot.slotTime}
                            value={slot.slotTime}
                            disabled={isDisabled}
                          >
                            {displayTime}
                            {isDisabled
                              ? ` - Only ${slot.availableTickets} ticket${slot.availableTickets !== 1 ? "s" : ""} available`
                              : ` - ${slot.availableTickets} ticket${slot.availableTickets !== 1 ? "s" : ""} available`}
                          </option>
                        );
                      })}
                    </select>
                    {selectedTime && (
                      <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-green-800">
                          Selected Time: {selectedTime.substring(0, 5)} {/* Display HH:MM format */}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Step 4: Zone Selection
  const renderStep4ZoneSelection = () => {
    if (!activityDetails) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Please complete previous steps first.</p>
        </div>
      );
    }

    const availableZones = activityDetails.zones?.filter(z => z.status === "active") || [];

    return (
      <div className="space-y-6">
        {/* Booking Summary */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase mb-1">Customer Details</p>
              <p className="text-sm font-medium text-gray-900">{customerInfo.name}</p>
              <p className="text-xs text-gray-600">{customerInfo.email}</p>
              <p className="text-xs text-gray-600">{customerInfo.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase mb-1">Activity Details</p>
              <p className="text-sm font-medium text-gray-900">Tickets: {customerInfo.tickets}</p>
              <p className="text-sm font-medium text-gray-900">{activityDetails.activity_name}</p>
              <p className="text-xs text-gray-600">Vendor: {vendorSlug}</p>
            </div>
          </div>
          {selectedDate && selectedTime && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">Date: {new Date(selectedDate).toLocaleDateString()}</p>
              <p className="text-xs text-gray-600">Time: {selectedTime}</p>
            </div>
          )}
        </div>

        {/* Zone Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-blue-600" />
            Select Activity Zone
          </h3>

          {availableZones.length === 0 ? (
            <p className="text-gray-500">No zones available for this activity.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableZones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => {
                    setSelectedZoneId(zone.id);
                    setSelectedZone(zone);
                  }}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedZoneId === zone.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  {zone.zone_thumbnail_image && (
                    <div className="relative w-full h-32 mb-3">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${zone.zone_thumbnail_image}`}
                        alt={zone.name}
                        fill
                        className="object-cover rounded-lg"
                        unoptimized
                      />
                    </div>
                  )}
                  <h4 className="font-semibold text-gray-900 mb-1">{zone.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{zone.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {zone.age_group || 'All Ages'}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${parseFloat(zone.price?.toString() || '0').toFixed(2)}
                    </span>
                  </div>
                  {selectedZoneId === zone.id && (
                    <div className="mt-2 flex items-center gap-1 text-blue-600">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span className="text-xs font-medium">Selected</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Step 5: Rentals (Optional)
  const renderStep5Rentals = () => {
    if (!activityDetails) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Please complete previous steps first.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Booking Summary */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase mb-1">Customer Details</p>
              <p className="text-sm font-medium text-gray-900">{customerInfo.name}</p>
              <p className="text-xs text-gray-600">{customerInfo.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase mb-1">Activity Details</p>
              <p className="text-sm font-medium text-gray-900">{activityDetails.activity_name}</p>
              <p className="text-xs text-gray-600">Date: {selectedDate && new Date(selectedDate).toLocaleDateString()}</p>
              <p className="text-xs text-gray-600">Time: {selectedTime}</p>
            </div>
          </div>
        </div>

        {/* Selected Zone */}
        {selectedZone && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPinIcon className="h-5 w-5 text-blue-600" />
                Selected Zone
              </h3>
              <button
                onClick={() => setCurrentStep(4)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <ArrowRightIcon className="h-4 w-4 rotate-180" />
                Change
              </button>
            </div>
            <div className="flex items-center gap-4">
              {selectedZone.zone_thumbnail_image && (
                <div className="relative w-20 h-20">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${selectedZone.zone_thumbnail_image}`}
                    alt={selectedZone.name}
                    fill
                    className="object-cover rounded-lg"
                    unoptimized
                  />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{selectedZone.name}</p>
                <p className="text-sm text-gray-600">{selectedZone.description}</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  ${parseFloat(selectedZone.price?.toString() || '0').toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rentals Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBagIcon className="h-5 w-5 text-blue-600" />
            Rental Equipment
          </h3>

          {!activityDetails.provides_rentals ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-4">This activity does not provide rental equipment.</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Would you like to add rental equipment to your booking?
              </p>
              
              {selectedRentals.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Selected Rentals</h4>
                    <button
                      onClick={() => setIsRentalModalOpen(true)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedRentals.map((rental, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">
                          {rental.quantity} x {rental.equipmentName} (Size: {rental.sizeValue})
                        </span>
                        <span className="font-semibold text-gray-900">
                          ${(parseFloat(rental.price) * rental.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setIsRentalModalOpen(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  <ShoppingBagIcon className="h-5 w-5" />
                  {selectedRentals.length > 0 ? 'Edit Rentals' : 'Select Rentals'}
                </button>
                <button
                  onClick={handleSubmitBooking}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  Continue Without Rentals
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Rental Modal */}
        {isRentalModalOpen && activityDetails.provides_rentals && (
          <RentalSelectionModal
            isOpen={isRentalModalOpen}
            onClose={() => setIsRentalModalOpen(false)}
            inventory={rentalInventory}
            selectedRentals={selectedRentals}
            onSelect={(rentals) => {
              setSelectedRentals(rentals);
              setIsRentalModalOpen(false);
            }}
            loading={loadingRentals}
          />
        )}
      </div>
    );
  };

  // Step 6: Review & Payment
  const renderStep6Review = () => {
    if (!bookingDetails && !isSubmitting) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading booking details...</p>
        </div>
      );
    }

    const subtotal = (bookingDetails?.subtotal || calculateTotal() / 1.13) || 0;
    const tax = (bookingDetails?.tax || subtotal * 0.13) || 0;
    const total = (bookingDetails?.total || calculateTotal()) || 0;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Payment</h2>
        <p className="text-gray-600 mb-6">Review your booking and confirm payment.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Booking Summary */}
          <div className="lg:col-span-2 space-y-4">
            {/* Customer Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">CUSTOMER INFORMATION</h3>
              </div>
              <p className="text-sm text-gray-900">{bookingDetails?.userDetails?.name || customerInfo.name}</p>
              <p className="text-xs text-gray-600 mt-1">{bookingDetails?.userDetails?.email || customerInfo.email}</p>
              <p className="text-xs text-gray-600">{bookingDetails?.userDetails?.phone || customerInfo.phone}</p>
            </div>

            {/* Date & Time */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CalendarIcon className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">DATE & TIME</h3>
              </div>
              <p className="text-sm text-gray-900">{selectedDate}</p>
              <p className="text-sm text-gray-900">{selectedTime}</p>
            </div>

            {/* Activity Zone */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPinIcon className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">ACTIVITY ZONE</h3>
              </div>
              <p className="text-sm text-gray-900">{selectedZone?.name || bookingDetails?.zoneName}</p>
              <p className="text-xs text-gray-600">{vendorSlug}</p>
            </div>

            {/* Activity Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircleIcon className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">ACTIVITY DETAILS</h3>
              </div>
              <p className="text-sm text-gray-900">
                {customerInfo.tickets} ticket{customerInfo.tickets > 1 ? 's' : ''} @ ${(Number(activityDetails?.base_price) || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-600">Activity: {activityDetails?.activity_name}</p>
            </div>

            {/* Rental Equipment */}
            {(selectedRentals.length > 0 || bookingDetails?.rentals?.length) && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">RENTAL EQUIPMENT</h3>
                <div className="space-y-2">
                  {(bookingDetails?.rentals || selectedRentals).map((rental: RentalSelection, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">
                        {rental.quantity} x {rental.equipmentName}
                        {rental.sizeValue && ` (Size: ${rental.sizeValue})`}
                      </span>
                      <span className="font-semibold text-gray-900">
                        ${(parseFloat(rental.price) * rental.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Payment Details */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Payment Details</h3>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Activity:</span>
                  <span className="font-semibold text-gray-900">
                    ${((Number(activityDetails?.base_price) || Number(selectedZone?.price) || 0) * customerInfo.tickets).toFixed(2)}
                  </span>
                </div>
                
                {selectedRentals.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rental Equipment:</span>
                    <span className="font-semibold text-gray-900">
                      ${selectedRentals.reduce((sum, r) => sum + (parseFloat(r.price) * r.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (HST 13%):</span>
                  <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-lg pt-3 border-t border-gray-200">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="font-bold text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">$</span>
                  Payment Method
                </h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="font-semibold text-blue-900">Pay in Cash</p>
                  <p className="text-xs text-blue-700 mt-1">Pay at the venue when you arrive.</p>
                </div>
              </div>

              {/* Important Note */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-yellow-800">
                    Please bring exact change if possible. Your booking will be confirmed immediately after payment.
                  </p>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmPayment}
                disabled={isConfirming}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isConfirming ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    Confirm Cash Payment
                    <ArrowRightIcon className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.visible}
          onClose={hideNotification}
        />

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
              <p className="text-gray-600 text-sm">Book an activity for a customer</p>
            </div>
            <button
              onClick={handleBack}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`mt-2 text-xs font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 6 && (
          <div className="mt-6 flex justify-between">
            <button
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back
            </button>
            <button
              onClick={currentStep === 5 ? handleSubmitBooking : handleNext}
              disabled={
                (currentStep === 2 && !selectedActivityId) ||
                (currentStep === 3 && (!selectedDate || !selectedTime)) ||
                (currentStep === 4 && !selectedZoneId) ||
                (currentStep === 5 && isSubmitting)
              }
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === 5 ? (
                <>
                  {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                </>
              ) : (
                'Next'
              )}
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Rental Selection Modal Component
interface RentalSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: RentalEquipment[];
  selectedRentals: RentalSelection[];
  onSelect: (rentals: RentalSelection[]) => void;
  loading: boolean;
}

const RentalSelectionModal: React.FC<RentalSelectionModalProps> = ({
  isOpen,
  onClose,
  inventory,
  selectedRentals,
  onSelect,
  loading,
}) => {
  const [localSelections, setLocalSelections] = useState<RentalSelection[]>(selectedRentals);

  useEffect(() => {
    setLocalSelections(selectedRentals);
  }, [selectedRentals]);

  if (!isOpen) return null;

  const handleQuantityChange = (equipmentId: number, sizeId: number, sizeValue: string, quantity: number, equipmentName: string, price: number) => {
    setLocalSelections(prev => {
      const existing = prev.findIndex(
        r => r.equipmentId === equipmentId && r.sizeId === sizeId
      );

      if (quantity === 0) {
        return prev.filter((_, idx) => idx !== existing);
      }

      const newRental: RentalSelection = {
        equipmentId,
        equipmentName,
        sizeValue,
        sizeId,
        quantity,
        price: price.toString(),
      };

      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newRental;
        return updated;
      } else {
        return [...prev, newRental];
      }
    });
  };

  const getQuantity = (equipmentId: number, sizeId: number): number => {
    const rental = localSelections.find(r => r.equipmentId === equipmentId && r.sizeId === sizeId);
    return rental?.quantity || 0;
  };

  const totalItems = localSelections.reduce((sum, r) => sum + r.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Select Rental Equipment</h2>
            <p className="text-blue-100 text-sm mt-1">Choose equipment and sizes for your booking</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading rental inventory...</p>
          ) : inventory.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No rental equipment available for this booking.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.map((equipment) => (
                <div key={equipment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{equipment.name}</h4>
                      {equipment.description && (
                        <p className="text-xs text-gray-600 mt-1">{equipment.description}</p>
                      )}
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                      <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    ${(Number(equipment.price) || 0).toFixed(2)} /hour
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">Available Sizes:</p>
                    {equipment.sizes.map((size) => {
                      const quantity = getQuantity(equipment.id, size.id);
                      const available = size.available || 0;
                      
                      return (
                        <div key={size.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Size: {size.value}
                            </p>
                            <p className="text-xs text-gray-600">{available} available</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(
                                equipment.id,
                                size.id,
                                size.value,
                                Math.max(0, quantity - 1),
                                equipment.name,
                                size.price || equipment.price
                              )}
                              disabled={quantity === 0}
                              className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(
                                equipment.id,
                                size.id,
                                size.value,
                                Math.min(available, quantity + 1),
                                equipment.name,
                                size.price || equipment.price
                              )}
                              disabled={quantity >= available}
                              className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {totalItems} item{totalItems !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSelect(localSelections)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Select Items to Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
