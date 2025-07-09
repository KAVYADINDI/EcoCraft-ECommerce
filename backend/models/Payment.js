// JavaScript source code
import mongoose from 'mongoose';
const paymentSchema = new mongoose.Schema({
  orderID: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  method: { type: String, enum: ['Credit', 'Debit', 'PayPal', 'ApplePay'], required: true },
  transactionID: String,
  paymentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
}, { timestamps: true });

const paymentModel = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export default paymentModel;

