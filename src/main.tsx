import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const errorStr = args.join(' ');
  if (
    errorStr.includes('styled-components') ||
    errorStr.includes('errors.md#17') ||
    errorStr.includes('reviewlab') ||
    errorStr.includes('index-es2015.js')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

window.addEventListener('error', (event) => {
  const errorMsg = event.message?.toString() || '';
  const errorStack = event.error?.stack?.toString() || '';
  const errorFilename = event.filename?.toString() || '';
  
  if (
    errorMsg.includes('styled-components') ||
    errorMsg.includes('errors.md#17') ||
    errorMsg.includes('reviewlab') ||
    errorStack.includes('styled-components') ||
    errorStack.includes('reviewlab') ||
    errorFilename.includes('index-es2015.js')
  ) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
  }
}, { capture: true });

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.toString() || '';
  if (
    reason.includes('styled-components') ||
    reason.includes('errors.md#17') ||
    reason.includes('reviewlab')
  ) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return false;
  }
}, { capture: true });

createRoot(document.getElementById("root")!).render(<App />);