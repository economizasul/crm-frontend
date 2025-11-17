import React from 'react' // Troca para React (para sintaxe JSX)
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'; // IMPORTAR O BROWSERROUTER.
import './index.css'
import App from './App.jsx'
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById('root')).render(
  // Use <React.StrictMode> se preferir, mas o StrictMode sozinho é suficiente
  <React.StrictMode> 
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)