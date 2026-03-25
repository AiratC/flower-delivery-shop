import React from 'react'
import Navbar from '../Navbar/Navbar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
   return (
      <>
         <Navbar/>

         <main>
            <Outlet/>
         </main>

         <footer>
            footer
         </footer>
      </>
   )
}

export default Layout
