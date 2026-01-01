import { useState } from 'react';
import { useAuth } from 'contexts/AuthContext';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { PlusOutlined as AddIcon } from '@ant-design/icons';

const UserManagement = () => {
  const { register } = useAuth();
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  // Liste d'utilisateurs factice - À remplacer par un appel API réel
  const [users, setUsers] = useState([
    { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
    { id: 2, name: 'Utilisateur Test', email: 'user@example.com', role: 'user' }
  ]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Appel à l'API pour enregistrer l'utilisateur
      const response = await register(formData);
      
      // Mise à jour de la liste des utilisateurs
      setUsers([...users, { ...formData, id: users.length + 1 }]);
      
      // Réinitialisation du formulaire
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user'
      });
      
      // Fermeture de la boîte de dialogue
      handleClose();
      
      // Affichage du message de succès
      setSnackbar({
        open: true,
        message: 'Utilisateur créé avec succès',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la création de l\'utilisateur',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestion des utilisateurs</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Ajouter un utilisateur
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rôle</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Nom complet"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="password"
              label="Mot de passe"
              type="password"
              fullWidth
              variant="outlined"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              select
              margin="dense"
              name="role"
              label="Rôle"
              fullWidth
              variant="outlined"
              value={formData.role}
              onChange={handleChange}
              SelectProps={{ native: true }}
              sx={{ mb: 2 }}
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Annuler
            </Button>
            <Button type="submit" color="primary" variant="contained">
              Enregistrer
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
