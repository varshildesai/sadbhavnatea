import express from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:id
router.get('/product/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id, isHidden: false }).populate('user', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.find({}).populate('user', 'name').populate('product', 'name image');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a review
// @route   POST /api/reviews/product/:id
router.post('/product/:id', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = await Review.findOne({ product: req.params.id, user: req.user._id });
      if (alreadyReviewed) {
        return res.status(400).json({ message: 'You have already reviewed this product' });
      }

      const review = new Review({
        rating: Number(rating),
        comment,
        user: req.user._id,
        product: req.params.id,
      });

      await review.save();

      // Recalculate average rating
      const reviews = await Review.find({ product: req.params.id });
      const numReviews = reviews.length;
      const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
      
      await Product.findByIdAndUpdate(req.params.id, {
        numReviews: numReviews,
        rating: avgRating
      });

      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @desc    Admin reply to a review
// @route   PUT /api/reviews/:id/reply
router.put('/:id/reply', protect, adminOnly, async (req, res) => {
  try {
    const { reply } = req.body;
    const review = await Review.findById(req.params.id);

    if (review) {
      review.adminReply = reply;
      await review.save();
      res.json({ message: 'Reply saved' });
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Toggle review visibility (Admin)
// @route   PUT /api/reviews/:id/visibility
router.put('/:id/visibility', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (review) {
      review.isHidden = !review.isHidden;
      await review.save();
      res.json(review);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update a review (User)
// @route   PUT /api/reviews/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (review) {
      // Check if user is the author
      if (review.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'User not authorized to update this review' });
      }

      review.rating = Number(rating) || review.rating;
      review.comment = comment || review.comment;
      await review.save();

      // Recalculate average rating
      const reviews = await Review.find({ product: review.product });
      const numReviews = reviews.length;
      const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
      await Product.findByIdAndUpdate(review.product, { numReviews, rating: avgRating });

      res.json(review);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a review (User or Admin)
// @route   DELETE /api/reviews/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (review) {
      if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'User not authorized to delete this review' });
      }

      const productId = review.product;
      await Review.deleteOne({ _id: review._id });

      // Recalculate average rating
      const reviews = await Review.find({ product: productId });
      const numReviews = reviews.length;
      const avgRating = numReviews > 0 ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews : 0;
      await Product.findByIdAndUpdate(productId, { numReviews, rating: avgRating });

      res.json({ message: 'Review removed' });
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
