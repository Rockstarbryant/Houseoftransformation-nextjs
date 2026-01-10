import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { galleryService } from '../../services/api/galleryService';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

const ManageGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    photo: null,
    category: 'Worship Services'
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const data = await galleryService.getPhotos();
      setPhotos(data.photos || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.photo) {
      alert('Please select a photo');
      return;
    }

    if (!formData.title) {
      alert('Please enter a title');
      return;
    }

    try {
      setLoading(true);
      
      const uploadData = new FormData();
      uploadData.append('photo', formData.photo);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('category', formData.category);

      console.log('Uploading to: /gallery/upload');
      await galleryService.uploadPhoto(uploadData);
      
      alert('Photo uploaded successfully!');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        photo: null,
        category: 'Worship Services'
      });
      setPreview(null);
      fetchPhotos();
    } catch (error) {
      console.error('Error uploading:', error);
      if (error.response?.status === 404) {
        alert('❌ Upload endpoint not found. Check backend configuration.');
      } else if (error.response?.status === 413) {
        alert('❌ File too large. Max size is 5MB.');
      } else if (error.response?.status === 401) {
        alert('❌ Not authorized. Please login as admin.');
      } else {
        alert('❌ Error: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this photo?')) {
      try {
        await galleryService.deletePhoto(id);
        alert('Photo deleted!');
        fetchPhotos();
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Error deleting photo');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      title: '',
      description: '',
      photo: null,
      category: 'Worship Services'
    });
    setPreview(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-blue-900">Manage Gallery</h1>
        <Button variant="primary" icon={Plus} onClick={() => setShowForm(!showForm)}>
          Upload Photo
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Upload New Photo</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="title"
              label="Photo Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            
            <Input
              name="description"
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Photo *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, GIF, WebP (Max 5MB)</p>
            </div>

            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option>Worship Services</option>
              <option>Youth Events</option>
              <option>Community Outreach</option>
              <option>Special Events</option>
              <option>Kids Ministry</option>
            </select>

            {preview && (
              <div>
                <p className="font-bold mb-2">Preview:</p>
                <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
              </div>
            )}

            <div className="flex gap-4">
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Upload Photo'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <Card key={photo._id} padding="none" hover>
            {/* ✅ FIXED: Use imageUrl directly - it's already a Cloudinary URL */}
            <img 
              src={photo.imageUrl}
              alt={photo.title}
              className="w-full h-64 object-cover rounded-t-xl"
              onError={(e) => {
                console.error('Image failed to load:', photo.imageUrl);
                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Error';
              }}
            />
            <div className="p-4">
              <h3 className="font-bold text-blue-900 mb-1">{photo.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{photo.category}</p>
              <p className="text-xs text-gray-500 mb-3">
                Uploaded: {new Date(photo.createdAt).toLocaleDateString()}
              </p>
              <button
                onClick={() => handleDelete(photo._id)}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </Card>
        ))}
      </div>

      {photos.length === 0 && !showForm && (
        <Card className="text-center py-12">
          <p className="text-gray-600">No photos uploaded yet. Click "Upload Photo" to get started.</p>
        </Card>
      )}
    </div>
  );
};

export default ManageGallery;