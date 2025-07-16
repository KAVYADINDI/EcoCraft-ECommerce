// JavaScript source code
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'artist', 'admin'], default: 'user' },
  passwordHash: { type: String, required: true },
  passwordHistory: [{ type: String }], // stores previous password hashes

  // For customers: interests (comma-separated string or array of tags/categories)
  interests: { type: String },

  // Favourites: Array of Product references (products they like)
  favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  // For artists:
  originStory: { type: String },

  // status field for admin panel
  status: {
    type: String,
    enum: ['request_received', 'waiting_for_documents', 'received_documents', 'approved', 'rejected'],
    default: function() {
      return this.role === 'artist' ? 'request_received' : undefined;
    }
  },

  commissionRate: { type: Number, default: 0 },

  // Personal Information (for both artists and customers)
  personalInfo: {
    address: { type: String },
    mobile: { type: String },
  },
}, { timestamps: true });

const userModel = mongoose.models.User || mongoose.model('User', userSchema);
export default userModel;