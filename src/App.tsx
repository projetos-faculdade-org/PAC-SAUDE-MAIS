import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ActivitiesProvider } from './contexts/ActivitiesContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Home from './pages/Home/Home'
import Atividades from './pages/Atividades/Atividades'
import Login from './pages/Login/Login'
import Cadastro from './pages/Cadastro/Cadastro'
import Dashboard from './pages/Empresa/Dashboard'
import './App.css'

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ActivitiesProvider>
          <Routes>
            {/* Dashboard sem navbar/footer (layout próprio) */}
            <Route
              path="/empresa/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* Demais rotas com navbar e footer */}
            <Route
              path="/"
              element={
                <AppLayout>
                  <Home />
                </AppLayout>
              }
            />
            <Route
              path="/atividades"
              element={
                <AppLayout>
                  <Atividades />
                </AppLayout>
              }
            />
            <Route
              path="/login"
              element={
                <AppLayout>
                  <Login />
                </AppLayout>
              }
            />
            <Route
              path="/cadastro"
              element={
                <AppLayout>
                  <Cadastro />
                </AppLayout>
              }
            />
          </Routes>
        </ActivitiesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
