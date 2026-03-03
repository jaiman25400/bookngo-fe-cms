"use client";
import { useState, useEffect, ChangeEvent, useCallback } from "react";
import { ProfileData } from "./types/profileTypes";
import { fetchProfileData, updateProfileData } from "./api/profilepage";
import Notification from "@/components/Notification";

const ProfilePage = () => {
  const [profile, setProfile] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  // Home image handling
  const [homeImagePreview, setHomeImagePreview] = useState<string | null>(null);
  const [homeImageFile, setHomeImageFile] = useState<File | null>(null);

  // Gallery handling
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  useEffect(() => {
    const getProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProfileData();
        setProfile(data || {});

        // Set initial image previews
        if (data.home_image_url) {
          setHomeImagePreview(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${data.home_image_url}`
          );
        }
        if (data.home_image_gallery) {
          setGalleryPreviews(
            data.home_image_gallery.map(
              (img) => `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${img}`
            )
          );
        }
      } catch (err: any) {
        const errorMessage = err.message || "Failed to fetch profile";
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    getProfileData();
  }, [showNotification]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const parts = name.split(".");

    if (parts.length > 1) {
      // Handle nested objects
      setProfile((prev) => {
        const newProfile = { ...prev };
        let current: any = newProfile;

        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current[part]) current[part] = {};
          current = current[part];
        }

        current[parts[parts.length - 1]] = value;
        return newProfile;
      });
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleHomeImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setHomeImageFile(file);
      setHomeImagePreview(URL.createObjectURL(file));
      setProfile((prev) => ({ ...prev, home_image_url: undefined }));
    }
  };

  const handleGalleryChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setGalleryFiles(files);
      setGalleryPreviews(files.map((file) => URL.createObjectURL(file)));
      setProfile((prev) => ({ ...prev, home_image_gallery: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const formData = new FormData();

      // Append basic fields
      formData.append(
        "customer_display_name",
        profile.customer_display_name || ""
      );
      formData.append("home_tagLine", profile.home_tagLine || "");
      formData.append(
        "customer_display_email",
        profile.customer_display_email || ""
      );
      formData.append(
        "customer_description",
        profile.customer_description || ""
      );
      formData.append("customer_address", profile.customer_address || "");
      formData.append("customer_city", profile.customer_city || "");
      formData.append("customer_state", profile.customer_state || "");
      formData.append("customer_zip", profile.customer_zip || "");
      formData.append("about_us", profile.about_us || "");
      formData.append("customer_slug", profile.customer_slug || "");
      formData.append("customer_longitude", profile.customer_longitude || "");
      formData.append("customer_latitude", profile.customer_latitude || "");
      formData.append("features", profile.features || "");

      // Append home image
      if (homeImageFile) {
        formData.append("home_image_url", homeImageFile);
      }

      // Append gallery images
      galleryFiles.forEach((file) => {
        formData.append("home_image_gallery", file);
      });

      // Call API
      const updatedProfile = await updateProfileData(formData);

      // Update state with new data from server
      setProfile((prev) => ({
        ...prev,
        ...updatedProfile,
        home_image_gallery:
          updatedProfile.home_image_gallery || prev.home_image_gallery,
      }));

      // Reset file states and previews with server URLs
      if (updatedProfile.home_image_url) {
        setHomeImagePreview(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${updatedProfile.home_image_url}`
        );
        setHomeImageFile(null);
      }

      if (updatedProfile.home_image_gallery) {
        setGalleryPreviews(
          updatedProfile.home_image_gallery.map(
            (img: any) => `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${img}`
          )
        );
        setGalleryFiles([]);
      }

      showNotification("Profile updated successfully!", 'success');
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update profile. Please try again.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Management</h1>
          <p className="text-gray-600 text-sm">
            Update your business profile and information
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

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600 font-medium">Loading profile...</p>
            </div>
          </div>
        ) : (
        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl border border-gray-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Display Name
                  </label>
                  <input
                    type="text"
                    name="customer_display_name"
                    value={profile.customer_display_name || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tagline
                  </label>
                  <input
                    type="text"
                    name="home_tagLine"
                    value={profile.home_tagLine || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Email
                  </label>
                  <input
                    type="email"
                    name="customer_display_email"
                    value={profile.customer_display_email || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Address Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="customer_address"
                    value={profile.customer_address || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="customer_city"
                    value={profile.customer_city || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="customer_state"
                    value={profile.customer_state || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="customer_zip"
                    value={profile.customer_zip || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    name="customer_slug"
                    value={profile.customer_slug || ""}
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="customer_longitude"
                    value={profile.customer_longitude || ""}
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="customer_latitude"
                    value={profile.customer_latitude || ""}
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Long Text Fields */}
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About Us
                  </label>
                  <textarea
                    name="about_us"
                    value={profile.about_us || ""}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features/Special Offers
                  </label>
                  <textarea
                    name="features"
                    value={profile.features || ""}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Image Uploads */}
              <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
                <div className="space-y-2 mb-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Home Page Image
                  </label>
                  <input
                    type="file"
                    onChange={handleHomeImageChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {homeImagePreview && (
                    <img
                      src={homeImagePreview}
                      className="mt-2 h-32 w-32 object-cover rounded"
                      alt="Home preview"
                    />
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Image Gallery
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleGalleryChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <div className="flex flex-wrap gap-2 mt-4">
                    <div className="flex flex-wrap gap-2 mt-4">
                      {galleryPreviews.map((preview, index) => (
                        <img
                          key={index}
                          src={preview}
                          className="h-24 w-24 object-cover rounded"
                          alt={`Gallery preview ${index}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        )}

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
};

export default ProfilePage;
