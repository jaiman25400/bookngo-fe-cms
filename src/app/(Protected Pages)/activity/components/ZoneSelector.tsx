"use client";

import { useState, useEffect } from "react";
import { fetchZones } from "@/app/(Protected Pages)/zone/api/zone";
import { Zone } from "@/app/(Protected Pages)/zone/types/ZoneTypes";

interface ZoneSelectorProps {
  onSelect: (zones: number[]) => void;
  selectedZones: number[];
}

export default function ZoneSelector({
  onSelect,
  selectedZones,
}: ZoneSelectorProps) {
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const zoneData = await fetchZones();
        setZones(zoneData);
      } catch (error) {
        console.error("Error fetching zones:", error);
      }
    };
    loadZones();
  }, []);

  const handleZoneChange = (zoneId: number) => {
    const updated = selectedZones.includes(zoneId)
      ? selectedZones.filter((z) => z !== zoneId)
      : [...selectedZones, zoneId];
    onSelect(updated);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Available Zones{" "}
        <span className="text-gray-400">({selectedZones.length} selected)</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {zones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => handleZoneChange(zone.id)}
            className={`px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2
              ${
                selectedZones.includes(zone.id)
                  ? "bg-blue-500 text-white shadow-sm hover:bg-blue-600"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }
              rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2`}
          >
            {selectedZones.includes(zone.id) && (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {zone.name}
          </button>
        ))}
      </div>
    </div>
  );
}
