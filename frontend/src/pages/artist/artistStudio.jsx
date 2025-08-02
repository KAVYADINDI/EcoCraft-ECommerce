
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../../components/navigationBar';
import api from '../../api';
import axios from 'axios';
import { FaEdit } from 'react-icons/fa';
import ArtistAddWork from './artistAddWork';

const ArtistStudio = () => {
  const [artworks, setArtworks] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editArtwork, setEditArtwork] = useState(null);

  // Try to get artist ID from sessionStorage, then localStorage
  const artistID = sessionStorage.getItem('id') || localStorage.getItem('id');
  const navigate = useNavigate();

  useEffect(() => {
    if (!artistID) {
      navigate('/login');
      return;
    }
    fetchArtworks();
  }, [artistID, navigate]);

  const fetchArtworks = async () => {
    try {
      const res = await api.get(`/products?artistID=${artistID}`);
      setArtworks(res.data);
    } catch (err) {
      setArtworks([]);
    }
  };

  const handleAddOrUpdate = async (formOrFormData) => {
    try {
      if (editArtwork) {
        // Update handled in update page, but fallback for in-place edit (not used currently)
        await api.put(`/products/${editArtwork._id}`, { ...formOrFormData, artistID });
      } else {
        // formOrFormData is FormData from ArtistAddWork
        if (formOrFormData instanceof FormData) {
          formOrFormData.append('artistID', artistID);
          await axios.post('/api/products', formOrFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          // fallback for non-FormData (should not happen)
          await api.post('/products', { ...formOrFormData, artistID });
        }
      }
      setShowForm(false);
      setEditArtwork(null);
      fetchArtworks();
    } catch (err) {
      alert('Error saving artwork');
    }
  };

  const handleEdit = (artwork) => {
    setEditArtwork(artwork);
    setShowForm(true);
  };

  const filteredArtworks = artworks.filter((art) =>
    art.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <NavigationBar role="artist" />
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Artworks</h2>
          <button onClick={() => { setShowForm(true); setEditArtwork(null); }} className="bg-green-700 text-white px-4 py-2 rounded">Add Artwork</button>
        </div>
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />
        {showForm && (
          <ArtistAddWork
            onSubmit={handleAddOrUpdate}
            initialData={editArtwork}
          />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {filteredArtworks.length === 0 ? (
            <div className="col-span-1 sm:col-span-2 md:col-span-3 flex items-center justify-center h-48 bg-gray-100 rounded-lg shadow-inner">
              <span className="text-gray-500 text-lg">No products to display yet</span>
            </div>
          ) : (
            filteredArtworks.map((art) => (
              <div key={art._id} className="relative group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Product Image */}
                {art.images && art.images.length > 0 && (
                  <img src={art.images[0]} alt={art.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{art.title}</h3>
                  <p className="text-gray-600 text-sm">Quantity available: <span className="font-bold">{art.quantityAvailable}</span></p>
                  <p className="text-gray-600 text-sm">Listing Price: <span className="font-bold">{art.listingPrice}</span></p>
                </div>
                {/* Edit icon top right, visible on hover */}
                <button
                  className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit Product"
                  onClick={() => navigate(`/artistUpdateWork/${art._id}`)}
                >
                  <FaEdit size={20} className="text-green-700" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistStudio;
