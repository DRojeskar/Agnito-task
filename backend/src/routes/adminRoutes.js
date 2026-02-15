
import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { requireFields } from '../middlewares/validation.js';
import { validateObjectId } from '../middlewares/validateObjectId.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(authenticate, requireRole(ROLES.ADMIN));

router.post('/vendor',requireFields('email','password','name'),adminController.createVendor);
router.patch(
  '/vendor/:id/status',
  validateObjectId('id'),
  requireFields('status'),
  adminController.updateVendorStatus
);


router.get('/vendors',adminController.listVendors);
router.get('/payments',adminController.listPayments);
router.get('/wallet',adminController.getPlatformWallet);

export default router;
