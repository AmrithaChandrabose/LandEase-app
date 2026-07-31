import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { LandProvider } from './contexts/LandContext'
import { LeaseProvider } from './contexts/LeaseContext'
import { AdminProvider } from './contexts/AdminContext'
import { OwnerProvider } from './contexts/OwnerContext'
import { UserProvider } from './contexts/UserContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AdminProvider>
            <OwnerProvider>
              <UserProvider>
                <LandProvider>
                  <LeaseProvider>
                    <App />
                  </LeaseProvider>
                </LandProvider>
              </UserProvider>
            </OwnerProvider>
          </AdminProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
