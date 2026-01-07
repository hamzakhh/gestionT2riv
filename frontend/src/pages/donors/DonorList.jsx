import { useState, useEffect } from 'react';
import { PlusOutlined, EditOutlined, EyeOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import MainCard from 'components/MainCard';

import donorService from 'services/donorService';

const DonorList = () => {
  const navigate = useNavigate();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    type: 'individual', // 'individual' ou 'company'
    companyName: '',
    amount: '',
    notes: ''
  });

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const response = await donorService.getAll();
      // S'assurer que donors est toujours un tableau
      if (Array.isArray(response)) {
        setDonors(response);
      } else if (response && Array.isArray(response.data)) {
        setDonors(response.data);
      } else if (response && response.data && typeof response.data === 'object') {
        // Si la réponse contient des données paginées
        setDonors(response.data.docs || response.data.items || []);
      } else {
        console.error('Format de réponse inattendu:', response);
        setDonors([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des donateurs:', error);
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredDonors = Array.isArray(donors) ? donors.filter(donor => {
    if (!donor) return false;
    const fullName = `${donor.firstName || ''} ${donor.lastName || ''}`.toLowerCase();
    return (
      fullName.includes(search.toLowerCase()) ||
      (donor.email && donor.email.toLowerCase().includes(search.toLowerCase())) ||
      (donor.phone && donor.phone.includes(search))
    );
  }) : [];

  const handleOpenDialog = (donor = null) => {
    if (donor) {
      setSelectedDonor(donor);
      setFormData({
        firstName: donor.firstName || '',
        lastName: donor.lastName || '',
        email: donor.email || '',
        phone: donor.phone || '',
        address: donor.address || '',
        city: donor.city || '',
        country: donor.country || '',
        postalCode: donor.postalCode || '',
        type: donor.type || 'individual',
        companyName: donor.companyName || '',
        amount: donor.amount || '',
        notes: donor.notes || ''
      });
    } else {
      setSelectedDonor(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
        type: 'individual',
        amount: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDonor(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce donateur ?')) {
      try {
        await donorService.delete(id);
        await fetchDonors();
      } catch (error) {
        console.error('Erreur lors de la suppression du donateur:', error);
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validation pour les particuliers
    if (formData.type === 'individual') {
      if (!formData.firstName || !formData.firstName.trim()) {
        errors.firstName = 'Le prénom est requis';
      }
      if (!formData.lastName || !formData.lastName.trim()) {
        errors.lastName = 'Le nom est requis';
      }
    } 
    // Validation pour les entreprises
    else if (formData.type === 'company') {
      if (!formData.companyName || !formData.companyName.trim()) {
        errors.companyName = 'Le nom de l\'entreprise est requis';
      }
    }
    
    // Validation du téléphone (obligatoire pour tous)
    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = 'Le numéro de téléphone est requis';
    } else if (!/^[0-9+\s-]+$/.test(formData.phone)) {
      errors.phone = 'Numéro de téléphone invalide';
    }
    
    // Validation de l'email si fourni
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Adresse email invalide';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    // Valider le formulaire avant soumission
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Préparer les données à envoyer
      const donorData = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        phone: formData.phone.trim()
      };
      
      // Nettoyer les données en fonction du type de donateur
      if (donorData.type === 'individual') {
        donorData.firstName = donorData.firstName.trim();
        donorData.lastName = donorData.lastName.trim();
        delete donorData.companyName;
      } else {
        donorData.companyName = donorData.companyName.trim();
        delete donorData.firstName;
        delete donorData.lastName;
      }

      if (selectedDonor) {
        await donorService.update(selectedDonor._id, donorData);
      } else {
        await donorService.create(donorData);
      }
      handleCloseDialog();
      await fetchDonors();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du donateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <MainCard title="Gestion des Donateurs">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 300 }}>
          <SearchOutlined sx={{ mr: 1, color: 'text.secondary' }} />
          <TextField
            fullWidth
            placeholder="Rechercher un donateur..."
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearch}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'background.paper',
              }
            }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => {
            setSelectedDonor(null);
            setFormData({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              address: '',
              city: '',
              country: '',
              postalCode: '',
              type: 'individual',
              notes: ''
            });
            setOpenDialog(true);
          }}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            }
          }}
        >
          Ajouter un donateur
        </Button>
      </Box>

      <Card variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Montant</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Chargement...</TableCell>
                </TableRow>
              ) : filteredDonors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Aucun donateur trouvé</TableCell>
                </TableRow>
              ) : (
                filteredDonors.map((donor) => (
                  <TableRow key={donor._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {donor.firstName?.[0]}{donor.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{`${donor.firstName} ${donor.lastName}`}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {donor.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{donor.phone}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {donor.city}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={donor.type === 'individual' ? 'Particulier' : 'Entreprise'}
                        size="small"
                        color={donor.type === 'individual' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {donor.amount ? `${parseFloat(donor.amount).toFixed(2)} €` : '0.00 €'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(donor)}
                          color="primary"
                        >
                          <EditOutlined />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(donor._id)}
                          color="error"
                        >
                          <DeleteOutlined />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Formulaire d'ajout/édition */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          py: 2,
          px: 3
        }}>
          <Box display="flex" alignItems="center">
            {selectedDonor ? (
              <EditOutlined sx={{ mr: 1 }} />
            ) : (
              <PlusOutlined sx={{ mr: 1 }} />
            )}
            {selectedDonor ? 'Modifier le donateur' : 'Nouveau donateur'}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Informations personnelles
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Prénom"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleInputChange}
                      margin="normal"
                      required={formData.type === 'individual'}
                      variant="outlined"
                      size="small"
                      error={!!formErrors.firstName}
                      helperText={formErrors.firstName || ' '}
                      disabled={formData.type === 'company'}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nom"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleInputChange}
                      margin="normal"
                      required={formData.type === 'individual'}
                      variant="outlined"
                      size="small"
                      error={!!formErrors.lastName}
                      helperText={formErrors.lastName || ' '}
                      disabled={formData.type === 'company'}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel>Type de donateur</InputLabel>
                      <Select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        label="Type de donateur"
                      >
                        <MenuItem value="individual">Particulier</MenuItem>
                        <MenuItem value="company">Entreprise</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {formData.type === 'company' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Nom de l'entreprise"
                        name="companyName"
                        value={formData.companyName || ''}
                        onChange={handleInputChange}
                        margin="normal"
                        required={formData.type === 'company'}
                        variant="outlined"
                        size="small"
                        error={!!formErrors.companyName}
                        helperText={formErrors.companyName || ' '}
                        disabled={formData.type === 'individual'}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Coordonnées
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      size="small"
                      error={!!formErrors.email}
                      helperText={formErrors.email || ' '}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        inputMode: 'email',
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Téléphone"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      margin="normal"
                      required
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Adresse"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Code postal"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label="Ville"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Pays"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Informations complémentaires
                </Typography>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  size="small"
                />
              </Grid>
              
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={handleCloseDialog}
            color="inherit"
            sx={{ textTransform: 'none' }}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ 
              textTransform: 'none',
              '&.Mui-disabled': {
                bgcolor: 'primary.main',
                opacity: 0.6,
                color: 'white'
              }
            }}
          >
            {selectedDonor ? 'Mettre à jour' : 'Ajouter le donateur'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default DonorList;
