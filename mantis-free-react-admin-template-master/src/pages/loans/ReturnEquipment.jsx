import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Stack,
  IconButton,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  MedicalInformation as EquipmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  EventAvailable as EventAvailableIcon,
  AssignmentReturn as ReturnIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import fr from 'date-fns/locale/fr';
import MainCard from 'components/MainCard';
import loanService from 'api/loanService';
import { EQUIPMENT_CONDITION } from 'config';

// Schéma de validation avec Yup
const validationSchema = Yup.object({
  condition: Yup.string()
    .required('Le nouvel état de l\'équipement est requis'),
  notes: Yup.string()
    .max(1000, 'Les notes ne doivent pas dépasser 1000 caractères')
});

const ReturnEquipment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loan, setLoan] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Charger les détails du prêt
  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        setLoading(true);
        const response = await loanService.getLoanDetails(id);
        
        // Vérifier si le prêt peut être retourné
        if (response.data.status !== 'active') {
          setError('Ce prêt ne peut pas être retourné car il est déjà clôturé.');
        }
        
        setLoan(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des détails du prêt:', err);
        if (err.response?.status === 404) {
          setError('Ce prêt n\'existe pas ou a été supprimé.');
        } else {
          setError('Impossible de charger les détails du prêt. Veuillez réessayer.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [id]);

  // Initialisation du formulaire avec Formik
  const formik = useFormik({
    initialValues: {
      condition: '',
      notes: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        setError('');
        
        // Appeler le service pour retourner l'équipement
        await loanService.returnEquipment(id, {
          condition: values.condition,
          notes: values.notes
        });
        
        // Rediriger vers la page de détail du prêt avec un message de succès
        navigate(`/loans/${id}`, { 
          state: { success: 'L\'équipement a été retourné avec succès.' } 
        });
      } catch (err) {
        console.error('Erreur lors du retour de l\'équipement:', err);
        if (err.response?.status === 404) {
          setError('Ce prêt n\'existe pas ou a été supprimé.');
        } else {
          setError(err.response?.data?.message || 'Une erreur est survenue lors du retour de l\'équipement');
        }
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Formater la date pour l'affichage
  const formatDate = (dateString, formatStr = 'PPP') => {
    if (!dateString) return 'Non défini';
    return format(parseISO(dateString), formatStr, { locale: fr });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Si le prêt ne peut pas être retourné
  if (error || !loan) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ my: 3 }}>
          {error || 'Impossible de charger les détails du prêt.'}
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
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Retour d'équipement</Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Récapitulatif du prêt */}
          <Grid item xs={12} md={5} lg={4}>
            <MainCard title="Récapitulatif du prêt" sx={{ height: '100%' }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EquipmentIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Équipement" 
                    secondary={
                      <>
                        <Typography variant="subtitle1">
                          {loan.equipment?.name || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {loan.equipment?.serialNumber || ''}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Patient" 
                    secondary={`${loan.patient?.firstName} ${loan.patient?.lastName}`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Date de prêt" 
                    secondary={formatDate(loan.startDate)}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <EventAvailableIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Retour prévu" 
                    secondary={formatDate(loan.expectedReturnDate)}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="primary" />
                  </ListItemIcon>
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
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Vérifiez soigneusement l'état de l'équipement avant de confirmer le retour.
              </Alert>
            </MainCard>
          </Grid>
          
          {/* Formulaire de retour */}
          <Grid item xs={12} md={7} lg={8}>
            <MainCard title="Détails du retour">
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl 
                      fullWidth 
                      error={formik.touched.condition && Boolean(formik.errors.condition)}
                    >
                      <InputLabel id="condition-label">État de l'équipement *</InputLabel>
                      <Select
                        labelId="condition-label"
                        id="condition"
                        name="condition"
                        value={formik.values.condition}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="État de l'équipement *"
                      >
                        {Object.entries(EQUIPMENT_CONDITION).map(([key, value]) => (
                          <MenuItem key={key} value={value}>
                            {value}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.condition && formik.errors.condition && (
                        <FormHelperText>{formik.errors.condition}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      id="notes"
                      name="notes"
                      label="Notes supplémentaires"
                      value={formik.values.notes}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.notes && Boolean(formik.errors.notes)}
                      helperText={formik.touched.notes && formik.errors.notes}
                      placeholder="Décrivez l'état de l'équipement, des dommages éventuels, ou toute autre information pertinente..."
                      variant="outlined"
                    />
                  </Grid>
                  
                  {error && (
                    <Grid item xs={12}>
                      <Alert severity="error">{error}</Alert>
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end" gap={2}>
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => navigate(-1)}
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
                        {submitting ? 'Enregistrement...' : 'Confirmer le retour'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </MainCard>
            
            {/* Avertissement si l'équipement est endommagé */}
            {formik.values.condition && 
              ['poor', 'unusable'].includes(formik.values.condition) && (
                <Alert 
                  severity="warning" 
                  icon={<WarningIcon />}
                  sx={{ mt: 2 }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Attention : Équipement endommagé
                  </Typography>
                  <Typography variant="body2">
                    Vous avez signalé que cet équipement est en mauvais état. 
                    Veuillez contacter le service technique pour évaluation et réparation si nécessaire.
                  </Typography>
                </Alert>
              )}
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};

export default ReturnEquipment;
