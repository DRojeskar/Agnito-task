
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import { VENDOR_STATUS } from '../utils/constants.js';
import { ApiError } from '../utils/errors.js';

export const listActiveProducts = async () => {
  const products = await Product.find()
    .populate({
      path: 'vendorId',
      populate: { path: 'userId', select: 'name' },
    })
    .lean();

    console.log(products,"kssksksksk")
  return products
    .filter((p) => p.vendorId && p.vendorId.status === VENDOR_STATUS.ACTIVE)
    .map((p) => ({
      id: p._id.toString(),
      name: p.name,
      price: p.price,
      description: p.description,
      vendorName: p.vendorId?.userId?.name || 'Unknown',
      vendorId: p.vendorId?._id?.toString(),
      vendorStatus: p.vendorId?.status,
    }));
};

export const getProductById = async (productId) => {
  const product = await Product.findById(productId)
    .populate({
      path: 'vendorId',
      populate: { path: 'userId', select: 'name' },
    })
    .lean();

  if (!product) {
    throw new ApiError('Product not found', 404);
  }

  return {
    id: product._id.toString(),
    name: product.name,
    price: product.price,
    description: product.description,
    vendorName: product.vendorId?.userId?.name || 'Unknown',
    vendorId: product.vendorId?._id?.toString(),
    vendorStatus: product.vendorId?.status,
  };
};
