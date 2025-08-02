import mongoose from 'mongoose';
const cartSchema = new mongoose.Schema({
  customerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true, default: 0 },
}, { timestamps: true });
const cartModel = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
export default cartModel;