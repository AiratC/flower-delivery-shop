import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetchAxios from "../../api/axios";

const getHeaders = () => ({
   headers: {
      'x-guest-token': localStorage.getItem('guest_token') || ''
   }
});

// !!! Создание заказа
export const createOrderThunk = createAsyncThunk(
   'checkout/createOrderThunk',
   async (checkoutData, thunkAPI) => {
      try {
         const response = await fetchAxios.post('/checkout/create-order', checkoutData, getHeaders());
         return response.data;
      } catch (error) {
         // Базовая проверка на наличие error.response
         const message = error.response?.data || { message: 'Ошибка соединения с сервером' };
         return thunkAPI.rejectWithValue(message);
      }
   }
);

const initialState = {
   loading: false,
   success: false,
   orderId: null,
   error: null
};

const checkoutSlice = createSlice({
   name: 'checkout',
   initialState,
   reducers: {
      // Полезно для сброса состояния при переходе на другую страницу
      resetCheckoutState: (state) => {
         state.loading = false;
         state.success = false;
         state.orderId = null;
         state.error = null;
      }
   },
   extraReducers: (builder) => {
      builder
         .addCase(createOrderThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
         })
         .addCase(createOrderThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.orderId = action.payload.orderId; // Сохраняем ID для страницы Success
         })
         .addCase(createOrderThunk.rejected, (state, action) => {
            state.loading = false;
            state.success = false;
            state.error = action.payload?.message || 'Произошла ошибка';
         });
   }
});

export const { resetCheckoutState } = checkoutSlice.actions;

export default checkoutSlice.reducer;