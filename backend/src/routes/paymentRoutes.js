
import express from 'express';

import * as paymentController from '../controllers/paymentController.js';

import { authenticate, requireRole } from '../middlewares/auth.js';
import { requireFields } from '../middlewares/validation.js';

import { validateObjectId } from '../middlewares/validateObjectId.js';


import { ROLES } from '../utils/constants.js';

const router = express.Router();


router.post('/create-payment', authenticate, requireRole(ROLES.CUSTOMER), requireFields('productId'), paymentController.createPayment);
router.get('/:id/client-secret', authenticate, requireRole(ROLES.CUSTOMER), validateObjectId('id'), paymentController.getClientSecret);
router.get('/:id', authenticate, validateObjectId('id'), paymentController.getPayment);

export default router;
