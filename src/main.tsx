import React from 'react'
    import ReactDOM from 'react-dom/client'
    // import { BrowserRouter } from 'react-router-dom'
    // import App from './App'
    import './globals.css'
    // import { ThemeProvider } from 'next-themes'
    // import { AuthProvider } from '@/context/AuthContext' 

    console.log("[main.tsx] SCRIPT VERY EARLY LOG: main.tsx is being processed.");

    const rootElement = document.getElementById('root');

    if (!rootElement) {
      console.error("[main.tsx] CRITICAL: Root element with ID 'root' not found in HTML.");
      alert("Root element not found!"); // Alerta para visibilidad
    } else {
      console.log("[main.tsx] Root element found. Rendering simple test content.");
      try {
        ReactDOM.createRoot(rootElement).render(
          <React.StrictMode>
            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
              <h1>Test Render from main.tsx</h1>
              <p>If you see this, React is rendering directly from main.tsx.</p>
              <p>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL || "NOT LOADED"}</p>
              <p>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? "LOADED" : "NOT LOADED"}</p>
            </div>
          </React.StrictMode>
        );
        console.log("[main.tsx] Simple test content rendered successfully.");
      } catch (error) {
        console.error("[main.tsx] CRITICAL ERROR during simple test render:", error);
        alert("Error during simple test render: " + (error as Error).message);
        rootElement.innerHTML = `<div style="color: red; padding: 20px;">Error: ${(error as Error).message}</div>`;
      }
    }