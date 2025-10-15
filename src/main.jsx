import React from 'react' // Troca para React (para sintaxe JSX)
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'; // IMPORTAR O BROWSERROUTER
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // Use <React.StrictMode> se preferir, mas o StrictMode sozinho é suficiente
  <React.StrictMode> 
    <BrowserRouter> // ENVOLVER A APLICAÇÃO NO ROTEADOR
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)