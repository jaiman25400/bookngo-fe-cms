import React, { ChangeEvent, useState } from "react";
import {
  AgeGroup,
  UpdateZoneFormData,
  ZoneStatus,
} from "../types/ZoneTypes";

interface ZoneFormProps { 
  initialData?: UpdateZoneFormData | null;
  onSave: (
    zone: UpdateZoneFormData,
    thumbnailFile?: File,
    galleryFiles?: File[]
  ) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const ZoneForm: React.FC<ZoneFormProps> = ({
  initialData,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  console.log("Zone iNTI dATA :", initialData);

  // Thumbnail handling
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Gallery handling
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(
    initialData?.zone_image_gallery?.map(
      (img) => `${process.env.NEXT_PUBLIC_API_BASE_URL}${img}`
    ) || []
  );
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  // Initialize form data with proper types
  const [formData, setFormData] = useState<UpdateZoneFormData>({
    id: initialData?.id || 0,
    name: initialData?.name || "",
    description: initialData?.description || "",
    status: initialData?.status || ZoneStatus.ACTIVE,
    capacity: initialData?.capacity || undefined,
    price: initialData?.price ? initialData.price.toString() : "",
    age_group: initialData?.age_group || undefined,
    zone_tagline: initialData?.zone_tagline || "",
    zone_thumbnail_image: initialData?.zone_thumbnail_image ?? null,
    zone_image_gallery: initialData?.zone_image_gallery ?? null,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
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
        zone_image_gallery: null,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, thumbnailFile || undefined, galleryFiles || undefined);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-xl mt-10 border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b-2 border-blue-100 pb-4">
        {initialData ? "Edit Zone" : "Add New Zone"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        encType="multipart/form-data"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Zone Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
          </div>

          <div className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Zone Tagline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone Tagline
              </label>
              <input
                type="text"
                name="zone_tagline"
                value={formData.zone_tagline}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  name="price"
                  value={formData.price ?? ""}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
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
              {(thumbnailPreview || formData.zone_thumbnail_image) && (
                <img
                  src={
                    thumbnailPreview ||
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}${formData.zone_thumbnail_image}`
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyMCAyMCIgc3Ryb2tlPSIjNmI3MjgwIiBzdHJva2Utd2lkdGg9IjEuNSI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNNiA4bDQgNCA0LTQiLz48L3N2Zz4=')] bg-no-repeat bg-[center_right_1rem]"
              >
                {Object.values(ZoneStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
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
              initialData ? "Update Zone" : "No Zone Selected"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ZoneForm;
