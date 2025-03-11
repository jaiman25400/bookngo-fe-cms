"use client";

import { useState, useEffect } from "react";
import ZoneTable from "./components/ZoneTable";
import ZoneForm from "./components/ZoneForm";
import DeleteModal from "./components/DeleteModal";
import { Zone } from "./types/ZoneTypes";
import { useRouter } from "next/navigation";
import { deleteZone, fetchZones, updateZone } from "./api/zone"; // Import zone API functions

const ZonePage = () => {

  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const getZones = async () => {
      try {
        console.log("Get Zone");
        const data = await fetchZones();
        setZones(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch zones");
        setLoading(false);
      }
    };

    getZones();
  }, []);

  const handleSave = async (zone: Zone) => {
    try {
      // Validate input
      if (!zone.id || typeof zone.id !== "number") {
        throw new Error("Invalid zone data");
      }
  
      // Exclude 'id' from the payload
      const { id, ...payload } = zone;
  
      // Optimistically update UI
      setZones((prev) => prev.map((z) => (z.id === id ? zone : z)));
      console.log("Update Zone ", zone);
  
      // Update zone on the server (send 'id' as URL param and 'payload' as body)
      const updatedZone = await updateZone(id, payload);
  
      // Ensure update is successful and reflect changes
      if (updatedZone?.id) {
        setZones((prev) =>
          prev.map((z) => (z.id === updatedZone.id ? updatedZone : z))
        );
      }
  
      setSelectedZone(null);
    } catch (error) {
      console.error("Error saving zone:", error);
      alert("Failed to save zone. Please try again.");
    }
  };
  

  const handleDelete = async () => {
    if (!selectedZone ) return;

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
