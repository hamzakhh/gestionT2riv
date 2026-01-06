import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  Event as EventIcon,
  Person as PersonIcon,
  MedicalInformation as EquipmentIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays } from 'date-fns';
import fr from 'date-fns/locale/fr';
import MainCard from 'components/MainCard';
import loanService from '../../services/loanService';
import equipmentService from '../../services/equipmentService';
import patientService from '../../services/patientService';

// Schéma de validation avec Yup
const validationSchema = Yup.object({
  equipmentId: Yup.string().required('L\'équipement est requis'),
  patientId: Yup.string().required('Le patient est requis'),
  startDate: Yup.date().required('La date de début est requisse'),
  expectedReturnDate: Yup.date()
    .required('La date de retour prévue est requise')
    .min(Yup.ref('startDate'), 'La date de retour doit être postérieure à la date de début'),
  notes: Yup.string()
});

const LoanForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [patients, setPatients] = useState([]);
  const [preselectedPatientId, setPreselectedPatientId] = useState(searchParams.get('patientId'));

  // Charger les équipements disponibles et les patients
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Récupérer les équipements disponibles
        const equipmentResult = await equipmentService.getAvailableEquipment();
        
        if (equipmentResult.success) {
          // Si la réponse contient des données, les utiliser
          const equipmentData = Array.isArray(equipmentResult.data) ? equipmentResult.data : [];
          setAvailableEquipment(equipmentData);
          
          if (equipmentData.length === 0) {
            setError('Aucun équipement disponible pour le moment.');
          }
        } else {
          // Si erreur, afficher le message d'erreur
          console.error('Erreur lors du chargement des équipements:', equipmentResult.error);
          setError(equipmentResult.error || 'Erreur lors du chargement des équipements');
        }

        // Récupérer la liste des patients
        console.log('Chargement des patients...');
        const patientsResponse = await patientService.getPatients(1, 1000, '');
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
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialisation du formulaire avec Formik
  const formik = useFormik({
    initialValues: {
      equipmentId: '',
      patientId: preselectedPatientId || '',
      startDate: new Date(),
      expectedReturnDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
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
          expectedReturnDate: values.expectedReturnDate.toISOString()
        };

        // Appeler le service pour créer le prêt
        const response = await loanService.createLoan(loanData);
        
        // Rediriger vers la page de détail du prêt
        navigate(`/loans/${response.data._id}`, { 
          state: { success: 'Prêt créé avec succès' } 
        });
      } catch (err) {
        console.error('Erreur lors de la création du prêt:', err);
        setError(err.response?.data?.message || 'Une erreur est survenue lors de la création du prêt');
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Mettre à jour la date de retour minimale lorsque la date de début change
  useEffect(() => {
    if (formik.values.startDate && !formik.values.expectedReturnDate) {
      const defaultReturnDate = new Date(formik.values.startDate);
      defaultReturnDate.setDate(defaultReturnDate.getDate() + 30); // 30 jours par défaut
      formik.setFieldValue('expectedReturnDate', defaultReturnDate);
    }
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

        {preselectedPatientId && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Patient pré-sélectionné: {
              patients.find(p => p._id === preselectedPatientId) 
                ? `${patients.find(p => p._id === preselectedPatientId).firstName} ${patients.find(p => p._id === preselectedPatientId).lastName}`
                : 'Chargement...'
            }
          </Alert>
        )}

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
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={formik.touched.equipmentId && Boolean(formik.errors.equipmentId)}>
                      <InputLabel id="equipment-label">Équipement *</InputLabel>
                      <Select
                        labelId="equipment-label"
                        id="equipmentId"
                        name="equipmentId"
                        value={formik.values.equipmentId}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Équipement *"
                        startAdornment={
                          <InputAdornment position="start">
                            <EquipmentIcon />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="">
                          <em>Sélectionner un équipement</em>
                        </MenuItem>
                        {availableEquipment.map((equipment) => (
                          <MenuItem key={equipment._id} value={equipment._id}>
                            {equipment.name} - {equipment.serialNumber} ({equipment.type})
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.equipmentId && formik.errors.equipmentId && (
                        <Typography variant="caption" color="error">
                          {formik.errors.equipmentId}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  {/* Aperçu des détails de l'équipement sélectionné */}
                  {formik.values.equipmentId && (
                    <Grid item xs={12} md={6}>
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
                    </Grid>
                  )}
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
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={formik.touched.patientId && Boolean(formik.errors.patientId)}>
                      <InputLabel id="patient-label">Patient *</InputLabel>
                      <Select
                        labelId="patient-label"
                        id="patientId"
                        name="patientId"
                        value={formik.values.patientId}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Patient *"
                        startAdornment={
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        }
                        disabled={patients.length === 0}
                      >
                        <MenuItem value="">
                          <em>{patients.length === 0 ? 'Aucun patient disponible' : 'Sélectionner un patient'}</em>
                        </MenuItem>
                        {patients && patients.length > 0 ? (
                          patients.map((patient) => (
                            <MenuItem key={patient._id} value={patient._id}>
                              {patient.firstName} {patient.lastName} 
                              {patient.phone && ` - ${patient.phone}`}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>
                            Aucun patient trouvé
                          </MenuItem>
                        )}
                      </Select>
                      {formik.touched.patientId && formik.errors.patientId && (
                        <Typography variant="caption" color="error">
                          {formik.errors.patientId}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  {/* Aperçu des détails du patient sélectionné */}
                  {formik.values.patientId && (
                    <Grid item xs={12} md={6}>
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
                    </Grid>
                  )}
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
                        label="Date de retour prévue *"
                        value={formik.values.expectedReturnDate}
                        onChange={(date) => formik.setFieldValue('expectedReturnDate', date, true)}
                        minDate={formik.values.startDate}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={formik.touched.expectedReturnDate && Boolean(formik.errors.expectedReturnDate)}
                            helperText={formik.touched.expectedReturnDate && formik.errors.expectedReturnDate}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </LocalizationProvider>
                
                <Box mt={2} display="flex" alignItems="center">
                  <InfoIcon color="info" fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="caption" color="textSecondary">
                    La durée maximale de prêt est de 90 jours. Des rappels seront envoyés avant la date de retour.
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
