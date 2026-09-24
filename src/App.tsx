import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ActivitiesProvider } from './contexts/ActivitiesContext'
import PrivateRoute from './components/PrivateRoute'
import AdminPrivateRoute from './components/AdminPrivateRoute'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Home from './pages/Home/Home'
import Atividades from './pages/Atividades/Atividades'
import Noticias from './pages/Noticias/Noticias'
import Login from './pages/Login/Login'
import Cadastro from './pages/Cadastro/Cadastro'
import Dashboard from './pages/Empresa/Dashboard'
import AdminDashboard from './pages/Admin/AdminDashboard'
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
              path="/noticias"
              element={
                <AppLayout>
                  <Noticias />
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

            {/* Rotas admin (sem navbar/footer) */}
            {/* Login do admin agora é o mesmo de /login */}
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminPrivateRoute>
                  <AdminDashboard />
                </AdminPrivateRoute>
              }
            />
          </Routes>
        </ActivitiesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
