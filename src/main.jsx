import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// Sensorli doskada uzoq bosish kontekst menyusini ochmasin.
window.addEventListener('contextmenu', (e) => e.preventDefault());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
