import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import productReducer from './productSlice';
import cartReducer from './cartSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
  },
  devTools: import.meta.env.NODE_ENV !== 'production',
});

export default store;
