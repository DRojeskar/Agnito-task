import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {type: String,required: true },
    price: {type: Number, required: true,min:0},
    description: {type:String,default:''},
    vendorId: {type: mongoose.Schema.Types.ObjectId,ref: 'Vendor'},
  },
  { timestamps: true }
);

productSchema.index({ vendorId: 1 });



export default mongoose.model('Product', productSchema);
