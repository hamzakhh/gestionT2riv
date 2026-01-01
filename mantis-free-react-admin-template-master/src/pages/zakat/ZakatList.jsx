import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Grid,
  Stack,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Typography,
  Card,
  CardContent,
  Avatar,
  Fab
} from '@mui/material';
import { 
  PlusOutlined, 
  SaveOutlined, 
  CloseOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  PhoneOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import MainCard from 'components/MainCard';
import PrintButton from 'components/PrintButton';
import zakatService from 'services/zakatService';

const ZakatList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  
  const [openDialog, setOpenDialog] = useState(false);
  
  // Chargement initial des données
  useEffect(() => {
    loadItems();
  }, []); // Le tableau vide signifie que cela ne s'exécute qu'au montage
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    type: 'zakat_fitr',
    beneficiaryName: '',
    beneficiaryPhone: '',
    amount: '',
    distributionDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const searchTimeout = useRef(null);

  // Gestion du debounce pour la recherche
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      loadItems();
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [search]);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      
      console.log('Chargement des données avec les paramètres:', params);
      const response = await zakatService.getAll(params);
      console.log('Réponse de l\'API:', response);
      
      // Vérification et normalisation de la réponse
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response && Array.isArray(response.data)) {
        data = response.data;
      }
      
      console.log('Données formatées pour le tableau:', data);
      setItems(data);
    } catch (error) {
      console.error('Erreur lors du chargement des données Zakat & Ramadan:', error);
      
      let errorMessage = 'Erreur lors du chargement des données';
      if (error.response) {
        if (error.response.status === 429) {
          errorMessage = 'Trop de requêtes. Veuillez patienter...';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      setAlert({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  const handleOpen = () => {
    setFormData({
      year: new Date().getFullYear(),
      type: 'zakat_fitr',
      beneficiaryName: '',
      beneficiaryPhone: '',
      amount: '',
      distributionDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setEditingId(null);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleEdit = (item) => {
    setFormData({
      year: item.year || new Date().getFullYear(),
      type: item.type || 'zakat_fitr',
      beneficiaryName: item.beneficiary?.name || '',
      beneficiaryPhone: item.beneficiary?.phone || '',
      amount: item.amount || '',
      distributionDate: item.distributionDate ? new Date(item.distributionDate).toISOString().split('T')[0] : '',
      notes: item.notes || ''
    });
    setEditingId(item._id);
    setOpenDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!formData.beneficiaryName.trim()) {
      setAlert({
        open: true,
        message: 'Le nom du bénéficiaire est requis',
        severity: 'error'
      });
      return;
    }
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setAlert({
        open: true,
        message: 'Veuillez saisir un montant valide',
        severity: 'error'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const dataToSend = {
        ...formData,
        amount: Number(formData.amount),
        year: Number(formData.year) || new Date().getFullYear(),
        distributionDate: formData.distributionDate || new Date().toISOString().split('T')[0],
        beneficiary: {
          name: formData.beneficiaryName.trim(),
          phone: formData.beneficiaryPhone.trim()
        }
      };
      
      if (editingId) {
        await zakatService.update(editingId, dataToSend);
        setAlert({ 
          open: true, 
          message: 'Enregistrement mis à jour avec succès', 
          severity: 'success' 
        });
      } else {
        await zakatService.create(dataToSend);
        setAlert({ 
          open: true, 
          message: 'Enregistrement créé avec succès', 
          severity: 'success' 
        });
      }
      
      await loadItems();
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la sauvegarde';
      if (error.response) {
        if (error.response.status === 429) {
          errorMessage = 'Trop de requêtes. Veuillez patienter avant de réessayer.';
        } else if (error.response.data?.message) {
          errorMessage = Array.isArray(error.response.data.message) 
            ? error.response.data.message.join('\n')
            : error.response.data.message;
        }
      }
      
      setAlert({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      await zakatService.delete(id);
      
      // Mise à jour optimiste de l'interface
      setItems(prevItems => prevItems.filter(item => item._id !== id));
      
      setAlert({ 
        open: true, 
        message: 'Enregistrement supprimé avec succès', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      
      let errorMessage = 'Erreur lors de la suppression';
      if (error.response) {
        if (error.response.status === 429) {
          errorMessage = 'Trop de requêtes. Veuillez patienter avant de réessayer.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      setAlert({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
      
      // Rechargement des données en cas d'erreur
      await loadItems();
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDistributed = async (id) => {
    try {
      setLoading(true);
      
      await zakatService.markAsDistributed(id);
      
      // Mise à jour optimiste de l'interface
      setItems(prevItems => 
        prevItems.map(item => 
          item._id === id 
            ? { ...item, status: 'distributed', distributedAt: new Date().toISOString() } 
            : item
        )
      );
      
      setAlert({ 
        open: true, 
        message: 'Marqué comme distribué avec succès', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Erreur lors du marquage comme distribué:', error);
      
      let errorMessage = 'Erreur lors du marquage comme distribué';
      if (error.response) {
        if (error.response.status === 429) {
          errorMessage = 'Trop de requêtes. Veuillez patienter avant de réessayer.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      setAlert({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
      
      // Rechargement des données en cas d'erreur
      await loadItems();
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(amount || 0);

  return (
    <Grid container spacing={3}>
      <Snackbar 
        open={alert.open} 
        autoHideDuration={alert.severity === 'error' ? 10000 : 6000} 
        onClose={() => setAlert(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setAlert(prev => ({ ...prev, open: false }))}
          severity={alert.severity}
          sx={{ 
            width: '100%',
            maxWidth: '400px',
            whiteSpace: 'pre-line',
            '& .MuiAlert-message': { width: '100%' }
          }}
          variant="filled"
        >
          {alert.message}
        </Alert>
      </Snackbar>

      <Grid item xs={12}>
        <MainCard title="Gestion Zakat">
          <Stack spacing={3}>
            {/* Search Bar */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Rechercher par nom du bénéficiaire..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchOutlined style={{ marginRight: 8, color: 'text.secondary' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'background.paper',
                      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                    }
                  }
                }}
              />
            </Box>

            {/* Cards Grid */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ ml: 2 }}>Chargement en cours...</Typography>
              </Box>
            ) : items.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Aucune donnée disponible
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Aucun enregistrement de zakat n'a été trouvé.
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={loadItems}
                  startIcon={<SearchOutlined />}
                  sx={{ borderRadius: 2 }}
                >
                  Réessayer
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {items.map((item) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        },
                      }}
                    >
                      <CardContent sx={{ flex: 1, p: 3 }}>
                        {/* Header with Avatar and Status */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: item.status === 'distributed' ? 'success.main' : 'warning.main',
                              mr: 2,
                              width: 48,
                              height: 48
                            }}
                          >
                            <UserOutlined />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Chip
                              label={item.type === 'zakat_fitr' ? 'Zakat El Fitr' :
                                     item.type === 'zakat_mal' ? 'Zakat El Mal' : 'Aide Ramadan'}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ mb: 1 }}
                            />
                            <Chip
                              label={item.status === 'distributed' ? 'Distribué' : 'En attente'}
                              size="small"
                              color={item.status === 'distributed' ? 'success' : 'warning'}
                            />
                          </Box>
                        </Box>

                        {/* Beneficiary Info */}
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {item.beneficiary?.name}
                        </Typography>

                        {item.beneficiary?.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PhoneOutlined style={{ fontSize: '16px', marginRight: 8, color: '#666' }} />
                            <Typography variant="body2" color="text.secondary">
                              {item.beneficiary.phone}
                            </Typography>
                          </Box>
                        )}

                        {/* Amount */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <DollarOutlined style={{ fontSize: '18px', marginRight: 8, color: '#4caf50' }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                            {formatCurrency(item.amount)}
                          </Typography>
                        </Box>

                        {/* Date */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <CalendarOutlined style={{ fontSize: '16px', marginRight: 8, color: '#666' }} />
                          <Typography variant="body2" color="text.secondary">
                            {item.distributionDate
                              ? new Date(item.distributionDate).toLocaleDateString('fr-FR')
                              : 'Date non spécifiée'}
                          </Typography>
                        </Box>

                        {/* Year */}
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Année: {item.year || 'N/A'}
                        </Typography>

                        {/* Actions */}
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 'auto' }}>
                          <Tooltip title="Modifier">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(item)}
                              disabled={loading}
                              sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'primary.dark' },
                                width: 36,
                                height: 36
                              }}
                            >
                              <EditOutlined style={{ fontSize: '16px' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(item._id)}
                              disabled={loading}
                              sx={{
                                bgcolor: 'error.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'error.dark' },
                                width: 36,
                                height: 36
                              }}
                            >
                              <DeleteOutlined style={{ fontSize: '16px' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Marquer comme distribué">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleMarkAsDistributed(item._id)}
                              disabled={loading || item.status === 'distributed'}
                              sx={{
                                bgcolor: item.status === 'distributed' ? 'grey.400' : 'success.main',
                                color: 'white',
                                '&:hover': {
                                  bgcolor: item.status === 'distributed' ? 'grey.500' : 'success.dark'
                                },
                                width: 36,
                                height: 36
                              }}
                            >
                              <CheckCircleOutlined style={{ fontSize: '16px' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        </MainCard>
      </Grid>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleOpen}
        disabled={loading}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 64,
          height: 64,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          '&:hover': {
            transform: 'scale(1.1)',
          },
          transition: 'transform 0.2s ease',
        }}
      >
        <PlusOutlined style={{ fontSize: '24px' }} />
      </Fab>

      {/* Dialog: Nouvelle entrée Zakat/Ramadan */}
      <Dialog 
        open={openDialog} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle 
            sx={{ 
              bgcolor: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              py: 2.5,
              px: 3,
              fontWeight: 600,
              fontSize: '1.25rem'
            }}
          >
            <Box display="flex" alignItems="center">
              {editingId ? <EditOutlined sx={{ mr: 1.5 }} /> : <PlusOutlined sx={{ mr: 1.5 }} />}
              {editingId ? 'Modifier l\'enregistrement' : 'Nouvel enregistrement Zakat'}
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField 
                fullWidth 
                required 
                type="number" 
                label="Année" 
                name="year" 
                value={formData.year} 
                onChange={handleChange}
                helperText="Année de distribution"
                disabled={isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              <FormControl 
                fullWidth 
                required 
                disabled={isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              >
                <InputLabel>Type</InputLabel>
                <Select 
                  name="type" 
                  value={formData.type} 
                  label="Type" 
                  onChange={handleChange}
                >
                  <MenuItem value="zakat_fitr">Zakat El Fitr</MenuItem>
                </Select>
              </FormControl>
              <TextField 
                fullWidth 
                required 
                label="Nom du bénéficiaire" 
                name="beneficiaryName" 
                value={formData.beneficiaryName} 
                onChange={handleChange}
                disabled={isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              <TextField 
                fullWidth 
                label="Téléphone du bénéficiaire" 
                name="beneficiaryPhone" 
                value={formData.beneficiaryPhone} 
                onChange={handleChange}
                disabled={isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              <TextField 
                fullWidth 
                required 
                type="number" 
                label="Montant (DZD)" 
                name="amount" 
                value={formData.amount} 
                onChange={handleChange}
                disabled={isSubmitting}
                inputProps={{
                  min: 1,
                  step: 1
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              <TextField 
                fullWidth
                type="date"
                label="Date de distribution"
                name="distributionDate"
                value={formData.distributionDate}
                onChange={handleChange}
                disabled={isSubmitting}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                disabled={isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={handleClose} 
              disabled={isSubmitting}
              startIcon={<CloseOutlined />}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                px: 3
              }}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveOutlined />}
              sx={{ 
                minWidth: '140px',
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                }
              }}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Grid>
  );
};

export default ZakatList;
