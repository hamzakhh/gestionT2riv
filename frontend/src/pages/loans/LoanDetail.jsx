import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  TextField,
  Chip,
  CircularProgress,
  Divider,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  KeyboardReturn as ReturnIcon,
  Cancel as CancelIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import loanService from 'services/loanService';
import LoanReturnModal from './LoanReturnModal';
import LoanCancelModal from './LoanCancelModal';

const LoanDetail = ({ open, onClose, loan: propLoan }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Use prop loan if provided (modal mode), otherwise fetch by ID (route mode)
  useEffect(() => {
    if (propLoan) {
      setLoan(propLoan);
      setLoading(false);
    } else if (id) {
      fetchLoan();
    }
  }, [id, propLoan]);

  const fetchLoan = async () => {
    try {
      setLoading(true);
      const loanId = loan?._id || id;
      const response = await loanService.getById(loanId);

      if (response.success) {
        setLoan(response.data);
      } else {
        setError(response.message || 'Erreur lors de la récupération du prêt');
      }
    } catch (err) {
      setError('Erreur lors de la récupération du prêt');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (returnData) => {
    try {
      const loanId = loan?._id || id;
      if (!loanId) {
        throw new Error('ID de prêt non disponible');
      }
      const response = await loanService.return(loanId, returnData);
      if (response.success) {
        setReturnModalOpen(false);
        // Only fetch if in route mode (id exists), not modal mode
        if (id) {
          fetchLoan(); // Rafraîchir les données
        }
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      throw err;
    }
  };

  const handleCancel = async (cancelData) => {
    try {
      const loanId = loan?._id || id;
      if (!loanId) {
        throw new Error('ID de prêt non disponible');
      }
      const response = await loanService.cancel(loanId, cancelData);
      if (response.success) {
        setCancelModalOpen(false);
        // Only fetch if in route mode (id exists), not modal mode
        if (id) {
          fetchLoan(); // Rafraîchir les données
        }
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      throw err;
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !loan) {
    return (
      <Box sx={{ p: 3 }}>
        {/* Only show "Retour à la liste" button in route mode, not modal mode */}
        {!open && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/loans')}
            sx={{ mb: 2 }}
          >
            Retour à la liste
          </Button>
        )}
        <Alert severity="error">{error || 'Prêt non trouvé'}</Alert>
      </Box>
    );
  }

  const content = (
    <>
      <Box sx={{ mb: 3 }}>
        {/* Only show "Retour à la liste" button in route mode, not modal mode */}
        {!open && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/loans')}
            sx={{ mb: 2 }}
          >
            Retour à la liste
          </Button>
        )}
        <Typography variant="h4">Détails du prêt</Typography>
      </Box>

      {loan.isOverdue && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Ce prêt est en retard
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Chip
              label={getStatusLabel(loan.status)}
              color={getStatusColor(loan.status)}
              size="medium"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Patient
            </Typography>
            <Typography variant="body1">
              {loan.patient?.firstName} {loan.patient?.lastName}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Équipement
            </Typography>
            <Typography variant="body1">
              {loan.equipment?.name}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Asset ID
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
              {loan.equipment?.assetId}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Numéro de série
            </Typography>
            <Typography variant="body1">
              {loan.equipment?.serialNumber || '—'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Date de prêt
            </Typography>
            <Typography variant="body1">
              {new Date(loan.loanDate).toLocaleDateString('fr-FR')}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Retour prévu
            </Typography>
            <Typography variant="body1">
              {new Date(loan.expectedReturnDate).toLocaleDateString('fr-FR')}
            </Typography>
          </Grid>

          {loan.actualReturnDate && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Date de retour
              </Typography>
              <Typography variant="body1">
                {new Date(loan.actualReturnDate).toLocaleDateString('fr-FR')}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Condition au prêt
            </Typography>
            <Typography variant="body1">
              {loan.conditionAtLoan}
            </Typography>
          </Grid>

          {loan.conditionAtReturn && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Condition au retour
              </Typography>
              <Typography variant="body1">
                {loan.conditionAtReturn}
              </Typography>
            </Grid>
          )}

          {loan.notes && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Notes
              </Typography>
              <Typography variant="body1">
                {loan.notes}
              </Typography>
            </Grid>
          )}

          {loan.returnNotes && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Notes de retour
              </Typography>
              <Typography variant="body1">
                {loan.returnNotes}
              </Typography>
            </Grid>
          )}

          {loan.cancellationReason && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Raison d'annulation
              </Typography>
              <Typography variant="body1">
                {loan.cancellationReason}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Créé par
            </Typography>
            <Typography variant="body1">
              {loan.createdBy?.firstName} {loan.createdBy?.lastName}
            </Typography>
          </Grid>

          {loan.returnedBy && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Retourné par
              </Typography>
              <Typography variant="body1">
                {loan.returnedBy?.firstName} {loan.returnedBy?.lastName}
              </Typography>
            </Grid>
          )}

          {loan.cancelledBy && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Annulé par
              </Typography>
              <Typography variant="body1">
                {loan.cancelledBy?.firstName} {loan.cancelledBy?.lastName}
              </Typography>
            </Grid>
          )}

          {loan.status === 'active' && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<ReturnIcon />}
                  onClick={() => setReturnModalOpen(true)}
                >
                  Retourner
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => setCancelModalOpen(true)}
                >
                  Annuler
                </Button>
              </Box>
            </Grid>
          )}

          <LoanReturnModal
            open={returnModalOpen}
            onClose={() => setReturnModalOpen(false)}
            loan={loan}
            onConfirm={handleReturn}
          />

          <LoanCancelModal
            open={cancelModalOpen}
            onClose={() => setCancelModalOpen(false)}
            loan={loan}
            onConfirm={handleCancel}
          />
        </Grid>
      </Paper>
    </>
  );

  // Render as modal if open prop is provided and true
  if (open) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Détails du prêt</Typography>
            <Button onClick={onClose} size="small">
              <CloseIcon />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
              <Grid item xs={12}>
                <Chip
                  label={getStatusLabel(loan.status)}
                  color={getStatusColor(loan.status)}
                  size="medium"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Patient
                </Typography>
                <Typography variant="body1">
                  {loan.patient?.firstName} {loan.patient?.lastName}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Équipement
                </Typography>
                <Typography variant="body1">
                  {loan.equipment?.name}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Asset ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {loan.equipment?.assetId}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Numéro de série
                </Typography>
                <Typography variant="body1">
                  {loan.equipment?.serialNumber || '—'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date de prêt
                </Typography>
                <Typography variant="body1">
                  {new Date(loan.loanDate).toLocaleDateString('fr-FR')}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Retour prévu
                </Typography>
                <Typography variant="body1">
                  {new Date(loan.expectedReturnDate).toLocaleDateString('fr-FR')}
                </Typography>
              </Grid>

              {loan.actualReturnDate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date de retour
                  </Typography>
                  <Typography variant="body1">
                    {new Date(loan.actualReturnDate).toLocaleDateString('fr-FR')}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Condition au prêt
                </Typography>
                <Typography variant="body1">
                  {loan.conditionAtLoan}
                </Typography>
              </Grid>

              {loan.conditionAtReturn && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Condition au retour
                  </Typography>
                  <Typography variant="body1">
                    {loan.conditionAtReturn}
                  </Typography>
                </Grid>
              )}

              {loan.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body1">
                    {loan.notes}
                  </Typography>
                </Grid>
              )}

              {loan.returnNotes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Notes de retour
                  </Typography>
                  <Typography variant="body1">
                    {loan.returnNotes}
                  </Typography>
                </Grid>
              )}

              {loan.cancellationReason && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Raison d'annulation
                  </Typography>
                  <Typography variant="body1">
                    {loan.cancellationReason}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Créé par
                </Typography>
                <Typography variant="body1">
                  {loan.createdBy?.firstName} {loan.createdBy?.lastName}
                </Typography>
              </Grid>

              {loan.returnedBy && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Retourné par
                  </Typography>
                  <Typography variant="body1">
                    {loan.returnedBy?.firstName} {loan.returnedBy?.lastName}
                  </Typography>
                </Grid>
              )}

              {loan.cancelledBy && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Annulé par
                  </Typography>
                  <Typography variant="body1">
                    {loan.cancelledBy?.firstName} {loan.cancelledBy?.lastName}
                  </Typography>
                </Grid>
              )}

              {loan.status === 'active' && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<ReturnIcon />}
                      onClick={() => setReturnModalOpen(true)}
                    >
                      Retourner
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => setCancelModalOpen(true)}
                    >
                      Annuler
                    </Button>
                  </Box>
                </Grid>
              )}

              <LoanReturnModal
                open={returnModalOpen}
                onClose={() => setReturnModalOpen(false)}
                loan={loan}
                onConfirm={handleReturn}
              />

              <LoanCancelModal
                open={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                loan={loan}
                onConfirm={handleCancel}
              />
            </Grid>
        </DialogContent>
      </Dialog>
    );
  }

  // Render as full page for route mode
  return <MainCard>{content}</MainCard>;
};

export default LoanDetail;
