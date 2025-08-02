import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../api';
import ArtistAddWork from './artistAddWork';
import NavigationBar from '../../components/navigationBar';

const ArtistUpdateWork = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');


  console.log('id from local session:', id);
  const artistID = sessionStorage.getItem('id') || localStorage.getItem('id');
  console.log('Artist ID:', artistID);

  useEffect(() => {
    // Fetch product details for this artist only
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        // Only allow if the product belongs to the logged-in artist
        if (res.data.artistID === artistID) {
          setProduct(res.data);
        } else {
          setError('You are not authorized to edit this product.');
        }
      } catch (err) {
        setError('Product not found or you are not authorized.');
      }
    };
    fetchProduct();
  }, [id, artistID]);


  const handleUpdate = async (formData) => {
    try {
      // Add artistID to formData if not present
      if (!formData.has('artistID')) {
        formData.append('artistID', artistID);
      }
      await axios.put(`/api/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/artist/studio');
    } catch (err) {
      let errorMsg = 'Failed to update product.';
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          // If backend sent HTML or plain text
          if (err.response.data.startsWith('<!DOCTYPE') || err.response.data.startsWith('<html')) {
            errorMsg = 'Server error: Please check backend logs.';
          } else {
            errorMsg = err.response.data;
          }
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        } else {
          errorMsg = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    }
  };

  return (
    <div>
      <NavigationBar role="artist" />
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Update Artwork</h2>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {product && (
      <ArtistAddWork onSubmit={handleUpdate} initialData={product} />
        )}
      </div>
    </div>
  );
};

export default ArtistUpdateWork;
