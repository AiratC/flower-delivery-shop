import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Flower2, ShoppingCart, Settings, Users, LogOut, Activity, MessageCircleMore } from 'lucide-react';
import { useDispatch } from 'react-redux';
import fetchAxios from '../api/axios';
import { logout } from '../redux/slices/authSlice';

const menuItems = [
   { icon: Flower2, label: 'Каталог', path: '/catalog' },
   { icon: Activity, label: 'Акции', path: '/stocks' },
   { icon: MessageCircleMore, label: 'Сообщения', path: '/messages' },
   { icon: ShoppingCart, label: 'Заказы', path: '/orders' },
];

export default function Sidebar() {
   const dispatch = useDispatch();
   const navigate = useNavigate();

   const handleLogout = async () => {
      try {
         // 1. Сообщаем бэкенду, что выходим (он удалит куку)
         await fetchAxios.post('/auth/logout');

         // 2. Чистим Redux
         dispatch(logout());

         // 3. Перекидываем на логин
         navigate('/login');
      } catch (error) {
         console.error("Ошибка при выходе:", error);
      }
   };

   return (
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
         <div className="p-6 text-center border-b border-gray-50">
            <h2 className="text-xl font-bold text-blue-600 flex items-center justify-center gap-2">
               <Flower2 className="w-6 h-6" />
               <span>Admin Panel</span>
            </h2>
         </div>

         {/* Основное меню */}
         <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
               <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                     `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'text-gray-600 hover:bg-gray-100'
                     }`
                  }
               >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
               </NavLink>
            ))}
         </nav>

         {/* Футер сайдбара с кнопкой выхода */}
         <div className="p-4 border-t border-gray-100">
            <button
               onClick={handleLogout}
               className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium group"
            >
               <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
               <span>Выйти</span>
            </button>
         </div>
      </div>
   );
}