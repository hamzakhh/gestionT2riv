// assets
import {
  MedicineBoxOutlined,
  HeartOutlined,
  DollarOutlined,
  GiftOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  SwapOutlined,
  UserAddOutlined,
  BankOutlined
} from '@ant-design/icons';

// icons
const icons = {
  MedicineBoxOutlined,
  HeartOutlined,
  DollarOutlined,
  GiftOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  SwapOutlined,
  UserAddOutlined,
  BankOutlined
};

// ==============================|| MENU ITEMS - ASSOCIATION ||============================== //

const association = {
  id: 'group-association',
  title: 'Gestion Association',
  type: 'group',
  children: [
    {
      id: 'equipment',
      title: 'Équipements Médicaux',
      type: 'item',
      url: '/equipment',
      icon: icons.MedicineBoxOutlined,
      breadcrumbs: true
    },
    {
      id: 'orphans',
      title: 'Orphelins',
      type: 'item',
      url: '/orphans',
      icon: icons.HeartOutlined,
      breadcrumbs: true
    },
    {
      id: 'loans',
      title: 'Prêts',
      type: 'item',
      url: '/loans',
      icon: icons.SwapOutlined,
      breadcrumbs: true
    },
    {
      id: 'donors',
      title: 'Donateurs',
      type: 'item',
      url: '/donors',
      icon: icons.TeamOutlined,
      breadcrumbs: true
    },
    {
      id: 'volunteers',
      title: 'Bénévoles',
      type: 'item',
      url: '/volunteers',
      icon: icons.UsergroupAddOutlined,
      breadcrumbs: true
    },
    {
      id: 'users',
      title: 'Utilisateurs',
      type: 'item',
      url: '/users',
      icon: icons.UserOutlined,
      breadcrumbs: true,
      roles: ['admin']
    },
    {
      id: 'role-management',
      title: 'Gestion des rôles',
      type: 'item',
      url: '/admin/roles',
      icon: icons.UserOutlined,
      breadcrumbs: true,
      roles: ['admin']
    },
    {
      id: 'zakat',
      title: 'Zakat',
      type: 'item',
      url: '/zakat',
      icon: icons.GiftOutlined,
      breadcrumbs: true
    },
    {
      id: 'don-ramadhan',
      title: 'Dons Ramadhan',
      type: 'item',
      url: '/don-ramadhan',
      icon: icons.GiftOutlined,
      breadcrumbs: true
    },
    {
      id: 'patients',
      title: 'Patients',
      type: 'item',
      url: '/patients',
      icon: icons.UserAddOutlined,
      breadcrumbs: true
    }
  ]
};

export default association;
