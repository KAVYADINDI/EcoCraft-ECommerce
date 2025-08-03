import express from 'express';
import User from '../models/User.js';
import { authenticateJWT, isAdmin } from '../middleware/auth.js';
import { updateCommissionRate } from '../controllers/adminController.js';

const router = express.Router();

// GET /api/users/ - Fetch all users (admin only)
router.get('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('userID email role status personalInfo'); // adjust fields as needed
    res.json(users);
  } catch (err) {
    console.error('Error fetching all users:', err);
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

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
    'approved': ['rejected'],
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

// // Route to update commission rate
// router.patch('/update-commission-rate', updateCommissionRate);

// Get user details by userID
router.get('/:userID', authenticateJWT, async (req, res) => {
  const { userID } = req.params;

  try {
    const user = await User.findById(userID).select('userID email role personalInfo'); // Adjust fields as needed
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

// Update user details (name, email, personalInfo)
router.patch('/:userID', authenticateJWT, async (req, res) => {
  const { userID } = req.params;
  const { userID: newUserID, email, personalInfo, originStory } = req.body;
  console.log('[PATCH /api/users/:userID] Params:', req.params);
  console.log('[PATCH /api/users/:userID] Body:', req.body);
  try {
    const update = {};
    if (typeof newUserID === 'string' && newUserID.trim()) {
      update.userID = newUserID.trim();
      console.log('[PATCH /api/users/:userID] Will update userID to:', update.userID);
    }
    if (typeof email === 'string' && email.trim()) {
      update.email = email.trim();
      console.log('[PATCH /api/users/:userID] Will update email to:', update.email);
    }
    if (personalInfo && typeof personalInfo === 'object') {
      for (const key of Object.keys(personalInfo)) {
        if (key === 'mobile' && typeof personalInfo[key] === 'string') {
          // Validate mobile number: allow +, digits, spaces, dashes, 10-15 digits
          const cleaned = personalInfo[key].replace(/[\s\-]/g, '');
          const mobileRegex = /^\+?\d{10,15}$/;
          if (!mobileRegex.test(cleaned)) {
            console.log('[PATCH /api/users/:userID] Invalid mobile number:', personalInfo[key]);
            return res.status(400).json({ message: 'Invalid mobile number format.' });
          }
        }
        update[`personalInfo.${key}`] = personalInfo[key];
        console.log(`[PATCH /api/users/:userID] Will update personalInfo.${key} to:`, personalInfo[key]);
      }
    }
    if (typeof originStory === 'string' && originStory.trim()) {
      update.originStory = originStory.trim();
      console.log('[PATCH /api/users/:userID] Will update originStory to:', update.originStory);
    }
    console.log('[PATCH /api/users/:userID] Final update object:', update);
    if (Object.keys(update).length === 0) {
      console.log('[PATCH /api/users/:userID] No valid fields to update.');
      return res.status(400).json({ message: 'No valid fields to update.' });
    }
    const user = await User.findByIdAndUpdate(userID, update, { new: true });
    if (!user) {
      console.log('[PATCH /api/users/:userID] User not found for id:', userID);
      return res.status(404).json({ message: 'User not found.' });
    }
    console.log('[PATCH /api/users/:userID] User updated successfully:', user);
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error('[PATCH /api/users/:userID] Error updating user:', err);
    res.status(500).json({ message: 'Failed to update user.' });
  }
});

export default router;
