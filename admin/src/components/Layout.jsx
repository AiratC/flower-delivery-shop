import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
   return (
      <div className="flex min-h-screen bg-gray-50 text-gray-900">
         {/* Боковое меню остается всегда */}
         <Sidebar />

         {/* Контентная область, которая меняется */}
         <main className="flex-1 p-8">
            <div className="max-w-6xl mx-auto">
               <Outlet />
            </div>
         </main>
      </div>
   );
}