import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';

// Async Thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/cart');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await API.post('/cart', { productId, quantity });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await API.delete(`/cart/${productId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to remove item');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.delete('/cart');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to clear cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalQuantity: 0,
    subtotal: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearCartLocal: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.subtotal = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalQuantity = action.payload.totalQuantity;
        state.subtotal = action.payload.subtotal;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add/Update Cart Item
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalQuantity = action.payload.totalQuantity;
        state.subtotal = action.payload.subtotal;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove Cart Item
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalQuantity = action.payload.totalQuantity;
        state.subtotal = action.payload.subtotal;
      })
      // Clear Cart
      .addCase(clearCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totalQuantity = action.payload.totalQuantity || 0;
        state.subtotal = action.payload.subtotal || 0;
      });
  },
});

export const { clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;
