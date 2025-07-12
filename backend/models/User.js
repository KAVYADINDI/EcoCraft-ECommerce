// JavaScript source code
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'artist', 'customer'], required: true },
  passwordHistory: [{ type: String }], // stores previous password hashes

  // For customers: interests (comma-separated string or array of tags/categories)
  interests: { type: String },

  // Favourites: Array of Product references (products they like)
  favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  // For artists: origin story
  originStory: { type: String },

  // status field for admin panel
  status: {
    type: String,
    enum: ['request_received', 'waiting_for_documents', 'received_documents', 'approved', 'rejected'],
    default: function() {
      return this.role === 'artist' ? 'request_received' : undefined;
    }
  },

  // Personal Information (for both artists and customers)
  personalInfo: {
    address: { type: String },
    mobile: { type: String },
  },
}, { timestamps: true });

const userModel = mongoose.models.User || mongoose.model('User', userSchema);
export default userModel;