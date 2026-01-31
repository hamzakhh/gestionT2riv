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
  Autocomplete
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  Event as EventIcon,
  Person as PersonIcon,
  MedicalInformation as EquipmentIcon,
  Search as SearchIcon,
  Clear as ClearIcon
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
    <Container maxWidth="lg">
      <Stack spacing={3}>
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Nouveau prêt d'équipement</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <MainCard>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              {/* Section Équipement */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <EquipmentIcon sx={{ mr: 1 }} />
                  Détails de l'équipement
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
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
                          size="small"
                          onChange={(e) => setEquipmentSearch(e.target.value)}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <SearchIcon style={{ color: 'text.secondary' }} />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box>
                            <Typography variant="body2">
                              {option.name} - {option.serialNumber}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {option.type} | {option.category}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    {formik.values.equipmentId && (
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Détails de l'équipement
                        </Typography>
                        {availableEquipment
                          .filter(eq => eq._id === formik.values.equipmentId)
                          .map(equipment => (
                            <Box key={equipment._id}>
                              <Typography><strong>Type:</strong> {equipment.type}</Typography>
                              <Typography><strong>Numéro de série:</strong> {equipment.serialNumber}</Typography>
                              <Typography><strong>État:</strong> {equipment.condition}</Typography>
                            </Box>
                          ))
                        }
                      </Paper>
                    )}
                  </Grid>
                </Grid>
              </Grid>

              {/* Section Patient */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  Informations du patient
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
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
                          size="small"
                          onChange={(e) => setPatientSearch(e.target.value)}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <PersonIcon />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                          error={formik.touched.patientId && Boolean(formik.errors.patientId)}
                          helperText={formik.touched.patientId && formik.errors.patientId}
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box>
                            <Typography variant="body2">
                              {option.firstName} {option.lastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {option.phone && `📞 ${option.phone}`}
                              {option.address && ` | 📍 ${option.address}`}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    {formik.values.patientId && (
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Informations du patient
                        </Typography>
                        {patients
                          .filter(p => p._id === formik.values.patientId)
                          .map(patient => (
                            <Box key={patient._id}>
                              <Typography><strong>Téléphone:</strong> {patient.phone || 'Non renseigné'}</Typography>
                              <Typography><strong>Adresse:</strong> {patient.address || 'Non renseignée'}</Typography>
                              <Typography><strong>Tuteur:</strong> {patient.guardianFirstName} {patient.guardianLastName}</Typography>
                            </Box>
                          ))
                        }
                      </Paper>
                    )}
                  </Grid>
                </Grid>
              </Grid>

              {/* Section Dates */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventIcon sx={{ mr: 1 }} />
                  Période de prêt
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                  <Grid container spacing={2}>
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
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </LocalizationProvider>
                
                <Box mt={2} display="flex" alignItems="center">
                  <InfoIcon color="info" fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="caption" color="textSecondary">
                    La date de retour est optionnelle. L'équipement sera retourné lorsque le patient terminera son utilisation.
                  </Typography>
                </Box>
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  id="notes"
                  name="notes"
                  label="Notes supplémentaires"
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Ajoutez des détails ou des instructions particulières..."
                  variant="outlined"
                />
              </Grid>

              {/* Boutons d'action */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => navigate('/loans')}
                    disabled={submitting}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={submitting}
                  >
                    {submitting ? 'Enregistrement...' : 'Enregistrer le prêt'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </MainCard>
      </Stack>
    </Container>
  );
};

export default LoanForm;
