"use client";

import React, { ChangeEvent, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreateZoneFormData, AgeGroup, ZoneStatus } from "../types/ZoneTypes";
import { addZone } from "../api/zone";
import Notification from "@/components/Notification";

export default function AddZonePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateZoneFormData>({
    name: "",
    description: "",
    status: ZoneStatus.ACTIVE,
    capacity: "",
    price: "",
    age_group: undefined,
    zone_tagline: "",
    zone_thumbnail_image: undefined,
    zone_image_gallery: undefined,
  });

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
  }>({ message: '', type: 'info', visible: false });

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ message, type, visible: true });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, visible: false }));
  }, []);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      galleryPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [thumbnailPreview, galleryPreviews]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const name = e.target.name;

      if (name === "zone_thumbnail_image") {
        const file = files[0];
        setFormData((prev) => ({ ...prev, [name]: file }));
        setThumbnailPreview(file ? URL.createObjectURL(file) : null);
      } else if (name === "zone_image_gallery") {
        setFormData((prev) => ({ ...prev, [name]: files }));
        setGalleryPreviews(files.map((file) => URL.createObjectURL(file)));
      }
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.name.trim()) errors.push("Name is required");
    if (!formData.description.trim()) errors.push("Description is required");

    if (formData.capacity && isNaN(Number(formData.capacity))) {
      errors.push("Invalid capacity format");
    }

    if (formData.price && isNaN(Number(formData.price))) {
      errors.push("Invalid price format");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotification({ message: '', type: 'info', visible: false });

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      const errorMsg = validationErrors.join(", ");
      setError(errorMsg);
      showNotification(errorMsg, 'error');
      setLoading(false);
      return;
    }

    try {
      const formPayload = new FormData();

      formPayload.append("name", formData.name);
      formPayload.append("description", formData.description);
      formPayload.append("status", formData.status);

      if (formData.capacity) formPayload.append("capacity", formData.capacity);
      if (formData.price) formPayload.append("price", formData.price);
      if (formData.age_group)
        formPayload.append("age_group", formData.age_group);
      if (formData.zone_tagline)
        formPayload.append("zone_tagline", formData.zone_tagline);

      if (formData.zone_thumbnail_image) {
        formPayload.append(
          "zone_thumbnail_image",
          formData.zone_thumbnail_image
        );
      }
      if (formData.zone_image_gallery) {
        formData.zone_image_gallery.forEach((file) => {
          formPayload.append("zone_image_gallery", file);
        });
      }

      await addZone(formPayload);
      showNotification("Zone created successfully! Redirecting...", 'success');
      setTimeout(() => router.push("/zone"), 2000);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create zone. Please try again.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.push("/zone")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Create New Zone</h1>
          </div>
          <p className="text-gray-600 text-sm ml-12">
            Add a new activity zone with all necessary details
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

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        encType="multipart/form-data"
      >
        {/* Form Fields */}
        <div className="space-y-6">
          {/* First Row Group */}
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

          {/* Description Group */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                required
                onChange={handleChange}
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
                value={formData.zone_tagline || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Pricing Group */}
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                  value={formData.price || ""}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
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
                  name="zone_thumbnail_image"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="text-gray-500">
                  {formData.zone_thumbnail_image?.name || "Click to upload"}
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
                  name="zone_image_gallery"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="text-gray-500">
                  {formData.zone_image_gallery?.length
                    ? `${formData.zone_image_gallery.length} files selected`
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status || ZoneStatus.ACTIVE}
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

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push("/zone")}
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
                  Create Zone
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
