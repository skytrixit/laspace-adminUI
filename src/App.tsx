import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AdminShell from './components/AdminShell'
import RequireAuth from './components/RequireAuth'
import Toast from './components/Toast'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import ProjectForm from './pages/ProjectForm'
import Projects from './pages/Projects'
import ServiceForm from './pages/ServiceForm'
import Services from './pages/Services'
import { AuthProvider } from './store/auth'
import { StudioProvider } from './store/studio'

export default function App() {
  return (
    <AuthProvider>
      <StudioProvider>
        <BrowserRouter basename="/admin">
          <Routes>
            <Route path="/login" element={<AdminLogin />} />

            {/* Everything below the guard renders inside the rail layout. */}
            <Route element={<RequireAuth />}>
              <Route element={<AdminShell />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/new" element={<ServiceForm />} />
                <Route path="/services/:id" element={<ServiceForm />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/new" element={<ProjectForm />} />
                <Route path="/projects/:id" element={<ProjectForm />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toast />
        </BrowserRouter>
      </StudioProvider>
    </AuthProvider>
  )
}
