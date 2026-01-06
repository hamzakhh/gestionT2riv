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
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  PictureAsPdf as PdfIcon,
  Visibility as ViewIcon,
  Assignment as LoanIcon
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import MainCard from 'components/MainCard';
import PatientForm from './PatientForm';
import patientService from '../../services/patientService';
import loanService from '../../services/loanService';
import { 
  formatPatientName, 
  formatPatientContact,
  hasActiveLoans,
  getActiveLoansCount,
  formatLoanStatus,
  createPatientActions,
  canDeletePatient
} from '../../utils/patientLoanUtils';

const Patient = () => {
  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPatientLoans, setSelectedPatientLoans] = useState([]);
  const [loansDialogOpen, setLoansDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await patientService.getPatients();
      setPatients(response.docs || []);
    } catch (error) {
      console.error('Failed to fetch patients', error);
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

  const handleSubmit = async (formData) => {
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

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
    const patient = patients.find(p => p._id === id);
    const validation = canDeletePatient(patient);
    
    if (!validation.canDelete) {
      alert(validation.reason);
      return;
    }
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      try {
        await patientService.deletePatient(id);
        fetchPatients();
      } catch (error) {
        console.error('Failed to delete patient', error);
        alert('Erreur lors de la suppression du patient');
      }
    }
  };

  // Fonctions pour gérer les prêts des patients
  const handleViewPatientLoans = async (patient) => {
    try {
      setSelectedPatient(patient);
      const response = await loanService.getLoanHistory({ patientId: patient._id });
      setSelectedPatientLoans(response.data || []);
      setLoansDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch patient loans', error);
    }
  };

  const handleCloseLoansDialog = () => {
    setLoansDialogOpen(false);
    setSelectedPatient(null);
    setSelectedPatientLoans([]);
  };

  const handleCreateLoanForPatient = (patient) => {
    // Naviguer vers le formulaire de prêt avec le patient pré-sélectionné
    window.location.href = `/loans/new?patientId=${patient._id}`;
  };

  // Créer les handlers pour les actions du patient
  const patientActionHandlers = {
    onViewLoans: handleViewPatientLoans,
    onCreateLoan: handleCreateLoanForPatient,
    onEdit: handleOpenForm,
    onDelete: handleDelete,
    onExport: handlePrintPatient
  };

  const handlePrintPatient = async (patient) => {
    if (typeof jsPDF === 'undefined') {
      console.error('jsPDF n\'est pas chargé correctement');
      return;
    }
    
    // Créer un nouveau document PDF en mode paysage pour plus d'espace
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    let y = 20; // Position Y initiale
    
    // Titre
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('FICHE PATIENT', 105, y, { align: 'center' });
    y += 15;
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 15;
    
    // Informations du patient
    doc.setFontSize(12);
    const lineHeight = 7;
    
    // Fonction pour obtenir l'URL de l'image
    const getImageUrl = (imageData) => {
      if (!imageData) return null;
      
      // Si c'est un objet File (nouvelle image téléversée)
      if (imageData instanceof File) {
        return URL.createObjectURL(imageData);
      }
      
      // Si c'est une chaîne (URL directe)
      if (typeof imageData === 'string') {
        // Si c'est déjà une URL complète
        if (imageData.startsWith('http') || imageData.startsWith('blob:')) {
          return imageData;
        }
        // Sinon, on suppose que c'est un chemin relatif
        return `${window.location.origin}/${imageData.replace(/^\/+/, '')}`;
      }
      
      // Si c'est un objet avec une propriété url ou path
      if (imageData.url || imageData.path) {
        const url = imageData.url || imageData.path;
        if (url.startsWith('http') || url.startsWith('blob:')) {
          return url;
        }
        return `${window.location.origin}/${url.replace(/^\/+/, '')}`;
      }
      
      return null;
    };
    
    // Fonction pour ajouter une image au PDF
    const addImageToPdf = async (imageData, title, x, y, maxWidth = 80, maxHeight = 80) => {
      try {
        if (!imageData) return y;
        
        // Obtenir l'URL de l'image
        const imageUrl = getImageUrl(imageData);
        if (!imageUrl) {
          console.log(`Aucune URL valide pour l'image:`, imageData);
          return y;
        }
        
        // Créer une nouvelle page si nécessaire
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        
        // Afficher le titre de l'image
        doc.setFont('helvetica', 'bold');
        doc.text(`${title}:`, x, y);
        y += lineHeight;
        
        console.log(`Tentative de chargement de l'image: ${title}`, imageUrl);
        
        // Créer un élément image pour obtenir les dimensions
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        // Charger l'image avec un timeout
        const imgLoadPromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout loading image'));
          }, 10000); // 10 secondes de timeout
          
          img.onload = () => {
            clearTimeout(timeout);
            console.log(`Image chargée: ${title}`, img.width, 'x', img.height);
            resolve();
          };
          
          img.onerror = (err) => {
            clearTimeout(timeout);
            console.error(`Erreur de chargement de l'image: ${title}`, err);
            reject(err);
          };
          
          // Ajouter un timestamp pour éviter le cache
          const timestamp = new Date().getTime();
          const separator = imageUrl.includes('?') ? '&' : '?';
          img.src = `${imageUrl}${separator}t=${timestamp}`;
        });
        
        await imgLoadPromise;
        
        // Vérifier si l'image est valide
        if (!img.width || !img.height) {
          throw new Error('Image dimensions are invalid');
        }
        
        // Calculer les dimensions pour s'adapter à l'espace disponible
        let width = img.width;
        let height = img.height;
        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
        width = width * ratio;
        height = height * ratio;
        
        console.log(`Ajout de l'image au PDF: ${title}`, width, 'x', height);
        
        try {
          // Essayer d'ajouter l'image avec les paramètres optimisés
          doc.addImage({
            imageData: img,
            x: x + 5,
            y: y,
            width: width,
            height: height,
            compression: 'FAST',
            format: 'JPEG',
            quality: 0.9
          });
          
          y += height + 10;
          
          // Ajouter des informations sur l'image si disponibles
          const fileName = imageData.originalname || imageData.name || '';
          if (fileName) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            const maxWidth = 50; // Largeur maximale pour le nom de fichier
            const fileNameText = doc.splitTextToSize(`Fichier: ${fileName}`, maxWidth);
            doc.text(fileNameText, x + 5, y);
            y += (fileNameText.length * 3) + 2; // Ajuster en fonction du nombre de lignes
          }
          
          return y;
        } catch (imgError) {
          console.error(`Erreur lors de l'ajout de l'image au PDF:`, imgError);
          doc.setFont('helvetica', 'italic');
          doc.text(`(Erreur d'affichage: ${title})`, x + 5, y);
          return y + lineHeight * 2;
        }
      } catch (error) {
        console.error(`Erreur lors du traitement de l'image ${title}:`, error);
        doc.setFont('helvetica', 'italic');
        doc.text(`(Erreur: ${title})`, 20, y);
        return y + lineHeight * 2;
      }
    };
  
    // Style pour les en-têtes de section
    const sectionStyle = {
      fontSize: 14,
      color: '#2c3e50',
      marginBottom: 5
    };

    // Style pour les labels
    const labelStyle = {
      fontSize: 10,
      color: '#7f8c8d',
      marginBottom: 2
    };

    // Style pour les valeurs
    const valueStyle = {
      fontSize: 11,
      color: '#2c3e50',
      marginBottom: 8
    };

    // Ajouter une section pour les informations de base
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(sectionStyle.fontSize);
    doc.setTextColor(sectionStyle.color);
    doc.text('INFORMATIONS DU PATIENT', 20, y);
    y += 10;

    // Créer un tableau pour les informations de base
    const patientData = [
      { label: 'ID', value: patient._id },
      { label: 'Nom', value: patient.lastName },
      { label: 'Prénom', value: patient.firstName },
      { label: 'Adresse', value: patient.address },
      { label: 'Téléphone', value: patient.phone },
      { label: 'Tuteur', value: `${patient.guardianFirstName || ''} ${patient.guardianLastName || ''}`.trim() || 'Non spécifié' },
      { label: 'Type de patient', value: patient.patientType },
      { 
    label: 'Photos', 
    value: patient.files && patient.files.length > 0 
      ? patient.files.map((file, index) => (
          <img 
            key={index} 
            src={`/uploads/${file}`} 
            alt={`Photo ${index + 1}`} 
            style={{ maxWidth: '100px', maxHeight: '100px', margin: '5px' }} 
          />
        ))
      : 'Aucune photo disponible'
  }
    ];

    // Ajouter les informations de base dans un tableau à deux colonnes
    const startX = 20;
    const colWidth = 85;
    const rowHeight = 8;
    let currentY = y;
    
    patientData.forEach((item, index) => {
      // Vérifier si on doit ajouter une nouvelle page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = startX + (col * colWidth);
      
      // Dessiner un fond légèrement gris pour les lignes paires
      if (row % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(x, currentY - 4, colWidth - 5, rowHeight + 2, 'F');
      }
      
      // Ajouter le label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(labelStyle.fontSize);
      doc.setTextColor(labelStyle.color);
      doc.text(`${item.label}:`, x, currentY);
      
      // Ajouter la valeur
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(valueStyle.fontSize);
      doc.setTextColor(valueStyle.color);
      
      // Gérer les textes longs avec retour à la ligne
      const text = String(item.value || '-');
      const splitText = doc.splitTextToSize(text, colWidth - 25); // Largeur réduite pour la colonne
      doc.text(splitText, x + 30, currentY);
      
      // Ajuster la position Y en fonction du nombre de lignes
      currentY += Math.max(rowHeight, splitText.length * 5);
    });
    
    y = currentY + 10;
    
    // Section Documents
    if (y > 120) {
      doc.addPage();
      y = 20;
    }
    
    // Style pour la section des documents
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(sectionStyle.fontSize);
    doc.setTextColor(sectionStyle.color);
    doc.text('DOCUMENTS ASSOCIÉS', 20, y);
    y += 10;
    
    // Fonction utilitaire pour vérifier si un patient a des documents
    const hasDocuments = (patient) => {
      const hasDocs = !!(patient.cinPhoto || patient.contractPhoto || patient.notebookPhoto);
      console.log('Documents disponibles:', {
        cinPhoto: !!patient.cinPhoto,
        contractPhoto: !!patient.contractPhoto,
        notebookPhoto: !!patient.notebookPhoto,
        hasAny: hasDocs
      });
      return hasDocs;
    };
    
    // Vérifier si le patient a des documents
    if (!hasDocuments(patient)) {
      console.log('Aucun document trouvé pour le patient:', patient._id);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text('Aucun document disponible pour ce patient.', 25, y);
      y += lineHeight;
    } else {
      // Ajouter les images du patient
      try {
        console.log('Tentative d\'ajout des documents pour le patient:', patient._id);
        
        // Ajouter la photo CIN si elle existe
        if (patient.cinPhoto) {
          console.log('Ajout de la photo CIN');
          y = await addImageToPdf(patient.cinPhoto, 'PHOTO CIN / PIÈCE D\'IDENTITÉ', 20, y, 160, 120);
        } else {
          console.log('Aucune photo CIN trouvée');
        }
        
        // Ajouter la photo du contrat si elle existe
        if (patient.contractPhoto) {
          console.log('Ajout de la photo du contrat');
          y = await addImageToPdf(patient.contractPhoto, 'PHOTO DU CONTRAT', 20, y, 160, 120);
        } else {
          console.log('Aucune photo de contrat trouvée');
        }
        
        // Ajouter la photo du carnet de santé si elle existe
        if (patient.notebookPhoto) {
          console.log('Ajout de la photo du carnet de santé');
          y = await addImageToPdf(patient.notebookPhoto, 'PHOTO DU CARNET DE SANTÉ', 20, y, 160, 120);
        } else {
          console.log('Aucune photo de carnet de santé trouvée');
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout des images au PDF :', error);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(200, 0, 0);
        doc.text('Une erreur est survenue lors du chargement des images.', 20, y);
        doc.text('Détails de l\'erreur : ' + error.message, 20, y + 10);
        y += lineHeight * 2;
      }
    }
    
    // Ajouter la date de génération et le pied de page
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Pied de page avec numéro de page
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      
      // Ligne de séparation
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(20, 280, 190, 280);
      
      // Texte du pied de page
      const footerText = `Page ${i} sur ${pageCount} | Généré le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`;
      doc.text(footerText, 105, 285, { align: 'center' });
      
      // Logo ou texte supplémentaire si nécessaire
      doc.text('© 2023 Votre Application', 20, 285);
    }
    
    // Générer le PDF et l'ouvrir dans un nouvel onglet
    try {
      console.log('Génération du PDF terminée, ouverture dans un nouvel onglet...');
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Ouvrir dans un nouvel onglet avec des options pour éviter le blocage des popups
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.location.href = pdfUrl;
      } else {
        // Fallback si la fenêtre n'a pas pu être ouverte
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.target = '_blank';
        link.download = `patient_${patient.lastName}_${patient.firstName}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF :', error);
      // En cas d'erreur, essayer de sauvegarder le PDF partiel
      try {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(255, 0, 0);
        doc.text('Erreur lors de la génération du PDF', 20, y);
        doc.text('Certaines images n\'ont pas pu être chargées', 20, y + 10);
        doc.save(`patient_${patient.lastName}_${patient.firstName}_ERREUR.pdf`);
      } catch (e) {
        console.error('Erreur critique lors de la sauvegarde du PDF :', e);
        alert('Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.');
      }
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
              <TableCell>Prêts actifs</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient._id}>
                <TableCell>{patient.lastName}</TableCell>
                <TableCell>{patient.firstName}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>{patient.patientType}</TableCell>
                <TableCell>
                  <Chip 
                    label={`${getActiveLoansCount(patient)} actifs`} 
                    color={hasActiveLoans(patient) ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {createPatientActions(patient, patientActionHandlers).map((action, index) => (
                    <Tooltip key={index} title={action.tooltip}>
                      <IconButton 
                        onClick={action.onClick} 
                        color={action.color} 
                        size="small"
                      >
                        {action.icon === 'Assignment' && <LoanIcon />}
                        {action.icon === 'Add' && <AddIcon />}
                        {action.icon === 'Edit' && <EditIcon />}
                        {action.icon === 'Delete' && <DeleteIcon />}
                        {action.icon === 'PictureAsPdf' && <PdfIcon />}
                      </IconButton>
                    </Tooltip>
                  ))}
                </TableCell>
              </TableRow>
            ))}
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
            width: 800,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2
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

      {/* Dialog pour afficher les prêts du patient */}
      <Dialog 
        open={loansDialogOpen} 
        onClose={handleCloseLoansDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Prêts de {formatPatientName(selectedPatient)}
            </Typography>
            <Chip 
              label={`${selectedPatientLoans.length} prêt(s)`}
              color="primary"
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPatientLoans.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Ce patient n'a aucun prêt enregistré.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Équipement</TableCell>
                    <TableCell>Date de début</TableCell>
                    <TableCell>Date de retour</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedPatientLoans.map((loan) => (
                    <TableRow key={loan._id}>
                      <TableCell>
                        {loan.equipment?.name || 'N/A'}
                        {loan.equipment?.serialNumber && ` (${loan.equipment.serialNumber})`}
                      </TableCell>
                      <TableCell>
                        {new Date(loan.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {loan.expectedReturnDate 
                          ? new Date(loan.expectedReturnDate).toLocaleDateString()
                          : 'Non définie'
                        }
                      </TableCell>
                      <TableCell>
                        {formatLoanStatus(loan.status).label && (
                          <Chip 
                            label={formatLoanStatus(loan.status).label}
                            color={formatLoanStatus(loan.status).color}
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Voir les détails">
                          <IconButton 
                            size="small"
                            onClick={() => window.location.href = `/loans/${loan._id}`}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLoansDialog}>
            Fermer
          </Button>
          {selectedPatient && (
            <Button 
              variant="contained"
              onClick={() => handleCreateLoanForPatient(selectedPatient)}
              startIcon={<AddIcon />}
            >
              Créer un nouveau prêt
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default Patient;
