import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';

const LoanReturnModal = ({ open, onClose, loan, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [conditionAtReturn, setConditionAtReturn] = useState('good');
  const [returnNotes, setReturnNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      await onConfirm({ conditionAtReturn, returnNotes });
      // onClose() is called by the parent handler on success
    } catch (err) {
      setError('Erreur lors du retour du prêt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Retourner le prêt</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {(conditionAtReturn === 'poor' || conditionAtReturn === 'unusable') && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Attention: L'équipement est retourné en mauvais état
          </Alert>
        )}

        <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
          <InputLabel>Condition au retour</InputLabel>
          <Select
            value={conditionAtReturn}
            onChange={(e) => setConditionAtReturn(e.target.value)}
            label="Condition"
          >
            <MenuItem value="new">Neuf</MenuItem>
            <MenuItem value="excellent">Excellent</MenuItem>
            <MenuItem value="good">Bon</MenuItem>
            <MenuItem value="fair">Moyen</MenuItem>
            <MenuItem value="poor">Mauvais</MenuItem>
            <MenuItem value="unusable">Inutilisable</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Notes de retour"
          value={returnNotes}
          onChange={(e) => setReturnNotes(e.target.value)}
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Confirmer le retour'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoanReturnModal;
