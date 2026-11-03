import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import './styles.css'

const router = getRouter()

const rootElement = document.getElementById('root')!
// Try to hydrate if server-rendered content exists, fall back to createRoot
function initializeApp() {
  try {
    // Check if root has server-rendered content
    if (rootElement.hasChildNodes()) {
      ReactDOM.hydrateRoot(
        rootElement,
        <RouterProvider router={router} />
      )
      return
    }
  } catch (error) {
    console.warn('Hydration failed, falling back to createRoot:', error)
  }

  ReactDOM.createRoot(rootElement).render(
    <RouterProvider router={router} />
  )
}

initializeApp()
