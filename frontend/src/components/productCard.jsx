import React from 'react';

const ProductCard = ({ product }) => {
  const { name, price, image } = product;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <img src={image} alt={name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
        <p className="text-indigo-600 font-bold">{price}</p>
      </div>
    </div>
  );
};

export default ProductCard;
