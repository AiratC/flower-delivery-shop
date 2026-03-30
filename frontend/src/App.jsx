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


function App() {
   useScrollRestoration()
   const dispatch = useDispatch();

   useEffect(() => {
      dispatch(fetchUserStats())
   }, [dispatch]);

   return (
      <>
         <ToastContainer/>
            <Routes>
               <Route path='/' element={<Layout />}>
                  <Route index element={<Home/>}/>
                  <Route path='auth' element={<Auth/>}/>
                  <Route path='profile' element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
                  <Route path='flower-card/:flowerId' element={<FlowerCard/>}/>

                  <Route path="*" element={<PageNotFound />} />
               </Route>
            </Routes>
      </>
   )
}

export default App
