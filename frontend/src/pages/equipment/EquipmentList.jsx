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
    Checkbox,
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
    PrinterOutlined,
    QrcodeOutlined,
    TagOutlined
  } from '@ant-design/icons';
  import equipmentService from 'services/equipmentService';
  import MainCard from 'components/MainCard';
  import PrintButton from 'components/PrintButton';
  import EquipmentQRCode from 'components/EquipmentQRCode';
  import EquipmentSticker from 'components/EquipmentSticker';
  import { styled, alpha } from '@mui/material/styles';
  import { getUsers } from 'services/userService';
  import loanService from 'services/loanService';

  // Modern styled components with gradients and glassmorphism
  const ModernMainCard = styled(MainCard)(({ theme }) => ({
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    borderRadius: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
    }
  }));

  const StatCard = styled(Card)(({ theme, gradient }) => ({
    background: gradient || 'white',
    color: gradient ? 'white' : theme.palette.text.primary,
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    border: gradient ? 'none' : '1px solid rgba(226, 232, 240, 0.8)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
    '& .MuiCardContent-root': {
      padding: '20px !important',
    }
  }));

  const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    background: 'white',
    maxHeight: 'calc(100vh - 400px)',
    overflow: 'auto',
    '&::-webkit-scrollbar': {
      height: '6px',
      width: '6px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(99, 102, 241, 0.3)',
      borderRadius: '3px',
      '&:hover': {
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
      }
    },
    '& .MuiTableCell-head': {
      background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      color: '#64748b',
      fontWeight: 600,
      padding: '16px 20px',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '2px solid #e2e8f0',
      whiteSpace: 'nowrap',
      '&:first-of-type': {
        borderTopLeftRadius: '16px',
        paddingLeft: '24px',
      },
      '&:last-of-type': {
        borderTopRightRadius: '16px',
        paddingRight: '24px',
      },
    },
    '& .MuiTableRow-root': {
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:nth-of-type(even)': {
        backgroundColor: '#f8fafc',
      },
      '&:hover': {
        backgroundColor: '#f1f5f9',
      },
    },
    '& .MuiTableCell-body': {
      padding: '16px 20px',
      fontSize: '0.875rem',
      borderBottom: '1px solid #e2e8f0',
      color: '#475569',
      verticalAlign: 'middle',
      '&:first-of-type': {
        color: '#1e293b',
        fontWeight: 500,
        paddingLeft: '24px',
      },
      '&:last-of-type': {
        paddingRight: '24px',
      },
    },
    '& .MuiTable-root': {
      minWidth: '1200px',
      borderCollapse: 'separate',
      borderSpacing: '0',
    },
  }));

  const StyledChip = styled(Chip)(({ theme, status }) => ({
    fontWeight: 500,
    borderRadius: '6px',
    height: '26px',
    fontSize: '0.75rem',
    textTransform: 'capitalize',
    transition: 'all 0.2s ease',
    '&.MuiChip-filled': {
      backgroundColor: status === 'available' ? '#dcfce7' : 
                      status === 'maintenance' ? '#fef3c7' :
                      status === 'decommissioned' ? '#fee2e2' :
                      status === 'lost' ? '#f3e8ff' :
                      '#f1f5f9',
      color: status === 'available' ? '#166534' : 
            status === 'maintenance' ? '#92400e' :
            status === 'decommissioned' ? '#991b1b' :
            status === 'lost' ? '#6b21a8' :
            '#475569',
      '& .MuiChip-label': {
        padding: '0 10px',
      },
    },
  }));

  const CategoryBadge = styled(Box)(({ category, theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '8px',
    fontWeight: 500,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.25px',
    background: category === 'Médical' 
      ? '#eff6ff'
      : '#faf5ff',
    color: category === 'Médical' ? '#1d4ed8' : '#7c3aed',
    border: `1px solid ${category === 'Médical' ? '#dbeafe' : '#e9d5ff'}`,
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
                      status === 'maintenance' ? theme.palette.warning.main :
                      status === 'decommissioned' ? theme.palette.error.main :
                      status === 'lost' ? theme.palette.error.dark :
                      theme.palette.grey.main,
      marginRight: '8px',
    },
  }));

  const ModernTableRow = styled(TableRow)(({ theme }) => ({
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      backgroundColor: '#f1f5f9',
    },
  }));

  const EquipmentAvatar = styled(Avatar)(({ theme, status }) => ({
    width: '48px',
    height: '48px',
    background: status === 'available' ? `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.light})` :
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
                    status === 'maintenance' ? theme.palette.warning.main :
                    status === 'decommissioned' ? theme.palette.error.main :
                    status === 'lost' ? theme.palette.error.dark :
                    theme.palette.error.main,
    boxShadow: `0 0 8px ${alpha(status === 'available' ? theme.palette.success.main :
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
    const [openQRCodeDialog, setOpenQRCodeDialog] = useState(false);
    const [openStickerDialog, setOpenStickerDialog] = useState(false);
    const [openPrintStickersDialog, setOpenPrintStickersDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedEquipmentIds, setSelectedEquipmentIds] = useState([]);
    const [page, setPage] = useState(0);
    const [pagination, setPagination] = useState(null);

    const [rowsPerPage, setRowsPerPage] = useState(50); // Optimisation: réduire le nombre d'éléments chargés par page
    const [users, setUsers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [equipmentLoans, setEquipmentLoans] = useState([]);
    const [formData, setFormData] = useState({
      assetId: '', // Asset ID généré par le backend
      name: '',
      category: '',
      type: '', // Added for the new sub-category
      serialNumber: '', // Sera généré automatiquement si vide
      status: 'available',
      condition: 'new',
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
          else if (item.status === 'decommissioned' || item.status === 'lost') teamStats[userId].notWorking++;
        }
      });
      
      return Object.values(teamStats);
    }, [equipment]);

    // Load users for assignment dropdown
    useEffect(() => {
      const loadUsers = async () => {
        try {
          const response = await getUsers();
          setUsers(response || []);
        } catch (error) {
          // Error handling without debug logs
        }
      };

      loadUsers();
    }, []);

    // Handle opening the dialog
    const handleOpenDialog = () => {
      setFormData({
        assetId: '', // Sera généré par le backend
        name: '',
        category: '',
        type: '',
        serialNumber: '', // Sera généré automatiquement (format: TYPE-12345)
        status: 'available',
        condition: 'new',
        notes: '',
        entryDate: '',
        assignedUserId: ''
      });
      setFormErrors({});
      setOpenDialog(true);
    };

    const handleCloseDialog = () => {
      setFormErrors({});
      setOpenDialog(false);
    };

    const validateForm = () => {
      const errors = {};
      
      if (!formData.name || formData.name.trim() === '') {
        errors.name = 'Le nom est obligatoire';
      }
      
      if (!formData.category) {
        errors.category = 'La catégorie est obligatoire';
      }
      
      if (formData.category && !formData.type) {
        errors.type = 'Le type est obligatoire';
      }
      
      // serialNumber est auto-généré, pas de validation requise
      
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };

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
        
        const response = await equipmentService.getAll(params);
        
        if (response && response.data && response.pagination) {
          // Réponse paginée
          setEquipment(response.data);
          setPagination(response.pagination);
          // Calculate statistics from paginated data instead of making second API call
          setEquipmentStats(calculateEquipmentStats(response.data || []));
        } else {
          // Réponse directe (compatibilité)
          setEquipment(response || []);
          setPagination(null);
          setEquipmentStats(calculateEquipmentStats(response || []));
        }
      } catch (error) {
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
          newState.serialNumber = ''; // Reset serial number
          newState.name = ''; // Reset name when category changes
        }

        // Générer automatiquement le nom et le numéro de série quand le type change
        if (name === 'type' && value) {
          newState.name = value; // Auto-fill name with type
          const prefix = value.toUpperCase().replace(/\s/g, '').substring(0, 5);
          const randomNum = Math.floor(Math.random() * 90000) + 10000;
          newState.serialNumber = `${prefix}-${randomNum}`;
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
      
      // Empêcher double soumission
      if (isSubmitting) {
        return;
      }
      
      setIsSubmitting(true);
      setLoading(true);
      setError(null);

      try {
        // Préparer les données pour l'API
        // NE PAS générer d'assetId - le backend le fera automatiquement
        // Envoyer serialNumber vide pour que le backend le génère automatiquement (format: TYPE-12345)
        const equipmentData = {
          name: formData.name.trim(),
          type: formData.type || 'other',
          category: formData.category.trim(),
          serialNumber: formData.serialNumber ? formData.serialNumber.trim() : '', // Vide = auto-génération par backend
          status: formData.status || 'available',
          condition: formData.condition || 'new',
          notes: formData.notes ? formData.notes.trim() : null,
          entryDate: formData.entryDate ? new Date(formData.entryDate).toISOString() : null,
          assignedUserId: formData.assignedUserId || null
        };
        
        // Envoyer les données (le backend générera l'assetId)
        const response = await equipmentService.create(equipmentData);
        
        // Recharger la liste des équipements
        await loadEquipment();
        
        // Réinitialiser le formulaire
        setFormData({
          name: '',
          type: 'other',
          category: '',
          serialNumber: '',
          status: 'available',
          condition: 'new',
          notes: '',
          entryDate: '',
          assignedUserId: ''
        });
        
        // Fermer la boîte de dialogue
        handleCloseDialog();
        
        // Afficher un message de succès avec l'Asset ID
        const assetId = response.data?.assetId || 'Généré automatiquement';
        alert(`Équipement enregistré avec succès!\nAsset ID: ${assetId}`);
        
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Une erreur est survenue lors de l\'enregistrement';
        
        setError(errorMessage);
        alert(`Erreur: ${errorMessage}`);
      } finally {
        setLoading(false);
        setIsSubmitting(false);
      }
    };

    const handleViewDetails = async (item) => {
      setSelectedItem(item);
      setOpenDetailsDialog(true);

      // Charger l'historique des prêts de l'équipement
      try {
        const response = await loanService.getByEquipment(item._id);
        setEquipmentLoans(response.data || response || []);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique des prêts:', error);
        setEquipmentLoans([]);
      }
    };

    const handleViewQRCode = (item) => {
      setSelectedItem(item);
      setOpenQRCodeDialog(true);
    };

    const handleViewSticker = (item) => {
      setSelectedItem(item);
      setOpenStickerDialog(true);
    };

    const handleSelectEquipment = (equipmentId) => {
      setSelectedEquipmentIds(prev => 
        prev.includes(equipmentId) 
          ? prev.filter(id => id !== equipmentId)
          : [...prev, equipmentId]
      );
    };

    const handleSelectAll = () => {
      const allIds = equipment.map(eq => eq._id);
      setSelectedEquipmentIds(prev => 
        prev.length === allIds.length ? [] : allIds
      );
    };

    const handlePrintStickers = () => {
      setOpenPrintStickersDialog(true);
    };

    const handlePrintMultipleStickers = () => {
      const selectedEquipment = equipment.filter(eq =>
        selectedEquipmentIds.includes(eq._id)
      );

      // Filtrer uniquement les équipements avec Asset ID
      const equipmentWithAssetId = selectedEquipment.filter(eq => eq.assetId);
      const equipmentWithoutAssetId = selectedEquipment.filter(eq => !eq.assetId);

      // Avertissement si certains équipements n'ont pas d'Asset ID
      if (equipmentWithoutAssetId.length > 0) {
        alert(`⚠️ ${equipmentWithoutAssetId.length} équipement(s) sélectionné(s) n'ont pas d'Asset ID et ne seront pas imprimés.`);
      }

      if (equipmentWithAssetId.length === 0) {
        alert('Aucun équipement avec Asset ID à imprimer.');
        return;
      }

      // Créer une fenêtre temporaire pour l'impression
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Veuillez autoriser les popups pour imprimer');
        return;
      }

      // Générer le QR Code pour chaque équipement
      const stickersHTML = equipmentWithAssetId.map(item => {
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/equipment/${item.assetId}`)}`;
        const logoUrl = `${window.location.origin}/images/t2riv-logo.jpg`;

        return `
          <div class="sticker-container">
            <div class="header">
              <img class="logo" src="${logoUrl}" alt="T2Riv Logo" onerror="this.style.display='none'" />
            </div>
            <div class="equipment-name">${item.name || '—'}</div>
            <div class="info-row">
              <div class="info-item">
                <div class="label">Asset ID</div>
                <div class="asset-id">${item.assetId}</div>
              </div>
              <div class="info-item">
                <div class="label">N° série</div>
                <div class="serial-number">${item.serialNumber || '—'}</div>
              </div>
            </div>
            <div class="category">${item.category || '—'}</div>
            <div class="footer">
              <div class="association">Tunisiens des deux rives</div>
              <img class="qr-code" src="${qrCodeUrl}" alt="QR Code" />
            </div>
          </div>
        `;
      }).join('');

      // Calculer le nombre de pages nécessaires (10 stickers par page)
      const stickersPerPage = 10;
      const totalPages = Math.ceil(equipmentWithAssetId.length / stickersPerPage);

      // Générer les pages
      let pagesHTML = '';
      for (let page = 0; page < totalPages; page++) {
        const startIndex = page * stickersPerPage;
        const endIndex = Math.min(startIndex + stickersPerPage, equipmentWithAssetId.length);
        const pageStickers = equipmentWithAssetId.slice(startIndex, endIndex);

        // Compléter avec des stickers vides si nécessaire
        while (pageStickers.length < stickersPerPage) {
          pageStickers.push(null);
        }

        const pageStickersHTML = pageStickers.map((item, index) => {
          if (!item) {
            return '<div class="sticker-container empty"></div>';
          }

          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/equipment/${item.assetId}`)}`;
          const logoUrl = `${window.location.origin}/images/t2riv-logo.jpg`;

          return `
            <div class="sticker-container">
              <div class="header">
                <img class="logo" src="${logoUrl}" alt="T2Riv Logo" onerror="this.style.display='none'" />
              </div>
              <div class="equipment-name">${item.name || '—'}</div>
              <div class="info-row">
                <div class="info-item">
                  <div class="label">Asset ID</div>
                  <div class="asset-id">${item.assetId}</div>
                </div>
                <div class="info-item">
                  <div class="label">N° série</div>
                  <div class="serial-number">${item.serialNumber || '—'}</div>
                </div>
              </div>
              <div class="category">${item.category || '—'}</div>
              <div class="footer">
                <div class="association">Tunisiens des deux rives</div>
                <img class="qr-code" src="${qrCodeUrl}" alt="QR Code" />
              </div>
            </div>
          `;
        }).join('');

        pagesHTML += `
          <div class="page">
            ${pageStickersHTML}
          </div>
        `;
      }

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Stickers - ${equipmentWithAssetId.length} équipements (${totalPages} page${totalPages > 1 ? 's' : ''})</title>
          <style>
            @page {
              size: A4;
              margin: 5mm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            .page {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              grid-template-rows: repeat(5, 1fr);
              gap: 2mm;
              width: 200mm;
              height: 287mm;
              page-break-after: always;
            }
            .page:last-child {
              page-break-after: auto;
            }
            .sticker-container {
              width: 100mm;
              height: 56mm;
              border: 2px solid #e0e0e0;
              padding: 3mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: white;
              break-inside: avoid;
            }
            .sticker-container.empty {
              border: 1px dashed #ccc;
              background: #f9f9f9;
            }
            .header {
              display: flex;
              justify-content: center;
              margin-bottom: 2mm;
            }
            .logo {
              width: 15mm;
              height: 15mm;
              object-fit: contain;
            }
            .equipment-name {
              text-align: center;
              font-size: 7pt;
              font-weight: 700;
              color: #1976d2;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              line-height: 1.2;
              min-height: 2.4em;
              margin-bottom: 2mm;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              gap: 2mm;
              margin-bottom: 2mm;
            }
            .info-item {
              flex: 1;
            }
            .label {
              font-size: 6pt;
              font-weight: 600;
              color: #666;
              text-transform: uppercase;
              margin-bottom: 0.5mm;
            }
            .asset-id {
              font-family: monospace;
              font-weight: 800;
              font-size: 9pt;
              color: #1976d2;
              letter-spacing: 0.3px;
              background: #f5f5f5;
              padding: 1mm;
              border-left: 2px solid #1976d2;
            }
            .serial-number {
              font-family: monospace;
              font-weight: 600;
              font-size: 7pt;
              color: #333;
            }
            .category {
              text-align: center;
              font-size: 7pt;
              font-weight: 600;
              color: #333;
              margin-bottom: 2mm;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              gap: 2mm;
            }
            .association {
              font-size: 6pt;
              font-weight: 600;
              color: #666;
            }
            .qr-code {
              width: 12mm;
              height: 12mm;
            }
            @media print {
              .page {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${pagesHTML}
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.print();
      };
    };

    const handlePrintSticker = (item) => {
      // Créer une fenêtre temporaire pour l'impression
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Veuillez autoriser les popups pour imprimer');
        return;
      }

      // Générer le QR Code en utilisant une API publique
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/equipment/${item.assetId}`)}`;

      // Utiliser le logo via URL absolue (dossier public)
      const logoUrl = `${window.location.origin}/images/t2riv-logo.jpg`;

      // Préparer le contenu du sticker
      const stickerContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sticker - ${item.assetId}</title>
          <style>
            @page {
              size: 100mm 60mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              font-family: Arial, sans-serif;
            }
            .sticker-container {
              width: 100mm;
              height: 60mm;
              border: 2px solid #e0e0e0;
              padding: 10mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: white;
            }
            .header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 8px;
            }
            .logo {
              width: 30px;
              height: 30px;
              object-fit: contain;
            }
            .title {
              font-size: 8px;
              font-weight: 600;
              color: #666;
              text-transform: uppercase;
            }
            .section {
              margin-bottom: 8px;
            }
            .label {
              font-size: 7px;
              font-weight: 600;
              color: #999;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .value {
              font-size: 10px;
              font-weight: 600;
              color: #333;
            }
            .asset-id {
              font-family: monospace;
              font-weight: 700;
              font-size: 14px;
              color: #1976d2;
              letter-spacing: 0.5px;
            }
            .serial-number {
              font-family: monospace;
              font-weight: 500;
              font-size: 9px;
              color: #333;
            }
            .qr-section {
              display: flex;
              align-items: center;
              justify-content: flex-end;
              gap: 10px;
            }
            .qr-code {
              width: 40px;
              height: 40px;
            }
          </style>
        </head>
        <body>
          <div class="sticker-container">
            <div class="header">
              <img class="logo" src="${logoUrl}" alt="T2Riv Logo" onerror="this.style.display='none'; this.parentElement.querySelector('.title').style.display='block'" />
              <div class="title">INVENTAIRE MATÉRIEL</div>
            </div>
            <div class="section">
              <div class="label">ÉQUIPEMENT</div>
              <div class="value">${item.name || '—'}</div>
            </div>
            <div class="section">
              <div class="label">ASSET ID</div>
              <div class="asset-id">${item.assetId}</div>
            </div>
            <div class="section">
              <div class="label">N° SÉRIE CONSTRUCTEUR</div>
              <div class="serial-number">${item.serialNumber || '—'}</div>
            </div>
            <div class="qr-section">
              <img class="qr-code" src="${qrCodeUrl}" alt="QR Code" />
            </div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(stickerContent);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé avant d'imprimer
      printWindow.onload = () => {
        printWindow.print();
      };
    };

    const handleEdit = (item) => {
      setSelectedItem(item);
      setFormData({
        assetId: item.assetId, // Inclure l'assetId pour affichage
        name: item.name,
        category: item.category,
        type: item.type || item.name, // Use type field if available, fallback to name
        serialNumber: item.serialNumber || '',
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
        
        // Validate required fields before sending (serialNumber retiré - maintenant optionnel)
        if (!formData.name || !formData.category || !formData.type) {
          window.alert('Veuillez remplir tous les champs obligatoires (nom, catégorie, type)');
          return;
        }
        
        // Clean the data before sending
        const cleanData = {
          ...formData,
          assignedUserId: formData.assignedUserId || null,
          notes: formData.notes || null,
          entryDate: formData.entryDate || null
        };
        
        // NE PAS envoyer assetId - le backend l'ignore et il ne doit pas être modifié
        delete cleanData.assetId;
        
        // Gérer serialNumber optionnel
        if (cleanData.serialNumber === '') {
          cleanData.serialNumber = null;
        }
        
        await equipmentService.update(selectedItem._id, cleanData);
        await loadEquipment();
        setOpenEditDialog(false);
      } catch (error) {
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
      const isMarkingDecommissioned = item.status !== 'decommissioned';
      const confirmMessage = isMarkingDecommissioned
        ? 'Êtes-vous sûr de vouloir marquer cet équipement comme hors service ?'
        : 'Voulez-vous marquer cet équipement comme fonctionnel à nouveau ?';

      if (window.confirm(confirmMessage)) {
        try {
          setLoading(true);
          const newStatus = isMarkingDecommissioned ? 'decommissioned' : 'available';
          // Only send the status field to avoid validation errors
          await equipmentService.update(item._id, { status: newStatus });
          await loadEquipment();
        } catch (error) {
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

              {/* Bureautique Equipment Stats */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" color="secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WorkOutlineIcon color="secondary" /> Équipements Bureautique
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
                          Aucun équipement bureautique trouvé
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        <Grid item xs={12}>
          <MainCard
            title="Gestion des équipements"
            secondary={
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {selectedEquipmentIds.length > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<PrinterOutlined />}
                    onClick={handlePrintStickers}
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
                      }
                    }}
                  >
                    🖨 Imprimer les stickers ({selectedEquipmentIds.length})
                  </Button>
                )}
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
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#cbd5e1',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1',
                      borderWidth: '2px',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined style={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                  endAdornment: search && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearch('')}
                        sx={{ color: '#94a3b8' }}
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
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedEquipmentIds.length > 0 && selectedEquipmentIds.length < equipment.length}
                        checked={equipment.length > 0 && selectedEquipmentIds.length === equipment.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>ASSET ID</TableCell>
                    <TableCell>ÉQUIPEMENT</TableCell>
                    <TableCell>CATÉGORIE</TableCell>
                    <TableCell>N° SÉRIE CONSTRUCTEUR</TableCell>
                    <TableCell>STATUT</TableCell>
                    <TableCell>ÉTAT</TableCell>
                    <TableCell>DERNIÈRE MISE À JOUR</TableCell>
                    <TableCell>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {equipment.map((item) => (
                    <ModernTableRow key={item._id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedEquipmentIds.includes(item._id)}
                          onChange={() => handleSelectEquipment(item._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            px: 2,
                            py: 0.75,
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            color: '#475569',
                            letterSpacing: '0.25px',
                            display: 'inline-block',
                          }}
                        >
                          {item.assetId || '—'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <EquipmentAvatar 
                            className="equipment-avatar"
                            status={item.status}
                          >
                            {item.name.charAt(0).toUpperCase()}
                          </EquipmentAvatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ fontSize: '0.9rem' }}>
                              {item.name}
                            </Typography>
                            {item.type && (
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                {item.type}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <CategoryBadge category={item.category}>
                          {item.category === 'Médical' ? <MedicalServicesIcon sx={{ fontSize: 16 }} /> : <WorkOutlineIcon sx={{ fontSize: 16 }} />}
                          {item.category}
                        </CategoryBadge>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            px: 2,
                            py: 0.75,
                            borderRadius: '8px',
                            background: 'rgba(0, 0, 0, 0.03)',
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            color: 'text.secondary',
                            display: 'inline-block',
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                          }}
                        >
                          {item.serialNumber || '—'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <StatusIndicator status={item.status} />
                          <StyledChip
                            label={item.status === 'available' ? 'Disponible' : 
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
                          <StyledChip
                            label={item.condition === 'excellent' ? '🌟 Excellent' :
                                   item.condition === 'good' ? '✅ Bon' :
                                   item.condition === 'fair' ? '⚠️ Moyen' :
                                   item.condition === 'poor' ? '❌ Mauvais' :
                                   'N/A'}
                            status={item.condition === 'excellent' ? 'available' :
                                    item.condition === 'good' ? 'available' :
                                    item.condition === 'fair' ? 'maintenance' :
                                    item.condition === 'poor' ? 'decommissioned' :
                                    'available'}
                            size="small"
                            variant="filled"
                          />
                          {item.lastMaintenance && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              🛠️ Dernier entretien: {new Date(item.lastMaintenance).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500} color="text.primary">
                            {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('fr-FR') : 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <ActionButtonGroup className="action-buttons">
                          <Tooltip title="Détails de l'équipement">
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
                          {item.assetId && (
                            <Tooltip title="Voir QR Code">
                              <IconButton 
                                onClick={() => handleViewQRCode(item)}
                                sx={{
                                  backgroundColor: 'success.light',
                                  color: 'success.main',
                                  '&:hover': {
                                    backgroundColor: 'success.main',
                                    color: 'white',
                                  }
                                }}
                              >
                                <QrcodeOutlined style={{ fontSize: '18px' }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {item.assetId && (
                            <Tooltip title="Voir sticker">
                              <IconButton 
                                onClick={() => handleViewSticker(item)}
                                sx={{
                                  backgroundColor: 'warning.light',
                                  color: 'warning.main',
                                  '&:hover': {
                                    backgroundColor: 'warning.main',
                                    color: 'white',
                                  }
                                }}
                              >
                                <TagOutlined style={{ fontSize: '18px' }} />
                              </IconButton>
                            </Tooltip>
                          )}
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
                      helperText="Automatiquement rempli par le type sélectionné"
                      error={!!formErrors.name}
                      {...(formErrors.name && { helperText: formErrors.name })}
                      InputProps={{
                        readOnly: true,
                        sx: {
                          backgroundColor: 'rgba(0, 0, 0, 0.03)',
                          cursor: 'not-allowed'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required variant="outlined" error={!!formErrors.category}>
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
                      {formErrors.category && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                          {formErrors.category}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  {formData.category && (
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required variant="outlined" error={!!formErrors.type}>
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
                        {formErrors.type && (
                          <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                            {formErrors.type}
                          </Typography>
                        )}
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
                
                {/* Asset ID généré automatiquement par le backend - non affiché en création */}
                
                <TextField
                  fullWidth
                  label="Numéro de série (auto-généré, modifiable)"
                  name="serialNumber"
                  value={formData.serialNumber || ''}
                  onChange={handleChange}
                  variant="outlined"
                  helperText="Généré automatiquement: 5 caractères du type + tiret + nombre aléatoire (ex: CHAIR-12345)"
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
                        <MenuItem value="new">
                          <Box display="flex" alignItems="center" gap={1}>
                            🆕 Neuf
                          </Box>
                        </MenuItem>
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
                        <MenuItem value="unusable">
                          <Box display="flex" alignItems="center" gap={1}>
                            ⛔ Inutilisable
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                {isSubmitting ? (
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
        <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth>
          {selectedItem && (
            <>
              <DialogTitle>Détails de l'équipement</DialogTitle>
              <DialogContent>
                <Stack spacing={3} sx={{ mt: 2 }}>
                  {/* Section: Informations de l'équipement */}
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                      📋 Informations de l'équipement
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Asset ID"
                          value={selectedItem.assetId || '—'}
                          size="small"
                          InputProps={{
                            readOnly: true,
                            sx: {
                              fontFamily: 'monospace',
                              fontWeight: 'bold',
                              color: 'primary.main'
                            }
                          }}
                          helperText="🔒 Identifiant interne"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nom"
                          value={selectedItem.name}
                          size="small"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Catégorie"
                          value={selectedItem.category}
                          size="small"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Numéro de série"
                          value={selectedItem.serialNumber || '—'}
                          size="small"
                          InputProps={{
                            readOnly: true,
                            sx: {
                              fontFamily: 'monospace'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Statut"
                          value={selectedItem.status}
                          size="small"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="État"
                          value={selectedItem.condition}
                          size="small"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
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
                          size="small"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Date d'entrée"
                          value={selectedItem.entryDate ? new Date(selectedItem.entryDate).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                          size="small"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Notes"
                          value={selectedItem.notes || 'Aucune note'}
                          size="small"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Section: Historique des mouvements */}
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                      📜 Historique des mouvements
                    </Typography>
                    {equipmentLoans.length > 0 ? (
                      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date de prêt</TableCell>
                              <TableCell>Patient</TableCell>
                              <TableCell>Statut</TableCell>
                              <TableCell>Retour attendu</TableCell>
                              <TableCell>Retour effectif</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {equipmentLoans.map((loan) => (
                              <TableRow key={loan._id}>
                                <TableCell>
                                  {new Date(loan.loanDate).toLocaleDateString('fr-FR')}
                                </TableCell>
                                <TableCell>
                                  {loan.patient?.firstName} {loan.patient?.lastName}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={loan.status}
                                    size="small"
                                    color={
                                      loan.status === 'active' ? 'success' :
                                      loan.status === 'returned' ? 'default' :
                                      loan.status === 'cancelled' ? 'error' : 'default'
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  {new Date(loan.expectedReturnDate).toLocaleDateString('fr-FR')}
                                </TableCell>
                                <TableCell>
                                  {loan.actualReturnDate
                                    ? new Date(loan.actualReturnDate).toLocaleDateString('fr-FR')
                                    : '—'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        Aucun mouvement enregistré pour cet équipement
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDetailsDialog(false)}>Fermer</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog open={openQRCodeDialog} onClose={() => setOpenQRCodeDialog(false)} maxWidth="sm" fullWidth>
          {selectedItem && selectedItem.assetId && (
            <>
              <DialogTitle>QR Code de l'équipement</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 2 }}>
                  <EquipmentQRCode assetId={selectedItem.assetId} size={250} />
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Scanner pour accéder à la fiche de l'équipement
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenQRCodeDialog(false)}>Fermer</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Sticker Dialog */}
        <Dialog open={openStickerDialog} onClose={() => setOpenStickerDialog(false)} maxWidth="sm" fullWidth>
          {selectedItem && (
            <>
              <DialogTitle>Aperçu du sticker</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <EquipmentSticker equipment={selectedItem} printMode={true} />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenStickerDialog(false)}>Fermer</Button>
                <Button 
                  onClick={() => handlePrintSticker(selectedItem)}
                  variant="contained"
                  startIcon={<PrinterOutlined />}
                >
                  Imprimer le sticker
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Print Stickers Dialog */}
        <Dialog open={openPrintStickersDialog} onClose={() => setOpenPrintStickersDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Aperçu des stickers ({selectedEquipmentIds.length})</DialogTitle>
          <DialogContent>
            <Box sx={{ py: 3 }}>
              <Grid container spacing={3}>
                {equipment.filter(eq => selectedEquipmentIds.includes(eq._id) && eq.assetId).map(item => (
                  <Grid item xs={12} sm={6} md={4} key={item._id}>
                    <EquipmentSticker equipment={item} />
                  </Grid>
                ))}
              </Grid>
              {equipment.filter(eq => selectedEquipmentIds.includes(eq._id) && !eq.assetId).length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="warning.dark">
                    ⚠️ {equipment.filter(eq => selectedEquipmentIds.includes(eq._id) && !eq.assetId).length} équipement(s) sans Asset ID ne seront pas imprimés
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPrintStickersDialog(false)}>Fermer</Button>
            <Button 
              onClick={handlePrintMultipleStickers}
              variant="contained"
              startIcon={<PrinterOutlined />}
            >
              Imprimer {equipment.filter(eq => selectedEquipmentIds.includes(eq._id) && eq.assetId).length} sticker{equipment.filter(eq => selectedEquipmentIds.includes(eq._id) && eq.assetId).length > 1 ? 's' : ''}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Equipment Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
          <form onSubmit={handleUpdate}>
            <DialogTitle>Modifier l'équipement</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {/* Asset ID - Non modifiable */}
                <TextField
                  fullWidth
                  disabled
                  label="Asset ID"
                  name="assetId"
                  value={formData.assetId || '—'}
                  margin="normal"
                  helperText="🔒 Identifiant interne — non modifiable"
                  InputProps={{
                    sx: {
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      backgroundColor: 'rgba(99, 102, 241, 0.05)'
                    }
                  }}
                />
                
                <TextField
                  fullWidth
                  required
                  label="Nom de l'équipement"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  helperText="Automatiquement rempli par le type sélectionné"
                  InputProps={{
                    readOnly: true,
                    sx: {
                      backgroundColor: 'rgba(0, 0, 0, 0.03)',
                      cursor: 'not-allowed'
                    }
                  }}
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
                  label="Numéro de série constructeur (optionnel)"
                  name="serialNumber"
                  value={formData.serialNumber || ''}
                  onChange={handleChange}
                  margin="normal"
                  helperText="Numéro de série du fabricant (modifiable)"
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
                    <MenuItem value="new">Neuf</MenuItem>
                    <MenuItem value="excellent">Excellent</MenuItem>
                    <MenuItem value="good">Bon</MenuItem>
                    <MenuItem value="fair">Moyen</MenuItem>
                    <MenuItem value="poor">Mauvais</MenuItem>
                    <MenuItem value="unusable">Inutilisable</MenuItem>
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

      </Grid>
    );
  };

  export default EquipmentList;
