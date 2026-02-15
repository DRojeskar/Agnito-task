
import express from 'express';
import authRoutes from './authRoutes.js';

import adminRoutes from './adminRoutes.js';


import vendorRoutes from './vendorRoutes.js';
import productRoutes from './productRoutes.js';


import paymentRoutes from './paymentRoutes.js';
import webhookRoutes from './webhookRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);


router.use('/admin', adminRoutes);

router.use('/vendor', vendorRoutes);

router.use('/products', productRoutes);


router.use('/payment', paymentRoutes);
router.use('/webhook', webhookRoutes);

export default router;
