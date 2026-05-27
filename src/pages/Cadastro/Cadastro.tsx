import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Cadastro.css'

export default function Cadastro() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    companyName: '',
    responsible: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      await register({
        companyName: form.companyName,
        responsible: form.responsible,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      })
      navigate('/empresa/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar empresa.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/jaraguasaudavel.png" alt="Saúde Mais" />
        </div>

        <h1>Cadastro de Empresa</h1>
        <p className="auth-subtitle">
          Registre sua empresa e publique suas atividades de saúde.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="companyName">Nome da empresa *</label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              placeholder="Ex.: Academia Saúde Total"
              value={form.companyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="responsible">Responsável *</label>
            <input
              id="responsible"
              name="responsible"
              type="text"
              placeholder="Nome do responsável"
              value={form.responsible}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail *</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="contato@empresa.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Telefone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(47) 99999-0000"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha *</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar senha *</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repita a senha"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar empresa'}
          </button>
        </form>

        <p className="auth-footer-text">
          Já tem uma conta? <Link to="/login">Fazer login</Link>
        </p>
      </div>
    </main>
  )
}
