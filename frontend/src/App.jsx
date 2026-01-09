import { RouterProvider } from 'react-router-dom';

// project imports
import router from 'routes';
import ThemeCustomization from 'themes';
import { AuthProvider } from 'contexts/AuthContext';
import ScrollTop from 'components/ScrollTop';
import ErrorBoundary from 'components/ErrorBoundary';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeCustomization>
        <AuthProvider>
          <ScrollTop>
            <RouterProvider router={router} />
          </ScrollTop>
        </AuthProvider>
      </ThemeCustomization>
    </ErrorBoundary>
  );
}
