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
      photos: patient?.photos || []
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
                <MenuItem value="Fauteuil confort">Fauteuil confort</MenuItem>
                <MenuItem value="Lit">Lit</MenuItem>
                <MenuItem value="Matelas">Matelas</MenuItem>
                <MenuItem value="Concentrateur d'oxygène">Concentrateur d'oxygène</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Photos du patient
              </Typography>
              <Button 
                variant="contained" 
                component="label" 
                startIcon={<AddPhotoIcon />}
              >
                Ajouter des photos
                <input 
                  type="file" 
                  hidden 
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const newPhotos = Array.from(e.target.files).map(file => ({
                      file,
                      name: file.name,
                      preview: URL.createObjectURL(file),
                      id: Date.now() + Math.random().toString(36).substr(2, 9)
                    }));
                    setFieldValue('photos', [...(values.photos || []), ...newPhotos]);
                  }} 
                />
              </Button>
            </Box>

            {values.photos && values.photos.length > 0 ? (
              <List dense={true}>
                {values.photos.map((photo, index) => (
                  <ListItem key={photo.id || index}>
                    <ListItemAvatar>
                      <Avatar 
                        src={photo.preview || (typeof photo === 'string' ? photo : '')} 
                        variant="rounded"
                        sx={{ width: 56, height: 56, mr: 2 }}
                      />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={photo.name || `Photo ${index + 1}`} 
                      secondary={photo.size ? `Taille: ${Math.round(photo.size / 1024)} KB` : ''}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="supprimer"
                        onClick={() => {
                          const newPhotos = [...values.photos];
                          newPhotos.splice(index, 1);
                          setFieldValue('photos', newPhotos);
                        }}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={3}>
                <Typography variant="body2" color="textSecondary">
                  Aucune photo ajoutée. Cliquez sur "Ajouter des photos" pour en sélectionner.
                </Typography>
              </Box>
            )}
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