import mongoose from 'mongoose';

import { ROLES } from '../utils/constants.js';

const userSchema = new mongoose.Schema({
    email: { type:String,required: true,unique: true},
    password: {type: String,required: true,select: false},
    name: { type: String,required:true},
    role: {type: String,enum: Object.values(ROLES),required: true,
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);
