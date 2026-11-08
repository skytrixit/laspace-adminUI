import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AdminShell from './components/AdminShell'
import RequireAuth from './components/RequireAuth'
import RequireFeature from './components/RequireFeature'
import Toast from './components/Toast'
import AdminLogin from './pages/AdminLogin'
import Brands from './pages/Brands'
import Dashboard from './pages/Dashboard'
import Faqs from './pages/Faqs'
import Leads from './pages/Leads'
import ProjectForm from './pages/ProjectForm'
import Projects from './pages/Projects'
import ServiceForm from './pages/ServiceForm'
import Services from './pages/Services'
import Settings from './pages/Settings'
import Testimonials from './pages/Testimonials'
import { AuthProvider } from './store/auth'
import { StudioProvider } from './store/studio'

export default function App() {
  return (
    <AuthProvider>
      <StudioProvider>
        {/* The mount path from Vite's base (VITE_BASE_PATH), without its trailing slash. */}
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
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
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/brands" element={<Brands />} />
                {/* Sections the API can lock (FEATURE_* in its environment) sit behind their flag. */}
                <Route element={<RequireFeature name="faqs" />}>
                  <Route path="/faqs" element={<Faqs />} />
                </Route>
                <Route element={<RequireFeature name="siteSettings" />}>
                  <Route path="/settings" element={<Settings />} />
                </Route>
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
