import { useState, useEffect } from 'react';
import { 
  // Layout
  Box, 
  Grid,
  Paper,
  // Form Controls
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  // Data Display
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  // Feedback
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  // Icons
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Transgender as GenderIcon,
  Home as HomeIcon,
  EventAvailable as EventAvailableIcon,
  Work as WorkIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  // Autres
  IconButton,
  Tooltip,
  styled
} from '@mui/material';

import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  SearchOutlined,
  EyeOutlined,
  CloseOutlined,
  PrinterOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  ScheduleOutlined,
  BulbOutlined,
  UserOutlined,
  FileTextOutlined
} from '@ant-design/icons';

import MainCard from 'components/MainCard';
import volunteerService from 'api/volunteerService';

// Composant pour afficher une information avec une icône
const InfoItem = ({ icon, label, value, fullWidth = false }) => (
  <Box sx={{ mb: 2, width: fullWidth ? '100%' : '48%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
      {icon}
      <Typography variant="subtitle2" sx={{ ml: 1, fontWeight: 'medium' }}>
        {label}:
      </Typography>
    </Box>
    <Typography variant="body2" sx={{ ml: 4 }}>
      {value || 'Non spécifié'}
    </Typography>
  </Box>
);

// Fonction pour formater la date
const formatDate = (dateString) => {
  if (!dateString) return 'Non spécifiée';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

// Fonction pour déterminer l'URL de l'image
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/images/volunteers/default-avatar.png';
  
  // Si c'est déjà une URL complète, la retourner telle quelle
  if (imagePath.startsWith('http') || imagePath.startsWith('blob:')) {
    return imagePath;
  }
  
  // Si c'est un chemin relatif, ajouter le préfixe du dossier des images
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // Sinon, supposer que c'est juste un nom de fichier
  return `/images/volunteers/${imagePath}`;
};

const VolunteerList = () => {
  // États pour la gestion des données
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(0);
  
  // États pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Charger les bénévoles
  const loadVolunteers = async (resetPage = false) => {
    try {
      setLoading(true);
      const response = await volunteerService.getVolunteers(
        resetPage ? 0 : page + 1, 
        rowsPerPage, 
        searchTerm
      );
      
      setVolunteers(response.data.volunteers || []);
      setTotal(response.data.total || 0);
      
      if (resetPage) {
        setPage(0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des bénévoles:', error);
      showSnackbar('Erreur lors du chargement des bénévoles', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Effet pour charger les bénévoles au montage et lors des changements de pagination/recherche
  useEffect(() => {
    loadVolunteers();
  }, [page, rowsPerPage, searchTerm]);

  // Gestion du changement de page
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

  // Fonction pour imprimer la liste des bénévoles
  const handlePrintList = () => {
    const printWindow = window.open('', '_blank');
    
    // Créer le contenu HTML pour l'impression
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Liste des Bénévoles</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; color: #1976d2; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .date { color: #666; }
          .logo { max-width: 150px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="date">${new Date().toLocaleDateString('fr-FR')}</div>
          <h1>Liste des Bénévoles</h1>
          <div class="logo">
            <!-- Ajoutez votre logo ici si nécessaire -->
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Date d'inscription</th>
            </tr>
          </thead>
          <tbody>
            ${volunteers.map(volunteer => `
              <tr>
                <td>${volunteer.firstName} ${volunteer.lastName}</td>
                <td>${volunteer.email || 'Non spécifié'}</td>
                <td>${volunteer.phone || 'Non spécifié'}</td>
                <td>${formatDate(volunteer.createdAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <script>
          // Lancer l'impression automatiquement
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.onafterprint = function() {
                setTimeout(function() {
                  window.close();
                }, 500);
              };
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    // Écrire le contenu dans la nouvelle fenêtre
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Fonction pour imprimer la fiche d'un bénévole
  const handlePrint = (volunteer) => {
    const printWindow = window.open('', '_blank');
    
    // Créer le contenu HTML pour l'impression
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fiche Bénévole - ${volunteer.firstName} ${volunteer.lastName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2 { color: #1976d2; }
          .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .date { color: #666; }
          .logo { max-width: 150px; }
          .volunteer-info { margin-top: 20px; }
          .info-grid { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px; }
          .info-item { flex: 1 1 45%; min-width: 200px; }
          .info-label { font-weight: bold; margin-bottom: 5px; }
          .photo { max-width: 200px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="date">${new Date().toLocaleDateString('fr-FR')}</div>
          <h1>Fiche Bénévole</h1>
          <div class="logo">
            <!-- Ajoutez votre logo ici si nécessaire -->
          </div>
        </div>
        
        <div class="volunteer-info">
          <h2>Informations personnelles</h2>
          
          <div style="display: flex; gap: 20px;">
            <div>
              <img 
                src="${getImageUrl(volunteer.photo)}" 
                alt="${volunteer.firstName} ${volunteer.lastName}" 
                class="photo"
                onerror="this.onerror=null; this.src='/images/volunteers/default-avatar.png'"
              />
            </div>
            
            <div style="flex: 1;">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Nom complet</div>
                  <div>${volunteer.firstName} ${volunteer.lastName}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Date de naissance</div>
                  <div>${formatDate(volunteer.birthDate)}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Email</div>
                  <div>${volunteer.email || 'Non spécifié'}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Téléphone</div>
                  <div>${volunteer.phone || 'Non spécifié'}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Adresse</div>
                  <div>${volunteer.address || 'Non spécifiée'}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Ville</div>
                  <div>${volunteer.city || 'Non spécifiée'}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Code postal</div>
                  <div>${volunteer.postalCode || 'Non spécifié'}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Pays</div>
                  <div>${volunteer.country || 'Non spécifié'}</div>
                </div>
              </div>
              
              <h3>Disponibilités</h3>
              <div>${volunteer.availability || 'Non spécifiées'}</div>
              
              <h3>Compétences</h3>
              <div>${volunteer.skills || 'Non spécifiées'}</div>
              
              <h3>Notes</h3>
              <div>${volunteer.notes || 'Aucune note'}</div>
            </div>
          </div>
        </div>

        <script>
          // Lancer l'impression automatiquement
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.onafterprint = function() {
                setTimeout(function() {
                  window.close();
                }, 500);
              };
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    // Écrire le contenu dans la nouvelle fenêtre
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <MainCard title="Liste des Bénévoles">
      {/* Barre d'outils */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          variant="outlined"
          placeholder="Rechercher un bénévole..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ width: 300 }}
        />
        
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={handlePrintList}
            sx={{ mr: 1 }}
          >
            Imprimer la liste
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {}}
          >
            Ajouter un bénévole
          </Button>
        </Box>
      </Box>

      {/* Tableau des bénévoles */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="table des bénévoles">
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Date d'inscription</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Chargement des données...
                  </TableCell>
                </TableRow>
              ) : volunteers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Aucun bénévole trouvé
                  </TableCell>
                </TableRow>
              ) : (
                volunteers.map((volunteer) => (
                  <TableRow hover key={volunteer._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          component="img"
                          src={getImageUrl(volunteer.photo)}
                          alt={volunteer.firstName}
                          sx={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', marginRight: 2 }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/volunteers/default-avatar.png';
                          }}
                        />
                        {volunteer.firstName} {volunteer.lastName}
                      </Box>
                    </TableCell>
                    <TableCell>{volunteer.email || 'Non spécifié'}</TableCell>
                    <TableCell>{volunteer.phone || 'Non spécifié'}</TableCell>
                    <TableCell>{formatDate(volunteer.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Voir la fiche">
                        <IconButton onClick={() => handlePrint(volunteer)} color="primary">
                          <FileTextOutlined />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton color="primary">
                          <EditOutlined />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton color="error">
                          <DeleteOutlined />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
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
      </Paper>

      {/* Snackbar pour les notifications */}
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
