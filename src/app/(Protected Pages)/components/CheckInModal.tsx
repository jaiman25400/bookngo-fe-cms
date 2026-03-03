"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, ClockIcon, UserIcon, CheckCircleIcon, ExclamationTriangleIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { Booking } from "../api/dashboard";

interface CheckInModalProps {
  isOpen: boolean;
  booking: Booking | null;
  onConfirm: (paymentVerified: boolean, waiverSigned: boolean) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  booking,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  // Local state to track if waiver is marked as signed (allows employee to override)
  const [localWaiverSigned, setLocalWaiverSigned] = useState(false);

  // Initialize local waiver status from booking data when modal opens
  useEffect(() => {
    if (booking) {
      setLocalWaiverSigned(booking.waiverSigned ?? false);
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  // Get waiver status from booking data (from GET /cms/bookings/:id)
  // Defaults: requiresWaiver = false
  const requiresWaiver = booking.requiresWaiver ?? false;
  
  // Use local state if waiver is required, otherwise use booking status
  // This allows employee to mark waiver as signed during check-in
  const waiverSigned = requiresWaiver ? localWaiverSigned : (booking.waiverSigned ?? true);
  const participantDetails = [
    { name: booking.customerName, age: "Adult" },
    ...Array.from({ length: booking.participants - 1 }, (_, i) => ({
      name: `Guest ${i + 1}`,
      age: "Adult",
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Check-In Customer</h2>
            <p className="text-blue-100 text-sm mt-1">Confirm and start the activity</p>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-white hover:text-gray-200 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking Summary Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 rounded-full p-2">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{booking.customerName}</h3>
                  <p className="text-sm text-gray-600">Confirmation: <span className="font-mono">{booking.confirmationId}</span></p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Amount</div>
                <div className="text-xl font-bold text-gray-900">${(booking.price ?? 0).toFixed(2)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-blue-200">
              <div>
                <p className="text-xs text-gray-600 mb-1">Activity</p>
                <p className="font-semibold text-gray-900">{booking.activityName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Zone</p>
                <p className="font-semibold text-gray-900">{booking.zoneName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Time Slot</p>
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4 text-gray-500" />
                  <p className="font-semibold text-gray-900">{booking.timeSlot}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Participants</p>
                <p className="font-semibold text-gray-900">{booking.participants} {booking.participants === 1 ? 'person' : 'people'}</p>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className={`rounded-lg p-4 border ${booking.paymentStatus ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-center gap-3">
              {booking.paymentStatus ? (
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              ) : (
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              )}
              <div>
                <p className={`font-semibold ${booking.paymentStatus ? 'text-green-900' : 'text-yellow-900'}`}>
                  Payment: {booking.paymentStatus ? 'Paid ✓' : 'Pending'}
                </p>
                {!booking.paymentStatus && (
                  <p className="text-sm text-yellow-700 mt-1">Please confirm payment before check-in</p>
                )}
              </div>
            </div>
          </div>

          {/* Waiver Status (if required) */}
          {requiresWaiver && (
            <div className={`rounded-lg p-4 border ${waiverSigned ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  {waiverSigned ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  ) : (
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold ${waiverSigned ? 'text-green-900' : 'text-red-900'}`}>
                      Waiver: {waiverSigned ? 'Signed ✓' : 'Not Signed'}
                    </p>
                    {waiverSigned && booking.waiverSignedAt && (
                      <p className="text-xs text-green-700 mt-1">
                        Signed on {new Date(booking.waiverSignedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                    {!waiverSigned && (
                      <p className="text-sm text-red-700 mt-1">Customer must sign waiver before check-in</p>
                    )}
                  </div>
                </div>
                
                {/* Toggle to mark waiver as signed */}
                {!booking.waiverSignedAt && (
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localWaiverSigned}
                        onChange={(e) => setLocalWaiverSigned(e.target.checked)}
                        disabled={isLoading}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        {localWaiverSigned ? 'Marked as Signed' : 'Mark as Signed'}
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Check-In Status (if already checked in) */}
          {booking.status === 'CHECKED_IN' && booking.checkedInAt && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900">Already Checked In ✓</p>
                  <p className="text-xs text-green-700 mt-1">
                    Checked in on {new Date(booking.checkedInAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {booking.checkedInBy && ` by ${booking.checkedInBy}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rental Equipment (if applicable) */}
          {booking.rentals && booking.rentals.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBagIcon className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Rental Equipment</h4>
              </div>
              <div className="space-y-2">
                {booking.rentals.map((rental, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">
                        {rental.quantity} x {rental.equipmentName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Size: {rental.sizeValue} • ${(rental.price || 0).toFixed(2)}/hour each
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${((rental.price || 0) * rental.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
                {booking.rentalPrice !== undefined && (
                  <div className="pt-2 mt-2 border-t border-gray-200 flex items-center justify-between">
                    <p className="font-semibold text-gray-900">Total Rental Cost:</p>
                    <p className="font-bold text-blue-600">${(booking.rentalPrice || 0).toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Participant Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Participants</h4>
            <div className="space-y-2">
              {participantDetails.map((participant, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{participant.name}</p>
                    <p className="text-sm text-gray-600">{participant.age}</p>
                  </div>
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Next Steps</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span>Verify customer identity matches booking details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>Ensure all participants are present</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>Confirm payment and waiver status (if applicable)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <span>Direct customer to {booking.zoneName} for their activity</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(booking.paymentStatus, waiverSigned)}
            disabled={isLoading || !booking.paymentStatus || (requiresWaiver && !waiverSigned)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking In...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                Check In Customer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInModal;
