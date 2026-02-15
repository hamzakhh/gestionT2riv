import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Grow,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  TablePagination,
  Toolbar,
  InputAdornment,
  Avatar,
  LinearProgress,
  Fade,
  Divider
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ManagerIcon,
  Person as UserIcon,
  CheckCircle as ActiveIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  SearchOutlined,
  FilterOutlined,
  StopOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  ToolOutlined,
  CheckOutlined,
  DashboardOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import equipmentService from 'services/equipmentService';
import MainCard from 'components/MainCard';
import PrintButton from 'components/PrintButton';
import { styled, alpha } from '@mui/material/styles';
import { getUsers } from 'services/userService';

// Modern styled components with gradients and glassmorphism
const ModernMainCard = styled(MainCard)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  borderRadius: '20px',
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: '20px 20px 0 0',
  }
}));

const StatCard = styled(Card)(({ theme, gradient }) => ({
  background: gradient || `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: 'white',
  borderRadius: '16px',
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
  '& .MuiCardContent-root': {
    padding: '24px !important',
  }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`, 
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
  background: alpha(theme.palette.background.paper, 0.8),
  maxHeight: 'calc(100vh - 400px)',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    height: '6px',
    width: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: alpha(theme.palette.primary.main, 0.3),
    borderRadius: '3px',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.5),
    }
  },
  '& .MuiTableCell-head': {
    background: `linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 25%, #45b7d1 50%, #96ceb4 75%, #ffeaa7 100%)`,
    color: 'white',
    fontWeight: 800,
    padding: '28px 36px',
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    borderBottom: 'none',
    whiteSpace: 'nowrap',
    position: 'relative',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.2)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.1) 100%)',
      borderRadius: '16px',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #ff1744, #ff9800, #ffeb3b, #4caf50, #2196f3)',
      borderRadius: '2px 2px 0 0',
    },
    '&:first-of-type': {
      borderTopLeftRadius: '16px',
      paddingLeft: '48px',
    },
    '&:last-of-type': {
      borderTopRightRadius: '16px',
      paddingRight: '48px',
    },
  },
  '& .MuiTableRow-root': {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:nth-of-type(even)': {
      backgroundColor: alpha(theme.palette.background.default, 0.5),
    },
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 25px ${alpha(theme.palette.common.black, 0.15)}`,
      backgroundColor: alpha(theme.palette.background.paper, 0.9),
      '& td': {
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
      },
      '&:first-of-type td': {
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
      },
    },
  },
  '& .MuiTableCell-body': {
    padding: '20px 24px',
    fontSize: '0.875rem',
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
    color: theme.palette.text.secondary,
    verticalAlign: 'middle',
    '&:first-of-type': {
      color: theme.palette.text.primary,
      fontWeight: 600,
      paddingLeft: '32px',
    },
    '&:last-of-type': {
      paddingRight: '32px',
    },
  },
  '& .MuiTable-root': {
    minWidth: '1200px',
    borderCollapse: 'separate',
    borderSpacing: '0 4px',
  },
}));

const StyledChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 500,
  borderRadius: '20px',
  height: '28px',
  fontSize: '0.75rem',
  textTransform: 'capitalize',
  transition: 'all 0.2s ease',
  '&.MuiChip-filled': {
    backgroundColor: status === 'available' ? 'rgba(76, 175, 80, 0.15)' : 
                    status === 'borrowed' ? 'rgba(33, 150, 243, 0.15)' :
                    status === 'maintenance' ? 'rgba(255, 152, 0, 0.15)' :
                    status === 'decommissioned' ? 'rgba(244, 67, 54, 0.15)' :
                    status === 'lost' ? 'rgba(136, 14, 79, 0.15)' :
                    'rgba(158, 158, 158, 0.15)',
    color: status === 'available' ? '#4caf50' : 
           status === 'borrowed' ? '#2196f3' :
           status === 'maintenance' ? '#ff9800' :
           status === 'decommissioned' ? '#f44336' :
           status === 'lost' ? '#880e4f' :
           '#9e9e9e',
    '& .MuiChip-label': {
      padding: '0 12px',
    },
  },
}));

const StatusBadge = styled('span')(({ status, theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  '&:before': {
    content: '""',
    display: 'inline-block',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: status === 'available' ? theme.palette.success.main : 
                    status === 'borrowed' ? theme.palette.info.main :
                    status === 'maintenance' ? theme.palette.warning.main :
                    status === 'decommissioned' ? theme.palette.error.main :
                    status === 'lost' ? theme.palette.error.dark :
                    theme.palette.grey.main,
    marginRight: '8px',
  },
}));

const ModernTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: '12px',
  marginBottom: '8px',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 25px ${alpha(theme.palette.common.black, 0.15)}`,
    background: 'rgba(255, 255, 255, 0.95)',
    '& .equipment-avatar': {
      transform: 'scale(1.1)',
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
    '& .action-buttons': {
      opacity: 1,
      transform: 'translateX(0)',
    }
  },
  '& td': {
    border: 'none',
    padding: '20px 24px',
  },
  '& td:first-of-type': {
    borderTopLeftRadius: '12px',
    borderBottomLeftRadius: '12px',
  },
  '& td:last-of-type': {
    borderTopRightRadius: '12px',
    borderBottomRightRadius: '12px',
  }
}));

const EquipmentAvatar = styled(Avatar)(({ theme, status }) => ({
  width: '48px',
  height: '48px',
  background: status === 'available' ? `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.light})` :
           status === 'borrowed' ? `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.light})` :
           status === 'maintenance' ? `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})` :
           status === 'decommissioned' ? `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.light})` :
           status === 'lost' ? `linear-gradient(135deg, ${theme.palette.error.dark}, ${theme.palette.error.main})` :
           `linear-gradient(135deg, ${theme.palette.grey.main}, ${theme.palette.grey.light})`,
  transition: 'all 0.3s ease',
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.15)}`,
  '& .MuiAvatar-fallback': {
    fontSize: '20px',
    fontWeight: 600,
  }
}));

const ActionButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px',
  opacity: 0.7,
  transform: 'translateX(-5px)',
  transition: 'all 0.3s ease',
  '& .MuiIconButton-root': {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'scale(1.1)',
      boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.2)}`,
    }
  }
}));

const StatusIndicator = styled(Box)(({ status, theme }) => ({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: status === 'available' ? theme.palette.success.main :
                  status === 'borrowed' ? theme.palette.info.main :
                  status === 'maintenance' ? theme.palette.warning.main :
                  status === 'decommissioned' ? theme.palette.error.main :
                  status === 'lost' ? theme.palette.error.dark :
                  theme.palette.error.main,
  boxShadow: `0 0 8px ${alpha(status === 'available' ? theme.palette.success.main :
                             status === 'borrowed' ? theme.palette.info.main :
                             status === 'maintenance' ? theme.palette.warning.main :
                             status === 'decommissioned' ? theme.palette.error.main :
                             status === 'lost' ? theme.palette.error.dark :
                             theme.palette.error.main, 0.5)}`,
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.5 },
    '100%': { opacity: 1 }
  }
}));

const equipmentCategories = {
  Médical: [
    'CHAISE ROULANTE NORMALE',
    'CHAISE ROULANTE ELECTRIQUE',
    'LEVE MALADE',
    'CHAISE DE DOUCHE',
    'CHAISE DISPOSITIF DE TOILETTE',
    'REHAUSSEUR DE TOILETTE',
    'TRIPIED',
    'RAMPE A MARCHE',
    'CANNES CANADIENNES',
    'CANNE PERSONNE AGEE',
    'DEAMBULATEUR',
    'COUSSIN ORTHOPIDIQUE',
    'FAUTEUIL CONFORT',
    'LIT MEDICAL',
    'TABLE A MANGER',
    'TABLE DE NUIT',
    'MATELAS D’AIR',
    'Chaise roulante',
    'Lit',
    'Table de mange',
    'Matelas',
    'Chaise toilette',
    'Oxygène 5L',
    'Oxygène 10L',
    'Pequit'
  ],
  Bureautique: [
    'Chaise',
    'Chaises petit écoliers',
    'Grand bureau',
    'Grande table ronde',
    'Table de classe',
    'Grand tableau'
  ],
};

const EquipmentList = () => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [equipmentStats, setEquipmentStats] = useState({ medical: {}, bureautique: {} });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [historySearchId, setHistorySearchId] = useState('');
  const [equipmentHistory, setEquipmentHistory] = useState(null);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  // Fonction pour gérer le prêt d'un équipement
  const handleLendEquipment = (equipmentId) => {
    navigate(`/loans/new?equipmentId=${equipmentId}`);
  };

  // Fonction pour rechercher l'historique d'un équipement par ID
  const handleSearchHistory = async () => {
    if (!historySearchId.trim()) {
      setHistoryError('Veuillez entrer un ID d\'équipement');
      return;
    }

    try {
      setHistoryLoading(true);
      setHistoryError('');
      const response = await equipmentService.getEquipmentHistory(historySearchId.trim());
      setEquipmentHistory(response.data);
      setOpenHistoryDialog(true);
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'historique:', error);
      setHistoryError(error.response?.data?.message || 'Équipement non trouvé ou erreur lors de la récupération de l\'historique');
      setEquipmentHistory(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fonction pour gérer la touche Entrée dans le champ de recherche
  const handleHistorySearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchHistory();
    }
  };
  const [rowsPerPage, setRowsPerPage] = useState(100000);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    type: '', // Added for the new sub-category
    serialNumber: '',
    status: 'available',
    condition: 'good',
    notes: '',
    entryDate: '',
    assignedUserId: ''
  });

  // Calculate statistics
  const stats = {
    total: pagination?.totalItems || equipment.length,
    available: equipment.filter(item => item.status === 'available').length,
    maintenance: equipment.filter(item => item.status === 'maintenance').length,
    notWorking: equipment.filter(item => item.status === 'decommissioned' || item.status === 'lost').length,
  };

  // Calculate equipment totals by medical team/user
  const equipmentByTeam = useMemo(() => {
    const teamStats = {};
    
    equipment.forEach(item => {
      if (item.assignedUserId && item.assignedUserId._id) {
        const userId = item.assignedUserId._id;
        const userName = `${item.assignedUserId.firstName} ${item.assignedUserId.lastName}`;
        const userRole = item.assignedUserId.role || 'USER';
        
        if (!teamStats[userId]) {
          teamStats[userId] = {
            name: userName,
            role: userRole,
            total: 0,
            available: 0,
            lent: 0,
            maintenance: 0,
            notWorking: 0,
          };
        }
        
        teamStats[userId].total++;
        
        if (item.status === 'available') teamStats[userId].available++;
        else if (item.status === 'lent') teamStats[userId].lent++;
        else if (item.status === 'maintenance') teamStats[userId].maintenance++;
        else if (item.status === 'not_working') teamStats[userId].notWorking++;
      }
    });
    
    return Object.values(teamStats);
  }, [equipment]);

  // Generate a default serial number in format EQ-YYYYMMDD-XXXX
  const generateSerialNumber = (typeName) => {
    if (!typeName) return '';
    const prefix = typeName.substring(0, 4).toUpperCase();
    const randomNum = Math.floor(100000000 + Math.random() * 900000000);
    return `${prefix}-${randomNum}`;
  };

  // Load users for assignment dropdown
  const loadUsers = useCallback(async () => {
    try {
      const response = await getUsers();
      setUsers(response || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle opening the dialog with a new serial number
  const handleOpenDialog = () => {
    setFormData({
      name: '',
      category: '',
      type: '',
      serialNumber: '',
      status: 'available',
      condition: 'good',
      notes: '',
      entryDate: '',
      assignedUserId: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const calculateEquipmentStats = (equipmentList) => {
    const stats = { 
      medical: { 
        items: {}, 
        status: { available: 0, outOfService: 0, maintenance: 0, total: 0 } 
      }, 
      bureautique: { 
        items: {}, 
        status: { available: 0, outOfService: 0, maintenance: 0, total: 0 } 
      } 
    };
    
    
    equipmentList.forEach(item => {
      const category = item.category.toLowerCase();
      const name = item.name.trim();
      const status = item.status;
      
      if (category === 'médical' || category === 'medical') {
        // Initialize equipment type if not exists
        if (!stats.medical.items[name]) {
          stats.medical.items[name] = {
            total: 0,
            available: 0,
            outOfService: 0,
            maintenance: 0
          };
        }
        
        // Count by equipment type and status
        stats.medical.items[name].total++;
        stats.medical.status.total++;
        
        if (status === 'available') {
          stats.medical.items[name].available++;
          stats.medical.status.available++;
        }
        else if (status === 'decommissioned' || status === 'lost') {
          stats.medical.items[name].outOfService++;
          stats.medical.status.outOfService++;
        }
        else if (status === 'maintenance') {
          stats.medical.items[name].maintenance++;
          stats.medical.status.maintenance++;
        }
      } else if (category === 'bureautique') {
        // Initialize equipment type if not exists
        if (!stats.bureautique.items[name]) {
          stats.bureautique.items[name] = {
            total: 0,
            available: 0,
            outOfService: 0,
            maintenance: 0
          };
        }
        
        // Count by equipment type and status
        stats.bureautique.items[name].total++;
        stats.bureautique.status.total++;
        
        if (status === 'available') {
          stats.bureautique.items[name].available++;
          stats.bureautique.status.available++;
        }
        else if (status === 'decommissioned' || status === 'lost') {
          stats.bureautique.items[name].outOfService++;
          stats.bureautique.status.outOfService++;
        }
        else if (status === 'maintenance') {
          stats.bureautique.items[name].maintenance++;
          stats.bureautique.status.maintenance++;
        }
      }
    });
    
    return stats;
  };

  const loadEquipment = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1, // Convertir en index base 1 pour le backend
        limit: rowsPerPage,
        all: true // Get all equipment for stats
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      
      console.log('Chargement des équipements avec params:', params);
      const response = await equipmentService.getAll(params);
      
      if (response && response.data && response.pagination) {
        // Réponse paginée
        setEquipment(response.data);
        setPagination(response.pagination);
        // Calculate statistics for all equipment
        const allEquipmentResponse = await equipmentService.getAll({ ...params, limit: 1000 });
        setEquipmentStats(calculateEquipmentStats(allEquipmentResponse.data || allEquipmentResponse));
      } else {
        // Réponse directe (compatibilité)
        setEquipment(response || []);
        setPagination(null);
        setEquipmentStats(calculateEquipmentStats(response || []));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des équipements:', error);
      setError('Erreur lors du chargement des équipements');
      setEquipment([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, rowsPerPage]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadEquipment();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [search, statusFilter, loadEquipment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };

      if (name === 'category') {
        newState.type = ''; // Reset type when category changes
      }

      if (name === 'type') {
        newState.serialNumber = generateSerialNumber(value);
        newState.name = value; // Also update the name field
      }

      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs requis
    if (!formData.name || !formData.category) {
      setError('Le nom et la catégorie sont obligatoires');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Préparer les données pour l'API avec des valeurs par défaut
      const equipmentData = {
        name: formData.name.trim(),
        type: formData.type || 'other', // Ajout du champ type avec une valeur par défaut
        category: formData.category.trim(),
        serialNumber: formData.serialNumber.trim() || `EQ-${new Date().toISOString().split('T')[0].replace(/-/g, '')}${Math.floor(1000 + Math.random() * 9000)}`,
        status: formData.status || 'available',
        condition: formData.condition || 'good',
        notes: formData.notes ? formData.notes.trim() : null,
        entryDate: formData.entryDate ? new Date(formData.entryDate).toISOString() : null,
        assignedUserId: formData.assignedUserId || null
      };
      
      console.log('Envoi des données au serveur:', JSON.stringify(equipmentData, null, 2));
      
      // Envoyer les données
      const response = await equipmentService.create(equipmentData);
      console.log('Réponse du serveur:', response);
      
      // Recharger la liste des équipements
      await loadEquipment();
      
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        type: 'other',
        category: '',
        serialNumber: '',
        status: 'available',
        condition: 'good',
        notes: '',
        entryDate: '',
        assignedUserId: ''
      });
      
      // Fermer la boîte de dialogue
      handleCloseDialog();
      
      // Afficher un message de succès
      setError(null);
      alert('Équipement enregistré avec succès!');
      
    } catch (error) {
      console.error('Erreur détaillée:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Une erreur est survenue lors de l\'enregistrement';
      
      setError(errorMessage);
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setOpenDetailsDialog(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      type: item.type || item.name, // Use type field if available, fallback to name
      serialNumber: item.serialNumber,
      status: item.status,
      condition: item.condition,
      notes: item.notes,
      entryDate: item.entryDate,
      assignedUserId: item.assignedUserId?._id || item.assignedUserId || ''
    });
    setOpenEditDialog(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate required fields before sending
      if (!formData.name || !formData.category || !formData.type || !formData.serialNumber) {
        window.alert('Veuillez remplir tous les champs obligatoires (nom, catégorie, type, numéro de série)');
        return;
      }
      
      // Clean the data before sending
      const cleanData = {
        ...formData,
        assignedUserId: formData.assignedUserId || null,
        notes: formData.notes || null,
        entryDate: formData.entryDate || null
      };
      
      console.log('Envoi des données de mise à jour:', cleanData);
      await equipmentService.update(selectedItem._id, cleanData);
      await loadEquipment();
      setOpenEditDialog(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'équipement:', error);
      
      // Afficher un message d'erreur plus détaillé
      let errorMessage = 'Une erreur est survenue lors de la mise à jour de l\'équipement.';
      
      if (error.response?.status === 400) {
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = 'Erreur de validation: ' + error.response.data.errors.join(', ');
        } else {
          errorMessage = error.response?.data?.message || 'Données invalides';
        }
      } else if (error.response?.status === 403) {
        errorMessage = 'Vous n\'avez pas les autorisations nécessaires pour effectuer cette action.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Équipement introuvable.';
      }
      
      window.alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      try {
        setError(null);
        setLoading(true);
        await equipmentService.delete(id);
        await loadEquipment();
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'équipement:', error);
        
        // Afficher un message d'erreur plus convivial
        let errorMessage = 'Une erreur est survenue lors de la suppression de l\'équipement.';
        
        if (error.response?.status === 400) {
          errorMessage = 'Impossible de supprimer cet équipement. Il est peut-être actuellement utilisé ou emprunté.';
        } else if (error.response?.status === 404) {
          errorMessage = 'Équipement introuvable. Il a peut-être déjà été supprimé.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Vous n\'avez pas les autorisations nécessaires pour effectuer cette action.';
        }
        
        setError(errorMessage);
        // Afficher une alerte à l'utilisateur
        
        window.alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const markAsNotWorking = async (item) => {
    const isMarkingNotWorking = item.status !== 'not_working';
    const confirmMessage = isMarkingNotWorking 
      ? 'Êtes-vous sûr de vouloir marquer cet équipement comme hors service ?' 
      : 'Voulez-vous marquer cet équipement comme fonctionnel à nouveau ?';
    
    if (window.confirm(confirmMessage)) {
      try {
        setLoading(true);
        const newStatus = isMarkingNotWorking ? 'not_working' : 'available';
        // Only send the status field to avoid validation errors
        await equipmentService.update(item._id, { status: newStatus });
        await loadEquipment();
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de l\'équipement:', error);
        let errorMessage = 'Une erreur est survenue lors de la mise à jour du statut de l\'équipement.';
        if (error.response?.data?.message) {
          errorMessage += `\n\n${error.response.data.message}`;
        }
        window.alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  // Fonction pour imprimer tous les numéros de série sous forme de tickets
  const printAllSerialNumbers = () => {
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    
    // Grouper les équipements par statut
    const availableEquipment = equipment.filter(item => item.status === 'available');
    const maintenanceEquipment = equipment.filter(item => item.status === 'maintenance');
    const outOfServiceEquipment = equipment.filter(item => 
      item.status === 'decommissioned' || item.status === 'lost' || item.status === 'not_working'
    );
    
    // Générer le contenu HTML pour les tickets
    const generateTicketHTML = (items, title, bgColor, borderColor) => {
      return `
        <div style="margin-bottom: 30px;">
          <h2 style="background-color: ${bgColor}; color: white; padding: 10px; margin: 0 0 15px 0; text-align: center; border-radius: 5px;">
            ${title}
          </h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px;">
            ${items.map(item => `
              <div style="
                border: 2px solid ${borderColor}; 
                border-radius: 8px; 
                padding: 15px; 
                margin: 5px; 
                background: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                page-break-inside: avoid;
              ">
                <div style="font-weight: bold; color: #333; margin-bottom: 8px; font-size: 14px;">
                  ${item.name}
                </div>
                <div style="font-family: monospace; font-size: 16px; font-weight: bold; color: #000; margin-bottom: 5px;">
                  N°: ${item.serialNumber}
                </div>
                <div style="font-size: 12px; color: #666;">
                  Catégorie: ${item.category}
                </div>
                <div style="font-size: 10px; color: #999; margin-top: 5px;">
                  ${item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    };
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tickets des Numéros de Série - Équipements</title>
        <style>
          @page {
            margin: 1cm;
            size: A4;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .summary {
            display: flex;
            justify-content: space-around;
            margin-bottom: 30px;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .summary-item {
            text-align: center;
          }
          .summary-number {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .summary-label {
            font-size: 12px;
            color: #666;
          }
          @media print {
            body { background: white; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏷️ TICKETS DES NUMÉROS DE SÉRIE</h1>
          <p>Gestion des Équipements - ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <div class="summary-number" style="color: #4caf50;">${availableEquipment.length}</div>
            <div class="summary-label">Disponibles</div>
          </div>
          <div class="summary-item">
            <div class="summary-number" style="color: #ff9800;">${maintenanceEquipment.length}</div>
            <div class="summary-label">En Maintenance</div>
          </div>
          <div class="summary-item">
            <div class="summary-number" style="color: #f44336;">${outOfServiceEquipment.length}</div>
            <div class="summary-label">Hors Service</div>
          </div>
          <div class="summary-item">
            <div class="summary-number" style="color: #2196f3;">${equipment.length}</div>
            <div class="summary-label">Total</div>
          </div>
        </div>
        
        ${availableEquipment.length > 0 ? generateTicketHTML(availableEquipment, '🟢 ÉQUIPEMENTS DISPONIBLES', '#4caf50', '#4caf50') : ''}
        ${maintenanceEquipment.length > 0 ? generateTicketHTML(maintenanceEquipment, '🟡 ÉQUIPEMENTS EN MAINTENANCE', '#ff9800', '#ff9800') : ''}
        ${outOfServiceEquipment.length > 0 ? generateTicketHTML(outOfServiceEquipment, '🔴 ÉQUIPEMENTS HORS SERVICE', '#f44336', '#f44336') : ''}
        
        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          ">
            🖨️ Imprimer les Tickets
          </button>
        </div>
        
        <script>
          // Auto-imprimer après chargement
          window.onload = function() {
            setTimeout(() => {
              window.print();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Attendre un peu que le contenu se charge avant d'imprimer
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // ... rest of the component code ...

  return (
    <Grid container spacing={3}>
      {/* Statistics Dashboard */}
      <Grid item xs={12}>
        <Grid container spacing={3} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Grow in={true} timeout={600}>
              <StatCard
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                sx={{ cursor: 'pointer' }}
                onClick={() => setStatusFilter('')}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <DashboardOutlined style={{ fontSize: '2.5rem', color: 'white', marginBottom: '8px' }} />
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    Total Équipements
                  </Typography>
                </CardContent>
              </StatCard>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Grow in={true} timeout={800}>
              <StatCard
                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                sx={{ cursor: 'pointer' }}
                onClick={() => setStatusFilter('available')}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <CheckCircleOutlined style={{ fontSize: '2.5rem', color: 'white', marginBottom: '8px' }} />
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                    {stats.available}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    Disponibles
                  </Typography>
                </CardContent>
              </StatCard>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Grow in={true} timeout={1000}>
              <StatCard
                gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                sx={{ cursor: 'pointer' }}
                onClick={() => setStatusFilter('maintenance')}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <SettingOutlined style={{ fontSize: '2.5rem', color: 'white', marginBottom: '8px' }} />
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                    {stats.maintenance}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    En Maintenance
                  </Typography>
                </CardContent>
              </StatCard>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Grow in={true} timeout={1200}>
              <StatCard
                gradient="linear-gradient(135deg, #f44336 0%, #e91e63 100%)"
                sx={{ cursor: 'pointer' }}
                onClick={() => setStatusFilter('decommissioned')}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <WarningOutlined style={{ fontSize: '2.5rem', color: 'white', marginBottom: '8px' }} />
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                    {stats.notWorking}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    Hors Service
                  </Typography>
                </CardContent>
              </StatCard>
            </Grow>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <MainCard title="Statistiques des équipements par catégorie">
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {/* Medical Equipment Stats */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MedicalServicesIcon color="primary" /> Équipements Médicaux
                  </Typography>
                  <Box sx={{ maxHeight: '300px', overflowY: 'auto', pr: 1 }}>
                    {equipmentStats.medical && equipmentStats.medical.items && Object.keys(equipmentStats.medical.items).length > 0 ? (
                      <>
                        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Statut des équipements</Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                              <Box>
                                <Typography variant="body2" color="text.secondary">Total</Typography>
                                <Typography variant="h6">{equipmentStats.medical.status?.total || 0}</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Box>
                                <Typography variant="body2" color="success.main">Disponibles</Typography>
                                <Typography variant="h6" color="success.main">{equipmentStats.medical.status?.available || 0}</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Box>
                                <Typography variant="body2" color="warning.main">Maintenance</Typography>
                                <Typography variant="h6" color="warning.main">{equipmentStats.medical.status?.maintenance || 0}</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Box>
                                <Typography variant="body2" color="error.main">Hors service</Typography>
                                <Typography variant="h6" color="error.main">{equipmentStats.medical.status?.outOfService || 0}</Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                        
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2, mb: 1 }}>Liste des équipements par statut</Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Équipement</strong></TableCell>
                              <TableCell align="center"><strong>Disponible</strong></TableCell>
                              <TableCell align="center"><strong>Maintenance</strong></TableCell>
                              <TableCell align="center"><strong>Hors Service</strong></TableCell>
                              <TableCell align="right"><strong>Total</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(equipmentStats.medical.items).map(([name, statusCounts]) => (
                              <TableRow key={`medical-${name}`}>
                                <TableCell sx={{ fontWeight: 500 }}>{name}</TableCell>
                                <TableCell align="center">
                                  <Chip 
                                    size="small" 
                                    label={statusCounts.available} 
                                    color="success" 
                                    sx={{ fontWeight: 600 }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip 
                                    size="small" 
                                    label={statusCounts.maintenance} 
                                    color="warning" 
                                    sx={{ fontWeight: 600 }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip 
                                    size="small" 
                                    label={statusCounts.outOfService} 
                                    color="error" 
                                    sx={{ fontWeight: 600 }}
                                  />
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>{statusCounts.total}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Aucun équipement médical trouvé
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Office Equipment Stats */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" color="secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkOutlineIcon color="secondary" /> Équipements de Bureautique
                  </Typography>
                  <Box sx={{ maxHeight: '300px', overflowY: 'auto', pr: 1 }}>
                    {equipmentStats.bureautique && equipmentStats.bureautique.items && Object.keys(equipmentStats.bureautique.items).length > 0 ? (
                      <>
                        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Statut des équipements</Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                              <Box>
                                <Typography variant="body2" color="text.secondary">Total</Typography>
                                <Typography variant="h6">{equipmentStats.bureautique.status?.total || 0}</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Box>
                                <Typography variant="body2" color="success.main">Disponibles</Typography>
                                <Typography variant="h6" color="success.main">{equipmentStats.bureautique.status?.available || 0}</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Box>
                                <Typography variant="body2" color="warning.main">Maintenance</Typography>
                                <Typography variant="h6" color="warning.main">{equipmentStats.bureautique.status?.maintenance || 0}</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Box>
                                <Typography variant="body2" color="error.main">Hors service</Typography>
                                <Typography variant="h6" color="error.main">{equipmentStats.bureautique.status?.outOfService || 0}</Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                        
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2, mb: 1 }}>Liste des équipements par statut</Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Équipement</strong></TableCell>
                              <TableCell align="center"><strong>Disponible</strong></TableCell>
                              <TableCell align="center"><strong>Maintenance</strong></TableCell>
                              <TableCell align="center"><strong>Hors Service</strong></TableCell>
                              <TableCell align="right"><strong>Total</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(equipmentStats.bureautique.items).map(([name, statusCounts]) => (
                              <TableRow key={`bureautique-${name}`}>
                                <TableCell sx={{ fontWeight: 500 }}>{name}</TableCell>
                                <TableCell align="center">
                                  <Chip 
                                    size="small" 
                                    label={statusCounts.available} 
                                    color="success" 
                                    sx={{ fontWeight: 600 }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip 
                                    size="small" 
                                    label={statusCounts.maintenance} 
                                    color="warning" 
                                    sx={{ fontWeight: 600 }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip 
                                    size="small" 
                                    label={statusCounts.outOfService} 
                                    color="error" 
                                    sx={{ fontWeight: 600 }}
                                  />
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>{statusCounts.total}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Aucun équipement de bureautique trouvé
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>

      {/* Equipment History Search Section */}
      <Grid item xs={12}>
        <ModernMainCard>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={600} color="primary" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <SearchOutlined style={{ fontSize: '28px' }} />
              Consultation d'Historique d'Équipement
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Entrez l'ID MongoDB (24 caractères hexadécimaux) ou le numéro de série d'un équipement pour consulter son historique complet
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                placeholder="ID MongoDB ou numéro de série..."
                variant="outlined"
                size="small"
                value={historySearchId}
                onChange={(e) => setHistorySearchId(e.target.value)}
                onKeyPress={handleHistorySearchKeyPress}
                sx={{
                  flex: 1,
                  minWidth: '300px',
                  maxWidth: '500px',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                    borderRadius: '12px',
                    fontFamily: 'monospace',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.light',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '2px',
                      borderColor: 'primary.main',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined style={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: historySearchId && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setHistorySearchId('')}
                        sx={{ color: 'text.secondary' }}
                      >
                        <StopOutlined style={{ fontSize: '16px' }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearchHistory}
                disabled={historyLoading || !historySearchId.trim()}
                startIcon={historyLoading ? (
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                      }
                    }}
                  />
                ) : <SearchOutlined />}
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5855eb 0%, #7c3aed 50%, #db2777 100%)',
                    boxShadow: '0 6px 25px rgba(99, 102, 241, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: 'rgba(156, 163, 175, 0.5)',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }
                }}
              >
                {historyLoading ? 'Recherche...' : 'Consulter l\'historique'}
              </Button>
            </Box>
            {historyError && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                backgroundColor: '#ffebee', 
                borderRadius: 1,
                borderLeft: '4px solid #f44336'
              }}>
                <Typography variant="subtitle2" color="error">
                  {historyError}
                </Typography>
              </Box>
            )}
          </Box>
        </ModernMainCard>
      </Grid>

      <Grid item xs={12}>
        <MainCard
          title="Gestion des équipements"
          secondary={
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<PrinterOutlined />}
                onClick={printAllSerialNumbers}
                disabled={equipment.length === 0}
                sx={{
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    borderColor: 'primary.main',
                  },
                  '&:disabled': {
                    backgroundColor: 'grey.200',
                    borderColor: 'grey.400',
                    color: 'grey.500',
                  }
                }}
              >
                🎫 Imprimer Tickets
              </Button>
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={handleOpenDialog}
              >
                Nouvel équipement
              </Button>
            </Box>
          }
        >
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Rechercher un équipement..."
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                flex: 1,
                minWidth: '300px',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                  borderRadius: '8px',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.light',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderWidth: '1px',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined style={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearch('')}
                      sx={{ color: 'text.secondary' }}
                    >
                      <StopOutlined style={{ fontSize: '16px' }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filtrer par statut</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filtrer par statut"
                sx={{
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                  },
                }}
              >
                <MenuItem value="">Tous les statuts</MenuItem>
                <MenuItem value="available">Disponible</MenuItem>
                <MenuItem value="borrowed">Prêté</MenuItem>
                <MenuItem value="maintenance">En maintenance</MenuItem>
                <MenuItem value="decommissioned">Hors service</MenuItem>
                <MenuItem value="lost">Perdu</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {error && (
            <Box sx={{ 
              mb: 2, 
              p: 2, 
              backgroundColor: '#ffebee', 
              borderRadius: 1,
              borderLeft: '4px solid #f44336'
            }}>
              <Typography variant="subtitle2" color="error">
                {error}
              </Typography>
            </Box>
          )}
          <StyledTableContainer component={Paper} elevation={0}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ÉQUIPEMENT</TableCell>
                  <TableCell>CATÉGORIE</TableCell>
                  <TableCell>N° DE SÉRIE</TableCell>
                  <TableCell>STATUT</TableCell>
                                    <TableCell>DISPONIBILITÉ</TableCell>
                  <TableCell>DERNIÈRE MISE À JOUR</TableCell>
                  <TableCell>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipment.map((item) => (
                  <ModernTableRow key={item._id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <EquipmentAvatar 
                          className="equipment-avatar"
                          status={item.status}
                        >
                          {item.name.charAt(0).toUpperCase()}
                        </EquipmentAvatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                            {item.name}
                          </Typography>
                          {item.model && (
                            <Typography variant="body2" color="text.secondary">
                              Modèle: {item.model}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={500} color="text.primary">
                          {item.category}
                        </Typography>
                        {item.location && (
                          <Typography variant="body2" color="text.secondary">
                            📍 {item.location}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={500} fontFamily="monospace" color="text.primary">
                          {item.serialNumber}
                        </Typography>
                        {item.assetTag && (
                          <Typography variant="body2" color="text.secondary">
                            Tag: {item.assetTag}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <StatusIndicator status={item.status} />
                        <StyledChip
                          label={item.status === 'available' ? 'Disponible' : 
                                 item.status === 'borrowed' ? 'Prêté' :
                                 item.status === 'maintenance' ? 'En maintenance' :
                                 item.status === 'decommissioned' ? 'Hors service' :
                                 item.status === 'lost' ? 'Perdu' : 'Indisponible'}
                          status={item.status}
                          size="small"
                          variant="filled"
                        />
                      </Box>
                    </TableCell>
                                        <TableCell>
                      <Box>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight={500} 
                          color={
                            item.condition === 'excellent' ? 'success.main' :
                            item.condition === 'good' ? 'info.main' :
                            item.condition === 'fair' ? 'warning.main' :
                            'error.main'
                          }
                        >
                          {item.condition === 'excellent' ? '🌟 Excellent' :
                           item.condition === 'good' ? '✅ Bon' :
                           item.condition === 'fair' ? '⚠️ Moyen' :
                           item.condition === 'poor' ? '❌ Mauvais' :
                           'N/A'}
                        </Typography>
                        {item.lastMaintenance && (
                          <Typography variant="body2" color="text.secondary">
                            🛠️ Dernier entretien: {new Date(item.lastMaintenance).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={500} color="text.primary">
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          📅 Entrée: {item.entryDate ? new Date(item.entryDate).toLocaleDateString() : 'Non spécifiée'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <ActionButtonGroup className="action-buttons">
                        <Tooltip title="Voir les détails">
                          <IconButton 
                            onClick={() => handleViewDetails(item)}
                            sx={{
                              backgroundColor: 'primary.light',
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                              }
                            }}
                          >
                            <EyeOutlined style={{ fontSize: '18px' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton 
                            onClick={() => handleEdit(item)}
                            sx={{
                              backgroundColor: 'info.light',
                              color: 'info.main',
                              '&:hover': {
                                backgroundColor: 'info.main',
                                color: 'white',
                              }
                            }}
                          >
                            <EditOutlined style={{ fontSize: '18px' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton 
                            onClick={() => handleDelete(item._id)}
                            sx={{
                              backgroundColor: 'error.light',
                              color: 'error.main',
                              '&:hover': {
                                backgroundColor: 'error.main',
                                color: 'white',
                              }
                            }}
                          >
                            <DeleteOutlined style={{ fontSize: '18px' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={item.status === 'not_working' ? 'Marquer comme fonctionnel' : 'Marquer comme hors service'}>
                          <IconButton 
                            onClick={() => markAsNotWorking(item)}
                            sx={{
                              backgroundColor: item.status === 'not_working' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                              color: item.status === 'not_working' ? 'error.main' : 'warning.main',
                              '&:hover': {
                                backgroundColor: item.status === 'not_working' ? 'error.main' : 'warning.main',
                                color: 'white',
                              }
                            }}
                          >
                            {item.status === 'not_working' ? (
                              <CheckCircleOutlined style={{ fontSize: '18px' }} />
                            ) : (
                              <WarningOutlined style={{ fontSize: '18px' }} />
                            )}
                          </IconButton>
                        </Tooltip>
                      </ActionButtonGroup>
                    </TableCell>
                  </ModernTableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100, 1000, 10000]}
              component="div"
              count={pagination?.totalItems || equipment.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Équipements par page"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
              }
            />
          </StyledTableContainer>
        </MainCard>
      </Grid>

      {/* Add Equipment Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              color: 'white',
              textAlign: 'center',
              py: 3,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #d97706)',
              }
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
              <PlusOutlined style={{ fontSize: '28px' }} />
              <Typography variant="h5" fontWeight={700}>
                Nouvel Équipement
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                📋 Informations Principales
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Nom de l'équipement"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    variant="outlined"
                    helperText="Donnez un nom descriptif à l'équipement"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required variant="outlined">
                    <InputLabel>Catégorie</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      label="Catégorie"
                    >
                      <MenuItem value=""><em>Sélectionner une catégorie</em></MenuItem>
                      {Object.keys(equipmentCategories).map(cat => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {formData.category && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required variant="outlined">
                      <InputLabel>Type d'équipement</InputLabel>
                      <Select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        label="Type d'équipement"
                      >
                        <MenuItem value=""><em>Sélectionner un type</em></MenuItem>
                        {equipmentCategories[formData.category].map(type => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                🔢 Identification
              </Typography>
              <TextField
                fullWidth
                required
                label="Numéro de série"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                variant="outlined"
                helperText="Numéro de série généré automatiquement - vous pouvez le modifier"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    fontFamily: 'monospace',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CheckCircleOutlined style={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                📊 État et Statut
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                          boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
                        }
                      }
                    }}
                  >
                    <InputLabel>Statut</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      label="Statut"
                      startAdornment={
                        <InputAdornment position="start">
                          <EyeOutlined style={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="available">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                          Disponible
                        </Box>
                      </MenuItem>
                      <MenuItem value="maintenance">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                          En maintenance
                        </Box>
                      </MenuItem>
                      <MenuItem value="decommissioned">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                          Hors service
                        </Box>
                      </MenuItem>
                      <MenuItem value="lost">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.dark' }} />
                          Perdu
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                          boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
                        }
                      }
                    }}
                  >
                    <InputLabel>État de l'équipement</InputLabel>
                    <Select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      label="État de l'équipement"
                      startAdornment={
                        <InputAdornment position="start">
                          <DashboardOutlined style={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="excellent">
                        <Box display="flex" alignItems="center" gap={1}>
                          🌟 Excellent
                        </Box>
                      </MenuItem>
                      <MenuItem value="good">
                        <Box display="flex" alignItems="center" gap={1}>
                          ✅ Bon
                        </Box>
                      </MenuItem>
                      <MenuItem value="fair">
                        <Box display="flex" alignItems="center" gap={1}>
                          ⚠️ Moyen
                        </Box>
                      </MenuItem>
                      <MenuItem value="poor">
                        <Box display="flex" alignItems="center" gap={1}>
                          ❌ Mauvais
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

            
            <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                📅 Dates
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date d'entrée"
                    type="date"
                    name="entryDate"
                    value={formData.entryDate}
                    onChange={handleChange}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'white',
                          boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          📅
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                              </Grid>
            </Box>

            <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

            <Box>
              <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                📝 Notes et Commentaires
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes supplémentaires"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                variant="outlined"
                placeholder="Ajoutez des informations supplémentaires sur l'équipement..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      📝
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              p: 4,
              pt: 2,
              gap: 2,
              justifyContent: 'space-between',
              backgroundColor: 'rgba(248, 250, 252, 0.8)',
              backdropFilter: 'blur(10px)',
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{
                borderRadius: '12px',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderColor: 'rgba(0, 0, 0, 0.12)',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'rgba(0, 0, 0, 0.24)',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <StopOutlined style={{ marginRight: '8px' }} />
              Annuler
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: '12px',
                px: 6,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5855eb 0%, #7c3aed 50%, #db2777 100%)',
                  boxShadow: '0 6px 25px rgba(99, 102, 241, 0.4)',
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  background: 'rgba(156, 163, 175, 0.5)',
                  color: 'rgba(255, 255, 255, 0.7)',
                }
              }}
            >
              {loading ? (
                <>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      mr: 1,
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                      }
                    }}
                  />
                  Enregistrement...
                </>
              ) : (
                <>
                  <CheckOutlined style={{ marginRight: '8px' }} />
                  Enregistrer l'équipement
                </>
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="sm" fullWidth>
        {selectedItem && (
          <>
            <DialogTitle>Détails de l'équipement</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={selectedItem.name}
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="Catégorie"
                  value={selectedItem.category}
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="N° Série"
                  value={selectedItem.serialNumber}
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="Statut"
                  value={selectedItem.status}
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="État"
                  value={selectedItem.condition}
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="Personnel Assigné"
                  value={
                    selectedItem.assignedUserId ? 
                      (() => {
                        const assignedUser = users.find(user => user._id === selectedItem.assignedUserId);
                        return assignedUser ? 
                          `${assignedUser.firstName} ${assignedUser.lastName} (${assignedUser.role || 'Utilisateur'})` : 
                          'Utilisateur non trouvé';
                      })() : 
                      'Non assigné'
                  }
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                  }}
                />
                                <TextField
                  fullWidth
                  label="Date d'entrée"
                  value={selectedItem.entryDate || 'Non spécifiée'}
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notes"
                  value={selectedItem.notes || 'Aucune note'}
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDetailsDialog(false)}>Fermer</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Equipment Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleUpdate}>
          <DialogTitle>Modifier l'équipement</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                required
                label="Nom de l'équipement"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
              />
              <FormControl fullWidth required margin="normal">
                <InputLabel>Catégorie</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Catégorie"
                >
                  {Object.keys(equipmentCategories).map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {formData.category && (
                <FormControl fullWidth required margin="normal">
                  <InputLabel>Type d'équipement</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Type d'équipement"
                  >
                    {equipmentCategories[formData.category].map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <TextField
                fullWidth
                required
                disabled
                label="N° Série"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Statut</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Statut"
                >
                  <MenuItem value="available">Disponible</MenuItem>
                  <MenuItem value="maintenance">En maintenance</MenuItem>
                  <MenuItem value="decommissioned">Hors service</MenuItem>
                  <MenuItem value="lost">Perdu</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>État</InputLabel>
                <Select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  label="État"
                >
                  <MenuItem value="excellent">Excellent</MenuItem>
                  <MenuItem value="good">Bon</MenuItem>
                  <MenuItem value="fair">Moyen</MenuItem>
                  <MenuItem value="poor">Mauvais</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Personnel Médical Assigné (Optionnel)</InputLabel>
                <Select
                  name="assignedUserId"
                  value={formData.assignedUserId}
                  onChange={handleChange}
                  label="Personnel Médical Assigné (Optionnel)"
                >
                  <MenuItem value="">
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon sx={{ color: 'text.secondary' }} />
                      Non assigné
                    </Box>
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </Avatar>
                        <Typography>
                          {user.firstName} {user.lastName}
                          {user.role && (
                            <Typography component="span" sx={{ ml: 1, fontSize: '0.8em', color: 'text.secondary' }}>
                              ({user.role})
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Date d'entrée"
                type="date"
                name="entryDate"
                value={formData.entryDate || ''}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                margin="normal"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Equipment History Dialog */}
      <Dialog
        open={openHistoryDialog}
        onClose={() => setOpenHistoryDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
            color: 'white',
            textAlign: 'center',
            py: 3,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #d97706)',
            }
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
            <SearchOutlined style={{ fontSize: '28px' }} />
            <Typography variant="h5" fontWeight={700}>
              Historique de l'Équipement
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {equipmentHistory && (
            <Box>
              {/* Equipment Information */}
              <Card sx={{ mb: 3, borderRadius: 2, background: 'rgba(99, 102, 241, 0.05)' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} color="primary" sx={{ mb: 2 }}>
                    📋 Informations de l'Équipement
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Nom:</Typography>
                      <Typography variant="body1" fontWeight={500}>{equipmentHistory.equipment.name}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">ID:</Typography>
                      <Typography variant="body1" fontWeight={500} fontFamily="monospace">{equipmentHistory.equipment._id}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Catégorie:</Typography>
                      <Typography variant="body1" fontWeight={500}>{equipmentHistory.equipment.category}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Type:</Typography>
                      <Typography variant="body1" fontWeight={500}>{equipmentHistory.equipment.type}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Numéro de série:</Typography>
                      <Typography variant="body1" fontWeight={500} fontFamily="monospace">{equipmentHistory.equipment.serialNumber}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Statut actuel:</Typography>
                      <Chip 
                        label={equipmentHistory.equipment.status === 'available' ? 'Disponible' : 
                               equipmentHistory.equipment.status === 'borrowed' ? 'Prêté' :
                               equipmentHistory.equipment.status === 'maintenance' ? 'En maintenance' :
                               equipmentHistory.equipment.status === 'decommissioned' ? 'Hors service' :
                               equipmentHistory.equipment.status === 'lost' ? 'Perdu' : 'Indisponible'}
                        color={equipmentHistory.equipment.status === 'available' ? 'success' :
                               equipmentHistory.equipment.status === 'borrowed' ? 'info' :
                               equipmentHistory.equipment.status === 'maintenance' ? 'warning' :
                               equipmentHistory.equipment.status === 'decommissioned' ? 'error' :
                               equipmentHistory.equipment.status === 'lost' ? 'error' : 'default'}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card sx={{ mb: 3, borderRadius: 2, background: 'rgba(34, 197, 94, 0.05)' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} color="success.main" sx={{ mb: 2 }}>
                    📊 Statistiques
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="primary" fontWeight={700}>{equipmentHistory.statistics.totalLoans}</Typography>
                        <Typography variant="body2" color="text.secondary">Total des prêts</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="warning.main" fontWeight={700}>{equipmentHistory.statistics.activeLoans}</Typography>
                        <Typography variant="body2" color="text.secondary">Prêts actifs</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="info.main" fontWeight={700}>{equipmentHistory.statistics.totalMaintenance}</Typography>
                        <Typography variant="body2" color="text.secondary">Maintenances</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="success.main" fontWeight={700}>{equipmentHistory.statistics.averageLoanDuration}</Typography>
                        <Typography variant="body2" color="text.secondary">Durée moyenne (jours)</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Loan History */}
              {equipmentHistory.loanHistory.length > 0 && (
                <Card sx={{ mb: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} color="primary" sx={{ mb: 2 }}>
                      📅 Historique des Prêts
                    </Typography>
                    <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {equipmentHistory.loanHistory.map((loan, index) => (
                        <Card key={index} variant="outlined" sx={{ mb: 2, borderRadius: 1 }}>
                          <CardContent sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="text.secondary">Emprunteur:</Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {loan.borrower.name} - {loan.borrower.phone}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  📍 {loan.borrower.address}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="text.secondary">Dates:</Typography>
                                <Typography variant="body2">
                                  📅 Début: {new Date(loan.lentDate).toLocaleDateString()}
                                </Typography>
                                {loan.returnDate && (
                                  <Typography variant="body2">
                                    ✅ Retour: {new Date(loan.returnDate).toLocaleDateString()}
                                  </Typography>
                                )}
                                <Typography variant="body2" color="primary">
                                  ⏱️ Durée: {loan.duration} jours
                                </Typography>
                              </Grid>
                              {loan.notes && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="text.secondary">Notes:</Typography>
                                  <Typography variant="body2">{loan.notes}</Typography>
                                </Grid>
                              )}
                            </Grid>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Maintenance History */}
              {equipmentHistory.maintenanceHistory.length > 0 && (
                <Card sx={{ mb: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} color="primary" sx={{ mb: 2 }}>
                      🔧 Historique des Maintenances
                    </Typography>
                    <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {equipmentHistory.maintenanceHistory.map((maintenance, index) => (
                        <Card key={index} variant="outlined" sx={{ mb: 2, borderRadius: 1 }}>
                          <CardContent sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="text.secondary">Date:</Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  📅 {new Date(maintenance.date).toLocaleDateString()}
                                </Typography>
                                {maintenance.performedBy && (
                                  <Typography variant="body2" color="text.secondary">
                                    👤 Par: {maintenance.performedBy.firstName} {maintenance.performedBy.lastName}
                                  </Typography>
                                )}
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="text.secondary">Coût:</Typography>
                                <Typography variant="body1" fontWeight={500} color="success.main">
                                  💰 {maintenance.cost ? `${maintenance.cost} €` : 'Non spécifié'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">Description:</Typography>
                                <Typography variant="body2">{maintenance.description}</Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Current Borrower */}
              {equipmentHistory.currentBorrower && (
                <Card sx={{ mb: 3, borderRadius: 2, background: 'rgba(255, 152, 0, 0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} color="warning.main" sx={{ mb: 2 }}>
                      🔄 Emprunteur Actuel
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Nom:</Typography>
                        <Typography variant="body1" fontWeight={500}>{equipmentHistory.currentBorrower.name}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Téléphone:</Typography>
                        <Typography variant="body1" fontWeight={500}>{equipmentHistory.currentBorrower.phone}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Adresse:</Typography>
                        <Typography variant="body2">{equipmentHistory.currentBorrower.address}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Date du prêt:</Typography>
                        <Typography variant="body2">
                          📅 {new Date(equipmentHistory.currentBorrower.lentDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 4,
            pt: 2,
            gap: 2,
            justifyContent: 'space-between',
            backgroundColor: 'rgba(248, 250, 252, 0.8)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <Button
            onClick={() => setOpenHistoryDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              borderColor: 'rgba(0, 0, 0, 0.12)',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'rgba(0, 0, 0, 0.24)',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <StopOutlined style={{ marginRight: '8px' }} />
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default EquipmentList;
