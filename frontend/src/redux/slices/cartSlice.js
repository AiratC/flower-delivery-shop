import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetchAxios from "../../api/axios";

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
         const response = await fetchAxios.get('/cart', getHeaders());
         return response.data;
      } catch (error) {
         return rejectWithValue(error.response?.data);
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
         return rejectWithValue(error.response?.data);
      }
   }
);

export const updateQty = createAsyncThunk(
   'cart/updateQty',
   async ({ cartItemId, quantity }, { dispatch, rejectWithValue }) => {
      try {
         // Приводим в соответствие с контроллером: 
         // Контроллер ждет cartItemId и quantity в body
         const response = await fetchAxios.put('/cart/update-quantity', { cartItemId, quantity }, getHeaders());
         dispatch(fetchCart());
         return response.data;
      } catch (error) {
         return rejectWithValue(error.response?.data);
      }
   }
);

export const removeItem = createAsyncThunk(
   'cart/removeItem',
   async (cartItemId, { dispatch, rejectWithValue }) => {
      try {
         const response = await fetchAxios.delete(`/cart/remove/${cartItemId}`, getHeaders());
         dispatch(fetchCart());
         return response.data;
      } catch (error) {
         return rejectWithValue(error.response?.data);
      }
   }
);

const initialState = {
   items: [],
   loading: false,
   error: null
};

const cartSlice = createSlice({
   name: 'cart',
   initialState,
   reducers: {},
   extraReducers: (builder) => {
      builder
         .addCase(fetchCart.pending, (state) => {
            state.loading = true;
         })
         .addCase(fetchCart.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload;
         })
         .addCase(fetchCart.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         });
   }
});

export default cartSlice.reducer;