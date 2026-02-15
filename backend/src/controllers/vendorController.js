
import * as vendorService from '../services/vendorService.js';

export const getStatus = async (req, res) => {
  const result = await vendorService.getVendorOnboardingStatus(req.user.id);
  console.log(result,"result")
 return res.json({ success: true, ...result });
};

export const onboard = async (req, res) => {
  const result = await vendorService.startOrResumeOnboarding(req.user.id);
  console.log(result,"result")
  console.log(result,"result")
  return res.json({success: true,...result});
};


export const getWallet = async (req, res) => {
  const vendor = await vendorService.getVendorByUserId(req.user.id);
  console.log(vendor,"vendor")
  const wallet = await vendorService.getVendorWallet(vendor._id);
 return res.json({ success: true,...wallet });
};

export const getProducts = async (req, res) => {
  const vendor = await vendorService.getVendorByUserId(req.user.id);
  console.log(vendor,"vendor")
  const products = await vendorService.getVendorProducts(vendor._id);
  console.log(products,"products")

  const items = products.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    price: p.price,
    description: p.description,
  }));
  console.log(items)
  return res.json({ success: true, products: items });
};

export const createProduct = async (req, res) => {
  const vendor = await vendorService.getVendorByUserId(req.user.id);
  console.log(vendor,"vendor")
  const product = await vendorService.createProduct(vendor._id, req.body);
  console.log(product,"products")
 return res.status(201).json({success: true,
    product: {
      id: product._id,
      name: product.name,
      price: product.price,
      description: product.description,
    },
  });
};

export const updateProduct = async (req, res) => {
  const vendor = await vendorService.getVendorByUserId(req.user.id);
  console.log(vendor,"vendprr")
  const product = await vendorService.updateProduct(req.params.id, vendor._id, req.body);
  return res.json({success: true,
product: {
      id: product._id,
      name: product.name,
      price: product.price,
      description: product.description,
    },
  });
};

export const getPayments = async (req, res) => {
  const vendor = await vendorService.getVendorByUserId(req.user.id);
  console.log(vendor,"vendor")
  const payments = await vendorService.getVendorPayments(vendor._id);
  console.log(payments,"payment")
  const items = payments.map((p) => ({
    id: p._id.toString(),
    paymentIntentId: p.paymentIntentId,
    status: p.status,
    amount: p.amount,
    product: p.productId,
    customer: p.customerId,
    createdAt: p.createdAt,
  }));
  return res.json({ success: true, payments: items });
};


// export const completeOnboarding = async (req, res) => {
//   const result = await vendorService.completeVendorOnboarding(req.user.id);

//   res.json({
//     success: true,
//     message: "Thank you! Your onboarding is completed.",
//     ...result
//   });
// };


// COMPLETE ONBOARDING
// export const completeOnboarding = async () => {
//   const res = await fetch('/api/vendor/complete-onboarding', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${localStorage.getItem('token')}`,
//     },
//   });

//   const data = await res.json();

//   if (!res.ok) {
//     throw new Error(data.message || 'Failed to complete onboarding');
//   }

//   return data;
// };



export const completeOnboarding = async (req, res) => {
  const result = await vendorService.completeVendorOnboarding(req.user.id);
  console.log(result,"test")

 return res.json({ success: true, message: "Thank you! Your onboarding is completed.", ...result});
};

