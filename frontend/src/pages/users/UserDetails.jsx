import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { getUser } from 'services/userService';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await getUser(id);
        setUser(userData);
      } catch (err) {
        setError('Erreur lors du chargement des détails de l\'utilisateur');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

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

  if (!user) {
    return (
      <Alert severity="warning">
        Aucune donnée utilisateur trouvée.
      </Alert>
    );
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'primary';
      case 'manager':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const DetailItem = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ mr: 2, color: 'text.secondary' }}>{icon}</Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          {label}
        </Typography>
        <Typography variant="body1">{value || 'Non spécifié'}</Typography>
      </Box>
    </Box>
  );

  return (
    <MainCard title="Détails de l'utilisateur">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/users')}
        sx={{ mb: 3 }}
      >
        Retour à la liste
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                sx={{
                  width: 150,
                  height: 150,
                  fontSize: 60,
                  mb: 2,
                  bgcolor: 'primary.main',
                }}
              >
                {user.firstName?.[0]}{user.lastName?.[0]}
              </Avatar>
              <Chip
                label={user.role}
                color={getRoleColor(user.role)}
                size="small"
                sx={{ mb: 1 }}
              />
              <Chip
                icon={user.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                label={user.isActive ? 'Actif' : 'Inactif'}
                color={user.isActive ? 'success' : 'error'}
                size="small"
                variant="outlined"
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={9}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                  @{user.username}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/users/edit/${user._id}`)}
              >
                Modifier
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DetailItem
                  icon={<EmailIcon />}
                  label="Email"
                  value={user.email}
                />
                <DetailItem
                  icon={<PhoneIcon />}
                  label="Téléphone"
                  value={user.phone}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DetailItem
                  icon={<BadgeIcon />}
                  label="Rôle"
                  value={user.role}
                />
                <DetailItem
                  icon={user.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                  label="Statut"
                  value={user.isActive ? 'Compte actif' : 'Compte désactivé'}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LockIcon />}
          onClick={() => navigate(`/users/change-password/${user._id}`)}
          sx={{ mr: 2 }}
        >
          Changer le mot de passe
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/users/edit/${user._id}`)}
        >
          Modifier le profil
        </Button>
      </Box>
    </MainCard>
  );
};

export default UserDetails;
