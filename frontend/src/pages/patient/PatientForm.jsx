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
  ListItemSecondaryAction,
  Card,
  CardContent,
  Chip,
  Tooltip
} from '@mui/material';
import { Delete as DeleteIcon, AddPhotoAlternate as AddPhotoIcon, PictureAsPdf as PdfIcon, Visibility as ViewIcon, CloudDownload as DownloadIcon } from '@mui/icons-material';

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

  // Fonction pour afficher les informations du fichier
  const getFileInfo = (file) => {
    if (!file) return null;
    const isPdf = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');
    const fileSize = file.size ? (file.size / 1024).toFixed(2) + ' KB' : '';
    return { isPdf, fileSize, name: file.name };
  };

  // Fonction pour supprimer un fichier
  const handleRemoveFile = (fieldName) => {
    setFieldValue(fieldName, null);
  };

  // Fonction pour afficher un aperçu
  const handleViewFile = (file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
    }
  };

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
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 8);
              setFieldValue('phone', value);
            }}
            onBlur={handleBlur}
            fullWidth
            required
            inputProps={{ maxLength: 8 }}
            helperText="Maximum 8 chiffres"
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
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" component="div" sx={{ mb: 3, fontWeight: 600 }}>
              Documents du patient
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, color: 'primary.main' }}>
                      📄 CIN / Pièce d'identité
                    </Typography>
                    
                    {!values.cinPhoto ? (
                      <Button 
                        variant="outlined" 
                        component="label" 
                        fullWidth
                        startIcon={<AddPhotoIcon />}
                        sx={{ height: 60 }}
                      >
                        Ajouter un document
                        <input 
                          type="file" 
                          hidden 
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            setFieldValue('cinPhoto', file);
                          }} 
                        />
                      </Button>
                    ) : (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {getFileInfo(values.cinPhoto)?.isPdf ? (
                            <Avatar 
                              variant="rounded"
                              sx={{ width: 50, height: 50, mr: 2, bgcolor: 'error.main' }}
                            >
                              <PdfIcon />
                            </Avatar>
                          ) : (
                            <Avatar 
                              src={URL.createObjectURL(values.cinPhoto)}
                              variant="rounded"
                              sx={{ width: 50, height: 50, mr: 2 }}
                            />
                          )}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap>
                              {getFileInfo(values.cinPhoto)?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {getFileInfo(values.cinPhoto)?.fileSize}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="outlined" 
                            component="label" 
                            size="small"
                            startIcon={<AddPhotoIcon />}
                            sx={{ flex: 1 }}
                          >
                            Changer
                            <input 
                              type="file" 
                              hidden 
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                setFieldValue('cinPhoto', file);
                              }} 
                            />
                          </Button>
                          <Tooltip title="Voir le document">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewFile(values.cinPhoto)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton 
                              size="small" 
                              onClick={() => handleRemoveFile('cinPhoto')}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, color: 'primary.main' }}>
                      📋 Contrat
                    </Typography>
                    
                    {!values.contractPhoto ? (
                      <Button 
                        variant="outlined" 
                        component="label" 
                        fullWidth
                        startIcon={<AddPhotoIcon />}
                        sx={{ height: 60 }}
                      >
                        Ajouter un document
                        <input 
                          type="file" 
                          hidden 
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            setFieldValue('contractPhoto', file);
                          }} 
                        />
                      </Button>
                    ) : (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {getFileInfo(values.contractPhoto)?.isPdf ? (
                            <Avatar 
                              variant="rounded"
                              sx={{ width: 50, height: 50, mr: 2, bgcolor: 'error.main' }}
                            >
                              <PdfIcon />
                            </Avatar>
                          ) : (
                            <Avatar 
                              src={URL.createObjectURL(values.contractPhoto)}
                              variant="rounded"
                              sx={{ width: 50, height: 50, mr: 2 }}
                            />
                          )}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap>
                              {getFileInfo(values.contractPhoto)?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {getFileInfo(values.contractPhoto)?.fileSize}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="outlined" 
                            component="label" 
                            size="small"
                            startIcon={<AddPhotoIcon />}
                            sx={{ flex: 1 }}
                          >
                            Changer
                            <input 
                              type="file" 
                              hidden 
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                setFieldValue('contractPhoto', file);
                              }} 
                            />
                          </Button>
                          <Tooltip title="Voir le document">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewFile(values.contractPhoto)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton 
                              size="small" 
                              onClick={() => handleRemoveFile('contractPhoto')}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, color: 'primary.main' }}>
                      🏥 Carnet de santé
                    </Typography>
                    
                    {!values.notebookPhoto ? (
                      <Button 
                        variant="outlined" 
                        component="label" 
                        fullWidth
                        startIcon={<AddPhotoIcon />}
                        sx={{ height: 60 }}
                      >
                        Ajouter un document
                        <input 
                          type="file" 
                          hidden 
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            setFieldValue('notebookPhoto', file);
                          }} 
                        />
                      </Button>
                    ) : (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {getFileInfo(values.notebookPhoto)?.isPdf ? (
                            <Avatar 
                              variant="rounded"
                              sx={{ width: 50, height: 50, mr: 2, bgcolor: 'error.main' }}
                            >
                              <PdfIcon />
                            </Avatar>
                          ) : (
                            <Avatar 
                              src={URL.createObjectURL(values.notebookPhoto)}
                              variant="rounded"
                              sx={{ width: 50, height: 50, mr: 2 }}
                            />
                          )}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap>
                              {getFileInfo(values.notebookPhoto)?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {getFileInfo(values.notebookPhoto)?.fileSize}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="outlined" 
                            component="label" 
                            size="small"
                            startIcon={<AddPhotoIcon />}
                            sx={{ flex: 1 }}
                          >
                            Changer
                            <input 
                              type="file" 
                              hidden 
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                setFieldValue('notebookPhoto', file);
                              }} 
                            />
                          </Button>
                          <Tooltip title="Voir le document">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewFile(values.notebookPhoto)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton 
                              size="small" 
                              onClick={() => handleRemoveFile('notebookPhoto')}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                size="small" 
                label="Formats acceptés: PDF, JPG, PNG" 
                variant="outlined" 
                color="info"
              />
              <Chip 
                size="small" 
                label="Taille max: 10MB" 
                variant="outlined" 
                color="info"
              />
            </Box>
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