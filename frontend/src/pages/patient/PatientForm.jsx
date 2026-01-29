import React from 'react';
import { useFormik } from 'formik';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { Delete as DeleteIcon, AddPhotoAlternate as AddPhotoIcon } from '@mui/icons-material';

const PatientForm = ({ patient, onSubmit, onCancel }) => {
  const formik = useFormik({
    initialValues: {
      firstName: patient?.firstName || '',
      lastName: patient?.lastName || '',
      address: patient?.address || '',
      phone: patient?.phone || '',
      guardianFirstName: patient?.guardianFirstName || '',
      guardianLastName: patient?.guardianLastName || '',
      patientType: patient?.patientType || 'général',
      specificEquipment: patient?.specificEquipment || '',
      entryDate: patient?.entryDate || new Date().toISOString().split('T')[0],
      cinPhoto: null,
      contractPhoto: null,
      notebookPhoto: null
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
    enableReinitialize: true
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue
  } = formik;

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Prénom"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Nom"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Adresse"
            name="address"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Numéro de téléphone"
            name="phone"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Prénom du tuteur"
            name="guardianFirstName"
            value={values.guardianFirstName}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Nom du tuteur"
            name="guardianLastName"
            value={values.guardianLastName}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Type de patient</InputLabel>
            <Select
              name="patientType"
              value={values.patientType}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <MenuItem value="général">Général</MenuItem>
              <MenuItem value="spécifique">Spécifique</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {values.patientType === 'spécifique' && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Équipement spécifique</InputLabel>
              <Select
                name="specificEquipment"
                value={values.specificEquipment}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <MenuItem value="">Aucun</MenuItem>
                <MenuItem value="Chaise roulante normale">Chaise roulante normale</MenuItem>
                <MenuItem value="Chaise roulante électrique">Chaise roulante électrique</MenuItem>
                <MenuItem value="Lève malade">Lève malade</MenuItem>
                <MenuItem value="Chaise de douche">Chaise de douche</MenuItem>
                <MenuItem value="Chaise dispositif de toilette">Chaise dispositif de toilette</MenuItem>
                <MenuItem value="Rehausseur de toilette">Rehausseur de toilette</MenuItem>
                <MenuItem value="Trépied">Trépied</MenuItem>
                <MenuItem value="Rampe à marche">Rampe à marche</MenuItem>
                <MenuItem value="Cannes canadiennes">Cannes canadiennes</MenuItem>
                <MenuItem value="Canne personne âgée">Canne personne âgée</MenuItem>
                <MenuItem value="Déambulateur">Déambulateur</MenuItem>
                <MenuItem value="Coussin orthopédique">Coussin orthopédique</MenuItem>
                <MenuItem value="lit">Lit</MenuItem>
                <MenuItem value="matelas">Matelas</MenuItem>
                <MenuItem value="concentrateur d'oxygène">Concentrateur d'oxygène</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" component="div" sx={{ mb: 2 }}>
              Documents du patient
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Photo CIN / Pièce d'identité
                  </Typography>
                  <Button 
                    variant="outlined" 
                    component="label" 
                    fullWidth
                    startIcon={<AddPhotoIcon />}
                  >
                    {values.cinPhoto ? 'Changer la photo' : 'Ajouter une photo'}
                    <input 
                      type="file" 
                      hidden 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setFieldValue('cinPhoto', file);
                      }} 
                    />
                  </Button>
                  {values.cinPhoto && (
                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                      <Avatar 
                        src={URL.createObjectURL(values.cinPhoto)}
                        variant="rounded"
                        sx={{ width: 80, height: 80, mx: 'auto' }}
                      />
                      <Typography variant="caption" display="block">
                        {values.cinPhoto.name}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Photo du contrat
                  </Typography>
                  <Button 
                    variant="outlined" 
                    component="label" 
                    fullWidth
                    startIcon={<AddPhotoIcon />}
                  >
                    {values.contractPhoto ? 'Changer la photo' : 'Ajouter une photo'}
                    <input 
                      type="file" 
                      hidden 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setFieldValue('contractPhoto', file);
                      }} 
                    />
                  </Button>
                  {values.contractPhoto && (
                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                      <Avatar 
                        src={URL.createObjectURL(values.contractPhoto)}
                        variant="rounded"
                        sx={{ width: 80, height: 80, mx: 'auto' }}
                      />
                      <Typography variant="caption" display="block">
                        {values.contractPhoto.name}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Photo du carnet de santé
                  </Typography>
                  <Button 
                    variant="outlined" 
                    component="label" 
                    fullWidth
                    startIcon={<AddPhotoIcon />}
                  >
                    {values.notebookPhoto ? 'Changer la photo' : 'Ajouter une photo'}
                    <input 
                      type="file" 
                      hidden 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setFieldValue('notebookPhoto', file);
                      }} 
                    />
                  </Button>
                  {values.notebookPhoto && (
                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                      <Avatar 
                        src={URL.createObjectURL(values.notebookPhoto)}
                        variant="rounded"
                        sx={{ width: 80, height: 80, mx: 'auto' }}
                      />
                      <Typography variant="caption" display="block">
                        {values.notebookPhoto.name}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button onClick={onCancel} sx={{ mr: 1 }}>
              Annuler
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {patient ? 'Mettre à jour' : 'Créer'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default PatientForm;