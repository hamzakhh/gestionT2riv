// assets
import {
  MedicineBoxOutlined,
  HeartOutlined,
  UserOutlined,
  UserAddOutlined,
  SwapOutlined
} from '@ant-design/icons';

// icons
const icons = {
  MedicineBoxOutlined,
  HeartOutlined,
  UserOutlined,
  UserAddOutlined,
  SwapOutlined
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
      id: 'patients',
      title: 'Patients',
      type: 'item',
      url: '/patients',
      icon: icons.UserAddOutlined,
      breadcrumbs: true
    },
    {
      id: 'loans',
      title: 'Prêts',
      type: 'item',
      url: '/loans',
      icon: icons.SwapOutlined,
      breadcrumbs: true
    }
  ]
};

export default association;
