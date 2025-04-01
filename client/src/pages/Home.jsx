import React from 'react'
import Navbar from '../components/Navbar.jsx'
import Header from '../components/Header.jsx'

const Home = () => {
  return (
    <div className='flex flex-col items-center min-h-screen'>
      <Navbar displayLogo={true}/>
      <Header/>
    </div>
  )
}

export default Home
