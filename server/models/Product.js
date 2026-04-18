import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
    },
    subCategory: {
      type: String,
    },
    keyFeatures: [
      { type: String }
    ],
    variants: [
      {
        label: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String },
        images: [{ type: String }]
      }
    ],
    images: {
      type: [String],
      validate: [v => v.length <= 15, 'Cannot exceed 15 images'],
      default: ['/uploads/default.jpg'],
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
