"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createActivity } from "../api/activity";
import ZoneSelector from "../components/ZoneSelector";
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
  });

  // Fixing type of holidays to be a string array
  const [holidays, setHolidays] = useState<string[]>([]); // Type is now `string[]`
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const router = useRouter();

  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

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
    setMessage(null);

    try {
      const formDataToSend = new FormData();

      // Append basic fields
      formDataToSend.append("activity_name", formData.activity_name);
      formDataToSend.append(
        "activity_description",
        formData.activity_description
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
        formData.safety_instructions
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

      // Log FormData entries
      console.log("FormData entries:");
      for (const pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }

      await createActivity(formDataToSend);
      setMessage({ type: "success", text: "Activity added successfully!" });
      setTimeout(() => router.push("/activity"), 1500);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to create activity. Please try again.",
      });
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
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-xl mt-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-blue-100 pb-4">
        Add New Activity
      </h2>

      {message && (
        <div
          className={`p-3 mb-6 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

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
        <button
          type="submit"
          className="w-full px-6 py-2.5 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm hover:shadow-md"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Activity"}
        </button>
      </form>
    </div>
  );
}
