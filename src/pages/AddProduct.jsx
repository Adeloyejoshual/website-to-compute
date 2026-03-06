import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const { id: sellerId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'NGN',
    category: '',
    marketplace_type: 'product',
    status: 'available',
    stock: 1,
    is_public: true,
    seller_type: 'individual',
    
    // Electronics fields
    brand: '',
    type: '',
    model: '',
    sim: '',
    year: '',
    voltage: '',
    megapixels: '',
    lens_mount: '',
    os: '',
    screen_size: '',
    processor: '',
    ram: '',
    storage: '',
    
    // Vehicle fields
    mileage: '',
    unlock_status: '',
    network: '',
    drive_type: '',
    service_history: '',
    accident_free: '',
    customs_duty_paid: '',
    registration: '',
    
    // Book fields
    title: '',
    author: '',
    isbn: '',
    edition: '',
    subject: '',
    pages_complete: '',
    
    // Job fields
    job_title: '',
    job_type: '',
    salary_min: '',
    salary_max: '',
    skills: '',
    education: '',
    experience_required: '',
    
    // Generic product fields
    condition: 'new',
    warranty: '',
    used_detail: '',
    features: '',
    size: '',
    weight: '',
    dimensions: '',
    material: '',
    
    // Pet fields
    pet_type: '',
    species: '',
    breed: '',
    gender: '',
    age_range: '',
    vaccination_status: '',
    pedigree: '',
    health_certificate: '',
    
    // Other fields
    compatibility: '',
    graphics_card: '',
    battery_health: '',
    power_rating: '',
    accessories: '',
    ingredients: '',
    protein_content: '',
    state: '',
    city: '',
    salary_expectation: '',
    availability: '',
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories] = useState([
    'electronics', 'vehicles', 'books', 'jobs', 'pets', 'real-estate', 
    'fashion', 'home-garden', 'services', 'parts', 'food'
  ]);

  const categoryFields = {
    electronics: ['brand', 'model', 'os', 'processor', 'ram', 'storage', 'screen_size'],
    vehicles: ['mileage', 'year', 'registration', 'drive_type', 'service_history'],
    books: ['title', 'author', 'isbn', 'edition', 'subject'],
    jobs: ['job_title', 'job_type', 'salary_min', 'salary_max', 'skills'],
    pets: ['pet_type', 'species', 'breed', 'vaccination_status']
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files.slice(0, 5 - prev.length)]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });
      
      formDataToSend.append('seller_id', sellerId);
      images.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      const response = await fetch('/api/products', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        navigate(`/seller/${sellerId}/products`);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVisibleFields = () => {
    const visibleFields = ['name', 'description', 'price', 'currency', 'category', 'stock'];
    
    if (formData.category && categoryFields[formData.category]) {
      visibleFields.push(...categoryFields[formData.category].slice(0, 4));
    }
    
    return visibleFields;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Add New Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₦) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-vertical"
            required
          />
        </div>

        {/* Category-specific fields (dynamic) */}
        {formData.category && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {formData.category.replace('_', ' ').toUpperCase()} Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryFields[formData.category]?.slice(0, 6).map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {field.replace('_', ' ')}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images (Max 5)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {img.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate(`/seller/${sellerId}`)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
                Saving...
              </>
            ) : (
              'Add Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;