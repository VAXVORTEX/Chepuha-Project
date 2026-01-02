import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.scss'
import App from './App.jsx'

async function dataLoader(){
  const response = await fetch('https://jsonplaceholder.typicode.com/users'); //поки тестовий json файл
  const data = await response.json();
  return {users: data};
}


const router = createBrowserRouter(
  [
    {
      path: "/", 
      element:<App />,
      loader: dataLoader,
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

createRoot(document.getElementById('root')).render(
<StrictMode>
  <RouterProvider router = {router}/>
</StrictMode>,)
