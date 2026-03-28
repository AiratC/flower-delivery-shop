import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import { ToastContainer } from 'react-toastify';
import Auth from './pages/Auth/Auth';

function App() {

   return (
      <>
         <ToastContainer/>
         <BrowserRouter>
            <Routes>
               <Route path='/' element={<Layout />}>
                  <Route index element={<Home/>}/>
                  <Route path='auth' element={<Auth/>}/>
               </Route>
            </Routes>
         </BrowserRouter>
      </>
   )
}

export default App
