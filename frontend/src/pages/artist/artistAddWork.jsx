import React, { useState } from 'react';

const initialState = {
  title: '',
  description: '',
  price: '',
  materials: '',
  dimensions: '',
  careInstructions: '',
  certified: false,
  copyrightText: '',     
  tags: '',
  quantityAvailable: 1,
  category: '',
};

const categories = ['select Category','Wall Art', 'Home Decor', 'Wearable Art', 'Stationery', 'Utility Crafts'];

const ArtistAddWork = ({ onSubmit, initialData }) => {
  const [form, setForm] = useState(initialData || initialState);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    setForm((prev) => ({
      ...prev,
      images: Array.from(e.target.files),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Build FormData for file upload
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'images' && value && value.length > 0) {
        value.forEach((file) => formData.append('images', file));
      }
      else {
        formData.append(key, value);
      }
    });

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow max-w-xl mx-auto" encType="multipart/form-data">
      <h3 className="text-lg font-bold">{initialData ? 'Update Artwork' : 'Add New Artwork'}</h3>
  
      <div className="mb-4">
      <label className="block font-semibold mb-1">Title</label>
      <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="w-full border p-2 rounded" required />
      </div>
       <div className="mb-4">
      <label className="block font-semibold mb-1">Description</label>
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full border p-2 rounded" />
       </div>
       <div className="mb-4">
      <label className="block font-semibold mb-1">Price</label>
      <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" className="w-full border p-2 rounded" required />
      </div>
       <div className="mb-4">
      <label className="block font-semibold mb-1">Materials</label>
      <input name="materials" value={form.materials} onChange={handleChange} placeholder="Materials (comma separated)" className="w-full border p-2 rounded" />
       </div>
       <div className="mb-4">
      <label className="block font-semibold mb-1">Dimensions</label>
      <input name="dimensions" value={form.dimensions} onChange={handleChange} placeholder="Dimensions" className="w-full border p-2 rounded" />
       </div>
       <div className="mb-4">
      <label className="block font-semibold mb-1">Care Instructions</label>
      <input name="careInstructions" value={form.careInstructions} onChange={handleChange} placeholder="Care Instructions" className="w-full border p-2 rounded" />
        </div>
      <label className="flex items-center gap-2">
        <input name="certified" type="checkbox" checked={form.certified} onChange={handleChange} /> Display copyright?
      </label>
        {form.certified && (
      <div className="mb-4">
        <label className="block font-semibold mb-1">Copyright Notice</label>
        <div className="flex gap-2">
          <input
            name="copyrightText"
            value={form.copyrightText}
            onChange={handleChange}
            placeholder="e.g., © 2025 Your Name. All rights reserved."
            className="w-full border p-2 rounded"
          />
          <button
            type="button"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                copyrightText: prev.copyrightText + '©'
              }))
            }
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            title="Insert © symbol"
          >
            + ©
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Add a copyright statement to display with this product.</p>
      </div>
    )}
      <div className="mb-4">
      <label className="block font-semibold mb-1">Images</label>
      <input name="images" type="file" multiple onChange={handleImageChange} className="w-full" />
      </div>
        <div className="mb-4">
      <label className="block font-semibold mb-1">Tags</label>
      <input name="tags" value={form.tags} onChange={handleChange} placeholder="Tags (comma separated)" className="w-full border p-2 rounded" />
      </div>
       <div className="mb-4">
      <label className="block font-semibold mb-1">Quantity</label>
      <input name="quantityAvailable" value={form.quantityAvailable} onChange={handleChange} placeholder="Quantity" type="number" className="w-full border p-2 rounded" />
      </div>
        <div className="mb-4">
      <label className="block font-semibold mb-1">Category</label>
      <select name="category" value={form.category} onChange={handleChange} className="w-full border p-2 rounded">
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      </div>
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">{initialData ? 'Update' : 'Add'}</button>
    </form>
  );
};

const handleSubmit = (e) => {
  e.preventDefault();

  if (form.certified && !form.copyrightText.trim()) {
    alert('Please enter your copyright notice.');
    return;
  }

  const formData = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (key === 'images' && value && value.length > 0) {
      value.forEach((file) => formData.append('images', file));
    } else {
      formData.append(key, value);
    }
  });

  onSubmit(formData);
};

export default ArtistAddWork;

