import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import RoleGuard from 'components/RoleGuard';
import { PAGES } from '../config';

// render - Dashboard
const DashboardDefault = Loadable(lazy(() => import('../pages/dashboard/default')));

// render - Association pages
const EquipmentList = Loadable(lazy(() => import('../pages/equipment/EquipmentList')));
const EquipmentDetail = Loadable(lazy(() => import('../pages/equipment/EquipmentDetail')));
// Admin pages
const UserManagement = Loadable(lazy(() => import('../pages/admin/UserManagement')));
const RoleManagement = Loadable(lazy(() => import('../pages/admin/RoleManagement')));

// User Management
const UsersList = Loadable(lazy(() => import('../pages/users/UsersList')));
const UserForm = Loadable(lazy(() => import('../pages/users/UserForm')));
const UserDetails = Loadable(lazy(() => import('../pages/users/UserDetails')));

// Ramadan
// const RamadhanPage = Loadable(lazy(() => import('../pages/ramadhan')));
const Patient = Loadable(lazy(() => import('../pages/patient/Patient')));

// Loans
const LoanList = Loadable(lazy(() => import('../pages/loans/LoanList')));
const LoanForm = Loadable(lazy(() => import('../pages/loans/LoanForm')));
const LoanDetail = Loadable(lazy(() => import('../pages/loans/LoanDetail')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      path: '/',
      element: <RoleGuard pageKey="dashboard"><DashboardDefault /></RoleGuard>
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <RoleGuard pageKey="dashboard"><DashboardDefault /></RoleGuard>
        }
      ]
    },
    // Admin Routes
    {
      path: 'admin',
      children: [
        {
          path: 'users',
          element: <RoleGuard pageKey="users"><UserManagement /></RoleGuard>
        },
        {
          path: 'roles',
          element: <RoleGuard pageKey="role-management"><RoleManagement /></RoleGuard>
        }
      ]
    },
    
    // User Management Routes
    {
      path: 'users',
      children: [
        {
          path: '',
          element: <RoleGuard pageKey="users"><UsersList /></RoleGuard>
        },
        {
          path: 'list',
          element: <RoleGuard pageKey="users"><UsersList /></RoleGuard>
        },
        {
          path: 'create',
          element: <RoleGuard pageKey="users"><UserForm /></RoleGuard>
        },
        {
          path: 'edit/:id',
          element: <RoleGuard pageKey="users"><UserForm /></RoleGuard>
        },
        {
          path: 'view/:id',
          element: <RoleGuard pageKey="users"><UserDetails /></RoleGuard>
        }
      ]
    },
    {
      path: 'patients',
      element: <RoleGuard pageKey={PAGES.PATIENTS}><Patient /></RoleGuard>
    },
    // Routes Loans
    {
      path: 'loans',
      children: [
        {
          path: '',
          element: <RoleGuard pageKey={PAGES.LOANS}><LoanList /></RoleGuard>
        },
        {
          path: 'create',
          element: <RoleGuard pageKey={PAGES.LOANS}><LoanForm /></RoleGuard>
        },
        {
          path: ':id',
          element: <RoleGuard pageKey={PAGES.LOANS}><LoanDetail /></RoleGuard>
        }
      ]
    },
    // Routes Association
    {
      path: 'equipment',
      element: <RoleGuard pageKey="equipment"><EquipmentList /></RoleGuard>
    },
    {
      path: 'equipment/:assetId',
      element: <RoleGuard pageKey="equipment"><EquipmentDetail /></RoleGuard>
    }
  ]
};

export default MainRoutes;
