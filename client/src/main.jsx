import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AnalyticsProvider } from './context/AnalyticsContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AnalyticsProvider>
      <App />
    </AnalyticsProvider>
  </React.StrictMode>
);
