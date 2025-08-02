import User from '../models/User.js';
import mongoose from 'mongoose';

// Update commission rate for an artist
export const updateCommissionRate = async (req, res) => {
  try {
    const { id, commissionRate } = req.body;

    console.log('Request body:', req.body);

    // Validate input
    if (!id || commissionRate === undefined) {
      console.log('Validation failed: Missing id or commissionRate');
      return res.status(400).json({ message: 'ID and commission rate are required.' });
    }

    console.log('Validation passed. Querying database...');

   // const objectId = new mongoose.Types.ObjectId(userId);
    // Find and update the artist's commission rate
    const user = await User.findOneAndUpdate(
      { _id: id, role: 'artist' },
      { commissionRate },
      { new: true }
    );

    console.log('Database query result:', user);

    if (!user) {
      console.log('Artist not found for userID:', user.userID);
      return res.status(404).json({ message: 'Artist not found.' });
    }

    console.log('Updated commission rate:', commissionRate, 'for userID:', user.userID);
    res.status(200).json({ message: 'Commission rate updated successfully.', userID: user.userID });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};