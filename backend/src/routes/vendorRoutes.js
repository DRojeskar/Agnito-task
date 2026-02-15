
import express from 'express';
import * as vendorController from '../controllers/vendorController.js';


import { authenticate, requireRole } from '../middlewares/auth.js';


import { requireFields } from '../middlewares/validation.js';

import { validateObjectId } from '../middlewares/validateObjectId.js';




import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(authenticate, requireRole(ROLES.VENDOR));

router.get('/status', vendorController.getStatus);

router.post('/onboard', vendorController.onboard);

router.get('/wallet', vendorController.getWallet);

router.get('/products', vendorController.getProducts);






router.post('/product',requireFields('name', 'price'),vendorController.createProduct);

router.patch('/product/:id',validateObjectId('id'), vendorController.updateProduct);

router.get('/payments', vendorController.getPayments);

router.post('/complete-onboarding', vendorController.completeOnboarding);


export default router;
