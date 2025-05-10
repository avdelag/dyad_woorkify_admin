import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './globals.css'
import { ThemeProvider } from 'next-themes'
// Corregir la ruta de importación para AuthProvider
import { AuthProvider } from '@/context/AuthContext' 

console.log("[main.tsx] Script starting. About to render React app.");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("[main.tsx] CRITICAL: Root element with ID 'root' not found in HTML.");
} else {
  console.log("[main.tsx] Root element found. Proceeding with ReactDOM.createRoot.");
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <BrowserRouter>
          {/* AuthProvider debe venir de AuthContext.tsx */}
          <AuthProvider> 
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <App />
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      </React.StrictMode>
    );
    console.log("[main.tsx] React app rendered successfully.");
  } catch (error) {
    console.error("[main.tsx] CRITICAL ERROR during initial render:", error);
    rootElement.innerHTML = `<div style="color: red; padding: 20px; font-family: sans-serif; background-color: #fff0f0; border: 1px solid red;">
      <h2>Application Render Error</h2>
      <p>A critical error occurred while trying to render the application. Please check the browser console.</p>
      <pre>${(error as Error).message}\n${(error as Error).stack}</pre>
    </div>`;
  }
}