import React from 'react'
import Banner from '../../components/Banner/Banner'
import Features from '../../components/Features/Features'
import Catalog from '../../components/Catalog/Catalog'
import Reviews from '../../components/Reviews/Reviews'
import TextSection from '../../components/TextSection/TextSection'

const Home = () => {
   return (
      <>
         <Banner/>

         <Features/>

         <Catalog/>

         <Reviews/>

         <TextSection/>
      </>
   )
}

export default Home
