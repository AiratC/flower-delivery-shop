import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import fetchAxios from './api/axios';
import { setUser } from './redux/slices/authSlice';
import { Loader2 } from 'lucide-react';
import Catalog from './pages/Catalog';
import Stocks from './pages/Stocks';
import Messages from './pages/Messages';
import AdminOrders from './pages/AdminOrders/AdminOrders';

const Dashboard = () => (
   <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Дашборд</h1>
      <p className="text-gray-500">Добро пожаловать в панель управления цветами!</p>
   </div>
);

function App() {
   const dispatch = useDispatch();
   const [isChecking, setIsChecking] = useState(true);

   useEffect(() => {
      const checkAuth = async () => {
         try {
            const response = await fetchAxios.get('/auth/me');
            if (response.data.success) {
               dispatch(setUser(response.data.user));
            }
         } catch (err) {
            console.log(err)
            console.log("Не авторизован");
         } finally {
            setIsChecking(false);
         }
      };
      checkAuth();
   }, [dispatch]);

   // КРИТИЧНО: Пока идет проверка, ничего не рендерим (или показываем спиннер)
   if (isChecking) {
      return (
         <div className="h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
         </div>
      );
   }

   return (
      <BrowserRouter>
         <Routes>
            <Route path='/login' element={<Login />}></Route>

            <Route element={<ProtectedRoute />}>
               <Route path="/" element={<Layout />}>
                  <Route path="catalog" element={<Catalog />} />
                  <Route path='stocks' element={<Stocks/>}/>
                  <Route path='messages' element={<Messages/>}/>
                  <Route path="orders" element={<AdminOrders />} />
               </Route>
            </Route>
         </Routes>
      </BrowserRouter>
   );
}

export default App;
