/**
 * Application Entry Point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Error handling for initial render
try {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to initialize application:', error);
  
  // Show error message in the DOM
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1>Application Error</h1>
        <p>Failed to load the application. Please check the browser console for details.</p>
        <p style="color: red;">Error: ${error.message}</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px;">
          Reload Page
        </button>
      </div>
    `;
  }
}

