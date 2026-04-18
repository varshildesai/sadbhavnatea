import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const migrateProducts = async () => {
  const localUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sadbhavna_tea';
  const prodUri = process.env.PROD_MONGO_URI;

  if (!prodUri || prodUri === '') {
    console.error('❌ Error: PROD_MONGO_URI is missing in your .env file!');
    console.error('Please add your MongoDB Atlas connection string to .env as PROD_MONGO_URI=mongodb+srv://... and run this script again.');
    process.exit(1);
  }

  try {
    // 1. Connect to Local DB
    console.log('🔗 Connecting to Local Database...');
    const localDb = await mongoose.createConnection(localUri).asPromise();
    const LocalProduct = localDb.model('Product', Product.schema);
    
    // Fetch all products from localhost
    const products = await LocalProduct.find({}).lean();
    console.log(`📦 Found ${products.length} products in local database.`);

    if (products.length === 0) {
      console.log('No products to migrate. Exiting.');
      process.exit(0);
    }

    // 2. Connect to Production DB
    console.log('\n🔗 Connecting to Production Database (MongoDB Atlas)...');
    const prodDb = await mongoose.createConnection(prodUri).asPromise();
    const ProdProduct = prodDb.model('Product', Product.schema);

    // Prepare products for insertion (remove existing _id to avoid conflicts, or keep them to maintain references if wanted. Better to keep them so orders/wishlists don't break if any exist, but it's a new db)
    // We will keep _id so it perfectly mirrors localhost
    
    console.log('⏳ Uploading products to production website...');
    let successCount = 0;
    for (let p of products) {
      const exists = await ProdProduct.findById(p._id);
      if (!exists) {
        await ProdProduct.create(p);
        successCount++;
        console.log(`✅ Uploaded: ${p.name}`);
      } else {
        console.log(`⚠️ Skipped (Already Exists): ${p.name}`);
      }
    }

    console.log(`\n🎉 Migration Complete! Successfully uploaded ${successCount} new products to your live website.`);
    
    // Close connections
    await localDb.close();
    await prodDb.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateProducts();
