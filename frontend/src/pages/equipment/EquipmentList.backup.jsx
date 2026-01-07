import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  TablePagination,
  Toolbar,
  InputAdornment
} from '@mui/material';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import equipmentService from 'services/equipmentService';
import MainCard from 'components/MainCard';
import PrintButton from 'components/PrintButton';
import { styled } from '@mui/material/styles';

// Styles personnalisés
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.customShadows.xs,
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontWeight: 600,
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 500,
  borderRadius: theme.shape.borderRadius,
}));

const EquipmentList = () => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Generate a default serial number in format EQ-YYYYMMDD-XXXX
  const generateDefaultSerialNumber = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    return `EQ-${dateStr}-${randomNum}`;
  };

  // Get default form data with auto-generated serial number
  const getDefaultFormData = () => ({
    name: '',
    category: '',
    serialNumber: generateDefaultSerialNumber(),
    status: 'available',
    condition: 'good',
    notes: '',
    exitDate: '',
    entryDate: ''
  });

  const [formData, setFormData] = useState(getDefaultFormData());
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    return `EQ-${dateStr}-${randomNum}`;
  };

  // Set default serial number when opening the dialog
  const handleOpenDialog = () => {
    setFormData({
      ...getDefaultFormData(),
      serialNumber: generateDefaultSerialNumber()
    });
    setOpenDialog(true);
  };


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    loadEquipment();
  }, [search, statusFilter]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      
      console.log('Chargement des équipements avec params:', params);
      const response = await equipmentService.getAll(params);
      
      // Afficher la structure complète des données reçues
      console.log('Données brutes de l\'API:', JSON.parse(JSON.stringify(response.data)));
      
      // Vérifier si les données ont la bonne structure
      const isValidData = Array.isArray(response.data) && response.data.every(item => 
        item && typeof item === 'object' && 'name' in item
      );
      
      if (!isValidData) {
        console.error('Format de données invalide reçu de l\'API:', response.data);
        throw new Error('Format de données invalide');
      }
      
      // Vérifier les champs de date pour chaque élément
      const processedData = response.data.map(item => {
        console.log('Vérification des dates pour:', item.name, {
          exitDate: item.exitDate,
          entryDate: item.entryDate,
          typeExitDate: typeof item.exitDate,
          typeEntryDate: typeof item.entryDate
        });
        return item;
      });
      
      setEquipment(processedData);
    } catch (error) {
      console.error('Erreur lors du chargement des équipements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour formater une date pour l'affichage
  const formatDateForDisplay = (dateValue) => {
    console.log('Formatage de la date - Valeur reçue:', dateValue, 'Type:', typeof dateValue);
    
    // Vérifier si la valeur est vide, nulle ou le mot 'null'/'undefined'
    if (dateValue === null || dateValue === undefined || 
        (typeof dateValue === 'string' && (dateValue === '' || dateValue === 'null' || dateValue === 'undefined'))) {
      console.log('Date non définie ou invalide');
      return 'Non définie';
    }
    
    try {
      // Essayer de créer un objet Date
      let date;
      
      if (dateValue instanceof Date) {
        date = dateValue;
      } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        date = new Date(dateValue);
      } else {
        console.warn('Type de date non supporté:', typeof dateValue, dateValue);
        return 'Format invalide';
      }
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        console.warn('Date invalide reçue:', dateValue);
        return 'Date invalide';
      }
      
      // Formater la date en français
      const formattedDate = date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      console.log('Date formatée avec succès:', { original: dateValue, formatted: formattedDate });
      return formattedDate;
      
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error, 'Valeur reçue:', dateValue);
      return 'Erreur de format';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'lent':
        return 'warning';
      case 'maintenance':
        return 'error';
      case 'lost':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'lent':
        return 'Prêté';
      case 'maintenance':
        return 'Maintenance';
      case 'lost':
        return 'Perdu';
      default:
        return status;
    }
  };

  // Handle opening the dialog with a new serial number
  const handleOpenDialog = () => {
    setFormData(getDefaultFormData());
    setOpenDialog(true);
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setOpenDetailsDialog(true);
  };
  
  const handleEdit = useCallback((item) => {
    setSelectedItem(item);
    // Fonction pour formater la date au format YYYY-MM-DD
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    };
    
    setFormData({
      name: item.name || '',
      category: item.category || '',
      serialNumber: item.serialNumber || '',
      status: item.status || 'available',
      condition: item.condition || 'good',
      notes: item.notes || '',
      exitDate: formatDateForInput(item.exitDate),
      entryDate: formatDateForInput(item.entryDate)
    });
    setOpenEditDialog(true);
  }, []);
  
  const handleDelete = async (id) => {
    if (!id) {
      console.error('Aucun ID fourni pour la suppression');
      alert('Erreur: Identifiant manquant pour la suppression');
      return;
    }
    
    console.log('Tentative de suppression - ID reçu:', id);
    console.log('Liste des équipements:', equipment);
    
    const itemToDelete = equipment.find(item => item._id === id || item.id === id);
    
    if (!itemToDelete) {
      console.error('Équipement non trouvé avec l\'ID:', id);
      alert('Erreur: Impossible de trouver l\'équipement à supprimer');
      return;
    }
    
    console.log('Équipement à supprimer:', itemToDelete);
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${itemToDelete.name}" ?`)) {
      try {
        setLoading(true);
        await equipmentService.delete(id);
        await loadEquipment();
        setAlert({ open: true, message: 'Équipement supprimé avec succès', severity: 'success' });
      } catch (e) {
        console.error('❌ Erreur suppression:', e);
        alert('❌ Erreur lors de la suppression: ' + (e.response?.data?.message || e.message));
<Dialog 
  open={openDialog} 
  onClose={handleCloseDialog} 
  maxWidth="sm" 
        value={formData.serialNumber} 
        onChange={handleChange}
        helperText="Numéro de série généré automatiquement"
      />
      <TextField
        fullWidth
        label="Date de sortie"
        type="date"
        name="exitDate"
        value={formData.exitDate}
        onChange={handleChange}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        fullWidth
        label="Date d'entrée"
        type="date"
        name="entryDate"
        value={formData.entryDate}
        onChange={handleChange}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <FormControl fullWidth>
        <InputLabel>Statut</InputLabel>
        <Select label="Statut" name="status" value={formData.status} onChange={handleChange}>
          <MenuItem value="available">Disponible</MenuItem>
          <MenuItem value="lent">Prêté</MenuItem>
          <MenuItem value="maintenance">Maintenance</MenuItem>
          <MenuItem value="lost">Perdu</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Condition</InputLabel>
        <Select label="Condition" name="condition" value={formData.condition} onChange={handleChange}>
          <MenuItem value="excellent">Excellente</MenuItem>
          <MenuItem value="good">Bonne</MenuItem>
          <MenuItem value="fair">Correcte</MenuItem>
          <MenuItem value="poor">Mauvaise</MenuItem>
        </Select>
      </FormControl>
      <TextField fullWidth multiline rows={3} label="Notes" name="notes" value={formData.notes} onChange={handleChange} />
    </Stack>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDialog}>Annuler</Button>
    <Button
      onClick={handleSubmit}
      variant="contained"
      disabled={loading || !formData.name || !formData.category || !formData.serialNumber}
    >
      Créer
    </Button>
  </DialogActions>
name="exitDate"
value={formData.exitDate}
onChange={handleChange}
InputLabelProps={{
shrink: true,
}}
/>
<TextField
fullWidth
label="Date d'entrée"
type="date"
name="entryDate"
value={formData.entryDate}
onChange={handleChange}
InputLabelProps={{
shrink: true,
}}
/>
<FormControl fullWidth>
<InputLabel>Statut</InputLabel>
<Select label="Statut" name="status" value={formData.status} onChange={handleChange}>
<MenuItem value="available">Disponible</MenuItem>
<MenuItem value="lent">Prêté</MenuItem>
<MenuItem value="maintenance">Maintenance</MenuItem>
<MenuItem value="lost">Perdu</MenuItem>
</Select>
</FormControl>
<FormControl fullWidth>
<InputLabel>Condition</InputLabel>
<Select label="Condition" name="condition" value={formData.condition} onChange={handleChange}>
<MenuItem value="excellent">Excellente</MenuItem>
<MenuItem value="good">Bonne</MenuItem>
<MenuItem value="fair">Correcte</MenuItem>
<MenuItem value="poor">Mauvaise</MenuItem>
</Select>
</FormControl>
<TextField fullWidth multiline rows={3} label="Notes" name="notes" value={formData.notes} onChange={handleChange} />
</Stack>
</DialogContent>
<DialogActions>
<Button onClick={() => setOpenEditDialog(false)}>Annuler</Button>
<Button
onClick={handleUpdate}
variant="contained"
disabled={loading || !formData.name || !formData.category || !formData.serialNumber}
>
Modifier
</Button>
</DialogActions>
</Dialog>
</Grid>
);
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              label="Date d'entrée"
              type="date"
              name="entryDate"
              value={formData.entryDate}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select label="Statut" name="status" value={formData.status} onChange={handleChange}>
                <MenuItem value="available">Disponible</MenuItem>
                <MenuItem value="lent">Prêté</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="lost">Perdu</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Condition</InputLabel>
              <Select label="Condition" name="condition" value={formData.condition} onChange={handleChange}>
                <MenuItem value="excellent">Excellente</MenuItem>
                <MenuItem value="good">Bonne</MenuItem>
                <MenuItem value="fair">Correcte</MenuItem>
                <MenuItem value="poor">Mauvaise</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth multiline rows={3} label="Notes" name="notes" value={formData.notes} onChange={handleChange} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Annuler</Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            disabled={loading || !formData.name || !formData.category || !formData.serialNumber}
          >
            Modifier
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default EquipmentList;
