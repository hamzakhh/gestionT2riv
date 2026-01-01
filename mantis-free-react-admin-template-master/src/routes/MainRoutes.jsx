import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import RoleGuard from 'components/RoleGuard';
import { PAGES } from '../config';

// render - Loans
const LoanList = Loadable(lazy(() => import('../pages/loans/LoanList')));
const LoanForm = Loadable(lazy(() => import('../pages/loans/LoanForm')));
const LoanDetails = Loadable(lazy(() => import('../pages/loans/LoanDetails')));
const ReturnEquipment = Loadable(lazy(() => import('../pages/loans/ReturnEquipment')));

// render - Dashboard
const DashboardDefault = Loadable(lazy(() => import('../pages/dashboard/default')));

// render - Association pages
const EquipmentList = Loadable(lazy(() => import('../pages/equipment/EquipmentList')));
const OrphanList = Loadable(lazy(() => import('../pages/orphans/OrphanList')));
const VolunteerList = Loadable(lazy(() => import('../pages/volunteers/VolunteerList')));
const DonorList = Loadable(lazy(() => import('../pages/donors/DonorList')));
// Admin pages
const UserManagement = Loadable(lazy(() => import('../pages/admin/UserManagement')));
const RoleManagement = Loadable(lazy(() => import('../pages/admin/RoleManagement')));

// User Management
const UsersList = Loadable(lazy(() => import('../pages/users/UsersList')));
const UserForm = Loadable(lazy(() => import('../pages/users/UserForm')));
const UserDetails = Loadable(lazy(() => import('../pages/users/UserDetails')));

// Ramadan
const RamadhanPage = Loadable(lazy(() => import('../pages/ramadhan')));
const DonRamadhan = Loadable(lazy(() => import('../pages/ramadhan/DonRamadhan')));
const Patient = Loadable(lazy(() => import('../pages/patient/Patient')));

// Zakat
const ZakatList = Loadable(lazy(() => import('../pages/zakat/ZakatList')));

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
    // Donors Routes
    {
      path: 'donors',
      children: [
        {
          path: '',
          element: <RoleGuard pageKey="donors"><DonorList /></RoleGuard>
        }
      ]
    },
    // Zakat routes
    {
      path: 'zakat',
      children: [
        {
          path: 'list',
          element: <RoleGuard pageKey="zakat"><ZakatList /></RoleGuard>
        }
      ]
    },
    // Loans routes
    {
      path: 'loans',
      children: [
        {
          path: '',
          element: <RoleGuard pageKey="loans"><LoanList /></RoleGuard>
        },
        {
          path: 'new',
          element: <RoleGuard pageKey="loans"><LoanForm /></RoleGuard>
        },
        {
          path: ':id',
          element: <RoleGuard pageKey="loans"><LoanDetails /></RoleGuard>
        },
        {
          path: ':id/edit',
          element: <RoleGuard pageKey="loans"><LoanForm isEditMode /></RoleGuard>
        },
        {
          path: ':id/return',
          element: <RoleGuard pageKey="loans"><ReturnEquipment /></RoleGuard>
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
    {
      path: 'don-ramadhan',
      element: <RoleGuard pageKey="don-ramadhan"><DonRamadhan /></RoleGuard>
    },
    {
      path: 'zakat',
      element: <RoleGuard pageKey="zakat"><ZakatList /></RoleGuard>
    },
    // Routes Association
    {
      path: 'volunteers',
      element: <RoleGuard pageKey="volunteers"><VolunteerList /></RoleGuard>
    },
    {
      path: 'equipment',
      element: <RoleGuard pageKey="equipment"><EquipmentList /></RoleGuard>
    },
    {
      path: 'orphans',
      children: [
        {
          path: '',
          element: <RoleGuard pageKey="orphans"><OrphanList /></RoleGuard>
        },
        {
          path: ':id',
          element: <RoleGuard pageKey="orphans"><OrphanList /></RoleGuard>
        }
      ]
    }
  ]
};

export default MainRoutes;
