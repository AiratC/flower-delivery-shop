import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Flower2, ShoppingCart, Settings, Users } from 'lucide-react';

const menuItems = [
   { icon: LayoutDashboard, label: 'Дашборд', path: '/' },
   { icon: Flower2, label: 'Каталог', path: '/catalog' },
   { icon: ShoppingCart, label: 'Заказы', path: '/orders' },
   { icon: Users, label: 'Клиенты', path: '/users' },
   { icon: Settings, label: 'Настройки', path: '/settings' },
];

export default function Sidebar() {
   return (
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
         <div className="p-6">
            <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
               <Flower2 className="w-6 h-6" /> Admin
            </h2>
         </div>

         <nav className="flex-1 px-4 space-y-1">
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
      </div>
   );
}