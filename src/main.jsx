import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';   // 대소문자/확장자 반드시 일치

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
