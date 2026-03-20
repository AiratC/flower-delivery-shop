import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Flower2, Lock, Mail, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/slices/authSlice';

const Login = () => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const navigate = useNavigate();
   const dispatch = useDispatch();
   const { loading } = useSelector(state => state.auth);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');

      try {
         // После .unwrap() в res попадает то, что ты вернул из thunk (т.е. response.data)
         const res = await dispatch(login({ userEmail: email, password })).unwrap();

         // Убираем лишний .data, так как он уже "развернут" слайсом
         if (res.success) {
            // Проверяем роль
            if (res.user.role_name === 'Админ') {
               navigate('/');
            } else {
               setError('Доступ запрещен. У вас нет прав администратора.');
            }
         }
      } catch (err) {
         // Если ты в rejectWithValue передаешь строку или error.response.data
         setError(err?.message || err || 'Ошибка при входе');
      }
   };


   return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
         <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">

            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
               <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <Flower2 className="w-10 h-10 text-blue-600" />
               </div>
               <h1 className="text-2xl font-bold text-slate-800">Вход в систему</h1>
               <p className="text-slate-500 text-sm">Управление магазином цветов</p>
            </div>

            {error && (
               <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
                  {error}
               </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <div className="relative">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                     <input
                        type="email"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="admin@flower.ru"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Пароль</label>
                  <div className="relative">
                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                     <input
                        type="password"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                     />
                  </div>
               </div>

               <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
               >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Войти в панель'}
               </button>
            </form>

            <p className="mt-8 text-center text-slate-400 text-xs uppercase tracking-widest font-semibold">
               Flower Delivery Shop © 2026
            </p>
         </div>
      </div>
   );
}

export default Login
