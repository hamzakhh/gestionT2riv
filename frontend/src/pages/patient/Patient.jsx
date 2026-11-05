import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Modal,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Avatar,
  Tooltip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, PictureAsPdf as PdfIcon, Visibility as ViewIcon, Close as CloseIcon, Description as DescriptionIcon, Image as ImageIcon, Download as DownloadIcon } from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import MainCard from 'components/MainCard';
import PatientForm from './PatientForm';
import patientService from 'services/patientService';
import { API_BASE_URL } from 'config';

const Patient = () => {
  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      // Optimisation: limité à 20 patients par page pour un chargement plus rapide
      const response = await patientService.getPatients(1, 20, '');
      
      // Gérer différents formats de réponse
      let patientsData = [];
      if (response && response.docs) {
        patientsData = response.docs;
      } else if (response && response.data && response.data.docs) {
        patientsData = response.data.docs;
      } else if (response && Array.isArray(response)) {
        patientsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        patientsData = response.data;
      }
      
      setPatients(patientsData);
    } catch (error) {
      console.error('Failed to fetch patients', error);
      setPatients([]);
    }
  };

  const handleOpenForm = (patient = null) => {
    setEditingPatient(patient);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingPatient(null);
    setIsFormOpen(false);
  };

  const handleViewPatient = async (patient) => {
    try {
      // Récupérer les données complètes du patient (incluant les fichiers)
      const fullPatientData = await patientService.getPatientById(patient._id);
      setViewingPatient(fullPatientData.data || fullPatientData);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch patient details', error);
      // Fallback: utiliser les données de la liste si l'API échoue
      setViewingPatient(patient);
      setIsViewModalOpen(true);
    }
  };

  const handleCloseViewModal = () => {
    setViewingPatient(null);
    setIsViewModalOpen(false);
  };

  const getDocumentUrl = (filePath) => {
    if (!filePath) return null;
    
    // Si c'est déjà une URL complète
    if (filePath.startsWith('http')) {
      return filePath;
    }
    
    // Extraire l'URL de base sans le préfixe /api
    const baseUrl = API_BASE_URL.replace('/api', '');
    
    // Extraire le nom de fichier du chemin (peut être Windows ou Unix)
    const pathParts = filePath.split(/[\/\\]/);
    const fileName = pathParts[pathParts.length - 1];
    
    // Construire l'URL correcte pour le dossier patients
    return `${baseUrl}/uploads/patients/${fileName}`;
  };

  const handleViewDocument = (filePath) => {
    const url = getDocumentUrl(filePath);
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('Impossible de générer l\'URL du document');
    }
  };

  const getFileInfo = (filePath) => {
    if (!filePath) return null;
    const fileName = filePath.split('/').pop();
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    return { fileName, isPdf };
  };

  const handleSubmit = async (formData) => {
    const data = new FormData();
    
    // Append all non-file fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined && !(formData[key] instanceof File)) {
        data.append(key, formData[key]);
      }
    });
    
    // Append file fields with correct names
    if (formData.cinPhoto instanceof File) {
      data.append('cinPhoto', formData.cinPhoto);
    }
    if (formData.contractPhoto instanceof File) {
      data.append('contractPhoto', formData.contractPhoto);
    }
    if (formData.notebookPhoto instanceof File) {
      data.append('notebookPhoto', formData.notebookPhoto);
    }

    try {
      if (editingPatient) {
        await patientService.updatePatient(editingPatient._id, data);
      } else {
        await patientService.createPatient(data);
      }
      fetchPatients();
      handleCloseForm();
    } catch (error) {
      console.error('Failed to save patient', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await patientService.deletePatient(id);
      fetchPatients();
    } catch (error) {
      console.error('Failed to delete patient', error);
    }
  };

  const handleDownloadPdf = async (patient) => {
    // Télécharger le PDF généré
    await handlePrintPatient(patient, true);
  };

  const handlePrintPatient = async (patient, download = false) => {
    if (typeof jsPDF === 'undefined') {
      console.error('jsPDF n\'est pas chargé correctement');
      return;
    }
    
    // Créer un nouveau document PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    let y = 15; // Position Y initiale
    
    // Couleurs professionnelles
    const primaryColor = [44, 62, 80]; // Bleu foncé
    const secondaryColor = [52, 152, 219]; // Bleu clair
    const accentColor = [231, 76, 60]; // Rouge
    const textColor = [52, 73, 94]; // Gris foncé
    const lightGray = [245, 245, 245];
    
    // ==================== EN-TÊTE ====================
    // Fond d'en-tête
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Titre principal
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('FICHE PATIENT', 105, 25, { align: 'center' });
    
    // Sous-titre
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Dossier médical et administratif', 105, 32, { align: 'center' });
    
    y = 50;
    
    // ==================== INFORMATIONS DU PATIENT ====================
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('👤 INFORMATIONS DU PATIENT', 20, y);
    y += 8;
    
    // Ligne de séparation
    doc.setDrawColor(...secondaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 10;
    
    // Tableau des informations du patient
    const patientInfo = [
      { label: 'Nom complet', value: `${patient.firstName} ${patient.lastName}` },
      { label: 'Adresse', value: patient.address || 'Non spécifié' },
      { label: 'Téléphone', value: patient.phone || 'Non spécifié' },
      { label: 'Tuteur', value: `${patient.guardianFirstName || ''} ${patient.guardianLastName || ''}`.trim() || 'Non spécifié' },
      { label: 'Type de patient', value: patient.patientType || 'Non spécifié' },
      { label: 'Date d\'entrée', value: patient.entryDate ? new Date(patient.entryDate).toLocaleDateString('fr-FR') : 'Non spécifié' },
    ];
    
    if (patient.patientType === 'spécifique' && patient.specificEquipment) {
      patientInfo.push({ label: 'Équipement spécifique', value: patient.specificEquipment });
    }
    
    // Dessiner le tableau d'informations
    const tableX = 20;
    const tableWidth = 170;
    const rowHeight = 10;
    
    patientInfo.forEach((info, index) => {
      // Vérifier si on doit ajouter une nouvelle page
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      // Fond alterné
      if (index % 2 === 0) {
        doc.setFillColor(...lightGray);
        doc.rect(tableX, y - 4, tableWidth, rowHeight, 'F');
      }
      
      // Label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text(`${info.label}:`, tableX + 5, y);
      
      // Valeur
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      const valueText = doc.splitTextToSize(info.value, tableWidth - 50);
      doc.text(valueText, tableX + 50, y);
      
      y += Math.max(rowHeight, valueText.length * 5);
    });
    
    y += 10;
    
    // ==================== PIED DE PAGE ====================
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Ligne de séparation
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(20, 280, 190, 280);
      
      // Texte du pied de page
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      
      const date = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      doc.text(`Généré le ${date}`, 20, 285);
      doc.text(`Page ${i} sur ${pageCount}`, 105, 285, { align: 'center' });
      doc.text('© Gestion T2Riv - Système de gestion', 190, 285, { align: 'right' });
    }
    
    // ==================== GÉNÉRATION DU PDF ====================
    try {
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      if (download) {
        // Télécharger le PDF
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `fiche_patient_${patient.lastName}_${patient.firstName}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Ouvrir dans un nouvel onglet
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.location.href = pdfUrl;
        } else {
          // Fallback si la fenêtre n'a pas pu être ouverte
          const link = document.createElement('a');
          link.href = pdfUrl;
          link.target = '_blank';
          link.download = `fiche_patient_${patient.lastName}_${patient.firstName}_${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF :', error);
      alert('Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  return (
    <MainCard>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Liste des patients</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Ajouter un patient
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.length > 0 ? (
              patients.map((patient) => (
                <TableRow key={patient._id}>
                  <TableCell>{patient.lastName}</TableCell>
                  <TableCell>{patient.firstName}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{patient.patientType}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Voir détails">
                        <IconButton 
                          onClick={() => handleViewPatient(patient)} 
                          size="small"
                          sx={{ 
                            bgcolor: 'info.light',
                            color: 'info.dark',
                            '&:hover': { bgcolor: 'info.main', color: 'white' }
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton 
                          onClick={() => handleOpenForm(patient)} 
                          size="small"
                          sx={{ 
                            bgcolor: 'primary.light',
                            color: 'primary.dark',
                            '&:hover': { bgcolor: 'primary.main', color: 'white' }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton 
                          onClick={() => handleDelete(patient._id)} 
                          size="small"
                          sx={{ 
                            bgcolor: 'grey.200',
                            color: 'grey.700',
                            '&:hover': { bgcolor: 'error.main', color: 'white' }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" sx={{ py: 3, color: 'text.secondary' }}>
                    Aucun patient trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal open={isFormOpen} onClose={handleCloseForm}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 1200,
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            overflowY: 'auto'
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            {editingPatient ? 'Modifier le patient' : 'Ajouter un patient'}
          </Typography>
          <PatientForm
            patient={editingPatient}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
          />
        </Box>
      </Modal>

      {/* Modal pour afficher les détails et documents du patient */}
      <Modal open={isViewModalOpen} onClose={handleCloseViewModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 1000,
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            overflowY: 'auto'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" component="h2">
              Détails du patient
            </Typography>
            <IconButton onClick={handleCloseViewModal}>
              <CloseIcon />
            </IconButton>
          </Box>

          {viewingPatient && (
            <Grid container spacing={3}>
              {/* Informations personnelles */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                      👤 Informations personnelles
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Nom complet
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {viewingPatient.firstName} {viewingPatient.lastName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Téléphone
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {viewingPatient.phone}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Adresse
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {viewingPatient.address}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Tuteur
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {viewingPatient.guardianFirstName} {viewingPatient.guardianLastName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Type de patient
                        </Typography>
                        <Chip 
                          label={viewingPatient.patientType} 
                          color={viewingPatient.patientType === 'spécifique' ? 'secondary' : 'primary'}
                          size="small"
                        />
                      </Grid>
                      {viewingPatient.patientType === 'spécifique' && viewingPatient.specificEquipment && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Équipement spécifique
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {viewingPatient.specificEquipment}
                          </Typography>
                        </Grid>
                      )}
                      {viewingPatient.entryDate && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Date d'entrée
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {new Date(viewingPatient.entryDate).toLocaleDateString('fr-FR')}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Documents */}
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon /> Documents du patient
                    </Typography>
                    
                    {viewingPatient.files && viewingPatient.files.length > 0 ? (
                      <Grid container spacing={3}>
                        {viewingPatient.files.map((file, index) => {
                          const fileInfo = getFileInfo(file);
                          const documentUrl = getDocumentUrl(file);
                          
                          return (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <Card 
                                variant="outlined" 
                                sx={{ 
                                  height: '100%',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 3,
                                    borderColor: 'primary.main'
                                  }
                                }}
                              >
                                <CardContent sx={{ p: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Box 
                                      sx={{ 
                                        width: 56, 
                                        height: 56, 
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 2,
                                        bgcolor: fileInfo?.isPdf ? 'error.light' : 'success.light',
                                        color: fileInfo?.isPdf ? 'error.dark' : 'success.dark'
                                      }}
                                    >
                                      {fileInfo?.isPdf ? (
                                        <PdfIcon sx={{ fontSize: 32 }} />
                                      ) : (
                                        <ImageIcon sx={{ fontSize: 32 }} />
                                      )}
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Typography 
                                        variant="body2" 
                                        noWrap 
                                        fontWeight={600}
                                        sx={{ mb: 0.5 }}
                                      >
                                        {fileInfo?.fileName || `Document ${index + 1}`}
                                      </Typography>
                                      <Chip 
                                        label={fileInfo?.isPdf ? 'PDF' : 'Image'} 
                                        size="small"
                                        variant="outlined"
                                        color={fileInfo?.isPdf ? 'error' : 'success'}
                                        sx={{ 
                                          fontSize: '0.7rem',
                                          height: 20,
                                          '& .MuiChip-label': {
                                            px: 1
                                          }
                                        }}
                                      />
                                    </Box>
                                  </Box>
                                  
                                  <Button
                                    fullWidth
                                    variant="contained"
                                    size="small"
                                    startIcon={<ViewIcon />}
                                    onClick={() => handleViewDocument(file)}
                                    sx={{
                                      textTransform: 'none',
                                      fontWeight: 500,
                                      py: 1
                                    }}
                                  >
                                    Voir le document
                                  </Button>
                                </CardContent>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    ) : (
                      <Box 
                        sx={{ 
                          textAlign: 'center', 
                          py: 6,
                          bgcolor: 'grey.50',
                          borderRadius: 2,
                          border: '2px dashed',
                          borderColor: 'grey.300'
                        }}
                      >
                        <DescriptionIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary" fontWeight={500}>
                          Aucun document disponible
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Les documents seront affichés ici après leur ajout
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Actions */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      handleCloseViewModal();
                      handleOpenForm(viewingPatient);
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownloadPdf(viewingPatient)}
                    sx={{ color: 'error.main', borderColor: 'error.main' }}
                  >
                    Télécharger PDF
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PdfIcon />}
                    onClick={() => handlePrintPatient(viewingPatient)}
                  >
                    Exporter en PDF
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </Box>
      </Modal>
    </MainCard>
  );
};

export default Patient;
