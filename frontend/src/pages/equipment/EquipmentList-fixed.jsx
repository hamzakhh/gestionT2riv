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
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    serialNumber: '',
    status: 'available',
    condition: 'good',
    notes: '',
    exitDate: '',
    entryDate: ''
  });

  // Generate a default serial number in format EQ-YYYYMMDD-XXXX
  const generateDefaultSerialNumber = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `EQ-${dateStr}-${randomNum}`;
  };

  // Handle opening the dialog with a new serial number
  const handleOpenDialog = () => {
    setFormData({
      name: '',
      category: '',
      serialNumber: generateDefaultSerialNumber(),
      status: 'available',
      condition: 'good',
      notes: '',
      exitDate: '',
      entryDate: ''
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
      setEquipment(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des équipements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await equipmentService.create(formData);
      await loadEquipment();
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la création de l\'équipement:', error);
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
      serialNumber: item.serialNumber,
      status: item.status,
      condition: item.condition,
      notes: item.notes,
      exitDate: item.exitDate,
      entryDate: item.entryDate
    });
    setOpenEditDialog(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await equipmentService.update(selectedItem._id, formData);
      await loadEquipment();
      setOpenEditDialog(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'équipement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      try {
        setLoading(true);
        await equipmentService.delete(id);
        await loadEquipment();
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'équipement:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // ... rest of the component code ...

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard
          title="Gestion des équipements"
          secondary={
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={handleOpenDialog}
            >
              Nouvel équipement
            </Button>
          }
        >
          <StyledTableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>N° Série</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipment.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.serialNumber}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.status} 
                        color={
                          item.status === 'available' ? 'success' : 
                          item.status === 'maintenance' ? 'warning' : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewDetails(item)}>
                        <EyeOutlined />
                      </IconButton>
                      <IconButton onClick={() => handleEdit(item)}>
                        <EditOutlined />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(item._id)}>
                        <DeleteOutlined />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={equipment.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </StyledTableContainer>
        </MainCard>
      </Grid>

      {/* Add/Edit Equipment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Nouvel équipement</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                required
                label="Nom"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                required
                label="Catégorie"
                name="category"
                value={formData.category}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                required
                label="N° Série"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                margin="normal"
                helperText="Numéro de série généré automatiquement"
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
                  <MenuItem value="in_use">En utilisation</MenuItem>
                  <MenuItem value="maintenance">En maintenance</MenuItem>
                  <MenuItem value="out_of_order">Hors service</MenuItem>
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
              <TextField
                fullWidth
                label="Date de sortie"
                type="date"
                name="exitDate"
                value={formData.exitDate}
                onChange={handleChange}
                margin="normal"
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
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
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
                  label="Date de sortie"
                  value={selectedItem.exitDate || 'Non spécifiée'}
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
    </Grid>
  );
};

export default EquipmentList;
