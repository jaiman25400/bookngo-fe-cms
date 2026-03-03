"use client";

import { ChangeEvent, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createActivity } from "../api/activity";
import ZoneSelector from "../components/ZoneSelector";
import Notification from "@/components/Notification";
import {
  ActivityFormData,
  ActivityType,
  AgeGroup,
} from "../types/activityTypes";

export default function AddActivityPage() {
  const [formData, setFormData] = useState<ActivityFormData>({
    activity_name: "",
    activity_tagline: null,
    activity_description: "",
    age_group: undefined,
    activity_type: undefined,
    base_price: null,
    slot_interval_minutes: 30,
    max_per_slot: 1,
    requires_waiver: false,
    provides_rentals: false,
    safety_instructions: "",
    duration_hours: null,
    start_date: null,
    end_date: null,
    is_active: true,
    booking_type: "ANYTIME",
    activity_thumbnail_image: undefined,
    activity_image_gallery: undefined,
    redirect_to_external_website: false,
    external_booking_url: null,
  });

  const [holidays, setHolidays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
  }>({ message: '', type: 'info', visible: false });

  const router = useRouter();

  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ message, type, visible: true });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? parseFloat(value)
          : value === "true"
          ? true
          : value === "false"
          ? false
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotification({ message: '', type: 'info', visible: false });

    // Basic validation
    if (!formData.activity_name.trim()) {
      const errorMsg = "Activity name is required";
      setError(errorMsg);
      showNotification(errorMsg, 'error');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Append basic fields
      formDataToSend.append("activity_name", formData.activity_name);
      formDataToSend.append(
        "activity_description",
        formData.activity_description || ""
      );
      if (formData.activity_tagline) {
        formDataToSend.append("activity_tagline", formData.activity_tagline);
      }
      if (formData.age_group) {
        formDataToSend.append("age_group", formData.age_group);
      }
      if (formData.activity_type) {
        formDataToSend.append("activity_type", formData.activity_type);
      }
      if (formData.base_price !== null) {
        formDataToSend.append("base_price", formData.base_price.toString());
      }
      formDataToSend.append(
        "requires_waiver",
        formData.requires_waiver.toString()
      );
      formDataToSend.append(
        "provides_rentals",
        formData.provides_rentals.toString()
      );
      formDataToSend.append(
        "safety_instructions",
        formData.safety_instructions || ""
      );
      if (formData.duration_hours !== null) {
        formDataToSend.append(
          "duration_hours",
          formData.duration_hours.toString()
        );
      }
      if (formData.start_date) {
        const startDateISO = new Date(formData.start_date).toISOString();
        formDataToSend.append("start_date", startDateISO);
      }
      if (formData.end_date) {
        const endDateISO = new Date(formData.end_date).toISOString();
        formDataToSend.append("end_date", endDateISO);
      }
      formDataToSend.append("is_active", formData.is_active.toString());
      formDataToSend.append("booking_type", formData.booking_type);
      formDataToSend.append(
        "slot_interval_minutes",
        formData.slot_interval_minutes.toString()
      );
      formDataToSend.append("max_per_slot", formData.max_per_slot.toString());

      formDataToSend.append(
        "redirect_to_external_website",
        (formData.redirect_to_external_website ?? false).toString()
      );
      if (formData.external_booking_url != null && formData.external_booking_url !== "") {
        formDataToSend.append("external_booking_url", formData.external_booking_url);
      }

      // Append files
      if (formData.activity_thumbnail_image) {
        formDataToSend.append(
          "activity_thumbnail_image",
          formData.activity_thumbnail_image
        );
      }
      if (formData.activity_image_gallery) {
        Array.from(formData.activity_image_gallery).forEach((file) => {
          formDataToSend.append("activity_image_gallery", file);
        });
      }

      // Append complex fields as JSON strings
      formDataToSend.append("zone_id", JSON.stringify(selectedZones));
      formDataToSend.append(
        "schedules",
        JSON.stringify(
          schedule.map((s) => ({
            day: s.day,
            start_time: s.start || null,
            end_time: s.end || null,
            duration: s.duration || null,
            price: s.price || null,
            is_24hours: s.is24Hours,
            is_holiday: s.isHoliday,
          }))
        )
      );
      formDataToSend.append(
        "holidays",
        JSON.stringify(holidays.map((date) => ({ date })))
      );

      await createActivity(formDataToSend);
      showNotification("Activity created successfully! Redirecting...", 'success');
      setTimeout(() => router.push("/activity"), 2000);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create activity. Please try again.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  interface ScheduleItem {
    day: string;
    start: string;
    end: string;
    duration: string;
    price: string;
    is24Hours: boolean;
    isHoliday: boolean;
  }
  type ScheduleField =
    | "start"
    | "end"
    | "duration"
    | "price"
    | "is24Hours"
    | "isHoliday";

  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].map((day) => ({
      day,
      start: "",
      end: "",
      duration: "",
      price: "",
      is24Hours: false,
      isHoliday: false,
    }))
  );

  const handleScheduleChange = (
    index: number,
    field: ScheduleField,
    value: string | boolean
  ) => {
    const updatedSchedule: ScheduleItem[] = [...schedule];

    if (
      field === "start" ||
      field === "end" ||
      field === "duration" ||
      field === "price"
    ) {
      // Update time values directly
      updatedSchedule[index][field] = value as string;
    } else {
      // For boolean fields, update the value
      updatedSchedule[index][field] = value as boolean;

      // If the user selects 24 Hours, uncheck Holiday and clear times
      if (field === "is24Hours" && value === true) {
        updatedSchedule[index].isHoliday = false;
        updatedSchedule[index].start = "";
        updatedSchedule[index].end = "";
      }
      // If the user selects Holiday, uncheck 24 Hours and clear times
      else if (field === "isHoliday" && value === true) {
        updatedSchedule[index].is24Hours = false;
        updatedSchedule[index].start = "";
        updatedSchedule[index].end = "";
      }
    }

    setSchedule(updatedSchedule);
  };

  const addHoliday = () => {
    // Add a blank string for a new holiday
    setHolidays([...holidays, ""]);
  };

  const updateHoliday = (index: number, value: string) => {
    const updatedHolidays = [...holidays];
    updatedHolidays[index] = value;
    setHolidays(updatedHolidays);
  };

  const removeHoliday = (index: number) => {
    // Remove the holiday at the specified index
    setHolidays(holidays.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      console.log("Handle Fle ", e.target.files);
      const files = Array.from(e.target.files);
      const name = e.target.name;

      if (name === "activity_thumbnail_image") {
        const file = files[0];
        setFormData((prev) => ({ ...prev, [name]: file }));
        setThumbnailPreview(file ? URL.createObjectURL(file) : null);
      } else if (name === "activity_image_gallery") {
        setFormData((prev) => ({ ...prev, [name]: files }));
        setGalleryPreviews(files.map((file) => URL.createObjectURL(file)));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.push("/activity")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Add New Activity</h1>
          </div>
          <p className="text-gray-600 text-sm ml-12">
            Create a new activity with all the necessary details
          </p>
        </div>

        {/* Error Banner */}
        {error && !notification.visible && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg mb-6 animate-fade-in">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Activity Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Activity Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="activity_name"
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
            />
          </div>
          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Base Price ($) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                $
              </span>
              <input
                type="number"
                name="base_price"
                onChange={handleChange}
                required
                className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Duration (Hours) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="duration_hours"
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                hours
              </span>
            </div>
          </div>
          {/* Booking Type */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Booking Type <span className="text-red-500">*</span>
            </label>
            <select
              name="booking_type"
              value={formData.booking_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiYjNDA7N0M4QkQwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiPjwvcG9seWxpbmU+PC9zdmc+')] bg-no-repeat bg-[right_1rem_center]"
            >
              <option value="SLOT">Slot Booking</option>
              <option value="ANYTIME">Book Anytime</option>
            </select>
          </div>
          {/* Time Slot Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Time Slot Interval <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="slot_interval_minutes"
                value={formData.slot_interval_minutes}
                onChange={handleChange}
                required
                placeholder="e.g. 30"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                minutes
              </span>
            </div>
          </div>

          {/* Max Capacity Per Slot */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Max Capacity per Slot <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="max_per_slot"
              value={formData.max_per_slot}
              onChange={handleChange}
              required
              placeholder="e.g. 10"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="start_date"
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
            />
          </div>
          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="end_date"
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
            />
          </div>
        </div>

        {/* Activity Tagline */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Activity Tagline
          </label>
          <input
            type="text"
            name="activity_tagline"
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Activity Description */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Activity Description
          </label>
          <textarea
            name="activity_description"
            onChange={(e) => handleChange(e as any)} // Workaround for textarea type
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Age Group */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age Group
          </label>
          <div className="relative">
            <select
              name="age_group"
              value={formData.age_group || ""}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyMCAyMCIgc3Ryb2tlPSIjNmI3MjgwIiBzdHJva2Utd2lkdGg9IjEuNSI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNNiA4bDQgNCA0LTQiLz48L3N2Zz4=')] bg-no-repeat bg-[center_right_1rem]"
            >
              <option value="">Select Age Group</option>
              {Object.values(AgeGroup).map((group) => (
                <option key={group} value={group}>
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Activity Type*/}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity Type
          </label>
          <div className="relative">
            <select
              name="activity_type"
              value={formData.activity_type || ""}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyMCAyMCIgc3Ryb2tlPSIjNmI3MjgwIiBzdHJva2Utd2lkdGg9IjEuNSI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNNiA4bDQgNCA0LTQiLz48L3N2Zz4=')] bg-no-repeat bg-[center_right_1rem]"
            >
              <option value="">Select Activity_type</option>
              {Object.values(ActivityType).map((group) => (
                <option key={group} value={group}>
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Safety Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Safety Instructions
          </label>
          <textarea
            name="safety_instructions"
            onChange={(e) => handleChange(e as any)} // Workaround for textarea type
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Media Uploads */}
        <div className="space-y-6">
          {/* Thumbnail Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Image
            </label>
            <div className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors relative">
              <input
                type="file"
                name="activity_thumbnail_image"
                onChange={handleFileChange}
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <span className="text-gray-500">
                {formData.activity_thumbnail_image?.name || "Click to upload"}
              </span>
            </div>
            {thumbnailPreview && (
              <div className="mt-4">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="h-32 w-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Image Gallery */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gallery Images
            </label>
            <div className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors relative">
              <input
                type="file"
                name="activity_image_gallery"
                multiple
                onChange={handleFileChange}
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <span className="text-gray-500">
                {formData.activity_image_gallery?.length
                  ? `${formData.activity_image_gallery.length} files selected`
                  : "Click to upload multiple images"}
              </span>
            </div>
            {galleryPreviews.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {galleryPreviews.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-lg border"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone Selector */}
        <ZoneSelector
          onSelect={setSelectedZones}
          selectedZones={selectedZones}
        />

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="is_active"
            value={formData.is_active.toString()}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Requires Waiver */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Requires Waver <span className="text-red-500">*</span>
          </label>
          <select
            name="requires_waiver"
            value={formData.requires_waiver.toString()}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Provides Rentals  */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Provides Rentals <span className="text-red-500">*</span>
          </label>
          <select
            name="provides_rentals"
            value={formData.provides_rentals.toString()}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* External booking */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">External booking</h3>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="redirect_to_external_website"
                checked={formData.redirect_to_external_website ?? false}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    redirect_to_external_website: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Redirect “Book now” to external website
              </span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              When enabled, users are sent to the external booking URL instead of the in-app flow.
            </p>
          </div>
          {(formData.redirect_to_external_website ?? false) && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                External booking URL
              </label>
              <input
                type="url"
                name="external_booking_url"
                value={formData.external_booking_url ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    external_booking_url: e.target.value || null,
                  }))
                }
                placeholder="https://..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
              />
            </div>
          )}
        </div>

        {/* Activity Schedule Section */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Activity Schedule
          </h3>
          {schedule.map((item, index) => (
            <div
              key={item.day}
              className="mb-4 bg-white rounded-lg border border-gray-100"
            >
              {/* First row */}
              <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_1fr_auto] gap-4 items-center p-4">
                <span className="font-medium text-gray-600">{item.day}</span>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={item.start}
                    disabled={item.is24Hours || item.isHoliday}
                    onChange={(e) =>
                      handleScheduleChange(index, "start", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
                  />
                  <input
                    type="time"
                    value={item.end}
                    disabled={item.is24Hours || item.isHoliday}
                    onChange={(e) =>
                      handleScheduleChange(index, "end", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={item.is24Hours}
                      onChange={(e) =>
                        handleScheduleChange(
                          index,
                          "is24Hours",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-300"
                    />
                    24 Hours
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={item.isHoliday}
                      onChange={(e) =>
                        handleScheduleChange(
                          index,
                          "isHoliday",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-300"
                    />
                    Holiday
                  </label>
                </div>
              </div>

              {/* Second row for duration and price */}
              <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_1fr_auto] gap-4 items-start px-4 pb-4">
                <div></div> {/* Empty spacer for alignment with day label */}
                <div className="flex gap-4 w-full">
                  {/* Duration field */}
                  <div className="flex flex-col w-full">
                    <label className="text-sm text-gray-600 mb-1">
                      Duration
                    </label>
                    <input
                      type="number"
                      placeholder="3"
                      value={item.duration}
                      onChange={(e) =>
                        handleScheduleChange(index, "duration", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Price field */}
                  <div className="flex flex-col w-full">
                    <label className="text-sm text-gray-600 mb-1">Price</label>
                    <input
                      type="number"
                      placeholder="100"
                      value={item.price}
                      onChange={(e) =>
                        handleScheduleChange(index, "price", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Special Holidays Section */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Special Holidays
          </h3>
          {holidays.map((date, index) => (
            <div
              key={index}
              className="flex items-center gap-3 mb-4 p-4 bg-white rounded-lg border border-gray-100"
            >
              <input
                type="date"
                value={date}
                onChange={(e) => updateHoliday(index, e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
              />
              <button
                type="button"
                onClick={() => removeHoliday(index)}
                className="px-4 py-2 text-red-500 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addHoliday}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg transition-colors"
          >
            + Add Holiday
          </button>
        </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push("/activity")}
              disabled={loading}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Activity
                </>
              )}
            </button>
          </div>
        </form>
        </div>

        {/* Notification Toast */}
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.visible}
          onClose={hideNotification}
        />
      </div>
    </div>
  );
}
