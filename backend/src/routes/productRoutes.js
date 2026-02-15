
import express from 'express';
import * as productController from '../controllers/productController.js';

import { validateObjectId } from '../middlewares/validateObjectId.js';

const router = express.Router();

router.get('/',productController.listProducts);
router.get('/:id',validateObjectId('id'), productController.getProduct);

export default router;
