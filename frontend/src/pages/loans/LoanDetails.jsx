import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Divider,
  Chip,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AssignmentReturn as ReturnIcon,
  Edit as EditIcon,
  Event as EventIcon,
  Person as PersonIcon,
  MedicalInformation as EquipmentIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  Description as NotesIcon,
  LocalHospital as HospitalIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { format, parseISO, isBefore } from 'date-fns';
import fr from 'date-fns/locale/fr';
import MainCard from 'components/MainCard';
import loanService from 'api/loanService';
import patientService from 'api/patientService';

// Formatage de date lisible
const formatDate = (dateString, formatStr = 'PPP', options = {}) => {
  if (!dateString) return 'Non défini';
  return format(parseISO(dateString), formatStr, { locale: fr, ...options });
};

// Composant d'onglet personnalisé
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`loan-tabpanel-${index}`}
      aria-labelledby={`loan-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [isReturning, setIsReturning] = useState(false);

  // Charger les détails du prêt
  // Fonction pour charger les détails du patient
  const fetchPatientDetails = async (patientId) => {
    if (!patientId) return null;
    
    try {
      setPatientLoading(true);
      const response = await patientService.getPatientById(patientId);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors du chargement des détails du patient:', error);
      return null;
    } finally {
      setPatientLoading(false);
    }
  };

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        setLoading(true);
        const response = await loanService.getLoanDetails(id);
        console.log('Détails du prêt reçus:', response.data);
        
        // Si le patient n'est pas inclus dans la réponse, on le charge séparément
        if (response.data.patientId && !response.data.patient) {
          console.log('Chargement des détails du patient séparément...');
          const patientData = await fetchPatientDetails(response.data.patientId);
          setPatient(patientData);
        } else if (response.data.patient) {
          setPatient(response.data.patient);
        }
        
        setLoan(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des détails du prêt:', err);
        setError('Impossible de charger les détails du prêt. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [id]);

  // Gérer le changement d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Vérifier si le prêt est en retard
  const isOverdue = loan && 
    loan.status === 'active' && 
    loan.expectedReturnDate && 
    new Date(loan.expectedReturnDate) < new Date();

  // Utiliser les données du patient du prêt ou celles chargées séparément
  const currentPatient = patient || (loan?.patient || null);

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return isOverdue ? 'error' : 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Obtenir l'icône de statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return isOverdue ? <WarningIcon /> : <CheckCircleIcon />;
      case 'completed':
        return <CheckCircleIcon />;
      case 'cancelled':
        return <ErrorIcon />;
      default:
        return <InfoIcon />;
    }
  };

  // Obtenir le texte du statut
  const getStatusText = (status) => {
    if (status === 'active' && isOverdue) {
      return 'En retard';
    }
    
    const statusTexts = {
      active: 'Actif',
      completed: 'Terminé',
      cancelled: 'Annulé'
    };
    
    return statusTexts[status] || status;
  };

  // Gérer le clic sur le bouton de retour
  const handleReturnClick = () => {
    navigate(`/loans/${id}/return`);
  };

  // Gérer le clic sur le bouton d'édition
  const handleEditClick = () => {
    navigate(`/loans/${id}/edit`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ my: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/loans')}
          sx={{ mt: 2 }}
        >
          Retour à la liste des prêts
        </Button>
      </Container>
    );
  }

  if (!loan) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ my: 3 }}>
          Aucune donnée de prêt trouvée.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/loans')}
          sx={{ mt: 2 }}
        >
          Retour à la liste des prêts
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Stack spacing={3}>
        {/* En-tête avec bouton de retour et titre */}
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton onClick={() => navigate('/loans')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Détails du prêt</Typography>
          <Box flexGrow={1} />
          {loan.status === 'active' && (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ReturnIcon />}
                onClick={handleReturnClick}
                disabled={isReturning}
                sx={{ ml: 1 }}
              >
                {isReturning ? 'Traitement...' : 'Retourner'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEditClick}
                sx={{ ml: 1 }}
              >
                Modifier
              </Button>
            </>
          )}
        </Box>

        {/* Bannière d'état */}
        {isOverdue && (
          <Alert 
            severity="error" 
            icon={<WarningIcon fontSize="inherit" />}
            sx={{ mb: 3 }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
              <span>Ce prêt est en retard ! La date de retour était le {formatDate(loan.expectedReturnDate, 'PPP')}.</span>
              <Button 
                variant="contained" 
                color="error" 
                size="small"
                startIcon={<ReturnIcon />}
                onClick={handleReturnClick}
                disabled={isReturning}
              >
                {isReturning ? 'Traitement...' : 'Marquer comme retourné'}
              </Button>
            </Box>
          </Alert>
        )}

        {/* En-tête avec statut et informations principales */}
        <MainCard>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="flex-start" mb={3}>
            <Box flexGrow={1}>
              <Typography variant="h5" gutterBottom>
                Prêt #{loan._id.substring(0, 8).toUpperCase()}
              </Typography>
              <Box display="flex" alignItems="center" mb={1}>
                <Chip
                  icon={getStatusIcon(loan.status)}
                  label={getStatusText(loan.status)}
                  color={getStatusColor(loan.status)}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="textSecondary">
                  Créé le {formatDate(loan.createdAt, 'PPPpp')}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mt: { xs: 2, md: 0 } }}>
              <Button 
                variant="outlined" 
                startIcon={<EventIcon />}
                onClick={() => setTabValue(2)}
              >
                Voir le calendrier
              </Button>
            </Box>
          </Box>

          {/* Onglets */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="Détails du prêt"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Résumé" icon={<InfoIcon />} iconPosition="start" />
              <Tab label="Équipement" icon={<EquipmentIcon />} iconPosition="start" />
              <Tab label="Patient" icon={<PersonIcon />} iconPosition="start" />
              <Tab label="Historique" icon={<HistoryIcon />} iconPosition="start" />
              <Tab label="Notes" icon={<NotesIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Contenu des onglets */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Dates importantes */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ mr: 1 }} />
                      Dates importantes
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <EventIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Date de début" 
                          secondary={formatDate(loan.startDate, 'PPPP', { locale: fr })}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <TimeIcon color={isOverdue ? 'error' : 'primary'} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Retour prévu" 
                          secondary={
                            <>
                              {formatDate(loan.expectedReturnDate, 'PPPP', { locale: fr })}
                              {isOverdue && (
                                <Chip 
                                  label="En retard" 
                                  size="small" 
                                  color="error" 
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </>
                          }
                        />
                      </ListItem>
                      {loan.actualReturnDate && (
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="success" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Retour effectif" 
                            secondary={formatDate(loan.actualReturnDate, 'PPPP', { locale: fr })}
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Statut et actions */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      État du prêt
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          {getStatusIcon(loan.status)}
                        </ListItemIcon>
                        <ListItemText 
                          primary="Statut" 
                          secondary={
                            <Chip 
                              label={getStatusText(loan.status)}
                              color={getStatusColor(loan.status)}
                              size="small"
                            />
                          } 
                        />
                      </ListItem>
                      {loan.closedBy && (
                        <ListItem>
                          <ListItemIcon>
                            <PersonIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Clôturé par" 
                            secondary={loan.closedBy?.name || 'Non spécifié'}
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Onglet Équipement */}
          <TabPanel value={tabValue} index={1}>
            {loan.equipment ? (
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <EquipmentIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {loan.equipment.name}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <List>
                        <ListItem>
                          <ListItemText 
                            primary="Type" 
                            secondary={loan.equipment.type || 'Non spécifié'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Numéro de série" 
                            secondary={loan.equipment.serialNumber || 'Non spécifié'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="État initial" 
                            secondary={
                              <Chip 
                                label={loan.conditionBefore || 'Non spécifié'} 
                                size="small"
                                variant="outlined"
                              />
                            }
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    {loan.conditionAfter && (
                      <Grid item xs={12} md={6}>
                        <List>
                          <ListItem>
                            <ListItemText 
                              primary="État au retour" 
                              secondary={
                                <Chip 
                                  label={loan.conditionAfter} 
                                  size="small"
                                  variant="outlined"
                                />
                              }
                            />
                          </ListItem>
                        </List>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            ) : (
              <Alert severity="warning">Aucune information sur l'équipement disponible.</Alert>
            )}
          </TabPanel>

          {/* Onglet Patient */}
          <TabPanel value={tabValue} index={2}>
            {patientLoading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>Chargement des informations du patient...</Typography>
              </Box>
            ) : currentPatient ? (
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {currentPatient.name || `${currentPatient.firstName || ''} ${currentPatient.lastName || ''}`.trim() || 'Patient sans nom'}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <PhoneIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Téléphone" 
                            secondary={currentPatient.phone || 'Non renseigné'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <HomeIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Adresse" 
                            secondary={currentPatient.address || 'Non renseignée'}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <PersonIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Tuteur" 
                            secondary={
                              currentPatient.guardianFirstName && currentPatient.guardianLastName
                                ? `${currentPatient.guardianFirstName} ${currentPatient.guardianLastName}`
                                : 'Non renseigné'
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <HospitalIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Type de patient" 
                            secondary={currentPatient.patientType || 'Non spécifié'}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ) : (
              <Alert severity="warning">
                Aucune information sur le patient n'est disponible pour ce prêt. 
              {loan.patientId && !patientLoading && (
                  <Box mt={1}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      component={Link} 
                      to={`/patients/${loan.patientId}`}
                      startIcon={<PersonIcon />}
                    >
                      Voir les détails du patient
                    </Button>
                  </Box>
                )}
              </Alert>
            )}
          </TabPanel>

          {/* Onglet Historique */}
          <TabPanel value={tabValue} index={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Historique des modifications
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EventIcon color="action" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Prêt créé" 
                      secondary={`${formatDate(loan.createdAt, 'PPPPpp', { locale: fr })} par ${loan.createdBy?.name || 'un utilisateur'}`}
                    />
                  </ListItem>
                  
                  {loan.updatedAt && (
                    <ListItem>
                      <ListItemIcon>
                        <EditIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Dernière mise à jour" 
                        secondary={`${formatDate(loan.updatedAt, 'PPPPpp', { locale: fr })}${
                          loan.lastUpdatedBy ? ` par ${loan.lastUpdatedBy.name}` : ''
                        }`}
                      />
                    </ListItem>
                  )}
                  
                  {loan.actualReturnDate && (
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Prêt clôturé" 
                        secondary={`${formatDate(loan.actualReturnDate, 'PPPPpp', { locale: fr })}${
                          loan.closedBy ? ` par ${loan.closedBy.name}` : ''
                        }`}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Onglet Notes */}
          <TabPanel value={tabValue} index={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notes et commentaires
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {loan.notes ? (
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {loan.notes}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Aucune note n'a été ajoutée à ce prêt.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </TabPanel>
        </MainCard>
      </Stack>
    </Container>
  );
};

export default LoanDetails;
