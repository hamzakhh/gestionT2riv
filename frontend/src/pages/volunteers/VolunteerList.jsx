import { useState, useEffect } from 'react';

// Fonction pour imprimer la liste des bénévoles
const handlePrintList = () => {
  const printWindow = window.open('', '_blank');
  
  // Créer le contenu HTML pour l'impression de la liste
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Liste des Bénévoles - ${new Date().toLocaleDateString('fr-FR')}</title>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
      <style>
        @page { 
          size: A4; 
          margin: 1.5cm;
          @top-center {
            content: "Liste des Bénévoles";
            font-size: 12px;
            color: #666;
          }
        }
        
        body { 
          font-family: 'Roboto', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333;
          max-width: 1000px; 
          margin: 0 auto;
          padding: 20px;
          background: #fff;
        }
        
        .header { 
          text-align: center; 
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .logo-container {
          margin-bottom: 20px;
          text-align: center;
        }
        
        .logo {
          max-width: 200px;
          max-height: 60px;
          object-fit: contain;
        }
        
        h1 {
          color: #1976d2;
          margin: 10px 0 5px;
          font-size: 24px;
          font-weight: 600;
        }
        
        .subtitle {
          color: #666;
          margin-bottom: 20px;
          font-size: 14px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 13px;
        }
        
        th {
          background-color: #f5f5f5;
          color: #333;
          font-weight: 600;
          text-align: left;
          padding: 12px 15px;
          border-bottom: 2px solid #ddd;
        }
        
        td {
          padding: 10px 15px;
          border-bottom: 1px solid #eee;
          vertical-align: middle;
        }
        
        tr:hover {
          background-color: #f9f9f9;
        }
        
        .status {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-active {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-inactive {
          background-color: #ffebee;
          color: #c62828;
        }
        
        .footer {
          text-align: right;
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #f0f0f0;
          font-size: 12px;
          color: #999;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .no-print { 
            display: none; 
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-container">
          <img src="${window.location.origin}/src/assets/images/t2riv-logo.jpg" alt="Logo" class="logo" onerror="this.style.display='none'">
        </div>
        <h1>Liste des Bénévoles</h1>
        <div class="subtitle">Généré le ${new Date().toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Nom Complet</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Âge</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${volunteers.map(vol => `
            <tr>
              <td>${vol.firstName} ${vol.lastName}</td>
              <td>${vol.email || '-'}</td>
              <td>${vol.phone || '-'}</td>
              <td>${vol.age || '-'}</td>
              <td>
                <span class="status ${vol.status === 'Actif' ? 'status-active' : 'status-inactive'}">
                  ${vol.status || 'Inactif'}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        Total: ${volunteers.length} bénévole${volunteers.length > 1 ? 's' : ''}
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
        
        // Fermer la fenêtre si l'utilisateur annule l'impression
        window.onbeforeunload = function() {
          if (!document.hidden) {
            window.close();
          }
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
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
      <style>
        @page { 
          size: A4; 
          margin: 1.5cm;
          @top-center {
            content: "Fiche Bénévole";
            font-size: 12px;
            color: #666;
          }
        }
        
        body { 
          font-family: 'Roboto', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333;
          max-width: 1000px; 
          margin: 0 auto;
          padding: 20px;
          background: #fff;
        }
        
        .header { 
          text-align: center; 
          margin-bottom: 30px;
          padding: 20px 0;
          border-bottom: 1px solid #f0f0f0;
          position: relative;
        }
        
        .logo-container {
          margin-bottom: 20px;
          text-align: center;
        }
        
        .logo {
          max-width: 200px;
          max-height: 60px;
          object-fit: contain;
        }
        
        .header h1 {
          color: #1976d2;
          margin-bottom: 5px;
          font-size: 28px;
          font-weight: 600;
        }
        
        .header h2 {
          color: #444;
          margin: 10px 0;
          font-size: 22px;
          font-weight: 500;
        }
        
        .photo-container {
          width: 150px;
          height: 150px;
          margin: 0 auto 15px;
          position: relative;
        }
        
        .photo { 
          width: 100%; 
          height: 100%; 
          border-radius: 50%; 
          object-fit: cover; 
          display: block;
          border: 4px solid #fff;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .photo-badge {
          position: absolute;
          bottom: 5px;
          right: 5px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #1976d2;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          border: 2px solid white;
        }
        
        .status {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background-color: ${volunteer.status === 'Actif' ? '#4caf50' : '#9e9e9e'};
          color: white;
          margin-top: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .section { 
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .section h2 { 
          color: #1976d2; 
          border-bottom: 2px solid #f0f0f0; 
          padding-bottom: 8px; 
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
        }
        
        .section h2:before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 20px;
          background: #1976d2;
          margin-right: 10px;
          border-radius: 3px;
        }
        
        .info-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }
        
        .info-item {
          margin-bottom: 10px;
        }
        
        .label { 
          font-weight: 500; 
          color: #666;
          font-size: 13px;
          margin-bottom: 3px;
          display: flex;
          align-items: center;
        }
        
        .label i {
          margin-right: 8px;
          color: #1976d2;
        }
        
        .value {
          font-size: 14px;
          padding-left: 24px;
          color: #333;
        }
        
        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }
        
        .skill-tag {
          background: #f0f7ff;
          color: #1976d2;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid #d0e3ff;
        }
        
        .availability {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #1976d2;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
          font-size: 12px;
          color: #999;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .no-print { 
            display: none; 
          }
          
          .section {
            page-break-inside: avoid;
          }
          
          .header {
            margin-bottom: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-container">
          <img src="${window.location.origin}/src/assets/images/t2riv-logo.jpg" alt="Logo" class="logo" onerror="this.style.display='none'">
        </div>
        <div class="photo-container">
          <img src="${getImageUrl(volunteer.photo)}" alt="Photo" class="photo" onerror="this.onerror=null; this.src='data:image/svg+xml;charset=UTF-8,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' font-family=\'Arial\' font-size=\'14\' text-anchor=\'middle\' dominant-baseline=\'middle\' fill=\'%23999\'%3E${volunteer.firstName ? volunteer.firstName[0] + (volunteer.lastName ? volunteer.lastName[0] : '') : '?'}%3C/text%3E%3C/svg%3E'"
          <div class="photo-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
        <h1>${volunteer.firstName} ${volunteer.lastName}</h1>
        <div class="status">${volunteer.status || 'Non spécifié'}</div>
      </div>

      <div class="section">
        <h2>Informations personnelles</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="label"><i>📧</i> Email</div>
            <div class="value">${volunteer.email || 'Non renseigné'}</div>
          </div>
          
          <div class="info-item">
            <div class="label"><i>📞</i> Téléphone</div>
            <div class="value">${volunteer.phone || 'Non renseigné'}</div>
          </div>
          
          <div class="info-item">
            <div class="label"><i>🎂</i> Âge</div>
            <div class="value">${volunteer.age || 'Non renseigné'}</div>
          </div>
          
          <div class="info-item">
            <div class="label"><i>👥</i> Genre</div>
            <div class="value">${volunteer.gender || 'Non renseigné'}</div>
          </div>
          
          <div class="info-item" style="grid-column: 1 / -1;">
            <div class="label"><i>📍</i> Adresse</div>
            <div class="value">${volunteer.address || 'Non renseignée'}</div>
          </div>
          
          <div class="info-item">
            <div class="label"><i>📅</i> Date d'adhésion</div>
            <div class="value">${volunteer.joinDate ? new Date(volunteer.joinDate).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Non spécifiée'}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Disponibilités</h2>
        <div class="availability">
          ${volunteer.availability || 'Aucune disponibilité renseignée'}
        </div>
      </div>

      <div class="section">
        <h2>Compétences</h2>
        <div class="skills">
          ${Array.isArray(volunteer.skills) 
            ? volunteer.skills.map(skill => 
                `<span class="skill-tag">${skill}</span>`
              ).join('\n')
            : volunteer.skills 
              ? `<span class="skill-tag">${volunteer.skills}</span>`
              : '<span style="color: #999; font-style: italic;">Aucune compétence renseignée</span>'
          }
        </div>
      </div>

      <div class="footer no-print">
        Document généré le ${new Date().toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
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
        
        // Fermer la fenêtre si l'utilisateur annule l'impression
        window.onbeforeunload = function() {
          if (!document.hidden) {
            window.close();
          }
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

// Fonction pour déterminer l'URL de l'image
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // Si c'est une URL complète (http:// ou https://), on l'utilise telle quelle
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si c'est un chemin de fichier local, on extrait juste le nom du fichier
  const fileName = imagePath.split(/[\\/]/).pop();
  
  // Vérifier si le fichier existe dans le dossier public/images/volunteers/
  // Si oui, on utilise ce chemin, sinon on essaie avec le chemin complet
  return `/images/volunteers/${fileName}`;
};
import { 
  // Layout
  Box, 
  Grid,
  Paper,
  Card,
  CardContent,
  
  // Navigation
  Button, 
  IconButton,
  Fab,
  
  // Data Display
  Avatar,
  Chip,
  Typography,
  
  // Feedback
  Alert,
  CircularProgress,
  Snackbar,
  
  // Form
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  
  // Table
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  
  // Dialog
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  
  // Tooltip
  Tooltip
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
  CalendarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  ScheduleOutlined,
  BulbOutlined,
  UserOutlined,
  FileTextOutlined,
  HeartOutlined,
  TrophyOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import MainCard from 'components/MainCard';
import volunteerService from 'api/volunteerService';

// Composant pour afficher un élément d'information avec icône
const InfoItem = ({ icon, label, value, fullWidth = false }) => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: fullWidth ? 'row' : 'column',
    alignItems: fullWidth ? 'center' : 'flex-start',
    mb: 1,
    width: '100%'
  }}>
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      mb: fullWidth ? 0 : 0.5,
      mr: fullWidth ? 1 : 0
    }}>
      {icon}
      <Typography variant="subtitle2" color="textSecondary" sx={{ ml: 0.5 }}>
        {label}:
      </Typography>
    </Box>
    <Typography variant="body1" sx={{ 
      fontWeight: 500,
      ml: fullWidth ? 0 : '24px',
      wordBreak: 'break-word'
    }}>
      {value || 'Non renseigné'}
    </Typography>
  </Box>
);

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
  const [open, setOpen] = useState(false);
  const [currentVolunteer, setCurrentVolunteer] = useState(null);
  
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
      console.log('=== DEBUT CHARGEMENT BENEVOLES ===');
      console.log('Paramètres de chargement:', { 
        page, 
        rowsPerPage, 
        searchTerm,
        resetPage 
      });
      
      // Si on doit réinitialiser la page, on revient à la première page
      const currentPage = resetPage ? 0 : page;
      
      console.log('Appel de volunteerService.getVolunteers avec:', {
        page: currentPage + 1,
        limit: rowsPerPage,
        search: searchTerm
      });
      
      const response = await volunteerService.getVolunteers(
        currentPage + 1, 
        rowsPerPage, 
        searchTerm
      );
      
      console.log('=== REPONSE DE L\'API ===');
      console.log('Structure complète de la réponse:', JSON.parse(JSON.stringify(response)));
      
      // Gestion de la structure de réponse
      let volunteersList = [];
      let totalVolunteers = 0;
      
      // Vérifier différentes structures de réponse possibles
      if (Array.isArray(response)) {
        // Si la réponse est directement un tableau
        console.log('La réponse est un tableau direct');
        volunteersList = response;
        totalVolunteers = response.length;
      } else if (response && response.docs) {
        // Structure avec pagination (mongoose-paginate-v2)
        console.log('Structure avec pagination (docs) détectée');
        volunteersList = response.docs;
        totalVolunteers = response.total || 0;
      } else if (response && response.data) {
        // Structure avec data enveloppée
        console.log('Structure avec data enveloppée détectée');
        if (Array.isArray(response.data)) {
          volunteersList = response.data;
          totalVolunteers = response.data.length;
        } else if (response.data.docs) {
          volunteersList = response.data.docs;
          totalVolunteers = response.data.total || 0;
        }
      } else {
        console.warn('Format de réponse inattendu, tentative de récupération directe');
        volunteersList = response || [];
        totalVolunteers = Array.isArray(response) ? response.length : 0;
      }
      
      console.log('=== DONNEES EXTRACTION ===');
      console.log('Liste des bénévoles extraite:', volunteersList);
      console.log('Total des bénévoles extrait:', totalVolunteers);
      
      // S'assurer que volunteersList est un tableau
      if (!Array.isArray(volunteersList)) {
        console.error('La liste des bénévoles n\'est pas un tableau:', volunteersList);
        volunteersList = [];
      }
      
      setVolunteers(volunteersList);
      setTotal(Number(totalVolunteers) || 0);
      setPage(currentPage);
      
      console.log('=== ETATS MIS A JOUR ===');
      console.log('Nombre de bénévoles dans l\'état:', volunteersList.length);
      console.log('Total dans l\'état:', totalVolunteers);
      console.log('Page actuelle:', currentPage);
      
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des bénévoles:', err);
      const errorMessage = err.response?.data?.message || 'Impossible de charger les bénévoles. Veuillez réessayer.';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
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

  // États pour les modales
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    status: 'active',
    skills: [],
    address: '',
    availability: '',
    joinDate: new Date().toISOString().split('T')[0],
    photo: null
  });

  // Gérer l'ouverture de la modale de détails
  const handleViewDetails = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setOpenDetailDialog(true);
  };

  // Gérer la fermeture de la modale de détails
  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedVolunteer(null);
  };

  // Gérer la fermeture de la modale d'édition
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVolunteer(null);
  };

  // Gérer l'ouverture de la modale d'édition
  const handleOpenDialog = (volunteer = null) => {
    if (volunteer) {
      setEditingVolunteer(volunteer);
      setFormData({
        firstName: volunteer.firstName || '',
        lastName: volunteer.lastName || '',
        email: volunteer.email || '',
        phone: volunteer.phone || '',
        age: volunteer.age || '',
        gender: volunteer.gender || '',
        status: volunteer.status || 'active',
        skills: volunteer.skills || [],
        address: volunteer.address || '',
        availability: volunteer.availability || '',
        joinDate: volunteer.joinDate ? new Date(volunteer.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        photo: null
      });
    } else {
      setEditingVolunteer(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        age: '',
        gender: '',
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

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate age
    const age = parseInt(formData.age, 10);
    if (isNaN(age) || age < 16 || age > 100) {
      showSnackbar('L\'âge doit être compris entre 16 et 100 ans', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      
      // Ajouter tous les champs requis
      const requiredFields = ['firstName', 'lastName', 'age', 'gender', 'phone', 'email'];
      const missingFields = [];
      
      requiredFields.forEach(field => {
        if (!formData[field]) {
          missingFields.push(field);
        }
      });
      
      if (missingFields.length > 0) {
        showSnackbar(`Champs obligatoires manquants: ${missingFields.join(', ')}`, 'error');
        return;
      }
      
      // Ajouter tous les champs au FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === 'skills' && Array.isArray(formData[key])) {
            formDataToSend.append(key, JSON.stringify(formData[key]));
          } else if (key === 'photo' && formData.photo instanceof File) {
            formDataToSend.append('photo', formData.photo);
          } else if (key !== 'photo') {
            formDataToSend.append(key, formData[key]);
          }
        }
      });
      
      if (editingVolunteer && editingVolunteer._id) {
        // Mise à jour d'un bénévole existant
        await volunteerService.updateVolunteer(editingVolunteer._id, formDataToSend);
        showSnackbar('Bénévole mis à jour avec succès', 'success');
        handleCloseDialog();
        // On recharge les données sans réinitialiser la page
        await loadVolunteers(false);
      } else {
        // Création d'un nouveau bénévole
        await volunteerService.createVolunteer(formDataToSend);
        showSnackbar('Bénévole ajouté avec succès', 'success');
        handleCloseDialog();
        // On recharge les données en réinitialisant à la première page
        await loadVolunteers(true);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = "Une erreur s'est produite. Veuillez réessayer.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
      }
      
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'photo' && files && files[0]) {
      // Vérifier la taille du fichier (max 2MB)
      if (files[0].size > 2 * 1024 * 1024) {
        showSnackbar('La photo ne doit pas dépasser 2 Mo', 'error');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Afficher le nom du fichier téléchargé
  const getFileName = () => {
    if (formData.photo instanceof File) {
      return formData.photo.name;
    }
    return 'Aucun fichier sélectionné';
  };

  const handleEdit = (volunteer) => {
    setEditingVolunteer(volunteer);
    setFormData({
      firstName: volunteer.firstName || '',
      lastName: volunteer.lastName || '',
      email: volunteer.email || '',
      phone: volunteer.phone || '',
      age: volunteer.age || '',
      gender: volunteer.gender || '',
      status: volunteer.status || 'active',
      skills: volunteer.skills || [],
      address: volunteer.address || '',
      availability: volunteer.availability || '',
      joinDate: volunteer.joinDate ? new Date(volunteer.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      photo: null
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bénévole ?')) {
      try {
        setLoading(true);
        await volunteerService.deleteVolunteer(id);
        showSnackbar('Bénévole supprimé avec succès', 'success');
        
        // Vérifier si nous devons revenir à la page précédente
        // si nous venons de supprimer le dernier élément de la page
        const shouldGoToPrevPage = volunteers.length === 1 && page > 0;
        
        if (shouldGoToPrevPage) {
          setPage(prevPage => prevPage - 1);
        }
        
        // Recharger les données
        await loadVolunteers(shouldGoToPrevPage);
      } catch (error) {
        console.error('Erreur lors de la suppression du bénévole:', error);
        const errorMessage = error.response?.data?.message || "Une erreur s'est produite lors de la suppression.";
        showSnackbar(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddNew = () => {
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
    setEditingVolunteer(null);
    setOpenDialog(true);
  };

  const handlePrintList = () => {
    const printWindow = window.open('', '_blank');
    
    // Créer le contenu HTML pour l'impression
    let printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Liste des Bénévoles - ${new Date().toLocaleDateString('fr-FR')}</title>
        <style>
          @page { 
            size: A4; 
            margin: 1.5cm;
            @top-center {
              content: "Liste des Bénévoles";
              font-size: 12px;
              color: #666;
            }
          }
          
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
            max-width: 1000px; 
            margin: 0 auto;
            padding: 20px;
            font-size: 12px;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          }
          
          .header h1 {
            margin: 0;
            color: #1976d2;
          }
          
          .print-date {
            color: #666;
            margin-top: 5px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .footer {
            margin-top: 30px;
            text-align: right;
            font-size: 11px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
          
          @media print {
            .no-print {
              display: none !important;
            }
            
            body {
              padding: 0;
            }
            
            @page {
              margin: 2cm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Liste des Bénévoles</h1>
          <div class="print-date">Généré le: ${new Date().toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Nom Complet</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>Date d'adhésion</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>`;
    
    // Ajouter les lignes du tableau pour chaque bénévole
    volunteers.forEach((volunteer, index) => {
      printContent += `
            <tr>
              <td>${index + 1}</td>
              <td>${volunteer.firstName} ${volunteer.lastName}</td>
              <td>${volunteer.phone || '-'}</td>
              <td>${volunteer.email || '-'}</td>
              <td>${volunteer.joinDate ? new Date(volunteer.joinDate).toLocaleDateString('fr-FR') : '-'}</td>
              <td>${volunteer.status || 'Actif'}</td>
            </tr>`;
    });
    
    // Fermer les balises HTML
    printContent += `
          </tbody>
        </table>
        
        <div class="footer">
          <p>Total: ${volunteers.length} bénévole(s)</p>
        </div>
        
        <script>
          // Imprimer automatiquement
          window.onload = function() {
            setTimeout(function() {
              window.print();
              // window.close(); // Optionnel: fermer la fenêtre après impression
            }, 200);
          };
        </script>
      </body>
      </html>`;
    
    // Écrire le contenu dans la fenêtre d'impression
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <MainCard title="Gestion des Bénévoles">
      <Grid container alignItems="center" justifyContent="space-between" mb={2}>
        <Grid item>
          <Typography variant="h3">Liste des Jeunes Bénévoles</Typography>
        </Grid>
        <Grid item>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<PrinterOutlined />}
            onClick={handlePrintList}
            sx={{ mr: 1 }}
          >
            Imprimer la liste
          </Button>
        </Grid>
      </Grid>

      {/* Modern Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Rechercher un bénévole par nom, email ou téléphone..."
          value={searchTerm}
          onChange={handleSearch}
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
      ) : volunteers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Aucun bénévole enregistré
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Aucun bénévole n'a été trouvé dans la base de données.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleAddNew}
            startIcon={<PlusOutlined />}
            sx={{ borderRadius: 2 }}
          >
            Ajouter le premier bénévole
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {volunteers.map((volunteer) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={volunteer._id}>
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
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                  },
                  position: 'relative',
                  overflow: 'hidden',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: volunteer.status === 'Actif' ? 'linear-gradient(90deg, #4caf50, #66bb6a)' : 'linear-gradient(90deg, #9e9e9e, #bdbdbd)',
                  }
                }}
              >
                <CardContent sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                  {/* Header with Avatar and Status */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={getImageUrl(volunteer.photo)}
                      sx={{
                        width: 56,
                        height: 56,
                        mr: 2,
                        bgcolor: volunteer.status === 'Actif' ? 'success.main' : 'grey.400',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}
                      onError={(e) => {
                        e.target.src = '';
                      }}
                    >
                      {volunteer.firstName?.[0]}{volunteer.lastName?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Chip
                        label={volunteer.status === 'Actif' ? 'Actif' : 'Inactif'}
                        size="small"
                        color={volunteer.status === 'Actif' ? 'success' : 'default'}
                        sx={{ mb: 1, fontWeight: 500 }}
                      />
                    </Box>
                  </Box>

                  {/* Volunteer Info */}
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    {volunteer.firstName} {volunteer.lastName}
                  </Typography>

                  {/* Age and Gender */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <UserOutlined style={{ fontSize: '16px', marginRight: 8, color: '#666' }} />
                    <Typography variant="body2" color="text.secondary">
                      {volunteer.age} ans • {volunteer.gender}
                    </Typography>
                  </Box>

                  {/* Phone */}
                  {volunteer.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PhoneOutlined style={{ fontSize: '16px', marginRight: 8, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        {volunteer.phone}
                      </Typography>
                    </Box>
                  )}

                  {/* Email */}
                  {volunteer.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <MailOutlined style={{ fontSize: '16px', marginRight: 8, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {volunteer.email}
                      </Typography>
                    </Box>
                  )}

                  {/* Join Date */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarOutlined style={{ fontSize: '16px', marginRight: 8, color: '#666' }} />
                    <Typography variant="body2" color="text.secondary">
                      Membre depuis {volunteer.joinDate ? new Date(volunteer.joinDate).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short'
                      }) : 'N/A'}
                    </Typography>
                  </Box>

                  {/* Skills Preview */}
                  {volunteer.skills && volunteer.skills.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <BulbOutlined style={{ fontSize: '16px', marginRight: 8, color: '#666' }} />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {(Array.isArray(volunteer.skills) ? volunteer.skills : [volunteer.skills])
                          .slice(0, 2)
                          .map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: '0.7rem',
                                height: '20px',
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          ))}
                        {(Array.isArray(volunteer.skills) ? volunteer.skills : [volunteer.skills]).length > 2 && (
                          <Chip
                            label={`+${(Array.isArray(volunteer.skills) ? volunteer.skills : [volunteer.skills]).length - 2}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '0.7rem',
                              height: '20px',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 'auto', pt: 2 }}>
                    <Tooltip title="Voir les détails">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(volunteer)}
                        sx={{
                          bgcolor: 'info.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'info.dark' },
                          width: 40,
                          height: 40
                        }}
                      >
                        <EyeOutlined style={{ fontSize: '16px' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(volunteer)}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' },
                          width: 40,
                          height: 40
                        }}
                      >
                        <EditOutlined style={{ fontSize: '16px' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(volunteer._id)}
                        sx={{
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' },
                          width: 40,
                          height: 40
                        }}
                      >
                        <DeleteOutlined style={{ fontSize: '16px' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Statistics Cards - Enhanced */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <TeamOutlined style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.8 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {volunteers.length}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Total des Bénévoles
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 25px rgba(245, 87, 108, 0.3)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <HeartOutlined style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.8 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {volunteers.filter(v => v.age >= 18 && v.age <= 25).length}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Jeunes (18-25 ans)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 25px rgba(79, 172, 254, 0.3)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <TrophyOutlined style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.8 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {volunteers.filter(v => {
                  const joinDate = new Date(v.joinDate);
                  const now = new Date();
                  return (
                    joinDate.getMonth() === now.getMonth() &&
                    joinDate.getFullYear() === now.getFullYear()
                  );
                }).length}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Nouveaux ce mois-ci
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pagination - Only show if we have volunteers */}
      {volunteers.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Lignes par page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`}
          />
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddNew}
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

      {/* Add/Edit Volunteer Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
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
              {editingVolunteer ? <EditOutlined sx={{ mr: 1.5 }} /> : <PlusOutlined sx={{ mr: 1.5 }} />}
              {editingVolunteer ? 'Modifier le bénévole' : 'Nouveau bénévole'}
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Âge"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  inputProps={{
                    min: 16,
                    max: 100
                  }}
                  helperText="L'âge doit être compris entre 16 et 100 ans"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}>
                  <InputLabel>Genre</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    label="Genre"
                  >
                    <MenuItem value="Masculin">Masculin</MenuItem>
                    <MenuItem value="Féminin">Féminin</MenuItem>
                    <MenuItem value="Autre">Autre</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
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
                  multiline
                  rows={2}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Compétences"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  margin="normal"
                  placeholder="Séparez les compétences par des virgules"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Disponibilité"
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  margin="normal"
                  placeholder="Jours/Heures de disponibilité"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date d'adhésion"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              
              {/* Champ de téléchargement de photo */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Photo du bénévole
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo-upload"
                  type="file"
                  name="photo"
                  onChange={handleInputChange}
                />
                <label htmlFor="photo-upload">
                  <Button variant="outlined" component="span" fullWidth sx={{ borderRadius: 2 }}>
                    {formData.photo ? 'Changer la photo' : 'Télécharger une photo'}
                  </Button>
                </label>
                {formData.photo && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Fichier sélectionné : {getFileName()}
                  </Typography>
                )}
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                  Taille maximale : 2MB. Formats acceptés : JPG, PNG, GIF
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={handleCloseDialog} 
              disabled={loading}
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
              color="primary" 
              variant="contained" 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlusOutlined />}
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
              {loading ? 'Enregistrement...' : editingVolunteer ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modale de détails du bénévole - Design moderne */}
      <Dialog 
        open={openDetailDialog} 
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
          color: 'white',
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              Fiche du Bénévole
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
              Détails et informations personnelles
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Imprimer la fiche">
              <IconButton 
                onClick={() => handlePrint(selectedVolunteer)} 
                sx={{ 
                  color: 'white',
                  mr: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)'
                  }
                }}
              >
                <PrinterOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="Fermer">
              <IconButton 
                onClick={handleCloseDetailDialog}
                sx={{ 
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)'
                  }
                }}
              >
                <CloseOutlined />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, '&.MuiDialogContent-root': { p: 0 } }}>
          {selectedVolunteer && (
            <Grid container spacing={0}>
              {/* Colonne de gauche - Photo et informations principales */}
              <Grid item xs={12} md={4} sx={{
                background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRight: '1px solid rgba(0,0,0,0.05)'
              }}>
                <Box 
                  sx={{
                    width: 180,
                    height: 180,
                    mb: 3,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '4px solid white',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    position: 'relative',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: '50%',
                      border: '2px solid rgba(25, 118, 210, 0.2)'
                    }
                  }}
                >
                  <img 
                    src={getImageUrl(selectedVolunteer.photo)}
                    alt={`${selectedVolunteer.firstName} ${selectedVolunteer.lastName}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                    onError={(e) => {
                      console.error('Erreur de chargement de l\'image:', e.target.src);
                      e.target.onerror = null;
                      if (selectedVolunteer.photo && !selectedVolunteer.photo.startsWith('http')) {
                        const fullPath = selectedVolunteer.photo.replace(/^.*[\\/]/, '');
                        e.target.src = `http://localhost:5000/uploads/volunteers/${fullPath}`;
                      } else {
                        e.target.src = '';
                      }
                    }}
                  />
                </Box>
                
                <Typography 
                  variant="h5" 
                  align="center" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 1,
                    background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textFillColor: 'transparent'
                  }}
                >
                  {`${selectedVolunteer.firstName} ${selectedVolunteer.lastName}`}
                </Typography>
                
                <Chip 
                  label={selectedVolunteer.status || 'Non spécifié'} 
                  color={selectedVolunteer.status === 'Actif' ? 'success' : 'default'}
                  size="medium"
                  sx={{ 
                    mb: 2,
                    fontWeight: 600,
                    px: 1,
                    height: 'auto',
                    '& .MuiChip-label': {
                      py: 0.5
                    }
                  }}
                />
                
                <Box sx={{ 
                  width: '100%',
                  mt: 'auto',
                  pt: 2,
                  borderTop: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FileTextOutlined style={{ marginRight: 8, fontSize: '1rem' }} />
                    Membre depuis: {selectedVolunteer.joinDate ? new Date(selectedVolunteer.joinDate).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Non spécifiée'}
                  </Typography>
                </Box>
              </Grid>

              {/* Colonne de droite - Détails */}
              <Grid item xs={12} md={8} sx={{ p: 4 }}>
                {/* Carte Informations Personnelles */}
                <Card 
                  variant="outlined" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.03)'
                  }}
                >
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      pb: 1,
                      borderBottom: '1px solid rgba(0,0,0,0.05)'
                    }}>
                      <UserOutlined style={{ color: '#1976d2', marginRight: 8, fontSize: '1.5rem' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Informations Personnelles</Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <InfoItem 
                          icon={<MailOutlined style={{ color: '#757575' }} />} 
                          label="Email" 
                          value={selectedVolunteer.email} 
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <InfoItem 
                          icon={<PhoneOutlined color="action" />} 
                          label="Téléphone" 
                          value={selectedVolunteer.phone} 
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <InfoItem 
icon={<CalendarOutlined style={{ color: '#757575' }} />} 
                          label="Âge" 
                          value={selectedVolunteer.age} 
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <InfoItem 
                          icon={<TeamOutlined style={{ color: '#757575' }} />} 
                          label="Genre" 
                          value={selectedVolunteer.gender} 
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <InfoItem 
                          icon={<EnvironmentOutlined style={{ color: '#757575' }} />} 
                          label="Adresse" 
                          value={selectedVolunteer.address} 
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                {/* Carte Disponibilités */}
                <Card 
                  variant="outlined" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.03)'
                  }}
                >
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      pb: 1,
                      borderBottom: '1px solid rgba(0,0,0,0.05)'
                    }}>
                      <ScheduleOutlined style={{ color: '#1976d2', marginRight: 8, fontSize: '1.5rem' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Disponibilités</Typography>
                    </Box>
                    
                    {selectedVolunteer.availability ? (
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: 'rgba(25, 118, 210, 0.05)', 
                        borderRadius: 1,
                        borderLeft: '3px solid #1976d2'
                      }}>
                        <Typography>{selectedVolunteer.availability}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        Aucune disponibilité renseignée
                      </Typography>
                    )}
                  </CardContent>
                </Card>
                
                {/* Carte Compétences */}
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.03)'
                  }}
                >
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      pb: 1,
                      borderBottom: '1px solid rgba(0,0,0,0.05)'
                    }}>
                      <BulbOutlined style={{ color: '#1976d2', marginRight: 8, fontSize: '1.5rem' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Compétences</Typography>
                    </Box>
                    
                    {selectedVolunteer.skills && selectedVolunteer.skills.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {Array.isArray(selectedVolunteer.skills) 
                          ? selectedVolunteer.skills.map((skill, index) => (
                              <Chip 
                                key={index} 
                                label={skill} 
                                size="small" 
                                sx={{
                                  background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
                                  color: '#2c3e50',
                                  fontWeight: 500,
                                  '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                  },
                                  transition: 'all 0.2s ease-in-out'
                                }}
                              />
                            ))
                          : <Chip 
                              label={selectedVolunteer.skills} 
                              size="small" 
                              sx={{
                                background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
                                color: '#2c3e50',
                                fontWeight: 500
                              }}
                            />
                        }
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        Aucune compétence renseignée
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            variant="contained" 
            onClick={handleCloseDetailDialog}
            color="primary"
            startIcon={<CloseOutlined />}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default VolunteerList;
