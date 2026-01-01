import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

const useConfirm = () => {
  const [state, setState] = useState({
    open: false,
    title: 'Confirmer',
    message: 'Êtes-vous sûr de vouloir effectuer cette action ?',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    confirmColor: 'primary',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showConfirm = useCallback(({
    title = 'Confirmer',
    message = 'Êtes-vous sûr de vouloir effectuer cette action ?',
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    confirmColor = 'primary',
    onConfirm = () => {},
    onCancel = () => {}
  } = {}) => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title,
        message,
        confirmText,
        cancelText,
        confirmColor,
        onConfirm: () => {
          onConfirm();
          setState(prev => ({ ...prev, open: false }));
          resolve(true);
        },
        onCancel: () => {
          onCancel();
          setState(prev => ({ ...prev, open: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    setState(prev => ({ ...prev, open: false }));
  }, []);

  const ConfirmDialog = () => (
    <Dialog
      open={state.open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="alert-dialog-title">
        {state.title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {state.message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={state.onCancel} color="inherit">
          {state.cancelText}
        </Button>
        <Button 
          onClick={state.onConfirm} 
          color={state.confirmColor} 
          variant="contained"
          autoFocus
        >
          {state.confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return { showConfirm, ConfirmDialog };
};

export default useConfirm;
