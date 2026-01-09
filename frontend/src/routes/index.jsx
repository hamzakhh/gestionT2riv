import { createBrowserRouter, Navigate } from 'react-router-dom';

// project imports
import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';
import RouteError from 'components/RouteError';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Navigate to="/login" replace />,
      errorElement: <RouteError />
    },
    {
      ...MainRoutes,
      errorElement: <RouteError />
    },
    {
      ...LoginRoutes,
      errorElement: <RouteError />
    },
    {
      path: '*',
      element: <Navigate to="/login" replace />,
      errorElement: <RouteError />
    }
  ],
  { basename: import.meta.env.VITE_APP_BASE_NAME || '/' }
);

export default router;
