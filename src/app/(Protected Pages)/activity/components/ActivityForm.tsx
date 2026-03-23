"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import ZoneSelector from "./ZoneSelector";
import { resolvePublicAssetUrl } from "@/app/utils/mediaUrl";
import {
  UpdateActivityFormData,
  currentActivityPayload,
  ScheduleItem,
  AgeGroup,
  ActivityType,
} from "../types/activityTypes";

interface ActivityFormProps {
  initialData?: currentActivityPayload;
  onSave: (
    activity: UpdateActivityFormData,
    thumbnailFile?: File,
    galleryFiles?: File[],
    schedules?: ScheduleItem[],
    holidays?: string[],
    selectedZones?: number[]
  ) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  initialData,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  console.log("Initial Data in activity form:", initialData);

  // Thumbnail handling
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Gallery handling
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(
    initialData?.activity_image_gallery
      ?.map((img) => resolvePublicAssetUrl(img))
      .filter((u): u is string => Boolean(u)) || []
  );
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  // Form State
  const [formData, setFormData] = useState<UpdateActivityFormData>({
    id: initialData?.id ?? 0,
    activity_name: initialData?.activity_name ?? "",
    base_price: initialData?.base_price?.toString() ?? "",
    duration_hours: initialData?.duration_hours?.toString() ?? "",
    start_date: initialData?.start_date?.split("T")[0] ?? "",
    end_date: initialData?.end_date?.split("T")[0] ?? "",
    is_active: initialData?.is_active ?? false,
    booking_type: initialData?.booking_type ?? "",
    slot_interval_minutes: initialData?.slot_interval_minutes || 30,
    max_per_slot: initialData?.max_per_slot || 10,
    // New fields
    age_group: initialData?.age_group || undefined,
    activity_type: initialData?.activity_type || undefined,
    activity_tagline: initialData?.activity_tagline ?? "",
    activity_description: initialData?.activity_description ?? "",
    requires_waiver: initialData?.requires_waiver ?? false,
    provides_rentals: initialData?.provides_rentals ?? false,
    safety_instructions: initialData?.safety_instructions ?? "",
    activity_thumbnail_image: initialData?.activity_thumbnail_image ?? null,
    activity_image_gallery: initialData?.activity_image_gallery ?? null,
    redirect_to_external_website: initialData?.redirect_to_external_website ?? false,
    external_booking_url: initialData?.external_booking_url ?? "",
  });

  // Zone Selector
  const [selectedZones, setSelectedZones] = useState<number[]>(
    initialData?.zones?.map((z) => z.id) ?? []
  );

  // Schedules
  const [schedules, setSchedules] = useState<ScheduleItem[]>(
    initialData?.schedules?.map((s) => ({
      day: s.day ?? "",
      start_time: s.start_time ?? "",
      end_time: s.end_time ?? "",
      duration: s.duration ?? "",
      price: s.price ?? "",
      is_24hours: s.is_24hours ?? false,
      is_holiday: s.is_holiday ?? false,
    })) ?? []
  );

  // Holidays
  const [holidays, setHolidays] = useState<string[]>(
    initialData?.holidays?.map((h) => h.date) ?? []
  );

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setGalleryFiles(files);
      setGalleryPreviews(files.map((file) => URL.createObjectURL(file)));
      // Clear existing backend gallery references
      setFormData((prev) => ({
        ...prev,
        activity_image_gallery: null,
      }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? value === ""
            ? ""
            : parseFloat(value) // Allow empty string temporarily
          : value === "true"
          ? true
          : value === "false"
          ? false
          : value,
    }));
  };

  type ScheduleField =
    | "start_time"
    | "end_time"
    | "duration"
    | "price"
    | "is_24hours"
    | "is_holiday";

  const handleScheduleChange = (
    index: number,
    field: ScheduleField,
    value: string | boolean
  ) => {
    const updatedSchedules = [...schedules];
    if (
      field === "start_time" ||
      field === "end_time" ||
      field === "duration" ||
      field === "price"
    ) {
      updatedSchedules[index][field] = value as string;
    } else {
      updatedSchedules[index][field] = value as boolean;
      if (field === "is_24hours" && value === true) {
        updatedSchedules[index].is_holiday = false;
        updatedSchedules[index].start_time = "";
        updatedSchedules[index].end_time = "";
      } else if (field === "is_holiday" && value === true) {
        updatedSchedules[index].is_24hours = false;
        updatedSchedules[index].start_time = "";
        updatedSchedules[index].end_time = "";
      }
    }
    setSchedules(updatedSchedules);
  };

  const addHoliday = () => setHolidays([...holidays, ""]);

  const updateHoliday = (index: number, value: string) =>
    setHolidays(holidays.map((h, i) => (i === index ? value : h)));

  const removeHoliday = (index: number) =>
    setHolidays(holidays.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onSave(
        formData,
        thumbnailFile || undefined,
        galleryFiles || undefined,
        schedules,
        holidays,
        selectedZones
      );
    } catch (error: any) {
      console.log("Update Error :", error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {initialData ? "Edit Activity" : "Create New Activity"}
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Activity Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Activity Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="activity_name"
              value={formData.activity_name}
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
                value={formData.base_price}
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
                value={formData.duration_hours}
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

          {/* Max Capacity per Slot */}
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
              value={formData.start_date}
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
              value={formData.end_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="is_active"
              value={formData.is_active.toString()}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all "
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
        </div>

        {/* Provide Rentals */}
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

        {/* Redirect to external website */}
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
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
              />
            </div>
          )}
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

        {/* Activity Type */}
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
              <option value="">Select Age Group</option>
              {Object.values(ActivityType).map((group) => (
                <option key={group} value={group}>
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </option>
              ))}
            </select>
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
            value={formData.activity_tagline}
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
            value={formData.activity_description}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
          />
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
            value={formData.safety_instructions}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
          />
        </div>
        {/* Zone Selector */}
        <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <ZoneSelector
            onSelect={setSelectedZones}
            selectedZones={selectedZones}
          />
        </div>

        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
          {/* Thumbnail Image Section */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Thumbnail Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {(thumbnailPreview || formData.activity_thumbnail_image) && (
              <img
                src={
                  thumbnailPreview ||
                  resolvePublicAssetUrl(
                    formData.activity_thumbnail_image ?? undefined
                  ) ||
                  ""
                }
                alt="Thumbnail preview"
                className="mt-2 h-32 w-32 object-cover rounded"
              />
            )}
          </div>

          {/* Gallery Images Section */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Gallery Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleGalleryChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="flex flex-wrap gap-2 mt-4">
                {galleryPreviews.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Gallery preview ${index + 1}`}
                    className="h-24 w-24 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Schedule */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Activity Schedule
          </h3>

          {schedules.map((item, index) => (
            <div key={item.day} className="mb-6">
              {/* First Row: Day, Time Inputs, Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_1fr_auto] gap-4 items-center p-4 bg-white rounded-lg border border-gray-100">
                {/* Day Label */}
                <span className="font-medium text-gray-600">{item.day}</span>

                {/* Start & End Time Inputs */}
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <input
                    type="time"
                    name={`start_time_${index}`}
                    value={item.start_time}
                    disabled={item.is_24hours || item.is_holiday}
                    onChange={(e) =>
                      handleScheduleChange(index, "start_time", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
                  />
                  <input
                    type="time"
                    name={`end_time_${index}`}
                    value={item.end_time}
                    disabled={item.is_24hours || item.is_holiday}
                    onChange={(e) =>
                      handleScheduleChange(index, "end_time", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex flex-wrap gap-4 items-center">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      name={`is_24hours_${index}`}
                      checked={item.is_24hours}
                      onChange={(e) =>
                        handleScheduleChange(
                          index,
                          "is_24hours",
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
                      name={`is_holiday_${index}`}
                      checked={item.is_holiday}
                      onChange={(e) =>
                        handleScheduleChange(
                          index,
                          "is_holiday",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-300"
                    />
                    Holiday
                  </label>
                </div>
              </div>

              {/* Second Row: Duration and Price */}
              <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 items-start px-4 pt-2">
                {/* Empty spacer to align with day label */}
                <div></div>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  {/* Duration */}
                  <div className="flex flex-col w-full">
                    <label className="text-sm text-gray-600 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      placeholder="2"
                      value={item.duration}
                      onChange={(e) =>
                        handleScheduleChange(index, "duration", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Price */}
                  <div className="flex flex-col w-full">
                    <label className="text-sm text-gray-600 mb-1">Price</label>
                    <input
                      type="text"
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

        {/* Activity Holiday Section */}
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
                name={`holiday_${index}`}
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

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              initialData ? "Save Changes" : "Create Activity"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityForm;
