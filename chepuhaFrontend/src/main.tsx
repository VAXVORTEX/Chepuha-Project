import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App'
import { LanguageProvider } from './contexts/LanguageContext';
import { TTSProvider } from './contexts/TTSContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Не вийшло знайти кореневий елемент")
};
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <LanguageProvider>
      <TTSProvider>
        <App />
      </TTSProvider>
    </LanguageProvider>
  </StrictMode>
);