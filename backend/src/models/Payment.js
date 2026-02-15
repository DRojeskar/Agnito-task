import mongoose from 'mongoose';


import { PAYMENT_STATUS } from '../utils/constants.js';

const paymentSchema = new mongoose.Schema(
  {
    paymentIntentId: {type:String,required: true,unique: true},


    productId: {
      type: mongoose.Schema.Types.ObjectId,ref: 'Product',required: true},


    customerId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},

    vendorId:{type:mongoose.Schema.Types.ObjectId,ref: 'Vendor',required: true },

    amount:{type: Number,required: true },

    platformFee:{type:Number,required: true },

    vendorAmount:{type: Number,required: true},


    status: {type: String,enum: Object.values(PAYMENT_STATUS),default: PAYMENT_STATUS.PENDING,},

    webhookProcessedAt: {type: Date},
  },
  { timestamps: true }
);

paymentSchema.index({ paymentIntentId: 1 }, { unique: true });


paymentSchema.index({ status: 1 });

paymentSchema.index({ customerId: 1 });
paymentSchema.index({ vendorId: 1 });

export default mongoose.model('Payment', paymentSchema);
