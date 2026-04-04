import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetchAxios from "../../api/axios";

const getHeaders = () => ({
   headers: {
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
   async ({ cartItemId, quantity }, { rejectWithValue }) => {
      try {
         // Приводим в соответствие с контроллером: 
         // Контроллер ждет cartItemId и quantity в body
         const response = await fetchAxios.put('/cart/update-quantity', { cartItemId, quantity }, getHeaders());
         return response.data;
      } catch (error) {
         return rejectWithValue(error.response?.data);
      }
   }
);

export const removeItem = createAsyncThunk(
   'cart/removeItem',
   async (cartItemId, { rejectWithValue }) => {
      try {
         const response = await fetchAxios.delete(`/cart/remove/${cartItemId}`, getHeaders());
         return response.data;
      } catch (error) {
         return rejectWithValue(error.response?.data);
      }
   }
);

const initialState = {
   items: [],
   loading: false,
   error: null,
   totalPrice: 0
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
         })
         // Оптимистичное обновление кол-ва
         .addCase(updateQty.pending, (state, action) => {
            // action.meta.arg - это те данные которые передаем в диспатч
            const { cartItemId, quantity } = action.meta.arg;
            const item = state.items.find(i => i.cart_item_id === cartItemId);
            if (item) {
               item.quantity = quantity
            }
         })
         .addCase(updateQty.rejected, (state, action) => {
            state.error = action.payload;
         })
         // Мгновенное удаление
         .addCase(removeItem.pending, (state, action) => {
            const cartItemId = action.meta.arg;
            state.items = state.items.filter(i => i.cart_item_id !== cartItemId);
         })
         .addCase(removeItem.rejected, (state, action) => {
            state.error = action.payload;
         });
   }
});

export default cartSlice.reducer;