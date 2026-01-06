import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { fetchUser } from './api/users'
import './index.scss'
import App from './App'

const router = createBrowserRouter(
  [
    {
      path: "/", 
      element:<App />,
      loader: fetchUser,
    },
  ],
  {
future: {
v7_relativeSplatPath:true,
v7_fetcherPersist:true,
v7_normalizeFormMethod:true,
v7_partialHydration:true,
v7_skipActionErrorRevalidation:true,
v7_singleFetch:true,
},
  },
);

const rootElement = document.getElementById('root');
if (!rootElement){
  throw new Error ("Не вийшло знайти кореневий елемент")
};

const root = createRoot (rootElement);
root.render(<StrictMode>
  <RouterProvider router = {router}/>
</StrictMode>);
