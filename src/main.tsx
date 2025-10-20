import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import './styles/animations.css'
import './styles/accessibility.css'
import App from './App.tsx'
import { initializeA11y } from './utils/a11y'

// Initialize accessibility features
initializeA11y();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
