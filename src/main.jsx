import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
// Shrift dastur ichiga qo'shiladi: internetsiz ham ishlaydi.
import '@fontsource-variable/nunito';
import './styles.css';
import './game.css';

// Sensorli doskada uzoq bosish kontekst menyusini ochmasin.
window.addEventListener('contextmenu', (e) => e.preventDefault());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
