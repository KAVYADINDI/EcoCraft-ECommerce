import mongoose from 'mongoose';

// Define the schema for individual cart items
const cartItemSchema = new mongoose.Schema({
  productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { timestamps: true }); // Automatically adds `createdAt` and `updatedAt`

// Define the schema for the cart
const cartSchema = new mongoose.Schema({
  buyerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user
  items: [cartItemSchema], // Embedded cart items as subdocuments
}, { timestamps: true }); // Automatically adds `createdAt` and `updatedAt`

export default mongoose.model('Cart', cartSchema);

