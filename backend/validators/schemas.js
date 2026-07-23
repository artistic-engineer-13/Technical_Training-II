import Joi from 'joi';
import ErrorResponse from '../utils/ErrorHandler.js';

// Validation middleware helper
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (error) {
      const errorMessage = error.details.map((details) => details.message).join(', ');
      return next(new ErrorResponse(errorMessage, 400));
    }
    next();
  };
};

// Authentication validation schemas
export const validateRegister = validateRequest(
  Joi.object({
    name: Joi.string().required().min(2).max(50).messages({
      'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
      'any.required': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),
    phone: Joi.string().required().min(10).max(15).messages({
      'any.required': 'Phone number is required',
    }),
    password: Joi.string().required().min(6).messages({
      'any.required': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
    }),
    role: Joi.string().valid('Customer', 'DeliveryPartner').default('Customer'),
  })
);

export const validateLogin = validateRequest(
  Joi.object({
    email: Joi.string().email().required().messages({
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  })
);

// Product schemas
export const validateProduct = validateRequest(
  Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required().min(0),
    discountPrice: Joi.number().min(0).max(Joi.ref('price')).optional(),
    stock: Joi.number().required().integer().min(0),
    unit: Joi.string().required(),
    category: Joi.string().required(), // Category ObjectId string
    isVeg: Joi.boolean().optional(),
    brand: Joi.string().optional(),
  })
);

// Category schema
export const validateCategory = validateRequest(
  Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
  })
);

// Address schema
export const validateAddress = validateRequest(
  Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    streetAddress: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().required(),
    country: Joi.string().optional(),
    isDefault: Joi.boolean().optional(),
  })
);

// Order placement validation schema
export const validateOrder = validateRequest(
  Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required(),
          quantity: Joi.number().required().integer().min(1),
        })
      )
      .required()
      .min(1),
    shippingAddress: Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required(),
      streetAddress: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      pincode: Joi.string().required(),
      country: Joi.string().optional(),
    }).required(),
    paymentMethod: Joi.string().valid('COD', 'Razorpay', 'Stripe').required(),
    couponCode: Joi.string().optional().allow(''),
  })
);
