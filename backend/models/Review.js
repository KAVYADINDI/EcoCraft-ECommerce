// JavaScript source code
import mongoose from 'mongoose';
const reviewSchema = new mongoose.Schema({
  productID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Linked to the product being reviewed
    required: true
  },
  reviewerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Linked to the user who submitted the review
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: { type: String },
  sentimentScore: { type: Number }, // Optional: for analysis
}, { timestamps: true });

const reviewModel = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default reviewModel;