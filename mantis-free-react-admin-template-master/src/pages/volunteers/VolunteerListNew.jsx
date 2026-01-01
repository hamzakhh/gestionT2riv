import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import volunteerService from 'api/volunteerService';

// Fonction pour formater la date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const VolunteerList = () => {
  // États pour la gestion des données
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour la modale
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  
  // États pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Charger les bénévoles
  const loadVolunteers = async () => {
    try {
      setLoading(true);
      const data = await volunteerService.getVolunteers(
        page + 1, 
        rowsPerPage, 
        searchTerm
      );
      setVolunteers(data.docs || []);
      setTotal(data.total || 0);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des bénévoles:', err);
      setError('Impossible de charger les bénévoles. Veuillez réessayer.');
      showSnackbar('Erreur lors du chargement des bénévoles', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Effet pour charger les bénévoles au montage et lors des changements de pagination/recherche
  useEffect(() => {
    loadVolunteers();
  }, [page, rowsPerPage, searchTerm]);

  // Gestion des changements de page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Gestion du changement de nombre de lignes par page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Gestion de la recherche
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Afficher une notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Fermer la notification
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // États pour le formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'active',
    skills: [],
    address: '',
    availability: '',
    joinDate: new Date().toISOString().split('T')[0],
    photo: null
  });

  // Gérer l'ouverture/fermeture de la modale
  const handleOpenDialog = (volunteer = null) => {
    if (volunteer) {
      setEditingVolunteer(volunteer);
      setFormData({
        ...volunteer,
        photo: null // Ne pas pré-remplir la photo pour éviter les problèmes de type
      });
    } else {
      setEditingVolunteer(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        status: 'active',
        skills: [],
        address: '',
        availability: '',
        joinDate: new Date().toISOString().split('T')[0],
        photo: null
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVolunteer(null);
  };

  // Gestion des changements de formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'skills' && Array.isArray(formData[key])) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (editingVolunteer) {
        await volunteerService.updateVolunteer(editingVolunteer._id, formDataToSend);
        showSnackbar('Bénévole mis à jour avec succès', 'success');
      } else {
        await volunteerService.createVolunteer(formDataToSend);
        showSnackbar('Bénévole ajouté avec succès', 'success');
      }
      
      handleCloseDialog();
      loadVolunteers();
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      showSnackbar("Une erreur s'est produite. Veuillez réessayer.", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la suppression d'un bénévole
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bénévole ?')) {
      try {
        setLoading(true);
        await volunteerService.deleteVolunteer(id);
        showSnackbar('Bénévole supprimé avec succès', 'success');
        loadVolunteers();
      } catch (error) {
        console.error('Erreur lors de la suppression du bénévole:', error);
        showSnackbar("Une erreur s'est produite lors de la suppression.", 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Gestion du téléchargement de photo
  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        photo: file
      });
    }
  };

  return (
    <MainCard title="Gestion des Bénévoles">
      {/* Barre d'outils */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          label="Rechercher un bénévole"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlusOutlined />}
          onClick={() => handleOpenDialog()}
        >
          Ajouter un bénévole
        </Button>
      </Box>

      {/* Tableau des bénévoles */}
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Photo</TableCell>
                      <TableCell>Nom</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Téléphone</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Date d'inscription</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {volunteers.length > 0 ? (
                      volunteers.map((volunteer) => (
                        <TableRow key={volunteer._id}>
                          <TableCell>
                            <Avatar 
                              src={volunteer.photo ? `http://localhost:5000/${volunteer.photo}` : '/default-avatar.png'}
                              alt={`${volunteer.firstName} ${volunteer.lastName}`}
                            />
                          </TableCell>
                          <TableCell>{`${volunteer.firstName} ${volunteer.lastName}`}</TableCell>
                          <TableCell>{volunteer.email}</TableCell>
                          <TableCell>{volunteer.phone || '-'}</TableCell>
                          <TableCell>
                            <Box 
                              sx={{
                                display: 'inline-block',
                                p: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: volunteer.status === 'active' ? 'success.light' : 'error.light',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {volunteer.status === 'active' ? 'Actif' : 'Inactif'}
                            </Box>
                          </TableCell>
                          <TableCell>{formatDate(volunteer.joinDate)}</TableCell>
                          <TableCell>
                            <IconButton 
                              color="primary" 
                              onClick={() => handleOpenDialog(volunteer)}
                              size="large"
                            >
                              <EditOutlined />
                            </IconButton>
                            <IconButton 
                              color="error" 
                              onClick={() => handleDelete(volunteer._id)}
                              size="large"
                            >
                              <DeleteOutlined />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          Aucun bénévole trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Pagination */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Lignes par page:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
                }
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Formulaire d'ajout/édition */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingVolunteer ? 'Modifier le bénévole' : 'Ajouter un nouveau bénévole'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Statut</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Statut"
                    required
                  >
                    <MenuItem value="active">Actif</MenuItem>
                    <MenuItem value="inactive">Inactif</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adresse"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Compétences (séparées par des virgules)"
                  name="skills"
                  value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills}
                  onChange={(e) => {
                    const skillsArray = e.target.value.split(',').map(skill => skill.trim());
                    setFormData({
                      ...formData,
                      skills: skillsArray
                    });
                  }}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Disponibilité"
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date d'inscription"
                  name="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo-upload"
                  type="file"
                  onChange={handlePhotoUpload}
                />
                <label htmlFor="photo-upload">
                  <Button variant="outlined" component="span" sx={{ mt: 2 }}>
                    {formData.photo ? formData.photo.name : 'Télécharger une photo'}
                  </Button>
                </label>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="inherit">
              Annuler
            </Button>
            <Button type="submit" color="primary" variant="contained" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default VolunteerList;
