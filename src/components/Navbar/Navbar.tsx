import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <Link to="/" className="logo">
        <img src="/jaraguasaudavel.png" alt="Saúde Mais" />
      </Link>

      <nav className="navbar">
        <Link to="/">Home</Link>
        <Link to="/atividades">Atividades</Link>

        {user ? (
          <>
            <Link to="/empresa/dashboard">Dashboard</Link>
            <button className="navbar-logout-btn" onClick={handleLogout}>
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/cadastro" className="navbar-cta">Cadastro</Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default Navbar
