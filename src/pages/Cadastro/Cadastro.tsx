import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import './Cadastro.css'

export default function Cadastro() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [form, setForm] = useState({
    companyName: '',
    responsible: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    // POC: apenas exibe mensagem de sucesso
    setShowSuccess(true)
  }

  if (showSuccess) {
    return (
      <main className="auth-page">
        <div className="auth-card success-card">
          <div className="success-icon">✅</div>
          <h1>Em breve!</h1>
          <p className="auth-subtitle">
            O cadastro de empresas estará disponível em breve. Obrigado pelo seu interesse no <strong>Jaraguá mais saudável</strong>!
          </p>
          <Link to="/login" className="btn-auth" style={{ display: 'block', textAlign: 'center' }}>
            Voltar ao login
          </Link>
        </div>
      </main>
    )
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

          <button type="submit" className="btn-auth">Cadastrar empresa</button>
        </form>

        <p className="auth-footer-text">
          Já tem uma conta? <Link to="/login">Fazer login</Link>
        </p>
      </div>
    </main>
  )
}
