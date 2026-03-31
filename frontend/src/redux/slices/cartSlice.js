import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetchAxios from "../../api/axios";

// Хелпер для заголовков
const getHeaders = () => ({
   headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'x-guest-token': localStorage.getItem('guest_token')
   }
});

export const fetchCart = createAsyncThunk(
   'cart/fetchCart',
   async (_, { rejectWithValue }) => {
      try {
         console.log(`getHeaders() === `, getHeaders());
         const response = await fetchAxios.get('/cart', getHeaders());
         return response.data;
      } catch (error) {
         return rejectWithValue(error.response.data);
      }
   }
);

export const addToCart = createAsyncThunk(
   'cart/addToCart',
   async (data, { dispatch, rejectWithValue }) => {
      try {
         const response = await fetchAxios.post('/cart/add-to-cart', data, getHeaders());
         dispatch(fetchCart());
         return response.data;
      } catch (error) {
         return rejectWithValue(error.response.data);
      }
   }
);

export const updateQty = createAsyncThunk(
   'cart/updateQty',
   async ({ id, qty }, { dispatch, rejectWithValue }) => {
      try {
         const response = await fetchAxios.patch(`/cart/update-to-cart/${id}`, { quantity: qty }, getHeaders());
         dispatch(fetchCart());
         return response.data;
      } catch (error) {
         return rejectWithValue(error.response.data);
      }
   }
);

const initialState = {
   items: [],
   loading: false
};

const cartSlice = createSlice({
   name: 'cart',
   initialState,
   reducers: {},
   extraReducers: (builder) => {
      builder
         .addCase(fetchCart.fulfilled, (state, action) => {
            state.items = action.payload;
         })
   }
});

export default cartSlice.reducer;