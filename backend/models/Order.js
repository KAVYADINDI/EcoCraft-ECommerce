// JavaScript source code
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  artistID: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Order', orderSchema);