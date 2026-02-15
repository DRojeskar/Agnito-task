
import express from 'express';
import { handleWebhook } from '../controllers/webhookController.js';


import { verifyWebhookSignature } from '../middlewares/webhookSignature.js';

const router = express.Router();

router.post('/',verifyWebhookSignature,handleWebhook);

export default router;
