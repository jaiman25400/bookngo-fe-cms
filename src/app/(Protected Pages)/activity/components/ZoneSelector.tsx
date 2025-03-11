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
  selectedZones 
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
      ? selectedZones.filter(z => z !== zoneId)
      : [...selectedZones, zoneId];
    onSelect(updated);
  };

  return (
    <div>
      <label className="block mb-2">Select Zones:</label>
      <div className="flex flex-wrap gap-2">
        {zones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => handleZoneChange(zone.id)}
            className={`px-3 py-1 rounded ${
              selectedZones.includes(zone.id)
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {zone.name}
          </button>
        ))}
      </div>
    </div>
  );
}