import React, { useEffect, useState } from 'react';
import UserLayout from '../../Layouts/UserLayout';
import { useOwner } from '../../contexts/OwnerContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { apiFetch, resolveImageUrl } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

function LandForm({ mode = 'create' }) {
  const { createLand, updateLand } = useOwner();
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [minLeaseDuration, setMinLeaseDuration] = useState('');
  const [price, setPrice] = useState('');
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode === 'edit' && id) {
      const loadLand = async () => {
        setFetching(true);
        try {
          const res = await apiFetch(`/api/owner/lands/${id}`, { token });
          const land = res.land || res;
          setTitle(land.title || '');
          setDescription(land.description || '');
          setLocation(land.location || '');
          setArea(land.area || '');
          setMinLeaseDuration(land.minLeaseDuration || '');
          setPrice(land.price || '');
          setExistingImages(land.images || []);
        } catch (err) {
          setError(err.message || 'Failed to load land details');
        } finally {
          setFetching(false);
        }
      };
      loadLand();
    }
  }, [mode, id, token]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setError(null);
    
    const validFiles = [];
    const validPreviews = [];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    
    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError(`File "${file.name}" is not a valid image format. Only JPEG, JPG, PNG, and WebP are allowed.`);
        return;
      }
      if (file.size > maxSizeBytes) {
        setError(`File "${file.name}" exceeds the 5 MB limit.`);
        return;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...validPreviews]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('area', area);
      formData.append('minLeaseDuration', minLeaseDuration);
      formData.append('price', Number(price));
      
      formData.append('existingImages', JSON.stringify(existingImages));
      
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      if (mode === 'create') {
        await createLand(formData);
      } else {
        await updateLand(id, formData);
      }
      navigate('/owner/lands');
    } catch (err) {
      setError(err.message || 'Failed to save listing');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-lime-50">
        <UserLayout />
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-lime-700 font-medium">Loading Listing Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lime-50">
      <UserLayout />
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-lime-700">
            {mode === 'create' ? 'List New Land' : 'Edit Land Listing'}
          </h1>
          <p className="text-sm text-gray-500">
            Provide details about the plot you want to rent out.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Listing Title</label>
              <input
                type="text"
                placeholder="e.g. Fertile Paddy Field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                placeholder="Describe your land, water availability, crop history, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
                rows="4"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Thrissur, Kerala"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Area</label>
                <input
                  type="text"
                  placeholder="e.g. 2 acre"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Min Lease Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 12 mo min"
                  value={minLeaseDuration}
                  onChange={(e) => setMinLeaseDuration(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Price (INR / Month)</label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Existing Images (for edit mode) */}
            {existingImages.length > 0 && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Existing Images</label>
                <div className="flex flex-wrap gap-3">
                  {existingImages.map((img, i) => (
                    <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                      <img src={resolveImageUrl(img)} alt="Existing" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow hover:bg-red-700 focus:outline-none"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Previews */}
            {previews.length > 0 && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">New Image Previews</label>
                <div className="flex flex-wrap gap-3">
                  {previews.map((previewUrl, i) => (
                    <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                      <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(i)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow hover:bg-red-700 focus:outline-none"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload Field */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Upload Land Photos</label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-lime-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-lime-700 hover:file:bg-lime-100 dark:bg-gray-800 dark:border-gray-700"
              />
              <p className="mt-1 text-xs text-gray-400">Supported formats: JPEG, JPG, PNG, WebP (Max 5 MB per image).</p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-lime-600 hover:bg-lime-700 text-white font-semibold rounded-lg py-2"
              >
                {loading ? 'Saving Listing...' : 'Save Listing'}
              </Button>
              <Button
                type="button"
                color="gray"
                onClick={() => navigate('/owner/lands')}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LandForm;