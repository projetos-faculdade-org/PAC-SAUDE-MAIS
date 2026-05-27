import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
    setMenuOpen(false)
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="header">
      <Link to="/" className="logo" onClick={closeMenu}>
        <img src="/jaraguasaudavel.png" alt="Saúde Mais" />
      </Link>

      <button
        className="hamburger"
        aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(prev => !prev)}
      >
        <span className={`hamburger-icon ${menuOpen ? 'open' : ''}`} />
      </button>

      {menuOpen && <div className="navbar-overlay" onClick={closeMenu} />}

      <nav className={`navbar${menuOpen ? ' open' : ''}`}>
        <Link to="/" onClick={closeMenu}>Home</Link>
        <Link to="/atividades" onClick={closeMenu}>Atividades</Link>

        {user ? (
          <>
            <Link to="/empresa/dashboard" onClick={closeMenu}>Dashboard</Link>
            <button className="navbar-logout-btn" onClick={handleLogout}>
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={closeMenu}>Login</Link>
            <Link to="/cadastro" className="navbar-cta" onClick={closeMenu}>Cadastro</Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default Navbar
