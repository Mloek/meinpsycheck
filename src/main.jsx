import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { inject } from '@vercel/analytics'
import './index.css'
import App from './App.jsx'
import LandingPage from './LandingPage.jsx'

inject()

const isStandalone =
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isStandalone ? <App /> : <LandingPage />}
  </StrictMode>,
)
