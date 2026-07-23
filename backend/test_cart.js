import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import User from './models/User.js';
import Cart from './models/Cart.js';

dotenv.config();

const test = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online-grocery';
    console.log('Connecting to:', dbUri);
    await mongoose.connect(dbUri);
    console.log('Connected!');

    const product = await Product.findOne({});
    console.log('Sample Product:', product ? {
      id: product._id,
      name: product.name,
      isActive: product.isActive,
      stock: product.stock,
      price: product.price,
    } : 'None found');

    const user = await User.findOne({ role: 'Customer' });
    console.log('Sample User:', user ? {
      id: user._id,
      name: user.name,
      email: user.email,
    } : 'None found');

    if (user) {
      let cart = await Cart.findOne({ userId: user._id });
      console.log('Existing Cart found:', !!cart);
      if (cart) {
        console.log('Cart items:', cart.items);
      }
    }

    await mongoose.disconnect();
    console.log('Disconnected!');
  } catch (err) {
    console.error(err);
  }
};

test();
