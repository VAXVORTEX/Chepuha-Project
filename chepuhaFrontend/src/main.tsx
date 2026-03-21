import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, useRouteError } from 'react-router-dom'
import './index.scss'
import App from './App'
function ErrorPage() {
  const error = useRouteError() as { status?: number; statusText?: string };
  return (
    <div style={{ fontFamily: 'Caveat, sans-serif', textAlign: 'center', marginTop: '20vh' }}>
      <h1 style={{ fontSize: '3rem' }}>Щось пішло не так 😅</h1>
      <p style={{ fontSize: '1.5rem' }}>{error?.statusText || 'Невідома помилка'}</p>
      <a href="/" style={{ fontSize: '1.5rem', color: '#e74c3c' }}>← На головну</a>
    </div>
  );
}
import { LanguageProvider } from './contexts/LanguageContext';
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <LanguageProvider><App /></LanguageProvider>,
      errorElement: <ErrorPage />,
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
      v7_singleFetch: true,
    },
  },
);
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Не вийшло знайти кореневий елемент")
};
const root = createRoot(rootElement);
root.render(<StrictMode>
  <RouterProvider router={router} />
</StrictMode>);