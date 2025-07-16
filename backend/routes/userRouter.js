import express from 'express';
import User from '../models/User.js';
import { authenticateJWT, isAdmin } from '../middleware/auth.js';
import { updateCommissionRate } from '../controllers/adminController.js';

const router = express.Router();

// Get all artists (for admin panel)
router.get('/artists', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const artists = await User.find({ role: 'artist' }, 'userID email status');
    res.json(artists);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch artists.' });
  }
});

// Update artist status (admin only)
router.patch('/artist/:id/status', authenticateJWT, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  // Add documents_received to the allowed statuses
  const allowed = ['request_received', 'waiting_for_documents', 'received_documents', 'approved', 'rejected'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  // Add logic for mapping status transitions
  const statusTransitions = {
    'request_received': ['waiting_for_documents'],
    'waiting_for_documents': ['received_documents'],
    'received_documents': ['approved', 'rejected'],
  };

  const currentStatus = await User.findById(id).select('status');
  console.log('Received ID:', id);
  console.log('Current Status:', currentStatus.status);
  console.log('Requested Status:', status);
  if (!statusTransitions[currentStatus.status]?.includes(status)) {
    return res.status(400).json({ message: 'Invalid status transition.' });
  }

  try {
    const user = await User.findByIdAndUpdate(id, { status }, { new: true });
    if (!user) return res.status(404).json({ message: 'Artist not found.' });
    res.json({ message: 'Status updated.', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status.' });
  }
});

// Route to update commission rate
router.patch('/update-commission-rate', updateCommissionRate);

// Get user details by userId
router.get('/:userId', authenticateJWT, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select('name email role'); // Adjust fields as needed
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
    console.log('Fetched user details:', user);
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ message: 'Failed to fetch user details.' });
  }
});

export default router;
