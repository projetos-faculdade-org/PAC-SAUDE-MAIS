import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Login.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const success = login(email, password)
    if (success) {
      navigate('/empresa/dashboard')
    } else {
      setError('E-mail ou senha incorretos. Verifique suas credenciais.')
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/jaraguasaudavel.png" alt="Saúde Mais" />
        </div>

        <h1>Acesso Empresa</h1>
        <p className="auth-subtitle">Entre com as credenciais da sua empresa.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="empresa@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-auth">Entrar</button>
        </form>

        <p className="auth-footer-text">
          Ainda não tem uma conta?{' '}
          <Link to="/cadastro">Cadastre sua empresa</Link>
        </p>

        <div className="poc-hint">
          <strong>POC:</strong> use <code>empresa@saude.com</code> / <code>saude123</code>
        </div>
      </div>
    </main>
  )
}
