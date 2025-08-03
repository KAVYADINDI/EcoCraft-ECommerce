import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  artistID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Relationship: Product belongs to an artist
    required: true
  },
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  // listingPrice: { type: Number, required: false },
  
  // Detailed Information
  category: {
    type: String,
    enum: ['All Categories', 'Wall Art', 'Home Decor', 'Wearable Art', 'Stationery', 'Utility Crafts'],
    required: true
  },
  materials: [{ type: String }], // Change materials to a list of strings
  dimensions: String,
  careInstructions: String,
  certified: { type: Boolean, default: false },
  
  returnPolicy: {
    type: String,
    default: 'We do not accept returns, but you can cancel your order before it ships.'
  },

  // Visuals
  images: [{ type: String }], // Store image URLs or file references
  
  // Chatbot-Searchable Tags
  tags: [{
    type: String
    // keywords like category, type, color, room
  }],
  
  quantityAvailable: { type: Number, default: 0 },
  commissionRate: { type: Number, default: 0 },
  listProduct: { type: Boolean, default: false },

}, { timestamps: true });


const productModel = mongoose.models.Product || mongoose.model('Product', productSchema);
export default productModel;