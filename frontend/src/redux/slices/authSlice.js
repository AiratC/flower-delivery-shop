import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetchAxios from "../../api/axios";

const getHeaders = () => ({
   headers: {
      'x-guest-token': localStorage.getItem('guest_token')
   }
});

export const fetchAuth = createAsyncThunk(
   "auth/fetchAuth",
   async ({ formData, endpoint }, thunkAPI) => {
      try {
         const response = await fetchAxios.post(endpoint, formData, getHeaders());
         return response.data;
      } catch (error) {
         return thunkAPI.rejectWithValue(
            error.response?.data?.message || "Ошибка сервера",
         );
      }
   },
);

// Создаем thunk для обновления профиля
export const fetchUserStats = createAsyncThunk(
   "auth/fetchStats",
   async (_, thunkAPI) => {
      try {
         const response = await fetchAxios.get("/users/stats"); // Твой эндпоинт
         return response.data; // Здесь придет объект с новым total_spent
      } catch (error) {
         return thunkAPI.rejectWithValue(error.response.data.message)
      }
   },
);

// Выход
export const fetchUserLogout = createAsyncThunk(
   "auth/fetchUserLogout",
   async (_, thunkAPI) => {
      try {
         const response = await fetchAxios.post("/auth/logout");
         return response.data;
      } catch (error) {
         return thunkAPI.rejectWithValue(error.response.data.message)
      }
   },
);

const initialState = {
   user: null,
   loading: false,
};

export const authSlice = createSlice({
   name: "auth",
   initialState,
   reducers: {},
   extraReducers: (builder) => {
      builder
         // !!! Вход и регистрация
         .addCase(fetchAuth.pending, (state) => {
            state.loading = true;
         })
         .addCase(fetchAuth.fulfilled, (state, action) => {
            state.user = action.payload.user || null;
            state.loading = false;
         })
         .addCase(fetchAuth.rejected, (state) => {
            state.loading = false;
         })
         // !!! Получаем обновленные данные
         .addCase(fetchUserStats.pending, (state) => {
            state.loading = true;
         })
         .addCase(fetchUserStats.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
         })
         .addCase(fetchUserStats.rejected, (state) => {
            state.loading = false;
            state.user = null;
         })
         // !!! Выход
         .addCase(fetchUserLogout.pending, (state) => {
            state.loading = true;
         })
         .addCase(fetchUserLogout.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
         })
         .addCase(fetchUserLogout.rejected, (state) => {
            state.loading = false;
         });
   },
});

export default authSlice.reducer;
