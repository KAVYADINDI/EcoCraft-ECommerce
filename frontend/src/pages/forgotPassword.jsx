import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [userID, setUserID] = useState('');
  const [lastRememberedPassword, setLastRememberedPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('/api/auth/passwordReset', { userID, lastRememberedPassword });
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-green-700">Forgot Password</h2>
        <div className="mb-4">
          <label className="block font-semibold mb-1" htmlFor="userID">User ID</label>
          <input
            id="userID"
            type="text"
            placeholder="Enter your User ID"
            value={userID}
            onChange={(e) => setUserID(e.target.value)}
            className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block font-semibold mb-1" htmlFor="lastPassword">Last Remembered Password</label>
          <input
            id="lastPassword"
            type="password"
            placeholder="Enter your last remembered password"
            value={lastRememberedPassword}
            onChange={(e) => setLastRememberedPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 focus:outline-none"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Request Password Reset'}
        </button>
        {message && <p className="mt-4 text-center text-green-700">{message}</p>}
      </form>
    </div>
  );
};

export default ForgotPassword;
