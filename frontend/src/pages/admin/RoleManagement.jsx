import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Box,
  Typography,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit as EditIcon, Search as SearchIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { getUsers, updateUser } from 'services/userService';
import { ROLES } from 'config';

const RoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des utilisateurs');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleEdit = (user) => {
    setEditingUser(user);
    setNewRole(user.role);
    setUpdateDialogOpen(true);
  };

  const handleRoleUpdate = async () => {
    try {
      await updateUser(editingUser._id, { role: newRole });
      setUsers(users.map(user =>
        user._id === editingUser._id ? { ...user, role: newRole } : user
      ));
      setUpdateDialogOpen(false);
      setEditingUser(null);
      setNewRole('');
    } catch (err) {
      setError('Erreur lors de la mise à jour du rôle');
    }
  };

  const handleCancelEdit = () => {
    setUpdateDialogOpen(false);
    setEditingUser(null);
    setNewRole('');
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'medical': return 'success';
      case 'orphiline': return 'secondary';
      default: return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'medical': return 'Médical';
      case 'orphiline': return 'Orphiline';
      default: return role;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <MainCard title="Gestion des rôles">
      <Box sx={{ mb: 3 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 350, mb: 2 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom d'utilisateur</TableCell>
              <TableCell>Nom complet</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Rôle actuel</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Actif' : 'Inactif'}
                    color={user.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={getRoleLabel(user.role)}
                    color={getRoleColor(user.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Modifier le rôle">
                    <IconButton
                      onClick={() => handleRoleEdit(user)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Role Update Dialog */}
      <Dialog open={updateDialogOpen} onClose={handleCancelEdit}>
        <DialogTitle>Modifier le rôle</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Utilisateur: {editingUser?.username} ({editingUser?.email})
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Nouveau rôle</InputLabel>
            <Select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              label="Nouveau rôle"
            >
              <MenuItem value="medical">Médical</MenuItem>
              <MenuItem value="orphiline">Orphiline</MenuItem>
              <MenuItem value="admin">Administrateur</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit} startIcon={<CancelIcon />}>
            Annuler
          </Button>
          <Button
            onClick={handleRoleUpdate}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default RoleManagement;
