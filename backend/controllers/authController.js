import crypto from 'crypto';
import User from '../models/User.js';
import Address from '../models/Address.js';
import ErrorResponse from '../utils/ErrorHandler.js';
import sendEmail from '../services/emailService.js';

// Send token response via cookie
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
};

// @desc      Register user (direct login, isVerified default: true)
// @route     POST /api/auth/register
// @access    Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check if user already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return next(new ErrorResponse('Email already registered', 400));
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return next(new ErrorResponse('Phone number already registered', 400));
    }

    // Create user (isVerified will default to true)
    const user = new User({
      name,
      email,
      phone,
      password,
      role: role || 'Customer',
    });

    await user.save();

    // Automatically login user upon successful registration
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc      Log user out / clear cookie
// @route     GET /api/auth/logout
// @access    Private
export const logoutUser = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Forgot password link generator
// @route     POST /api/auth/forgot-password
// @access    Public
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
    const htmlContent = `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password. The link is active for 10 minutes:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <br/>
      <p>Or copy this link to your browser: ${resetUrl}</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request Token',
        message,
        html: htmlContent,
      });

      res.status(200).json({ success: true, data: 'Email sent successfully' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse('Reset email could not be sent', 500));
    }
  } catch (error) {
    next(error);
  }
};

// @desc      Reset password
// @route     PUT /api/auth/reset-password/:resettoken
// @access    Public
export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired reset password token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc      Get current logged-in user profile
// @route     GET /api/auth/profile
// @access    Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Update user profile
// @route     PUT /api/auth/profile
// @access    Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ================= ADDRESS MANAGEMENT =================

// @desc      Get all addresses for user
// @route     GET /api/auth/addresses
// @access    Private
export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ userId: req.user.id });
    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Create new address
// @route     POST /api/auth/addresses
// @access    Private
export const addAddress = async (req, res, next) => {
  try {
    const { name, phone, streetAddress, city, state, pincode, country, isDefault } = req.body;

    const address = new Address({
      userId: req.user.id,
      name,
      phone,
      streetAddress,
      city,
      state,
      pincode,
      country,
      isDefault,
    });

    await address.save();

    res.status(201).json({
      success: true,
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Update address
// @route     PUT /api/auth/addresses/:id
// @access    Private
export const updateAddress = async (req, res, next) => {
  try {
    let address = await Address.findById(req.params.id);

    if (!address) {
      return next(new ErrorResponse('Address not found', 404));
    }

    // Verify address belongs to user
    if (address.userId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to edit this address', 401));
    }

    address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Handle isDefault trigger (if edited to default)
    if (req.body.isDefault) {
      await address.save(); // Triggers the pre-save Hook
    }

    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Delete address
// @route     DELETE /api/auth/addresses/:id
// @access    Private
export const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return next(new ErrorResponse('Address not found', 404));
    }

    // Verify address belongs to user
    if (address.userId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this address', 401));
    }

    await address.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Address removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
