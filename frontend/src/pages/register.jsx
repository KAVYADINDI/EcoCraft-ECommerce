import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('buy');
  const [showSellNote, setShowSellNote] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/auth/register', {
        userID: name,
        email,
        password,
        role: accountType === 'buy' ? 'customer' : 'artist',
      });
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
        <input
          type="text"
          placeholder="Enter your Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-gray-700 rounded-lg focus:outline-none"
        />
        <input
          type="email"
          placeholder="Enter a valid Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-gray-700 rounded-lg focus:outline-none"
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-gray-700 rounded-lg focus:outline-none"
        />
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
              After you click register, our team will send an email to the address you provided with further instructions for artist onboarding.<br/><br/>
              As part of our commitment to authenticity and sustainability, an EcoCraft admin will reach out to you via email to learn more about your story, the products you wish to list, the materials you use, and the eco-friendly benefits of your creations. This process helps us ensure that all products meet our standards.<br/><br/>
              Once your information is reviewed and approved, you will receive access to list your products on our platform.<br/><br/>
              Thank you for your interest in joining the EcoCraft community!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
