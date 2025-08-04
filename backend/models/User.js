// JavaScript source code
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'artist', 'customer'], required: true },
  passwordHistory: [{ type: String }], // stores previous password hashes
  resetPasswordToken: String, // Stores the hashed token during resetPassword
  resetPasswordExpires: Date, // Stores the expiry date/time for the reset token

  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date },

    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
    },
    mobile: { type: String },
  },

  // For customers
  interests: { type: String },
  favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  // For artists
  originStory: { type: String },
  status: {
    type: String,
    enum: ['request_received', 'waiting_for_documents', 'received_documents', 'approved', 'rejected'],
    default: function() {
      return this.role === 'artist' ? 'request_received' : undefined;
    }
  },
 // commissionRate: { type: Number, default: 0 },

}, { timestamps: true });

const userModel = mongoose.models.User || mongoose.model('User', userSchema);
export default userModel;