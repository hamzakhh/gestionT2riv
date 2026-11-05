import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';

const LoanCancelModal = ({ open, onClose, loan, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!cancellationReason.trim()) {
      setError('La raison d\'annulation est obligatoire');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onConfirm({ cancellationReason });
      // onClose() is called by the parent handler on success
    } catch (err) {
      setError('Erreur lors de l\'annulation du prêt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Annuler le prêt</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Alert severity="warning" sx={{ mb: 2 }}>
          Êtes-vous sûr de vouloir annuler ce prêt ? Cette action est irréversible.
        </Alert>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Raison d'annulation *"
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
          required
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="error" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Confirmer l\'annulation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoanCancelModal;
