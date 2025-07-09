// JavaScript source code
import mongoose from 'mongoose';
const cartItemSchema = new mongoose.Schema({
  buyerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
}, { timestamps: true });

const cartItemModel = mongoose.models.CartItem || mongoose.model('CartItem', cartItemSchema);
export default cartItemModel;
