import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Stack,
  InputAdornment,
  IconButton,
  Tooltip,
  Autocomplete,
  Chip,
  Avatar,
  Fade,
  Zoom,
  alpha
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  Event as EventIcon,
  Person as PersonIcon,
  MedicalInformation as EquipmentIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays } from 'date-fns';
import fr from 'date-fns/locale/fr';
import MainCard from 'components/MainCard';
import loanService from 'api/loanService';
import equipmentService from 'api/equipmentService';
import patientService from 'api/patientService';

// Schéma de validation avec Yup
const validationSchema = Yup.object({
  equipmentId: Yup.string().required('L\'équipement est requis'),
  patientId: Yup.string().required('Le patient est requis'),
  startDate: Yup.date().required('La date de début est requise'),
  expectedReturnDate: Yup.date()
    .nullable()
    .optional()
    .min(Yup.ref('startDate'), 'La date de retour doit être postérieure à la date de début'),
  notes: Yup.string()
});

const LoanForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [patients, setPatients] = useState([]);
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);

  // Charger les équipements disponibles et les patients
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Récupérer uniquement les équipements disponibles (jusqu'à 50,000)
        const equipmentResult = await equipmentService.getAvailableEquipment(50000);
        
        if (equipmentResult.success) {
          // Si la réponse contient des données, les utiliser
          const equipmentData = equipmentResult.data || [];
          setAvailableEquipment(equipmentData);
          setFilteredEquipment(equipmentData || []);
          
          if (equipmentData.length === 0) {
            console.warn('Aucun équipement disponible trouvé.');
          } else {
            console.log(`Équipements disponibles chargés: ${equipmentData.length}`);
          }
        } else {
          // Si erreur, afficher le message d'erreur
          console.error('Erreur lors du chargement des équipements disponibles:', equipmentResult.error);
          setError(equipmentResult.error || 'Erreur lors du chargement des équipements disponibles');
          return;
        }

        // Récupérer la liste des patients (jusqu'à 50,000)
        console.log('Chargement des patients...');
        const patientsResponse = await patientService.getPatients(1, 50000, '');
        console.log('Réponse des patients:', patientsResponse);
        
        // Gérer la structure de la réponse
        let patientsList = [];
        if (patientsResponse && patientsResponse.docs) {
          patientsList = patientsResponse.docs; // Format avec pagination
        } else if (Array.isArray(patientsResponse)) {
          patientsList = patientsResponse; // Format tableau simple
        } else if (patientsResponse && patientsResponse.data) {
          patientsList = patientsResponse.data; // Format avec propriété data
        }
        
        console.log('Liste des patients chargée:', patientsList);
        setPatients(patientsList || []);
        setFilteredPatients(patientsList || []);
        
        if (patientsList.length === 0) {
          console.warn('Aucun patient trouvé.');
        } else {
          console.log(`Patients chargés: ${patientsList.length}`);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Effet pour filtrer les équipements en fonction de la recherche
  useEffect(() => {
    if (!equipmentSearch.trim()) {
      setFilteredEquipment(availableEquipment);
    } else {
      const searchLower = equipmentSearch.toLowerCase();
      const filtered = availableEquipment.filter(equipment => 
        equipment.name?.toLowerCase().includes(searchLower) ||
        equipment.type?.toLowerCase().includes(searchLower) ||
        equipment.serialNumber?.toLowerCase().includes(searchLower) ||
        equipment.category?.toLowerCase().includes(searchLower)
      );
      setFilteredEquipment(filtered);
    }
  }, [equipmentSearch, availableEquipment]);

  // Effet pour filtrer les patients en fonction de la recherche
  useEffect(() => {
    if (!patientSearch.trim()) {
      setFilteredPatients(patients);
    } else {
      const searchLower = patientSearch.toLowerCase();
      const filtered = patients.filter(patient => 
        patient.firstName?.toLowerCase().includes(searchLower) ||
        patient.lastName?.toLowerCase().includes(searchLower) ||
        patient.phone?.includes(patientSearch) ||
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower)
      );
      setFilteredPatients(filtered);
    }
  }, [patientSearch, patients]);

  // Initialisation du formulaire avec Formik
  const formik = useFormik({
    initialValues: {
      equipmentId: '',
      patientId: '',
      startDate: new Date(),
      expectedReturnDate: null, // Rend la date de retour optionnelle
      notes: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        setError('');
        
        // Formater les dates pour l'API
        const loanData = {
          ...values,
          startDate: values.startDate.toISOString(),
          expectedReturnDate: values.expectedReturnDate ? values.expectedReturnDate.toISOString() : null
        };

        console.log('Submitting loan data:', loanData);

        // Appeler le service pour créer le prêt
        const response = await loanService.createLoan(loanData);
        
        console.log('Loan creation response:', response);
        
        // Rediriger vers la page de détail du prêt
        navigate(`/loans/${response.data._id}`, { 
          state: { success: 'Prêt créé avec succès' } 
        });
      } catch (err) {
        console.error('Erreur lors de la création du prêt:', err);
        console.error('Error response:', err.response?.data);
        setError(err.response?.data?.message || 'Une erreur est survenue lors de la création du prêt');
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Mettre à jour la date de retour minimale lorsque la date de début change
  useEffect(() => {
    // Ne plus définir automatiquement la date de retour
    // Laisser l'utilisateur décider s'il veut spécifier une date
  }, [formik.values.startDate]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in timeout={800}>
        <Stack spacing={4}>
          {/* Header Section */}
          <Box 
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              p: 4,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="7"/%3E%3Ccircle cx="53" cy="7" r="7"/%3E%3Ccircle cx="30" cy="30" r="7"/%3E%3Ccircle cx="7" cy="53" r="7"/%3E%3Ccircle cx="53" cy="53" r="7"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                opacity: 0.3
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <IconButton 
                  onClick={() => navigate(-1)} 
                  sx={{ 
                    mr: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)'
                    }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mr: 2 }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Nouveau prêt d'équipement
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Enregistrez un nouveau prêt de matériel médical
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {error && (
            <Zoom in timeout={400}>
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.15)'
                }}
              >
                {error}
              </Alert>
            </Zoom>
          )}

        <MainCard sx={{ borderRadius: 3, overflow: 'visible' }}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={4}>
              {/* Section Équipement */}
              <Grid item xs={12}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                    border: '1px solid rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <EquipmentIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="medium">
                      Détails de l'équipement
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} lg={8} sx={{ mx: 'auto' }}>
                      <Autocomplete
                        fullWidth
                        options={filteredEquipment}
                        getOptionLabel={(option) => `${option.name} - ${option.serialNumber} (${option.type})`}
                        value={filteredEquipment.find(eq => eq._id === formik.values.equipmentId) || null}
                        onChange={(event, newValue) => {
                          formik.setFieldValue('equipmentId', newValue?._id || '');
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Rechercher un équipement..."
                            variant="outlined"
                            size="large"
                            onChange={(e) => setEquipmentSearch(e.target.value)}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                  </InputAdornment>
                                  {params.InputProps.startAdornment}
                                </>
                              ),
                              sx: {
                                borderRadius: 2,
                                fontSize: '1rem',
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  transition: 'all 0.3s ease',
                                  minHeight: '56px',
                                  '&:hover': {
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                  },
                                  '&.Mui-focused': {
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                                  }
                                },
                                '& .MuiInputLabel-root': {
                                  fontSize: '1rem'
                                }
                              }
                            }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box component="li" {...props} sx={{ py: 2, px: 2 }}>
                            <Box sx={{ width: '100%' }}>
                              <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
                                {option.name} - {option.serialNumber}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
                                <Chip 
                                  label={option.type} 
                                  size="small" 
                                  variant="outlined" 
                                  sx={{ fontSize: '0.75rem', height: 24, fontWeight: 'medium' }}
                                />
                                <Chip 
                                  label={option.category} 
                                  size="small" 
                                  color="secondary" 
                                  sx={{ fontSize: '0.75rem', height: 24, fontWeight: 'medium' }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        )}
                        ListboxProps={{
                          sx: {
                            '& .MuiAutocomplete-option': {
                              py: 1.5
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      {formik.values.equipmentId && (
                        <Zoom in timeout={400}>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 3, 
                              borderRadius: 2,
                              bgcolor: 'success.lightest',
                              border: '1px solid rgba(76, 175, 80, 0.2)',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                              <Typography variant="subtitle2" fontWeight="medium" color="success.dark">
                                Équipement sélectionné
                              </Typography>
                            </Box>
                            {availableEquipment
                              .filter(eq => eq._id === formik.values.equipmentId)
                              .map(equipment => (
                                <Grid container spacing={2} key={equipment._id}>
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                      Type
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                      {equipment.type}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                      Numéro de série
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                      {equipment.serialNumber}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                      État
                                    </Typography>
                                    <Chip 
                                      label={equipment.condition} 
                                      size="small" 
                                      color={equipment.condition === 'Excellent' ? 'success' : equipment.condition === 'Bon' ? 'info' : 'warning'}
                                      sx={{ fontWeight: 'medium' }}
                                    />
                                  </Grid>
                                </Grid>
                              ))
                            }
                          </Paper>
                        </Zoom>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Section Patient */}
              <Grid item xs={12}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                    border: '1px solid rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="medium">
                      Informations du patient
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} lg={8} sx={{ mx: 'auto' }}>
                      <Autocomplete
                        fullWidth
                        options={filteredPatients}
                        getOptionLabel={(option) => `${option.firstName} ${option.lastName}${option.phone ? ` - ${option.phone}` : ''}`}
                        value={filteredPatients.find(p => p._id === formik.values.patientId) || null}
                        onChange={(event, newValue) => {
                          formik.setFieldValue('patientId', newValue?._id || '');
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Rechercher un patient..."
                            variant="outlined"
                            size="large"
                            onChange={(e) => setPatientSearch(e.target.value)}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  <InputAdornment position="start">
                                    <PersonIcon color="action" />
                                  </InputAdornment>
                                  {params.InputProps.startAdornment}
                                </>
                              ),
                              sx: {
                                borderRadius: 2,
                                fontSize: '1rem',
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  transition: 'all 0.3s ease',
                                  minHeight: '56px',
                                  '&:hover': {
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                  },
                                  '&.Mui-focused': {
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                                  }
                                },
                                '& .MuiInputLabel-root': {
                                  fontSize: '1rem'
                                }
                              }
                            }}
                            error={formik.touched.patientId && Boolean(formik.errors.patientId)}
                            helperText={formik.touched.patientId && formik.errors.patientId}
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box component="li" {...props} sx={{ py: 2, px: 2 }}>
                            <Box sx={{ width: '100%' }}>
                              <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
                                {option.firstName} {option.lastName}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
                                {option.phone && (
                                  <Chip 
                                    icon={<span style={{ fontSize: '14px' }}>📞</span>}
                                    label={option.phone} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ fontSize: '0.75rem', height: 24, fontWeight: 'medium' }}
                                  />
                                )}
                                {option.address && (
                                  <Chip 
                                    icon={<span style={{ fontSize: '14px' }}>📍</span>}
                                    label={option.address} 
                                    size="small" 
                                    color="secondary" 
                                    sx={{ fontSize: '0.75rem', height: 24, fontWeight: 'medium' }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        )}
                        ListboxProps={{
                          sx: {
                            '& .MuiAutocomplete-option': {
                              py: 1.5
                            }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                    <Grid item xs={12}>
                      {formik.values.patientId && (
                        <Zoom in timeout={400}>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 3, 
                              borderRadius: 2,
                              bgcolor: 'info.lightest',
                              border: '1px solid rgba(33, 150, 243, 0.2)',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <CheckCircleIcon color="info" sx={{ mr: 1 }} />
                              <Typography variant="subtitle2" fontWeight="medium" color="info.dark">
                                Patient sélectionné
                              </Typography>
                            </Box>
                            {patients
                              .filter(p => p._id === formik.values.patientId)
                              .map(patient => (
                                <Grid container spacing={2} key={patient._id}>
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                      Téléphone
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                      {patient.phone || 'Non renseigné'}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                      Adresse
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                      {patient.address || 'Non renseignée'}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                      Tuteur
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                      {patient.guardianFirstName} {patient.guardianLastName}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              ))
                            }
                          </Paper>
                        </Zoom>
                      )}
                    </Grid>
                </Paper>
              </Grid>

              {/* Section Dates */}
              <Grid item xs={12}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                    border: '1px solid rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <EventIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="medium">
                      Période de prêt
                    </Typography>
                  </Box>
                  
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <DatePicker
                          label="Date de début *"
                          value={formik.values.startDate}
                          onChange={(date) => formik.setFieldValue('startDate', date, true)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                              helperText={formik.touched.startDate && formik.errors.startDate}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <EventIcon color="action" />
                                  </InputAdornment>
                                ),
                                sx: {
                                  borderRadius: 2,
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                    },
                                    '&.Mui-focused': {
                                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                                    }
                                  }
                                }
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <DatePicker
                          label="Date de retour prévue (optionnelle)"
                          value={formik.values.expectedReturnDate}
                          onChange={(date) => formik.setFieldValue('expectedReturnDate', date, true)}
                          minDate={formik.values.startDate}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              error={formik.touched.expectedReturnDate && Boolean(formik.errors.expectedReturnDate)}
                              helperText={formik.touched.expectedReturnDate && formik.errors.expectedReturnDate}
                              placeholder="Laisser vide si indéterminé"
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <ScheduleIcon color="action" />
                                  </InputAdornment>
                                ),
                                sx: {
                                  borderRadius: 2,
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                    },
                                    '&.Mui-focused': {
                                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                                    }
                                  }
                                }
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </LocalizationProvider>
                  
                  <Paper 
                    sx={{ 
                      mt: 3, 
                      p: 2, 
                      borderRadius: 2,
                      bgcolor: 'info.lightest',
                      border: '1px solid rgba(33, 150, 243, 0.1)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <InfoIcon color="info" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      La date de retour est optionnelle. L'équipement sera retourné lorsque le patient terminera son utilisation.
                    </Typography>
                  </Paper>
                </Paper>
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                    border: '1px solid rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'grey.600', mr: 2 }}>
                      <InfoIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="medium">
                      Notes supplémentaires
                    </Typography>
                  </Box>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    id="notes"
                    name="notes"
                    label="Ajoutez des détails ou des instructions particulières..."
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    variant="outlined"
                    placeholder="Ex: Instructions particulières, conditions d'utilisation, remarques importantes..."
                    InputProps={{
                      sx: {
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }
                    }}
                  />
                </Paper>
              </Grid>

              {/* Boutons d'action */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                    border: '1px solid rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        * Champs obligatoires
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => navigate('/loans')}
                        disabled={submitting}
                        sx={{ 
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          textTransform: 'none',
                          fontWeight: 'medium',
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                            backgroundColor: 'grey.50'
                          }
                        }}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={submitting}
                        sx={{ 
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          textTransform: 'none',
                          fontWeight: 'medium',
                          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                          },
                          '&:disabled': {
                            background: 'grey.300'
                          }
                        }}
                      >
                        {submitting ? 'Enregistrement...' : 'Enregistrer le prêt'}
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </form>
        </MainCard>
        </Stack>
      </Fade>
    </Container>
  );
};

export default LoanForm;
