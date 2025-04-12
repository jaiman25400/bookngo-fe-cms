"use client";

import { useState, useEffect } from "react";
import ZoneTable from "./components/ZoneTable";
import ZoneForm from "./components/ZoneForm";
import DeleteModal from "./components/DeleteModal";
import { Zone, UpdateZoneFormData } from "./types/ZoneTypes";
import { useRouter } from "next/navigation";
import { deleteZone, fetchZones, updateZone } from "./api/zone"; // Import zone API functions

const ZonePage = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<UpdateZoneFormData | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const getZones = async () => {
      try {
        console.log("Get Zone");
        const data = await fetchZones();
        console.log("Zone Data ", data);
        setZones(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch zones");
        setLoading(false);
      }
    };

    getZones();
  }, []);
  
  const handleSave = async (
    zoneData: UpdateZoneFormData,
    thumbnailFile?: File,
    galleryFiles?: File[]
  ) => {
    try {
      console.log("🚀 SAVE BUTTON CLICKED: Zone Update", {
        zoneData,
        thumbnailFile,
        galleryFiles,
      });

      const formData = new FormData();

      if (thumbnailFile) {
        formData.append("zone_thumbnail_image", thumbnailFile);
      }

      if (galleryFiles?.length) {
        galleryFiles.forEach((file) => {
          formData.append("zone_image_gallery", file); // Ensure multiple files are appended correctly
        });
      }

      // Append other zoneData fields safely
      Object.entries(zoneData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      console.log("📦 FormData Prepared for Submission:");

      for (const [key, value] of formData.entries()) {
        console.log(`🔹 ${key}:`, value);
      }

      if (!zoneData.id) {
        setError("❌ Update Failed: Missing Zone ID");
        return;
      }

      console.log("🔄 Updating Zone...");

      const updatedZone = await updateZone(zoneData.id, formData);

      console.log("✅ Update Response:", updatedZone);

      if (updatedZone?.id) {
        setZones((prev) =>
          prev.map((i) => (i.id === updatedZone.id ? updatedZone : i))
        );
      } else {
        setError("❌ Update Failed: Invalid Response from Server");
      }

      setSelectedZone(null);
    } catch (error) {
      console.error("🔥 Error in handleSave:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!selectedZone) return;

    try {
      await deleteZone(selectedZone.id);
      setZones((prev) => prev.filter((z) => z.id !== selectedZone.id));

      setSelectedZone(null);
      setIsDeleting(false);
    } catch (error) {
      console.error("Error deleting zone:", error);
      alert("Failed to delete zone. Please try again.");
    }
  };

  const handleAddZoneClick = () => {
    router.push("/zone/add");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Zone Management</h1>

      {loading ? (
        <p>Loading zones...</p> // Show loading message
      ) : error ? (
        <p className="text-red-600">{error}</p> // Show error message
      ) : (
        <>
          <button
            onClick={handleAddZoneClick}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Add New Zone
          </button>

          {selectedZone ? (
            <ZoneForm
              initialData={selectedZone}
              onSave={handleSave}
              onCancel={() => setSelectedZone(null)}
            />
          ) : (
            <ZoneTable
              zones={zones}
              onEdit={setSelectedZone}
              onDelete={(id: number) => {
                setSelectedZone(zones.find((z) => z.id === id) || null);
                setIsDeleting(true);
              }}
            />
          )}

          <DeleteModal
            isOpen={isDeleting}
            onConfirm={handleDelete}
            onCancel={() => setIsDeleting(false)}
          />
        </>
      )}
    </div>
  );
};

export default ZonePage;
