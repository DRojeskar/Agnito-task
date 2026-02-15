import mongoose from 'mongoose';
import { VENDOR_STATUS } from '../utils/constants.js';

const vendorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true},
    status: {type:String,
enum: Object.values(VENDOR_STATUS),
      default: VENDOR_STATUS.NOT_CONNECTED,
    },
    onboardingLink:{type: String},
  },
  {timestamps: true }
);

vendorSchema.index({ userId: 1 }, { unique: true });

vendorSchema.index({ status: 1 });

export default mongoose.model('Vendor', vendorSchema);
