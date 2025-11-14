import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './common/styles/globals.css'
import './common/styles/animations.css'
import './common/styles/accessibility.css'
import './common/styles/theme.css'
import App from './App.tsx'
import { initializeA11y } from './common/utils/a11y'

// Initialize accessibility features
initializeA11y();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
