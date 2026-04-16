import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import { ToastContainer } from 'react-toastify';
import Auth from './pages/Auth/Auth';
import PageNotFound from './components/PageNotFound/PageNotFound';
import { useDispatch } from 'react-redux';
import Profile from './pages/Profile/Profile';
import { useEffect } from 'react';
import { fetchUserStats } from './redux/slices/authSlice';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import FlowerCard from './pages/FlowerCard/FlowerCard';
import useScrollRestoration from './hooks/useScrollRestoration';
import { v4 as uuidv4 } from 'uuid';
import { fetchCart } from './redux/slices/cartSlice';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage/OrderSuccessPage';
import ContactsPage from './pages/ContactsPage/ContactsPage';
import FAQPage from './pages/FAQPage/FAQPage';
import StocksSection from './pages/StocksSection/StocksSection';


function App() {
   useScrollRestoration();
   const dispatch = useDispatch();

   useEffect(() => {
      dispatch(fetchUserStats());
      dispatch(fetchCart());
   }, [dispatch]);

   useEffect(() => {
      const guestToken = localStorage.getItem('guest_token');

      if(!guestToken) {
         const guest_token = uuidv4();
         localStorage.setItem('guest_token', guest_token);
      }
   }, [])

   return (
      <>
         <ToastContainer/>
            <Routes>
               <Route path='/' element={<Layout />}>
                  <Route index element={<Home/>}/>
                  <Route path='auth' element={<Auth/>}/>
                  <Route path='profile' element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
                  <Route path='flower-card/:flowerId' element={<FlowerCard/>}/>
                  <Route path='checkout' element={<CheckoutPage />}/>
                  <Route path='order-success/:orderId' element={<OrderSuccessPage/>}/>
                  <Route path='contacts' element={<ContactsPage />}/>
                  <Route path='faq' element={<FAQPage />}/>
                  <Route path='stocks' element={<StocksSection/>}/>

                  <Route path="*" element={<PageNotFound />} />
               </Route>
            </Routes>
      </>
   )
}

export default App
