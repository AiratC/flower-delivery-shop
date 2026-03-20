import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Временные компоненты (позже вынесем в отдельные файлы в src/pages)
const Dashboard = () => (
   <div>
      <h1 className="text-2xl font-bold mb-4">Дашборд</h1>
      <p className="text-gray-500">Статистика продаж и активности.</p>
   </div>
);

const Catalog = () => (
   <div>
      <h1 className="text-2xl font-bold mb-4">Каталог цветов</h1>
      <p className="text-gray-500">Здесь будет список ваших букетов.</p>
   </div>
);

function App() {

   return (
      <BrowserRouter>
         <Routes>
            <Route path='/login' element={<Login />}></Route>

            <Route element={<ProtectedRoute/>}>
               <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="catalog" element={<Catalog />} />
                  <Route path="orders" element={<div>Заказы</div>} />
                  <Route path="users" element={<div>Пользователи</div>} />
                  <Route path="settings" element={<div>Настройки</div>} />
               </Route>
            </Route>
         </Routes>
      </BrowserRouter>
   );
}

export default App;
