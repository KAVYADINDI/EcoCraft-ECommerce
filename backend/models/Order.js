// JavaScript source code
import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  buyerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderDate: { type: Date, default: Date.now },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  shippingStatus: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
  items: [{
    productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    priceAtPurchase: { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
}, { timestamps: true });


const orderModel = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default orderModel;