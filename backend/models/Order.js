import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderDate: { type: Date, default: Date.now },
  items: [{
    productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    priceAtPurchase: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },     
    artistPayout: { type: Number, required: true },
    shippingStatus: { type: String, enum: ['pending', 'orderAccepted', 'shipped', 'cancelled'], default: 'pending' },
    shippedDate: { type: Date, default: null },
    trackingNumber: { type: String, default: null }
  }],
  orderStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  totalAmountWhilePlacingOrder: { type: Number, required: true },
}, { timestamps: true });


const orderModel = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default orderModel;