import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import ArtistStudio from './pages/artist/artistStudio';
import AdminPanel from './pages/admin/adminPanel';
import Login from './pages/login';
import Register from './pages/register';
import Cart from './pages/cart';
import ForgotPassword from './pages/forgotPassword';
import ChangePassword from './pages/changePassword'; // Assuming this is the correct path for ChangePassword
import ArtistDashboard from './pages/artist/artistDashboard';
import ArtistUpdateWork from './pages/artist/artistUpdateWork';
import CustomerDashboard from './pages/customer/customerDashboard';
import AdminDashboard from './pages/admin/adminDashboard';
import UserAccount from './pages/customer/userAccount';
import ArtistAccount from './pages/artist/artistAccount';
import ArtistOrders from './pages/artist/artistOrders';
import CustomerOrders from './pages/customer/customerOrders';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/cart" element={<Cart/>} />
        <Route path="/artist/studio" element={<ArtistStudio/>} />
        <Route path="/admin/adminPanel" element={<AdminPanel/>} />
        <Route path="/artistUpdateWork/:id" element={<ArtistUpdateWork/>} />
        <Route path="/forgotPassword" element={<ForgotPassword/>} />
        <Route path="/changePassword/:token" element={<ChangePassword/>} />
        <Route path="/artist/dashboard" element={<ArtistDashboard/>} />
        <Route path="/customer/dashboard" element={<CustomerDashboard/>} />
        <Route path="/admin/dashboard" element={<AdminDashboard/>} />
        <Route path="/customer/userAccount" element={<UserAccount/>} />
        <Route path="/customer/customerOrders" element={<CustomerOrders/>} />
        <Route path="/artist/artistAccount" element={<ArtistAccount/>} />
        <Route path="/artist/orders" element={<ArtistOrders/>} />
      </Routes>
    </Router>
  );
};

export default App;
