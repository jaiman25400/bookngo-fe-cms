"use client";

import React, { useState, useEffect } from "react";
import ZoneSelector from "./ZoneSelector";
import { UpdateActivityPayload } from "../types/activityTypes";

interface ActivityFormProps {
  initialData?: UpdateActivityPayload;
  onSave: (activity: any) => void;
  onCancel: () => void;
}
interface ScheduleItem {
  day: string;
  start_time: string;
  end_time: string;
  is_24hours: boolean;
  is_holiday: boolean;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  console.log("Intial Data in activity form :", initialData);
  // Process initialData for formData with defaults
  const initializeFormData = () => {
    if (!initialData) {
      return {
        id: 0,
        activity_name: "",
        base_price: "",
        duration_hours: "",
        start_date: "",
        end_date: "",
        is_active: false,
      };
    }
    return {
      id: initialData.id || 0,
      activity_name: initialData.activity_name || "",
      base_price: initialData.base_price || "",
      duration_hours: initialData.duration_hours || "",
      start_date: initialData.start_date
        ? initialData.start_date.split("T")[0]
        : "",
      end_date: initialData.end_date ? initialData.end_date.split("T")[0] : "",
      is_active: initialData.is_active || false,
    };
  };

  const [formData, setFormData] = useState<any>(initializeFormData());

  //Zone Selector
  const [selectedZones, setSelectedZones] = useState<number[]>(
    initialData?.zones?.map((z: { id: number }) => z.id) || []
  );

  // Process initialData for schedules with defaults
  const initializeSchedules = (): ScheduleItem[] => {
    if (!initialData?.schedules) return [];
    return initialData.schedules.map((s: any) => ({
      day: s.day || "",
      start_time: s.start_time || "",
      end_time: s.end_time || "",
      is_24hours: s.is_24hours || false,
      is_holiday: s.is_holiday || false,
    }));
  };

  const [schedules, setSchedules] = useState<ScheduleItem[]>(
    initializeSchedules()
  );

  //Initialize Holidays
  const initializeHolidays = (): string[] => {
    if (!initialData?.holidays) return [];
    return initialData.holidays.map((h: any) => h.date || "");
  };

  const [holidays, setHolidays] = useState<string[]>(initializeHolidays());

  useEffect(() => {
    if (initialData) {
      setFormData(initializeFormData());
      setSchedules(initializeSchedules());
      setHolidays(initializeHolidays());
      setSelectedZones(initialData.zones?.map((z: { id: any }) => z.id) || []);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: name === "is_active" ? value === "true" : value,
    }));
  };

  type ScheduleField = "start_time" | "end_time" | "is_24hours" | "is_holiday";

  const handleScheduleChange = (
    index: number,
    field: ScheduleField,
    value: string | boolean
  ) => {
    const updatedSchedules = [...schedules];

    if (field === "start_time" || field === "end_time") {
      updatedSchedules[index][field] = value as string;
    } else {
      // Update the checkbox value
      updatedSchedules[index][field] = value as boolean;

      // If 24H is selected, unselect Holiday and clear times
      if (field === "is_24hours" && value === true) {
        updatedSchedules[index].is_holiday = false;
        updatedSchedules[index].start_time = "";
        updatedSchedules[index].end_time = "";
      }
      // If Holiday is selected, unselect 24H and clear times
      else if (field === "is_holiday" && value === true) {
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

    const submittedData = {
      ...formData,
      base_price: parseFloat(formData.base_price),
      duration_hours: parseFloat(formData.duration_hours),
      schedules,
      holidays: holidays.map((date) => ({ date })),
      zone_ids: selectedZones,
    };
    console.log("Update Act Data : ", submittedData);
    onSave(submittedData);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {initialData ? "Edit Activity" : "Add New Activity"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Activity Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Activity Name
          </label>
          <input
            type="text"
            name="activity_name"
            value={formData.activity_name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Base Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Base Price ($)
          </label>
          <input
            type="number"
            name="base_price"
            value={formData.base_price}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Duration (Hours)
          </label>
          <input
            type="number"
            name="duration_hours"
            value={formData.duration_hours}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start
          </label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="is_active"
            value={formData.is_active.toString()}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        {/* Zone Selector */}
        <div className="mt-4">
          <ZoneSelector
            onSelect={setSelectedZones}
            selectedZones={selectedZones}
          />
        </div>
        {/* Activity Schedule */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity Schedule
          </label>
          {schedules.map((item, index) => (
            <div key={item.day} className="flex gap-4 items-center mb-2">
              <span className="w-24">{item.day}</span>
              <input
                type="time"
                value={item.start_time}
                disabled={item.is_24hours || item.is_holiday}
                onChange={(e) =>
                  handleScheduleChange(index, "start_time", e.target.value)
                }
                className="p-2 border rounded w-32"
              />
              <input
                type="time"
                value={item.end_time}
                disabled={item.is_24hours || item.is_holiday}
                onChange={(e) =>
                  handleScheduleChange(index, "end_time", e.target.value)
                }
                className="p-2 border rounded w-32"
              />
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={item.is_24hours}
                  onChange={(e) =>
                    handleScheduleChange(index, "is_24hours", e.target.checked)
                  }
                  className="mt-1"
                />
                24H
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={item.is_holiday}
                  onChange={(e) =>
                    handleScheduleChange(index, "is_holiday", e.target.checked)
                  }
                  className="mt-1"
                />
                Holiday
              </label>
            </div>
          ))}
        </div>
        {/* Special Holidays */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Holidays
          </label>
          {holidays.map((date, index) => (
            <div key={index} className="flex gap-2 items-center mb-2">
              <input
                type="date"
                value={date}
                onChange={(e) => updateHoliday(index, e.target.value)}
                className="p-2 border rounded"
              />
              <button
                type="button"
                onClick={() => removeHoliday(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addHoliday}
            className="text-blue-500 hover:text-blue-700 mt-2"
          >
            + Add Holiday
          </button>
        </div>
        {/* Submit Buttons */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            {initialData ? "Update Activity" : "Add Activity"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityForm;
