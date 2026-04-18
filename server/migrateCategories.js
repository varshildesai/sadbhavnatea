import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Schema for Category
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String }
}, { timestamps: true });

const migrateCategories = async () => {
  const localUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sadbhavna_tea';
  const prodUri = process.env.PROD_MONGO_URI;

  if (!prodUri) {
    console.error('PROD_MONGO_URI is missing');
    process.exit(1);
  }

  try {
    const localDb = await mongoose.createConnection(localUri).asPromise();
    const LocalCategory = localDb.model('Category', categorySchema);
    
    const categories = await LocalCategory.find({}).lean();
    console.log(`📦 Found ${categories.length} categories locally.`);

    if (categories.length === 0) {
      console.log('No categories to migrate.');
      process.exit(0);
    }

    const prodDb = await mongoose.createConnection(prodUri).asPromise();
    const ProdCategory = prodDb.model('Category', categorySchema);

    for (let c of categories) {
      const exists = await ProdCategory.findById(c._id);
      if (!exists) {
        await ProdCategory.create(c);
        console.log(`✅ Uploaded Category: ${c.name}`);
      }
    }

    console.log(`🎉 Category Migration Complete!`);
    await localDb.close();
    await prodDb.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateCategories();
