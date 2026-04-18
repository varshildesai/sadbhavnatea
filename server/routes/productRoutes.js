import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Product from '../models/Product.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  },
});

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching products' });
  }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching product' });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', upload.any(), async (req, res) => {
  try {
    const { name, price, description, category, subCategory } = req.body;
    let keyFeatures = [];
    if (req.body.keyFeatures) {
      if (Array.isArray(req.body.keyFeatures)) {
        keyFeatures = req.body.keyFeatures;
      } else {
        try {
          keyFeatures = JSON.parse(req.body.keyFeatures);
        } catch (e) {
          keyFeatures = [req.body.keyFeatures];
        }
      }
    }

    let variants = [];
    if (req.body.variants) {
      try {
        variants = JSON.parse(req.body.variants);
      } catch (e) {
        variants = [];
      }
    }

    let imagesUrls = ['/uploads/default.jpg'];

    if (req.files) {
      const mainFiles = req.files.filter(f => f.fieldname === 'images');
      if (mainFiles.length > 0) {
        imagesUrls = mainFiles.map(file => `/uploads/${file.filename}`);
      }
      
      variants.forEach((v, idx) => {
        const variantFiles = req.files.filter(f => f.fieldname === `variant_${idx}_images`);
        if (variantFiles.length > 0) {
          v.images = variantFiles.map(file => `/uploads/${file.filename}`);
        } else {
          v.images = [];
        }
      });
    }

    const product = new Product({
      name,
      price,
      description,
      category,
      subCategory,
      keyFeatures,
      variants,
      images: imagesUrls,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error creating product', error: error.message });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', upload.any(), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, price, description, category, subCategory } = req.body;
    let keyFeatures = [];
    if (req.body.keyFeatures) {
      if (Array.isArray(req.body.keyFeatures)) {
        keyFeatures = req.body.keyFeatures;
      } else {
        try {
          keyFeatures = JSON.parse(req.body.keyFeatures);
        } catch (e) {
          keyFeatures = [req.body.keyFeatures];
        }
      }
    }

    let variants = [];
    if (req.body.variants) {
      try {
        variants = JSON.parse(req.body.variants);
      } catch (e) {
        variants = [];
      }
    }

    let existingImages = [];
    if (req.body.existingImages) {
      if (Array.isArray(req.body.existingImages)) {
        existingImages = req.body.existingImages;
      } else {
        existingImages = [req.body.existingImages];
      }
    }

    const keptExistingImages = new Set(existingImages);
    variants.forEach(v => {
      let vExisting = [];
      if (v.existingImages) {
        vExisting = Array.isArray(v.existingImages) ? v.existingImages : [v.existingImages];
        vExisting.forEach(i => keptExistingImages.add(i));
      }
      // Temporarily store it so we can merge later
      v._existingParsed = vExisting;
    });

    const allOldImages = new Set([...(product.images || [])]);
    if (product.variants) {
      product.variants.forEach(v => {
        (v.images || []).forEach(i => allOldImages.add(i));
      });
    }

    // Remove obsolete images from file system
    allOldImages.forEach(img => {
      if (!keptExistingImages.has(img) && img !== '/uploads/default.jpg') {
        const filePath = path.join(process.cwd(), img);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    let newImagesUrls = [];
    if (req.files) {
      const mainFiles = req.files.filter(f => f.fieldname === 'images');
      if (mainFiles.length > 0) {
        newImagesUrls = mainFiles.map(file => `/uploads/${file.filename}`);
      }

      variants.forEach((v, idx) => {
        const variantFiles = req.files.filter(f => f.fieldname === `variant_${idx}_images`);
        let vNewImages = [];
        if (variantFiles.length > 0) {
          vNewImages = variantFiles.map(file => `/uploads/${file.filename}`);
        }
        v.images = [...(v._existingParsed || []), ...vNewImages];
      });
    } else {
      variants.forEach(v => {
        v.images = [...(v._existingParsed || [])];
      });
    }

    const finalImages = [...existingImages, ...newImagesUrls];

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.category = category || product.category;
    product.subCategory = subCategory !== undefined ? subCategory : product.subCategory;
    product.keyFeatures = keyFeatures;
    if (req.body.variants) {
      product.variants = variants;
    }
    product.images = finalImages.length > 0 ? finalImages : ['/uploads/default.jpg'];

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating product', error: error.message });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (img !== '/uploads/default.jpg') {
          const filePath = path.join(process.cwd(), img);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }
    
    if (product.variants) {
      product.variants.forEach(v => {
        (v.images || []).forEach(img => {
          if (img !== '/uploads/default.jpg') {
            const filePath = path.join(process.cwd(), img);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
        });
      });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error deleting product' });
  }
});

export default router;
