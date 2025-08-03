import Product from '../models/Product.js';

export const updateCommissionRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { commissionRate } = req.body;

    if (commissionRate === undefined) {
      return res.status(400).json({ message: 'Commission rate is required.' });
    }

    const product = await Product.findByIdAndUpdate(
    id,
    { 
      commissionRate,
      listProduct: true 
    },
    { new: true }
);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({ message: 'Commission rate updated successfully.', productID: product._id });
  } catch (error) {
    console.error('Error updating commission:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};
