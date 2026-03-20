import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
   const { user, loading } = useSelector((state) => state.auth);

   // Пока идет проверка токена (getMe), показываем пустой экран или спиннер
   if (loading) {
      return <div className="flex h-screen items-center justify-center">Загрузка...</div>;
   }

   // Если юзера нет или он не админ — отправляем на логин
   if (!user || user.role_name !== 'Админ') {
      return <Navigate to="/login" replace />;
   }

   // Если всё ок — показываем дочерние маршруты (Layout и всё что внутри)
   return <Outlet />;

}

export default ProtectedRoute
