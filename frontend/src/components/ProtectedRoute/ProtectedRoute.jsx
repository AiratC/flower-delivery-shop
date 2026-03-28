import { Loader } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
   const { user, loading } = useSelector((state) => state.auth);
   const location = useLocation();

   // Пока идет первичная проверка (fetchUserStats), ничего не рендерим
   // Это предотвращает редирект на Home до того, как мы узнали статус юзера
   if (loading) {
      return (
         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <Loader size={40} />
         </div>
      ); // Или <Loader />
   }

   if (!user) {
      // replace: true удаляет страницу профиля из истории, чтобы нельзя было вернуться кнопкой "Назад"
      // state: { from: location } позволит вернуть юзера на профиль после логина
      return <Navigate to="/auth" state={{ from: location }} replace />;
   }

   return children;
};

export default ProtectedRoute;