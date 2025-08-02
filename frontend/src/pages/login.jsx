import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      const user = res.data?.user;
      const role = user?.role;
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
      }
      if (user?._id) {
        localStorage.setItem('id', user._id); // Save user ID to localStorage for all roles
        console.log('User ID saved to localStorage:', user._id);  
      }
      if (role === 'artist') {
        navigate('/artist/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'customer') {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-green-700">Sign in</h2>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="border-2 border-gray-800 text-gray-800 font-semibold rounded-full px-6 py-2 hover:bg-gray-100 focus:outline-none"
          >
            Register
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-lg font-semibold mb-1" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none text-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-lg font-semibold mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none text-lg"
          />
        </div>
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <button
            type="button"
            onClick={() => navigate('/forgotPassword')}
            className="text-gray-700 underline hover:text-gray-900 text-base focus:outline-none"
          >
            Forgot your password?
          </button> 
        </div>
        <button
          type="submit"
          className="w-full bg-green-700 text-white py-4 rounded-full text-xl font-semibold hover:bg-green-800 focus:outline-none"
        >
          Sign in
        </button>
      </form>
    </div>
  );
};

export default Login;
