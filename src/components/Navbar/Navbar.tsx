import React from 'react'
import './Navbar.css'

const Navbar = () => {
  return (
    <header className='header'>
      <a href="/" className='logo'>
      <img src="./public/jaraguasaudavel.png" alt="Logo" />
      </a>

      <nav className='navbar'>
        <a href="">Home</a>
        <a href="">Atividades</a>
        <a href="">Login</a>
        <a href="">Cadastro</a>

      </nav>
    </header>
  )
}

export default Navbar