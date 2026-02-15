
import * as adminService from '../services/adminService.js';

export const createVendor = async (req, res) => {
  const { vendor } = await adminService.createVendor(req.body);
  const user = (await vendor.populate('userId', 'email name')).userId;
  res.status(201).json({
    success: true,
    vendor: {
      id: vendor._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      status: vendor.status,
    },
  });
};

export const listVendors = async (req, res) => {
  const vendors = await adminService.listVendors();
  const items = vendors.map((v) => ({
    id: v._id.toString(),
    userId: v.userId?._id?.toString(),
    email: v.userId?.email,
    name: v.userId?.name,
    status: v.status,
    createdAt: v.createdAt,
  }));
  res.json({ success: true, vendors: items });
};

export const updateVendorStatus = async (req, res) => {
  const vendor = await adminService.updateVendorStatus(req.params.id, req.body.status);
  res.json({
    success: true,
    vendor: {
      id: vendor._id.toString(),
      email: vendor.userId?.email,
      name: vendor.userId?.name,
      status: vendor.status,
    },
  });
};

export const listPayments = async (req, res) => {
  const payments = await adminService.listAllPayments();
  const items = payments.map((p) => ({
    id: p._id.toString(),
    paymentIntentId: p.paymentIntentId,
    status: p.status,
    amount: p.amount,
    product: p.productId,
    customer: p.customerId,
    vendor: p.vendorId,
    createdAt: p.createdAt,
  }));
  res.json({ success: true, payments: items });
};

export const getPlatformWallet = async (req, res) => {
  const wallet = await adminService.getPlatformWallet();
  res.json({ success: true, ...wallet });
};
