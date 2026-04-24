import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Generate Token
const generateToken = (id, role, name) => {
  return jwt.sign({ id, role, name }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here', {
    expiresIn: '7d',
  });
};

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // e.g. varshildesai247@gmail.com
    pass: process.env.EMAIL_PASS, // e.g. the app password
  },
});

// Rate limiting for sending OTP to prevent abuse
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: 'Too many requests for OTP, please try again later.' },
});

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Generate 6 digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this email
    await Otp.deleteMany({ email });

    // Store in DB (will be hashed automatically by pre-save hook)
    await Otp.create({ email, otp: otpCode });

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Login OTP - Sadbhavna Tea',
      text: `Your OTP for login is: ${otpCode}. It is valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #007a33; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">Sadbhavna Tea</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #333; margin-top: 0;">Welcome back!</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #555;">Use the following One-Time Password (OTP) to securely log in to your account. This OTP is valid for <strong>5 minutes</strong>.</p>
            <div style="background-color: #f8f9fa; border: 1px dashed #007a33; border-radius: 6px; padding: 15px; text-align: center; margin: 25px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #007a33;">${otpCode}</span>
            </div>
            <p style="font-size: 14px; color: #888; margin-bottom: 0;">If you did not request this OTP, please ignore this email. Never share this code with anyone.</p>
          </div>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email. Falling back to DEV OTP:', error.message);
        // Fallback for development if App Password isn't configured properly
        return res.status(200).json({ 
          message: 'Email service unavailable. Developer mode OTP active.',
          devOtp: otpCode 
        });
      } else {
        console.log('OTP Email sent:', info.response);
        return res.status(200).json({ message: 'OTP sent successfully to email' });
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Verify OTP and Login/Register
// @route   POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const existingOtp = await Otp.findOne({ email });
    if (!existingOtp) {
      return res.status(400).json({ message: 'OTP invalid or expired' });
    }

    const isMatch = await bcrypt.compare(otp.toString(), existingOtp.otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect OTP' });
    }

    // OTP is correct - delete it
    await Otp.deleteMany({ email });

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user (name default to portion of email)
      const name = email.split('@')[0];
      user = await User.create({
        name,
        email,
        isVerified: true,
        loginProvider: 'otp',
      });
    } else {
      user.isVerified = true;
      if (!user.loginProvider) user.loginProvider = 'otp';
      await user.save();
    }

    // Generate JWT
    const token = generateToken(user._id, user.role, user.name);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Register user with password & send OTP
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (!user) {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        isVerified: false,
        loginProvider: 'password'
      });
    } else {
      user.name = name;
      user.password = hashedPassword;
      await user.save();
    }

    // Generate 6 digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: otpCode });

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Registration - Sadbhavna Tea',
      text: `Your OTP for registration is: ${otpCode}. Valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #007a33; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">Sadbhavna Tea</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #333; margin-top: 0;">Verify Your Account</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #555;">Thank you for registering with Sadbhavna Tea! Please use the following One-Time Password (OTP) to complete your registration. This OTP is valid for <strong>5 minutes</strong>.</p>
            <div style="background-color: #f8f9fa; border: 1px dashed #007a33; border-radius: 6px; padding: 15px; text-align: center; margin: 25px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #007a33;">${otpCode}</span>
            </div>
            <p style="font-size: 14px; color: #888; margin-bottom: 0;">If you did not create an account, please ignore this email. Never share this code with anyone.</p>
          </div>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email. Falling back to DEV OTP', error.message);
        return res.status(200).json({ 
          message: 'OTP sent (Dev Mode Active)',
          devOtp: otpCode 
        });
      } else {
        return res.status(200).json({ message: 'OTP sent to email. Please verify.' });
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Verify Registration OTP
// @route   POST /api/auth/verify-register
router.post('/verify-register', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const existingOtp = await Otp.findOne({ email });
    if (!existingOtp) {
      return res.status(400).json({ message: 'OTP invalid or expired' });
    }

    const isMatch = await bcrypt.compare(otp.toString(), existingOtp.otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect OTP' });
    }

    // OTP is correct - delete it
    await Otp.deleteMany({ email });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isVerified = true;
    await user.save();

    const token = generateToken(user._id, user.role, user.name);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Login user with password
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return res.status(400).json({ message: 'Invalid credentials or user not verified' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'Please login using OTP or Google' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role, user.name);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Forgot password - Send OTP
// @route   POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6 digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: otpCode });

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset - Sadbhavna Tea',
      text: `Your OTP for password reset is: ${otpCode}. Valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #007a33; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">Sadbhavna Tea</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #555;">You recently requested to reset your password. Use the following One-Time Password (OTP) to reset it. This OTP is valid for <strong>5 minutes</strong>.</p>
            <div style="background-color: #f8f9fa; border: 1px dashed #007a33; border-radius: 6px; padding: 15px; text-align: center; margin: 25px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #007a33;">${otpCode}</span>
            </div>
            <p style="font-size: 14px; color: #888; margin-bottom: 0;">If you did not request a password reset, please ignore this email.</p>
          </div>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email. Falling back to DEV OTP', error.message);
        return res.status(200).json({ 
          message: 'OTP sent (Dev Mode Active)',
          devOtp: otpCode 
        });
      } else {
        return res.status(200).json({ message: 'OTP sent to email. Please verify.' });
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    const existingOtp = await Otp.findOne({ email });
    if (!existingOtp) {
      return res.status(400).json({ message: 'OTP invalid or expired' });
    }

    const isMatch = await bcrypt.compare(otp.toString(), existingOtp.otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    // OTP is correct - delete it
    await Otp.deleteMany({ email });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- GOOGLE OAUTH ROUTES ---

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=true` }),
  (req, res) => {
    // Successful authentication
    const token = generateToken(req.user._id, req.user.role, req.user.name);
    
    // Redirect to frontend auth success page with the token
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/auth/success?token=${token}`);
  }
);


// @desc    Toggle Wishlist (Requires Auth Middleware)
// @route   POST /api/auth/wishlist
router.post('/wishlist', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isLiked = user.wishlist.includes(productId);
    if (isLiked) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());
    } else {
      user.wishlist.push(productId);
    }
    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
