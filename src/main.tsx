import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import Shop from '@/pages/Shop';
import './index.css';

const isShopRoute = window.location.pathname.replace(/\/+$/, '') === '/shop';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isShopRoute ? <Shop /> : <App />}
  </StrictMode>
);
