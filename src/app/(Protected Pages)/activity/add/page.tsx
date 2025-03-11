"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createActivity } from "../api/activity";
import ZoneSelector from "../components/ZoneSelector";
import {
  ActivityFormData,
  CreateActivityPayload,
} from "../types/activityTypes";

export default function AddActivityPage() {
  const [formData, setFormData] = useState<ActivityFormData>({
    activity_name: "",
    base_price: null,
    duration_hours: null,
    start_date: null,
    end_date: null,
    is_active: true,
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
      const payload: CreateActivityPayload = {
        ...formData,
        zone_id: selectedZones,
        schedules: schedule.map((s) => ({
          day: s.day,
          start_time: s.start || null,
          end_time: s.end || null,
          is_24hours: s.is24Hours,
          is_holiday: s.isHoliday,
        })),
        holidays: holidays.map((date) => ({ date })),
      };

      if (formData.start_date)
        payload.start_date = new Date(formData.start_date).toISOString();
      if (formData.end_date)
        payload.end_date = new Date(formData.end_date).toISOString();

      console.log("Add Activity Payload :", payload);
      await createActivity(payload);
      setMessage({ type: "success", text: "Activity added successfully!" });
      setTimeout(() => router.push("/activity"), 1500);
    } catch (err) {
      setMessage({
        type: "error",
        text: "Failed to add activity. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  interface ScheduleItem {
    day: string;
    start: string;
    end: string;
    is24Hours: boolean;
    isHoliday: boolean;
  }
  type ScheduleField = "start" | "end" | "is24Hours" | "isHoliday";

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
  
    if (field === "start" || field === "end") {
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

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Add New Activity
      </h2>

      {message && (
        <div
          className={`p-3 mb-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          // General form fields
          {
            label: "Activity Name",
            name: "activity_name",
            type: "text",
            required: true,
          },
          {
            label: "Base Price ($)",
            name: "base_price",
            type: "number",
            required: true,
          },
          {
            label: "Duration (Hours)",
            name: "duration_hours",
            type: "number",
            required: true,
          },
          { label: "Start Date", name: "start_date", type: "date" },
          { label: "End Date", name: "end_date", type: "date" },
        ].map(({ label, name, type, required }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              type={type}
              name={name}
              value={(formData as any)[name] || ""}
              onChange={handleChange}
              required={required}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ))}

        <ZoneSelector
          onSelect={setSelectedZones}
          selectedZones={selectedZones}
        />
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

        <div>
          {/* Activity Schedule Section */}
          <div>
            <label className="block text-sm font-medium">
              Activity Schedule
            </label>
            {schedule.map((item, index) => (
              <div key={item.day} className="flex gap-4 items-center mt-2">
                <span className="w-20">{item.day}</span>
                <input
                  type="time"
                  value={item.start}
                  disabled={item.is24Hours || item.isHoliday}
                  onChange={(e) =>
                    handleScheduleChange(index, "start", e.target.value)
                  }
                  className="p-2 border rounded"
                />
                <input
                  type="time"
                  value={item.end}
                  disabled={item.is24Hours || item.isHoliday}
                  onChange={(e) =>
                    handleScheduleChange(index, "end", e.target.value)
                  }
                  className="p-2 border rounded"
                />
                <label>
                  <input
                    type="checkbox"
                    checked={item.is24Hours}
                    onChange={(e) =>
                      handleScheduleChange(index, "is24Hours", e.target.checked)
                    }
                  />
                  24 Hours
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={item.isHoliday}
                    onChange={(e) =>
                      handleScheduleChange(index, "isHoliday", e.target.checked)
                    }
                  />
                  Holiday
                </label>
              </div>
            ))}
          </div>

          {/* Special Holidays */}
          <div>
            <label className="block text-sm font-medium">
              Special Holidays
            </label>
            {holidays.map((date, index) => (
              <div key={index} className="flex gap-4 mt-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => updateHoliday(index, e.target.value)}
                  className="p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => removeHoliday(index)}
                  className="text-red-500"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addHoliday}
              className="mt-2 text-blue-500"
            >
              Add Holiday
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Activity"}
        </button>
      </form>
    </div>
  );
}
