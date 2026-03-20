import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import fetchAxios from '../../api/axios';

export const login = createAsyncThunk(
   'auth/login', // Изменил имя для красоты
   async (loginData, thunkAPI) => {
      try {
         const response = await fetchAxios.post(`/auth/login`, loginData);
         // ВОЗВРАЩАЕМ ТОЛЬКО ДАННЫЕ (то, что прислал сервер)
         return response.data; 
      } catch (error) {
         // Проверяем наличие сообщения об ошибке от сервера
         const message = error.response?.data?.message || 'Ошибка сервера';
         return thunkAPI.rejectWithValue(message);
      }
   }
);

const initialState = {
   user: null,
   isAuthenticated: false,
   loading: false,
   error: null // Полезно хранить ошибку здесь
};

const authSlice = createSlice({
   name: 'auth',
   initialState,
   reducers: {
      // Добавим метод для выхода
      logout: (state) => {
         state.user = null;
         state.isAuthenticated = false;
      }
   },
   extraReducers: (builder) => {
      builder
         .addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            // Теперь action.payload — это сразу response.data с сервера
            state.user = action.payload.user; 
         })
         .addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.error = action.payload; // Сохраняем сообщение об ошибке
         });
   }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;