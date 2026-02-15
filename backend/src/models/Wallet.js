import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    ownerId: {type:mongoose.Schema.Types.Mixed,required: true },

    ownerType: 
    {type:String,enum: ['vendor', 'platform'],required: true},


    balance: {type:Number,default: 0,min: 0},


    currency: {type: String, default: 'USD'},
  },
  { timestamps: true}
);

walletSchema.index({ ownerId: 1, ownerType: 1 }, { unique: true });


export default mongoose.model('Wallet', walletSchema);
