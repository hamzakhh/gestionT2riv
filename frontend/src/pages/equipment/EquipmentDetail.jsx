import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Container,
  Paper,
  Grid,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility as ViewIcon,
  KeyboardReturn as ReturnIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import equipmentService from 'services/equipmentService';
import loanService from 'services/loanService';
import MainCard from 'components/MainCard';
import LoanReturnModal from 'pages/loans/LoanReturnModal';
import LoanCancelModal from 'pages/loans/LoanCancelModal';
import LoanDetail from 'pages/loans/LoanDetail';

const EquipmentDetail = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loans, setLoans] = useState([]);
  const [loansLoading, setLoansLoading] = useState(false);
  const [loansError, setLoansError] = useState('');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loanDetailOpen, setLoanDetailOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  useEffect(() => {
    const loadEquipment = async () => {
      try {
        setLoading(true);
        setError('');

        // Récupérer par assetId via la nouvelle méthode getByAssetId
        const response = await equipmentService.getByAssetId(assetId);

        if (response && response.success && response.data) {
          setEquipment(response.data);
        } else if (response && response.data) {
          // Compatibilité avec les anciennes réponses
          setEquipment(response.data);
        } else {
          setError('Équipement non trouvé');
        }
      } catch (err) {
        setError('Erreur lors du chargement de l\'équipement');
      } finally {
        setLoading(false);
      }
    };

    loadEquipment();
  }, [assetId]);

  useEffect(() => {
    const loadLoans = async () => {
      if (!equipment || !equipment._id) return;

      try {
        setLoansLoading(true);
        setLoansError('');

        const response = await loanService.getByEquipment(equipment._id);

        if (response && response.success && response.data) {
          setLoans(response.data);
        } else if (Array.isArray(response)) {
          setLoans(response);
        } else if (response && response.data) {
          setLoans(response.data);
        } else {
          setLoans([]);
        }
      } catch (err) {
        setLoansError('Impossible de charger l\'historique des mouvements');
        setLoans([]);
      } finally {
        setLoansLoading(false);
      }
    };

    loadLoans();
  }, [equipment]);

  const handleViewLoan = (loan) => {
    setSelectedLoan(loan);
    setLoanDetailOpen(true);
  };

  const handleReturn = async (returnData) => {
    if (!selectedLoan || !selectedLoan._id) return;

    try {
      await loanService.return(selectedLoan._id, returnData);
      setReturnModalOpen(false);
      // Recharger l'équipement et les prêts
      const equipmentResponse = await equipmentService.getByAssetId(assetId);
      if (equipmentResponse && equipmentResponse.data) {
        setEquipment(equipmentResponse.data);
      }
      const loansResponse = await loanService.getByEquipment(equipment._id);
      if (loansResponse && loansResponse.data) {
        setLoans(loansResponse.data);
      } else if (Array.isArray(loansResponse)) {
        setLoans(loansResponse);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = async (cancelData) => {
    if (!selectedLoan || !selectedLoan._id) return;

    try {
      await loanService.cancel(selectedLoan._id, cancelData);
      setCancelModalOpen(false);
      // Recharger l'équipement et les prêts
      const equipmentResponse = await equipmentService.getByAssetId(assetId);
      if (equipmentResponse && equipmentResponse.data) {
        setEquipment(equipmentResponse.data);
      }
      const loansResponse = await loanService.getByEquipment(equipment._id);
      if (loansResponse && loansResponse.data) {
        setLoans(loansResponse.data);
      } else if (Array.isArray(loansResponse)) {
        setLoans(loansResponse);
      }
    } catch (error) {
      throw error;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'returned': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'En cours';
      case 'returned': return 'Retourné';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getConditionLabel = (condition) => {
    switch (condition) {
      case 'new': return 'Neuf';
      case 'excellent': return 'Excellent';
      case 'good': return 'Bon';
      case 'fair': return 'Moyen';
      case 'poor': return 'Mauvais';
      case 'unusable': return 'Inutilisable';
      default: return condition;
    }
  };

  const isOverdue = (loan) => {
    return loan.status === 'active' && new Date() > new Date(loan.expectedReturnDate);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !equipment) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <MainCard>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="error" gutterBottom>
              {error || 'Équipement non trouvé'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/equipment')}
              sx={{ mt: 2 }}
            >
              Retour à la liste
            </Button>
          </Box>
        </MainCard>
      </Container>
    );
  }

  // Prêt actuel
  const activeLoan = loans.find(loan => loan.status === 'active');

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <MainCard>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/equipment')}
            sx={{ mb: 2 }}
          >
            Retour à la liste
          </Button>
          <Typography variant="h4" fontWeight={600}>
            Détails de l'équipement
          </Typography>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Asset ID"
                value={equipment.assetId || '—'}
                margin="normal"
                InputProps={{
                  readOnly: true,
                  sx: {
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    color: 'primary.main'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom"
                value={equipment.name}
                margin="normal"
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Catégorie"
                value={equipment.category}
                margin="normal"
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Type"
                value={equipment.type}
                margin="normal"
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Numéro de série constructeur"
                value={equipment.serialNumber || '—'}
                margin="normal"
                InputProps={{
                  readOnly: true,
                  sx: {
                    fontFamily: 'monospace'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Statut"
                value={equipment.status}
                margin="normal"
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="État"
                value={equipment.condition}
                margin="normal"
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Prêt actuel */}
        {activeLoan && (
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'info.lighter' }}>
            <Typography variant="h6" gutterBottom>
              Prêt actuel
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Patient
                </Typography>
                <Typography variant="body1">
                  {activeLoan.patient?.firstName} {activeLoan.patient?.lastName}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Téléphone
                </Typography>
                <Typography variant="body1">
                  {activeLoan.patient?.phone || '—'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date du prêt
                </Typography>
                <Typography variant="body1">
                  {new Date(activeLoan.loanDate).toLocaleDateString('fr-FR')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Retour prévu
                </Typography>
                <Typography variant="body1">
                  {new Date(activeLoan.expectedReturnDate).toLocaleDateString('fr-FR')}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <Chip
                    label={getStatusLabel(activeLoan.status)}
                    color={getStatusColor(activeLoan.status)}
                    size="medium"
                  />
                  {isOverdue(activeLoan) && (
                    <Chip
                      label="En retard"
                      color="error"
                      size="medium"
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<ReturnIcon />}
                    onClick={() => { setSelectedLoan(activeLoan); setReturnModalOpen(true); }}
                  >
                    Retourner
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => { setSelectedLoan(activeLoan); setCancelModalOpen(true); }}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewLoan(activeLoan)}
                  >
                    Voir détails
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Historique des mouvements */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Historique des mouvements
          </Typography>
          {loansLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : loansError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loansError}
            </Alert>
          ) : loans.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Aucun mouvement enregistré pour cet équipement.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Prêt le</TableCell>
                    <TableCell>Retour prévu</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loans.map((loan) => (
                    <TableRow key={loan._id}>
                      <TableCell>
                        <Typography variant="body2">
                          {loan.patient?.firstName} {loan.patient?.lastName}
                        </Typography>
                        {loan.patient?.phone && (
                          <Typography variant="caption" color="text.secondary">
                            {loan.patient.phone}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(loan.loanDate).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {new Date(loan.expectedReturnDate).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Chip
                            label={getStatusLabel(loan.status)}
                            color={getStatusColor(loan.status)}
                            size="small"
                          />
                          {isOverdue(loan) && (
                            <Chip
                              label="En retard"
                              color="error"
                              size="small"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => handleViewLoan(loan)}
                        >
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Modals */}
        <LoanDetail
          open={loanDetailOpen}
          onClose={() => setLoanDetailOpen(false)}
          loan={selectedLoan}
        />
        <LoanReturnModal
          open={returnModalOpen}
          onClose={() => setReturnModalOpen(false)}
          loan={selectedLoan}
          onConfirm={handleReturn}
        />
        <LoanCancelModal
          open={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          loan={selectedLoan}
          onConfirm={handleCancel}
        />
      </MainCard>
    </Container>
  );
};

export default EquipmentDetail;
