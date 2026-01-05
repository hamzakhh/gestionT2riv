import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project imports
import Loadable from 'components/Loadable';

// jwt auth
const LoginPage = Loadable(lazy(() => import('pages/auth/Login')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      children: [
        {
          path: '/login',
          element: <LoginPage />
        },
        {
          path: '/register',
          element: <Navigate to="/login" replace />
        }
      ]
    }
  ]
};

export default LoginRoutes;
