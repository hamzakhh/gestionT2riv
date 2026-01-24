import { useState, useEffect, useRef } from 'react';
import { UploadOutlined, CameraOutlined, PrinterOutlined } from '@ant-design/icons';
import { message } from 'antd';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import { PlusOutlined, EditOutlined, EyeOutlined, HeartOutlined, SaveOutlined, CloseOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from 'config';
import orphanService from 'services/orphanService';
import MainCard from 'components/MainCard';

const OrphanList = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [orphans, setOrphans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [savedOrphan, setSavedOrphan] = useState(null);
  const [selectedOrphan, setSelectedOrphan] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  const printRef = useRef();

  // Helper function to construct full image URL
  const getImageUrl = (photoPath) => {
    if (!photoPath) return null;
    // If it's already a full URL, return as is
    if (photoPath.startsWith('http')) return photoPath;
    // If it's an upload path, use base URL (not API URL)
    if (photoPath.includes('uploads/')) {
      return `${import.meta.env.VITE_BASE_URL}${photoPath.startsWith('/') ? '' : '/'}${photoPath}`;
    }
    // For other paths, use API URL
    return `${API_URL}${photoPath.startsWith('/') ? '' : '/'}${photoPath}`;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fiche Orphelin - ${selectedOrphan?.firstName} ${selectedOrphan?.lastName}</title>
        <style>
          @page { 
            size: A4;
            margin: 1.5cm;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 100%;
          }
          .print-header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0f0f0;
          }
          .print-title {
            color: #1890ff;
            margin-bottom: 5px;
          }
          .print-date {
            color: #666;
            margin-bottom: 20px;
          }
          .print-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .print-section-title {
            color: #1890ff;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-size: 1.2em;
          }
          .print-row {
            display: flex;
            margin-bottom: 10px;
            flex-wrap: wrap;
          }
          .print-label {
            font-weight: 600;
            color: #555;
            min-width: 180px;
            margin-bottom: 5px;
          }
          .print-value {
            flex: 1;
            min-width: 200px;
          }
          .profile-header {
            display: flex;
            margin-bottom: 25px;
            align-items: flex-start;
          }
          .profile-photo {
            width: 150px;
            height: 150px;
            object-fit: cover;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            margin-right: 25px;
          }
          .profile-info {
            flex: 1;
          }
          .profile-name {
            font-size: 1.8em;
            margin: 0 0 15px 0;
            color: #333;
          }
          .signature {
            margin-top: 40px;
            text-align: center;
            color: #999;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="print-content">
          <div class="print-header">
            <h1 class="print-title">Fiche Orphelin</h1>
            <div class="print-date">${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          ${selectedOrphan ? `
            <div class="profile-header">
              <div>
                ${selectedOrphan.photo ? 
                  `<img src="${getImageUrl(selectedOrphan.photo)}" alt="${selectedOrphan.firstName} ${selectedOrphan.lastName}" class="profile-photo">` : 
                  '<div class="profile-photo" style="display:flex;align-items:center;justify-content:center;background:#f5f5f5;border:1px dashed #d9d9d9;">Pas de photo</div>'
                }
              </div>
              <div class="profile-info">
                <h2 class="profile-name">${selectedOrphan.firstName} ${selectedOrphan.lastName}</h2>
                <div class="print-row">
                  <span class="print-label">Date de naissance:</span>
                  <span class="print-value">
                    ${new Date(selectedOrphan.dateOfBirth).toLocaleDateString('fr-FR')} 
                    (Âge: ${calculateAge(selectedOrphan.dateOfBirth)} ans)
                  </span>
                </div>
                <div class="print-row">
                  <span class="print-label">Genre:</span>
                  <span class="print-value">
                    ${selectedOrphan.gender === 'male' ? 'Masculin' : 'Féminin'}
                  </span>
                </div>
                ${selectedOrphan.sponsorship?.isSponsored ? `
                  <div class="print-row">
                    <span class="print-label">Statut:</span>
                    <span class="print-value" style="color:#52c41a;">
                      Parrainé
                    </span>
                  </div>
                ` : ''}
              </div>
            </div>

            <div class="print-section">
              <h3 class="print-section-title">Informations du Tuteur</h3>
              <div class="print-row">
                <span class="print-label">Nom complet:</span>
                <span class="print-value">${selectedOrphan.guardian?.name || '-'}</span>
              </div>
              <div class="print-row">
                <span class="print-label">Téléphone:</span>
                <span class="print-value">${selectedOrphan.guardian?.phone || '-'}</span>
              </div>
              <div class="print-row">
                <span class="print-label">Lien de parenté:</span>
                <span class="print-value">${selectedOrphan.guardian?.relationship || '-'}</span>
              </div>
              <div class="print-row">
                <span class="print-label">Adresse:</span>
                <span class="print-value">${selectedOrphan.guardian?.address || '-'}</span>
              </div>
            </div>

            <div class="print-section">
              <h3 class="print-section-title">Éducation</h3>
              <div class="print-row">
                <span class="print-label">Niveau scolaire:</span>
                <span class="print-value">${selectedOrphan.education?.level || '-'}</span>
              </div>
              <div class="print-row">
                <span class="print-label">Établissement:</span>
                <span class="print-value">${selectedOrphan.education?.school || '-'}</span>
              </div>
              <div class="print-row">
                <span class="print-label">Performance:</span>
                <span class="print-value">${selectedOrphan.education?.academicPerformance || '-'}</span>
              </div>
            </div>

            ${selectedOrphan.health ? `
              <div class="print-section">
                <h3 class="print-section-title">Santé</h3>
                <div class="print-row">
                  <span class="print-label">État de santé:</span>
                  <span class="print-value">
                    ${selectedOrphan.health.status === 'Bon' ? '✅' : 
                      selectedOrphan.health.status === 'Moyen' ? '⚠️' : '❌'}
                    ${selectedOrphan.health.status}
                  </span>
                </div>
                ${selectedOrphan.health.medicalConditions ? `
                  <div class="print-row">
                    <span class="print-label">Conditions médicales:</span>
                    <span class="print-value">${selectedOrphan.health.medicalConditions}</span>
                  </div>
                ` : ''}
              </div>
            ` : ''}

            ${selectedOrphan.sponsorship?.isSponsored ? `
              <div class="print-section">
                <h3 class="print-section-title">Parrainage</h3>
                <div class="print-row">
                  <span class="print-label">Montant mensuel:</span>
                  <span class="print-value">
                    ${selectedOrphan.sponsorship.monthlyAmount?.toLocaleString('fr-FR')} DH
                  </span>
                </div>
                <div class="print-row">
                  <span class="print-label">Date de début:</span>
                  <span class="print-value">
                    ${new Date(selectedOrphan.sponsorship.startDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ` : ''}

            ${selectedOrphan.notes ? `
              <div class="print-section">
                <h3 class="print-section-title">Notes</h3>
                <div style="white-space: pre-line;">${selectedOrphan.notes}</div>
              </div>
            ` : ''}

            <div class="signature">
              <div>----------------------------------</div>
              <div>Signature du responsable</div>
            </div>
          ` : '<p>Aucune donnée à afficher</p>'}
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for images to load before printing
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        // Close the window after printing
        printWindow.onafterprint = function() {
          printWindow.close();
        };
      }, 500);
    };
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    photo: '',
    ripName: '', // Nouveau champ pour Num RIP
    guardian: {
      name: '',
      phone: '',
      relationship: '',
      address: ''
    },
    education: {
      level: '',
      school: '',
      academicPerformance: ''
    },
    health: {
      status: '',
      medicalConditions: ''
    },
    sponsorship: {
      isSponsored: false,
      monthlyAmount: 0,
      startDate: ''
    },
    notes: ''
  });

  useEffect(() => {
    if (id) {
      loadSingleOrphan(id);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      loadOrphans();
    }
  }, [search, id]);

  const loadSingleOrphan = async (orphanId) => {
    try {
      setLoading(true);
      const response = await orphanService.getById(orphanId);
      setSelectedOrphan(response.data);
      setOpenDetailsDialog(true);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement de l\'orphelin');
      navigate('/orphans');
    } finally {
      setLoading(false);
    }
  };

  const loadOrphans = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      
      const response = await orphanService.getAll(params);
      setOrphans(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  
  const handleViewDetails = (orphan) => {
    setSelectedOrphan(orphan);
    setOpenDetailsDialog(true);
  };
  
  const handleEdit = (orphan) => {
    setSelectedOrphan(orphan);
    setFormData({
      firstName: orphan.firstName,
      lastName: orphan.lastName,
      dateOfBirth: orphan.dateOfBirth?.split('T')[0] || '',
      gender: orphan.gender,
      photo: orphan.photo || '',
      ripName: orphan.ripName || '', // Nouveau champ pour Num RIP
      guardian: {
        name: orphan.guardian?.name || '',
        phone: orphan.guardian?.phone || '',
        relationship: orphan.guardian?.relationship || '',
        address: orphan.guardian?.address || ''
      },
      education: {
        level: '',
        school: '',
        academicPerformance: ''
      },
      health: {
        status: '',
        medicalConditions: ''
      },
      sponsorship: {
        isSponsored: orphan.sponsorship?.isSponsored || false,
        monthlyAmount: orphan.sponsorship?.monthlyAmount || 0,
        startDate: orphan.sponsorship?.startDate?.split('T')[0] || ''
      },
      notes: orphan.notes || ''
    });
    setOpenEditDialog(true);
  };
  
  const handleDelete = async (orphan) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${orphan.firstName} ${orphan.lastName}" ?`)) {
      try {
        setLoading(true);
        await orphanService.delete(orphan._id);
        await loadOrphans();
        alert('✅ Orphelin supprimé avec succès');
      } catch (e) {
        console.error('❌ Erreur suppression:', e);
        alert('❌ Erreur: ' + (e.response?.data?.message || e.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      photo: '',
      ripName: '', // Nouveau champ pour Num RIP
      guardian: {
        name: '',
        phone: '',
        relationship: '',
        address: ''
      },
      education: {
        level: '',
        school: '',
        academicPerformance: ''
      },
      health: {
        status: '',
        medicalConditions: ''
      },
      sponsorship: {
        isSponsored: false,
        monthlyAmount: 0,
        startDate: ''
      },
      notes: ''
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(selectedFile.type)) {
      message.error('Format de fichier non supporté. Veuillez sélectionner une image (JPEG, PNG, JPG, GIF)');
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      message.error(`La taille du fichier (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB) dépasse la limite de 5MB`);
      return;
    }

    // Créer une URL de prévisualisation
    const fileReader = new FileReader();
    
    fileReader.onload = () => {
      const imageUrl = fileReader.result;
      
      // Mettre à jour l'état avec le fichier et l'URL de prévisualisation
      setFile(selectedFile);
      setPreviewUrl(imageUrl);
      
      // Mettre à jour formData avec le fichier (pas l'URL base64)
      setFormData(prev => ({
        ...prev,
        photo: selectedFile // Envoyer le fichier directement
      }));
      
      console.log('Image sélectionnée:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        preview: imageUrl.substring(0, 50) + '...'
      });
    };
    
    fileReader.onerror = (error) => {
      console.error('Erreur lors de la lecture du fichier:', error);
      message.error('Erreur lors de la lecture du fichier. Veuillez réessayer.');
    };
    
    fileReader.readAsDataURL(selectedFile);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Vérification des champs requis côté client
      const requiredFields = {
        'firstName': 'Le prénom est requis',
        'lastName': 'Le nom est requis',
        'dateOfBirth': 'La date de naissance est requise',
        'gender': 'Le genre est requis',
        'guardian.name': 'Le nom du tuteur est requis',
        'guardian.phone': 'Le téléphone du tuteur est requis'
      };

      const missingFields = [];
      Object.entries(requiredFields).forEach(([field, message]) => {
        const value = field.split('.').reduce((obj, key) => obj && obj[key], { ...formData });
        if (!value) {
          missingFields.push(message);
        }
      });

      if (missingFields.length > 0) {
        throw new Error(missingFields.join('\n'));
      }

      // Créer un objet FormData pour l'envoi
      const formDataToSend = new FormData();
      
      // Ajouter le fichier s'il existe
      if (file) {
        formDataToSend.append('photo', file);
      }
      
      // Ajouter les autres champs
      formDataToSend.append('firstName', formData.firstName.trim());
      formDataToSend.append('lastName', formData.lastName.trim());
      formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('ripName', formData.ripName.trim()); // Nouveau champ pour Num RIP
      formDataToSend.append('notes', formData.notes || '');
      
      // Ajouter les champs imbriqués
      formDataToSend.append('guardian', JSON.stringify({
        name: formData.guardian.name.trim(),
        phone: formData.guardian.phone.trim(),
        relationship: formData.guardian.relationship || '',
        address: formData.guardian.address || ''
      }));
      
      formDataToSend.append('sponsorship', JSON.stringify(formData.sponsorship?.isSponsored ? {
        isSponsored: true,
        monthlyAmount: Number(formData.sponsorship.monthlyAmount) || 0,
        startDate: formData.sponsorship.startDate || new Date().toISOString().split('T')[0]
      } : {
        isSponsored: false,
        monthlyAmount: 0,
        startDate: null
      }));
      
      formDataToSend.append('education', JSON.stringify({
        level: formData.education?.level || '',
        school: formData.education?.school || '',
        academicPerformance: formData.education?.academicPerformance || ''
      }));
      
      formDataToSend.append('health', JSON.stringify({
        status: formData.health?.status || '',
        medicalConditions: formData.health?.medicalConditions || ''
      }));
      
      formDataToSend.append('createdBy', 'user-id'); // Remplacez par l'ID de l'utilisateur connecté
      
      console.log('📤 Envoi des données au serveur...');
      const response = await orphanService.create(formDataToSend);
      console.log('✅ Réponse du serveur:', response);
      const newOrphan = response.data;
      await loadOrphans();
      
      // Show success dialog with image
      setSavedOrphan({
        ...newOrphan,
        photo: previewUrl || newOrphan.photo // Use the preview URL for immediate display
      });
      setOpenSuccessDialog(true);
      
      // Don't close the main dialog immediately
      // handleCloseDialog();
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la sauvegarde';
      
      if (error.response) {
        // Erreur du serveur avec réponse
        console.error('Réponse du serveur:', error.response.data);
        
        if (error.response.data && error.response.data.message) {
          // Si le message est un tableau (comme les erreurs de validation Mongoose)
          if (Array.isArray(error.response.data.message)) {
            errorMessage = error.response.data.message.join('\n');
          } 
          // Si c'est une chaîne simple
          else if (typeof error.response.data.message === 'string') {
            errorMessage = error.response.data.message;
          }
          // Si c'est un objet (comme les erreurs de validation détaillées)
          else if (typeof error.response.data.message === 'object') {
            errorMessage = Object.values(error.response.data.message)
              .map(err => typeof err === 'object' ? err.message || JSON.stringify(err) : err)
              .join('\n');
          }
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error('Pas de réponse du serveur:', error.request);
        errorMessage = 'Le serveur ne répond pas. Veuillez réessayer plus tard.';
      } else {
        // Erreur lors de la configuration de la requête
        console.error('Erreur de configuration de la requête:', error.message);
        errorMessage = error.message || 'Erreur lors de la configuration de la requête';
      }
      
      // Afficher le message d'erreur
      message.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdate = async () => {
    try {
      setLoading(true);
      
      // Prepare the data object
      const orphanData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        ripName: formData.ripName, // Nouveau champ pour Num RIP
        notes: formData.notes,
        guardian: {
          name: formData.guardian?.name || '',
          phone: formData.guardian?.phone || '',
          relationship: formData.guardian?.relationship || '',
          address: formData.guardian?.address || ''
        },
        sponsorship: {
          isSponsored: formData.sponsorship?.isSponsored || false,
          monthlyAmount: formData.sponsorship?.monthlyAmount || 0,
          startDate: formData.sponsorship?.startDate || ''
        }
      };

      // If there's a file, use FormData, otherwise send as JSON
      let dataToSend;
      
      if (file) {
        dataToSend = new FormData();
        dataToSend.append('photo', file);
        // Append all other fields as JSON string
        Object.keys(orphanData).forEach(key => {
          if (key !== 'photo') {
            dataToSend.append(key, typeof orphanData[key] === 'object' 
              ? JSON.stringify(orphanData[key]) 
              : orphanData[key]);
          }
        });
      } else {
        dataToSend = orphanData;
        if (formData.photo && formData.photo.startsWith('http')) {
          dataToSend.photoUrl = formData.photo;
        }
      }
      
      console.log('📤 Mise à jour orphelin avec les données:', {
        id: selectedOrphan._id,
        ...orphanData,
        hasPhoto: !!(file || (formData.photo && formData.photo.startsWith('http')))
      });
      
      await orphanService.update(selectedOrphan._id, dataToSend);
      await loadOrphans();
      setOpenEditDialog(false);
      setSelectedOrphan(null);
      resetForm();
      message.success('✅ Orphelin modifié avec succès');
    } catch (error) {
      console.error('❌ Erreur modification:', error);
      const errorMsg = error.response?.data?.message;
      const displayMsg = Array.isArray(errorMsg) ? errorMsg.join('\n') : (errorMsg || error.message);
      message.error('❌ Erreur: ' + displayMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 4,
        px: 2
      }}
    >
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <MainCard
            sx={{
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <Stack spacing={4}>
              {/* Header with modern styling */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pb: 3,
                  borderBottom: '2px solid #f0f0f0'
                }}
              >
                <Box>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1
                    }}
                  >
                    Gestion des Orphelins
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Gérez et suivez les informations des orphelins
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<PlusOutlined />}
                  onClick={handleOpenDialog}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      boxShadow: '0 12px 25px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Ajouter un Orphelin
                </Button>
              </Box>

              {/* Search bar with modern design */}
              <Box
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderRadius: 3,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              >
                <TextField
                  fullWidth
                  placeholder="🔍 Rechercher par nom..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)'
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: <SearchOutlined style={{ color: '#667eea', marginRight: 8 }} />
                  }}
                />
              </Box>

            {/* Grille de cartes */}
            {loading ? (
              <Typography align="center">Chargement...</Typography>
            ) : orphans.length === 0 ? (
              <Typography align="center">Aucun orphelin trouvé</Typography>
            ) : (
              <Grid container spacing={3}>
                {orphans.map((orphan) => (
                  <Grid item xs={12} sm={6} md={4} lg={4} xl={3} key={orphan._id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(255,255,255,0.8)',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: orphan.sponsorship?.isSponsored 
                            ? 'linear-gradient(90deg, #ff6b6b, #ffa500)' 
                            : 'linear-gradient(90deg, #667eea, #764ba2)',
                          opacity: 0,
                          transition: 'opacity 0.3s ease'
                        },
                        '&:hover': {
                          transform: 'translateY(-12px) scale(1.02)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                          '&::before': {
                            opacity: 1
                          }
                        }
                      }}
                      onClick={() => navigate(`/orphans/${orphan._id}`)}
                    >
                      {/* Photo section with modern design */}
                      <Box sx={{ 
                        p: 3, 
                        textAlign: 'center',
                        background: orphan.sponsorship?.isSponsored 
                          ? 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)' 
                          : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                        position: 'relative'
                      }}>
                        <Box
                          sx={{
                            width: 120,
                            height: 120,
                            margin: '0 auto',
                            mb: 2,
                            position: 'relative',
                            '&:hover .edit-photo-overlay': {
                              opacity: 1
                            }
                          }}
                        >
                          <Avatar
                            src={getImageUrl(orphan.photo)}
                            sx={{
                              width: '100%',
                              height: '100%',
                              fontSize: '2.8rem',
                              border: '4px solid white',
                              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                              objectFit: 'cover',
                              background: 'linear-gradient(135deg, #667eea, #764ba2)',
                              transition: 'transform 0.3s ease'
                            }}
                            alt={`${orphan.firstName} ${orphan.lastName}`}
                          >
                            {orphan.firstName?.[0]}{orphan.lastName?.[0]}
                          </Avatar>
                          
                          {/* Overlay for photo edit */}
                          <Box
                            className="edit-photo-overlay"
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(0, 0, 0, 0.6)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: 0,
                              transition: 'opacity 0.3s ease',
                              borderRadius: '50%',
                              cursor: 'pointer',
                              backdropFilter: 'blur(2px)'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <CameraOutlined style={{ color: 'white', fontSize: '28px' }} />
                          </Box>
                        </Box>

                        {/* Name with modern typography */}
                        <Typography 
                          variant="h5" 
                          gutterBottom 
                          align="center"
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          {orphan.firstName} {orphan.lastName}
                        </Typography>
                        
                        {/* Age chip with modern styling */}
                        <Chip 
                          label={`${calculateAge(orphan.dateOfBirth)} ans • ${orphan.gender === 'male' ? '👦' : '👧'}`}
                          size="small" 
                          sx={{
                            background: 'rgba(255,255,255,0.9)',
                            color: 'primary.main',
                            fontWeight: 600,
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            '&:hover': {
                              background: 'white',
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        />
                      </Box>
                      
                      {/* Content section */}
                      <CardContent sx={{ 
                        flexGrow: 1,
                        p: 3,
                        '&:last-child': {
                          paddingBottom: 3
                        }
                      }}>
                        <Stack spacing={2}>
                          {/* Guardian info with modern cards */}
                          <Box sx={{ 
                            p: 2,
                            background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)',
                            borderRadius: 2,
                            border: '1px solid rgba(102, 126, 234, 0.1)'
                          }}>
                            <Typography variant="subtitle2" color="primary.main" fontWeight="600" gutterBottom>
                              👨‍👩‍👧‍👦 Tuteur
                            </Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                              {orphan.guardian?.name || 'Non spécifié'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              📞 {orphan.guardian?.phone || 'N/A'}
                            </Typography>
                          </Box>
                          
                          {/* Sponsored badge */}
                          {orphan.sponsorship?.isSponsored && (
                            <Box sx={{ textAlign: 'center' }}>
                              <Chip
                                label="💝 Parrainé"
                                color="success"
                                size="small"
                                sx={{
                                  background: 'linear-gradient(135deg, #56ab2f, #a8e6cf)',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  boxShadow: '0 4px 12px rgba(86, 171, 47, 0.3)',
                                  '&:hover': {
                                    transform: 'scale(1.1)',
                                    boxShadow: '0 6px 16px rgba(86, 171, 47, 0.4)'
                                  },
                                  transition: 'all 0.3s ease'
                                }}
                              />
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                      
                      {/* Action buttons with modern styling */}
                      <Box sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        borderTop: '1px solid #f0f0f0',
                        background: 'linear-gradient(135deg, #fafbfc 0%, #f1f3f4 100%)'
                      }}>
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(orphan);
                            }}
                            sx={{
                              backgroundColor: 'rgba(102, 126, 234, 0.1)',
                              color: '#667eea',
                              '&:hover': {
                                backgroundColor: '#667eea',
                                color: 'white',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                            title="Voir le profil"
                          >
                            <EyeOutlined />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(orphan);
                            }}
                            sx={{
                              backgroundColor: 'rgba(255, 193, 7, 0.1)',
                              color: '#ffc107',
                              '&:hover': {
                                backgroundColor: '#ffc107',
                                color: 'white',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                            title="Modifier"
                          >
                            <EditOutlined />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(orphan);
                            }}
                            sx={{
                              backgroundColor: 'rgba(220, 53, 69, 0.1)',
                              color: '#dc3545',
                              '&:hover': {
                                backgroundColor: '#dc3545',
                                color: 'white',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                            title="Supprimer"
                          >
                            <DeleteOutlined />
                          </IconButton>
                        </Stack>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        </MainCard>
      </Grid>

      {/* Dialog pour ajouter un orphelin */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            py: 3,
            position: 'relative'
          }}
        >
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <IconButton 
              onClick={handleCloseDialog}
              sx={{ 
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
              }}
            >
              <CloseOutlined />
            </IconButton>
          </Box>
          <Typography variant="h4" fontWeight="bold">
            👶 Ajouter un Orphelin
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
            Remplissez les informations de l'orphelin
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Stack spacing={4} sx={{ mt: 2 }}>
            {/* Photo upload section with modern design */}
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: 2,
              background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)',
              border: '2px dashed rgba(102, 126, 234, 0.3)'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  id="photo-upload"
                />
                <label htmlFor="photo-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<CameraOutlined />}
                    sx={{
                      height: '120px',
                      width: '120px',
                      borderRadius: '50%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '3px dashed #667eea',
                      background: 'rgba(255,255,255,0.8)',
                      '&:hover': {
                        borderColor: '#764ba2',
                        background: 'white',
                        transform: 'scale(1.05)',
                        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
                      },
                      transition: 'all 0.3s ease',
                      mb: 2
                    }}
                  >
                    <CameraOutlined style={{ fontSize: '32px', color: '#667eea' }} />
                    <Typography variant="caption" sx={{ mt: 1, color: '#667eea', fontWeight: 600 }}>
                      {file ? 'Changer' : 'Ajouter'} Photo
                    </Typography>
                  </Button>
                </label>
                {previewUrl && (
                  <Box sx={{ mt: 2 }}>
                    <Avatar
                      src={previewUrl}
                      sx={{
                        width: 100,
                        height: 100,
                        margin: '0 auto',
                        border: '4px solid white',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                        borderRadius: '50%'
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Informations personnelles */}
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  📋 Informations Personnelles
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Prénom"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Nom"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      type="date"
                      label="Date de naissance"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Num RIP"
                      name="ripName"
                      value={formData.ripName}
                      onChange={handleChange}
                      placeholder="Entrez le num RIP si applicable"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    >
                      <InputLabel>Sexe</InputLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        label="Sexe"
                      >
                        <MenuItem value="male">👦 Masculin</MenuItem>
                        <MenuItem value="female">👧 Féminin</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Num RIP"
                      name="ripName"
                      value={formData.ripName}
                      onChange={handleChange}
                      placeholder="Entrez le num RIP si applicable"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Informations du tuteur */}
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  👨‍👩‍👧‍👦 Informations du Tuteur
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Nom du tuteur"
                      value={formData.guardian.name}
                      onChange={(e) => handleNestedChange('guardian', 'name', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Téléphone"
                      value={formData.guardian.phone}
                      onChange={(e) => handleNestedChange('guardian', 'phone', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Lien de parenté"
                      value={formData.guardian.relationship}
                      onChange={(e) => handleNestedChange('guardian', 'relationship', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Adresse"
                      value={formData.guardian.address}
                      onChange={(e) => handleNestedChange('guardian', 'address', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Éducation */}
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  🎓 Éducation
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Niveau scolaire"
                      value={formData.education.level}
                      onChange={(e) => handleNestedChange('education', 'level', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="École"
                      value={formData.education.school}
                      onChange={(e) => handleNestedChange('education', 'school', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Performance académique"
                      value={formData.education.academicPerformance}
                      onChange={(e) => handleNestedChange('education', 'academicPerformance', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Santé */}
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  🏥 Santé
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    >
                      <InputLabel>État de santé</InputLabel>
                      <Select
                        value={formData.health.status}
                        onChange={(e) => handleNestedChange('health', 'status', e.target.value)}
                        label="État de santé"
                      >
                        <MenuItem value="Bon">✅ Bon</MenuItem>
                        <MenuItem value="Moyen">⚠️ Moyen</MenuItem>
                        <MenuItem value="Faible">❌ Faible</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Conditions médicales"
                      value={formData.health.medicalConditions}
                      onChange={(e) => handleNestedChange('health', 'medicalConditions', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Parrainage */}
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  💝 Parrainage
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.sponsorship.isSponsored}
                          onChange={(e) => handleNestedChange('sponsorship', 'isSponsored', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#667eea',
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.08)'
                              }
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#667eea'
                            }
                          }}
                        />
                      }
                      label={
                        <Typography variant="body1" fontWeight="600">
                          {formData.sponsorship.isSponsored ? '💝 Parrainé' : '👤 Non parrainé'}
                        </Typography>
                      }
                    />
                  </Grid>
                  {formData.sponsorship.isSponsored && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Montant mensuel (DH)"
                          value={formData.sponsorship.monthlyAmount}
                          onChange={(e) => handleNestedChange('sponsorship', 'monthlyAmount', parseFloat(e.target.value))}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(102, 126, 234, 0.04)',
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.08)'
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                              }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Date de début"
                          value={formData.sponsorship.startDate}
                          onChange={(e) => handleNestedChange('sponsorship', 'startDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(102, 126, 234, 0.04)',
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.08)'
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                              }
                            }
                          }}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  📝 Notes
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notes supplémentaires"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Ajoutez des informations supplémentaires sur l'orphelin..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(102, 126, 234, 0.04)',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.08)'
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                        boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            p: 4,
            pt: 2,
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderTop: '1px solid rgba(0,0,0,0.1)'
          }}
        >
          <Button 
            onClick={handleCloseDialog}
            startIcon={<CloseOutlined />}
            variant="outlined"
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              borderColor: '#dc3545',
              color: '#dc3545',
              '&:hover': {
                borderColor: '#c82333',
                backgroundColor: 'rgba(220, 53, 69, 0.04)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(220, 53, 69, 0.2)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SaveOutlined />}
            disabled={loading || !formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.gender}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                boxShadow: '0 12px 25px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-2px)'
              },
              '&:disabled': {
                background: '#ccc',
                boxShadow: 'none'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? '⏳ Enregistrement...' : '💾 Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Print functionality is now handled by the handlePrint function */}

      {/* Dialog: Détails de l'orphelin - Design Moderne */}
      <Dialog 
        open={openDetailsDialog} 
        onClose={() => {
          setOpenDetailsDialog(false);
          if (id) navigate('/orphans');
        }} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }
        }}
      >
        {selectedOrphan && (
          <>
            {/* En-tête avec photo */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                p: 4,
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                <IconButton 
                  onClick={handlePrint} 
                  sx={{ 
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                  }}
                  title="Imprimer"
                >
                  <PrinterOutlined />
                </IconButton>
                <IconButton 
                  onClick={() => {
                    setOpenDetailsDialog(false);
                    if (id) navigate('/orphans');
                  }} 
                  sx={{ 
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                  }}
                  title="Fermer"
                >
                  <CloseOutlined />
                </IconButton>
              </Box>
              <Avatar
                src={getImageUrl(selectedOrphan.photo)}
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto',
                  border: '4px solid white',
                  boxShadow: 3,
                  fontSize: '3rem',
                  mb: 2
                }}
              >
                {selectedOrphan.firstName[0]}{selectedOrphan.lastName[0]}
              </Avatar>
              <Typography variant="h4" fontWeight="bold">
                {selectedOrphan.firstName} {selectedOrphan.lastName}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
                {calculateAge(selectedOrphan.dateOfBirth)} ans • {selectedOrphan.gender === 'male' ? 'Masculin' : 'Féminin'}
              </Typography>
              {selectedOrphan.sponsorship?.isSponsored && (
                <Chip
                  icon={<HeartOutlined />}
                  label="Parrainé"
                  sx={{
                    mt: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(10px)'
                  }}
                />
              )}
            </Box>

            <DialogContent sx={{ p: 3, bgcolor: 'transparent' }}>
              <Stack spacing={2.5}>
                {/* Informations personnelles */}
                <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                      📋 Informations Personnelles
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary" fontWeight="600">Date de naissance</Typography>
                          <Typography variant="body1" fontWeight="500">
                            {new Date(selectedOrphan.dateOfBirth).toLocaleDateString('fr-FR')}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Informations du tuteur */}
                <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                      👤 Tuteur Légal
                    </Typography>
                    <Stack spacing={1.5} sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight="600">Nom complet</Typography>
                        <Typography variant="body1" fontWeight="500">{selectedOrphan.guardian?.name || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#fff', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight="600">Téléphone</Typography>
                        <Typography variant="body1" fontWeight="500">{selectedOrphan.guardian?.phone || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight="600">Lien de parenté</Typography>
                        <Typography variant="body1" fontWeight="500">{selectedOrphan.guardian?.relationship || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#fff', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight="600">Adresse</Typography>
                        <Typography variant="body1" fontWeight="500" textAlign="right" sx={{ maxWidth: '60%' }}>
                          {selectedOrphan.guardian?.address || '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Parrainage */}
                {selectedOrphan.sponsorship?.isSponsored && (
                  <Card sx={{ borderRadius: 2, boxShadow: 2, background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#d84315' }}>
                        💝 Informations de Parrainage
                      </Typography>
                      <Stack spacing={1.5} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary" fontWeight="600">Montant mensuel</Typography>
                          <Typography variant="h6" fontWeight="bold" color="success.main">
                            {selectedOrphan.sponsorship.monthlyAmount} DH
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary" fontWeight="600">Date de début</Typography>
                          <Typography variant="body1" fontWeight="500">
                            {selectedOrphan.sponsorship.startDate 
                              ? new Date(selectedOrphan.sponsorship.startDate).toLocaleDateString('fr-FR') 
                              : '-'}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                {selectedOrphan.notes && (
                  <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                        📝 Notes
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mt: 1.5, 
                          p: 2, 
                          bgcolor: '#f8f9fa', 
                          borderRadius: 1,
                          borderLeft: '4px solid #667eea',
                          fontStyle: 'italic'
                        }}
                      >
                        {selectedOrphan.notes}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: 'transparent' }}>
              <Button 
                onClick={() => window.print()} 
                startIcon={<PrinterOutlined />}
                variant="outlined"
                sx={{ mr: 1 }}
              >
                Imprimer
              </Button>
              <Button 
                onClick={() => {
                  setOpenDetailsDialog(false);
                  if (id) navigate('/orphans');
                }} 
                startIcon={<CloseOutlined />}
                variant="outlined"
              >
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog: Modifier l'orphelin */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
            color: 'white',
            textAlign: 'center',
            py: 3,
            position: 'relative'
          }}
        >
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <IconButton 
              onClick={() => setOpenEditDialog(false)}
              sx={{ 
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
              }}
            >
              <CloseOutlined />
            </IconButton>
          </Box>
          <Typography variant="h4" fontWeight="bold">
            ✏️ Modifier l'Orphelin
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
            Modifiez les informations de l'orphelin
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Stack spacing={4} sx={{ mt: 2 }}>
            {/* Photo upload section with modern design */}
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: 2,
              background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)',
              border: '2px dashed rgba(102, 126, 234, 0.3)'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  id="edit-photo-upload"
                />
                <label htmlFor="edit-photo-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<CameraOutlined />}
                    sx={{
                      height: '120px',
                      width: '120px',
                      borderRadius: '50%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '3px dashed #667eea',
                      background: 'rgba(255,255,255,0.8)',
                      '&:hover': {
                        borderColor: '#764ba2',
                        background: 'white',
                        transform: 'scale(1.05)',
                        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
                      },
                      transition: 'all 0.3s ease',
                      mb: 2
                    }}
                  >
                    <CameraOutlined style={{ fontSize: '32px', color: '#667eea' }} />
                    <Typography variant="caption" sx={{ mt: 1, color: '#667eea', fontWeight: 600 }}>
                      {file ? 'Changer' : 'Modifier'} Photo
                    </Typography>
                  </Button>
                </label>
                {previewUrl && (
                  <Box sx={{ mt: 2 }}>
                    <Avatar
                      src={previewUrl}
                      sx={{
                        width: 100,
                        height: 100,
                        margin: '0 auto',
                        border: '4px solid white',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                        borderRadius: '50%'
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Informations personnelles */}
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  📋 Informations Personnelles
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Prénom"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Nom"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      type="date"
                      label="Date de naissance"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    >
                      <InputLabel>Sexe</InputLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        label="Sexe"
                      >
                        <MenuItem value="male">👦 Masculin</MenuItem>
                        <MenuItem value="female">👧 Féminin</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Num RIP"
                      name="ripName"
                      value={formData.ripName}
                      onChange={handleChange}
                      placeholder="Entrez le num RIP si applicable"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Informations du tuteur */}
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  👨‍👩‍👧‍👦 Informations du Tuteur
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Nom du tuteur"
                      value={formData.guardian.name}
                      onChange={(e) => handleNestedChange('guardian', 'name', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Téléphone"
                      value={formData.guardian.phone}
                      onChange={(e) => handleNestedChange('guardian', 'phone', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Lien de parenté"
                      value={formData.guardian.relationship}
                      onChange={(e) => handleNestedChange('guardian', 'relationship', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Adresse"
                      value={formData.guardian.address}
                      onChange={(e) => handleNestedChange('guardian', 'address', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Éducation */}
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  🎓 Éducation
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Niveau scolaire"
                      value={formData.education.level}
                      onChange={(e) => handleNestedChange('education', 'level', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="École"
                      value={formData.education.school}
                      onChange={(e) => handleNestedChange('education', 'school', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Performance académique"
                      value={formData.education.academicPerformance}
                      onChange={(e) => handleNestedChange('education', 'academicPerformance', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Santé */}
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  🏥 Santé
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    >
                      <InputLabel>État de santé</InputLabel>
                      <Select
                        value={formData.health.status}
                        onChange={(e) => handleNestedChange('health', 'status', e.target.value)}
                        label="État de santé"
                      >
                        <MenuItem value="Bon">✅ Bon</MenuItem>
                        <MenuItem value="Moyen">⚠️ Moyen</MenuItem>
                        <MenuItem value="Faible">❌ Faible</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Conditions médicales"
                      value={formData.health.medicalConditions}
                      onChange={(e) => handleNestedChange('health', 'medicalConditions', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Parrainage */}
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  💝 Parrainage
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.sponsorship.isSponsored}
                          onChange={(e) => handleNestedChange('sponsorship', 'isSponsored', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#667eea',
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.08)'
                              }
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#667eea'
                            }
                          }}
                        />
                      }
                      label={
                        <Typography variant="body1" fontWeight="600">
                          {formData.sponsorship.isSponsored ? '💝 Parrainé' : '👤 Non parrainé'}
                        </Typography>
                      }
                    />
                  </Grid>
                  {formData.sponsorship.isSponsored && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Montant mensuel (DH)"
                          value={formData.sponsorship.monthlyAmount}
                          onChange={(e) => handleNestedChange('sponsorship', 'monthlyAmount', parseFloat(e.target.value))}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(102, 126, 234, 0.04)',
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.08)'
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                              }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Date de début"
                          value={formData.sponsorship.startDate}
                          onChange={(e) => handleNestedChange('sponsorship', 'startDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(102, 126, 234, 0.04)',
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.08)'
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                              }
                            }
                          }}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  📝 Notes
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notes supplémentaires"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Ajoutez des informations supplémentaires sur l'orphelin..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(102, 126, 234, 0.04)',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.08)'
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                        boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            p: 4,
            pt: 2,
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderTop: '1px solid rgba(0,0,0,0.1)'
          }}
        >
          <Button 
            onClick={() => setOpenEditDialog(false)}
            startIcon={<CloseOutlined />}
            variant="outlined"
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              borderColor: '#dc3545',
              color: '#dc3545',
              '&:hover': {
                borderColor: '#c82333',
                backgroundColor: 'rgba(220, 53, 69, 0.04)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(220, 53, 69, 0.2)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleUpdate}
            variant="contained"
            startIcon={<SaveOutlined />}
            disabled={loading || !formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.gender}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
              boxShadow: '0 8px 20px rgba(255, 107, 107, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #ff5252 0%, #ff8a00 100%)',
                boxShadow: '0 12px 25px rgba(255, 107, 107, 0.4)',
                transform: 'translateY(-2px)'
              },
              '&:disabled': {
                background: '#ccc',
                boxShadow: 'none'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? '⏳ Modification...' : '💾 Modifier'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog - Affichage de l'image après enregistrement */}
      <Dialog
        open={openSuccessDialog}
        onClose={() => {
          setOpenSuccessDialog(false);
          setSavedOrphan(null);
          handleCloseDialog(); // Now close the main dialog
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
            color: 'white',
            textAlign: 'center',
            py: 3,
            position: 'relative'
          }}
        >
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <IconButton
              onClick={() => {
                setOpenSuccessDialog(false);
                setSavedOrphan(null);
                handleCloseDialog();
              }}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
              }}
            >
              <CloseOutlined />
            </IconButton>
          </Box>
          <Typography variant="h4" fontWeight="bold">
            ✅ Enregistrement Réussi !
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
            L'orphelin a été ajouté avec succès
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          {savedOrphan && (
            <Stack spacing={3} alignItems="center">
              {/* Photo de l'orphelin */}
              <Box>
                <Avatar
                  src={getImageUrl(savedOrphan.photo)}
                  sx={{
                    width: 150,
                    height: 150,
                    margin: '0 auto',
                    border: '6px solid #56ab2f',
                    boxShadow: '0 8px 20px rgba(86, 171, 47, 0.3)',
                    objectFit: 'cover'
                  }}
                  alt={`${savedOrphan.firstName} ${savedOrphan.lastName}`}
                >
                  {savedOrphan.firstName?.[0]}{savedOrphan.lastName?.[0]}
                </Avatar>
              </Box>

              {/* Informations de l'orphelin */}
              <Box sx={{ width: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                  {savedOrphan.firstName} {savedOrphan.lastName}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {calculateAge(savedOrphan.dateOfBirth)} ans • {savedOrphan.gender === 'male' ? 'Masculin' : 'Féminin'}
                </Typography>
                {savedOrphan.sponsorship?.isSponsored && (
                  <Chip
                    label="💝 Parrainé"
                    color="success"
                    size="small"
                    sx={{ mt: 2 }}
                  />
                )}
              </Box>

              {/* Informations du tuteur */}
              <Card sx={{
                width: '100%',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)'
              }}>
                <CardContent>
                  <Typography variant="subtitle2" color="primary.main" fontWeight="600" gutterBottom>
                    👨‍👩‍👧‍👦 Tuteur: {savedOrphan.guardian?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📞 {savedOrphan.guardian?.phone}
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button
            onClick={() => {
              setOpenSuccessDialog(false);
              setSavedOrphan(null);
              handleCloseDialog();
            }}
            variant="contained"
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4a9b2a 0%, #8bc6a8 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 15px rgba(86, 171, 47, 0.3)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Parfait ! 👍
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
    </Box>
  );
};

export default OrphanList;
