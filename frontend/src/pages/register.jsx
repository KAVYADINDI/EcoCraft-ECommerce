import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const [form, setForm] = useState({
    userID: '',
    email: '',
    password: '',
    role: 'customer',
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    mobile: '',
  });
  const [accountType, setAccountType] = useState('buy');
  const [showSellNote, setShowSellNote] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const address = {
        street: form.street,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        country: form.country
      };
      const payload = {
        userID: form.userID,
        email: form.email,
        password: form.password,
        role: accountType === 'buy' ? 'customer' : 'artist',
        personalInfo: {
          firstName: form.firstName,
          lastName: form.lastName,
          address,
          mobile: form.mobile
        }
      };
      await api.post('/auth/register', payload);
      setSuccess('Registration successful! Please check your email for further instructions.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
    setLoading(false);
  };

  const handleSellClick = () => {
    setAccountType('sell');
    setShowSellNote(true);
  };

  const closeModal = () => setShowSellNote(false);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-green-700">Register</h2>
        {error && <div className="mb-2 text-red-600 text-center">{error}</div>}
        {success && <div className="mb-2 text-green-700 text-center">{success}</div>}
        <label>User ID</label>
        <input
          name="userID"
          value={form.userID}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded mb-2"
          placeholder="User ID"
        />
        <label>Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded mb-2"
          placeholder="Email"
        />
        <label>Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded mb-2"
          placeholder="Password"
        />
        <label>First Name</label>
        <input
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded mb-2"
          placeholder="First Name"
        />
        <label>Last Name</label>
        <input
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded mb-2"
          placeholder="Last Name"
        />
        <label>Mobile</label>
        <input
          name="mobile"
          value={form.mobile}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded mb-2"
          placeholder="Mobile"
        />
        <fieldset className="mb-2">
          <legend>Address:</legend><br />
          <label>Street</label>
          <input name="street" value={form.street} onChange={handleChange} required className="w-full border p-2 rounded mb-2" placeholder="Street" />
          <label>City</label>
          <input name="city" value={form.city} onChange={handleChange} required className="w-full border p-2 rounded mb-2" placeholder="City" />
          <label>State</label>
          <input name="state" value={form.state} onChange={handleChange} required className="w-full border p-2 rounded mb-2" placeholder="State" />
          <label>Zip Code</label>
          <input name="zipCode" value={form.zipCode} onChange={handleChange} required className="w-full border p-2 rounded mb-2" placeholder="Zip Code" />
          <label>Country</label>
          <input name="country" value={form.country} onChange={handleChange} required className="w-full border p-2 rounded mb-2" placeholder="Country" />
        </fieldset>
        <div className="flex justify-center mb-4">
          <button
            type="button"
            className={`px-4 py-2 rounded-l-lg border border-green-700 font-semibold ${accountType === 'buy' ? 'bg-green-700 text-white' : 'bg-white text-green-700'}`}
            onClick={() => { setAccountType('buy'); setShowSellNote(false); }}
          >
            Buy
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-r-lg border border-green-700 font-semibold ${accountType === 'sell' ? 'bg-green-700 text-white' : 'bg-white text-green-700'}`}
            onClick={handleSellClick}
          >
            Sell
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Create Account'}
        </button>
      </form>
      {showSellNote && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
            <h3 className="text-lg font-bold mb-2 text-green-700">Note for Sellers</h3>
            <p className="text-gray-700 text-base">
             You must have received an email for further processing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;