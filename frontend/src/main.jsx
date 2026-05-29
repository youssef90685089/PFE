import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '12px',
          fontFamily: 'inherit',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          padding: '14px 18px',
        },
        success: {
          style: {
            background: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #bbf7d0',
          },
          iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
        },
        error: {
          style: {
            background: '#fef2f2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
          },
          iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
        },
      }}
    />
  </StrictMode>,
)

